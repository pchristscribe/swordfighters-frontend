import bcrypt from 'bcryptjs';

export default async function adminAuthRoutes(fastify, options) {
  const { prisma } = fastify;

  // Login route
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      reply.code(400);
      return {
        error: 'Validation Error',
        message: 'Email and password are required'
      };
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      reply.code(401);
      return {
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      };
    }

    // Check if admin is active
    if (!admin.isActive) {
      reply.code(403);
      return {
        error: 'Account Inactive',
        message: 'Your admin account has been deactivated'
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      reply.code(401);
      return {
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      };
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });

    // Set session
    request.session.adminId = admin.id;

    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    };
  });

  // Logout route
  fastify.post('/logout', async (request, reply) => {
    if (request.session) {
      request.session.destroy();
    }
    return { success: true, message: 'Logged out successfully' };
  });

  // Get current session (check if logged in)
  fastify.get('/session', async (request, reply) => {
    if (!request.session || !request.session.adminId) {
      reply.code(401);
      return {
        error: 'Not Authenticated',
        message: 'No active session'
      };
    }

    const admin = await prisma.admin.findUnique({
      where: { id: request.session.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!admin || !admin.isActive) {
      request.session.destroy();
      reply.code(401);
      return {
        error: 'Session Invalid',
        message: 'Admin account not found or inactive'
      };
    }

    return {
      authenticated: true,
      admin
    };
  });
}
