/**
 * Admin authentication middleware
 * Protects admin routes by checking for valid session
 */
export async function adminAuth(request, reply) {
  // Check if session exists and has adminId
  if (!request.session || !request.session.adminId) {
    reply.code(401);
    return {
      error: 'Unauthorized',
      message: 'Please log in to access this resource'
    };
  }

  // Verify admin still exists and is active
  const admin = await request.server.prisma.admin.findUnique({
    where: { id: request.session.adminId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });

  if (!admin || !admin.isActive) {
    // Clear invalid session
    request.session.destroy();
    reply.code(401);
    return {
      error: 'Unauthorized',
      message: 'Admin account not found or inactive'
    };
  }

  // Attach admin info to request for use in routes
  request.admin = admin;
}
