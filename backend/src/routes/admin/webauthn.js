import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const RP_NAME = 'Swordfighters Admin';
const RP_ID = process.env.NODE_ENV === 'production'
  ? process.env.RP_ID || 'swordfighters.com'
  : 'localhost';
const ORIGIN = process.env.NODE_ENV === 'production'
  ? process.env.ADMIN_URL || 'https://admin.swordfighters.com'
  : 'http://localhost:3002';

export default async function webauthnRoutes(fastify, options) {
  const { prisma } = fastify;

  // Step 1: Generate registration options (called when admin wants to add a security key)
  fastify.post('/register/options', async (request, reply) => {
    try {
      fastify.log.info('📝 Registration options request received');
      const { email } = request.body;

      if (!email) {
        fastify.log.warn('❌ Registration options: Missing email');
        reply.code(400);
        return { error: 'Email is required' };
      }

      fastify.log.info({ email }, '🔍 Looking up admin by email');

      // Find or create admin
      let admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          webauthnCredentials: true
        }
      });

      if (!admin) {
        fastify.log.info({ email }, '➕ Creating new admin');
        // Create new admin (they'll register their first credential)
        admin = await prisma.admin.create({
          data: {
            email: email.toLowerCase(),
            name: email.split('@')[0],
            role: 'admin',
            isActive: true
          },
          include: {
            webauthnCredentials: true
          }
        });
        fastify.log.info({ adminId: admin.id }, '✅ Admin created successfully');
      } else {
        fastify.log.info({ adminId: admin.id, credentialCount: admin.webauthnCredentials.length }, '✅ Admin found');
      }

      // Convert string ID to Uint8Array as required by SimpleWebAuthn v9+
      const userIdBuffer = new TextEncoder().encode(admin.id);

      // Filter out any credentials with invalid credential IDs
      const validCredentials = admin.webauthnCredentials.filter(
        cred => cred.credentialId && typeof cred.credentialId === 'string' && cred.credentialId.length > 0
      );

      fastify.log.info({ 
        validCredentialCount: validCredentials.length,
        rpName: RP_NAME,
        rpID: RP_ID 
      }, '🔑 Generating registration options');

      const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: userIdBuffer,
        userName: admin.email,
        userDisplayName: admin.name,
        attestationType: 'none',
        excludeCredentials: validCredentials.map(cred => ({
          id: isoBase64URL.toBuffer(cred.credentialId),
          type: 'public-key',
          transports: cred.transports
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred'
          // No authenticatorAttachment - allows both platform (TouchID) and cross-platform (YubiKey)
        }
      });

      fastify.log.info({ challengeLength: options.challenge.length }, '💾 Storing challenge');

      // Store challenge in admin record
      await prisma.admin.update({
        where: { id: admin.id },
        data: { currentChallenge: options.challenge }
      });

      fastify.log.info('✅ Registration options generated successfully');
      return options;
    } catch (error) {
      fastify.log.error({ 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      }, '❌ Error generating registration options');
      reply.code(500);
      return { 
        error: 'Failed to generate registration options',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  });

  // Step 2: Verify registration response and store credential
  fastify.post('/register/verify', async (request, reply) => {
    const { email, credential, deviceName } = request.body;

    if (!email || !credential) {
      reply.code(400);
      return { error: 'Email and credential are required' };
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin || !admin.currentChallenge) {
      reply.code(400);
      return { error: 'Invalid registration session' };
    }

    try {
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: admin.currentChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID
      });

      if (!verification.verified || !verification.registrationInfo) {
        reply.code(400);
        return { error: 'Verification failed' };
      }

      const { credential: credentialData, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      // Log for debugging
      fastify.log.info({
        registrationInfo: verification.registrationInfo,
        credentialId: credential.id,
        credentialDataId: credentialData?.id
      }, 'Registration info received');

      if (!credentialData) {
        reply.code(400);
        return { error: 'Missing credential data' };
      }

      // In SimpleWebAuthn v13+, credential.id from the request is already base64url
      // This matches what we'll receive during authentication
      const credentialId = credential.id;

      if (!credentialId || credentialId.length === 0) {
        fastify.log.error({ credential, credentialData }, 'Missing credential ID');
        reply.code(400);
        return { error: 'Missing credential ID' };
      }

      // Store the credential (counter defaults to 0 if undefined)
      await prisma.webAuthnCredential.create({
        data: {
          adminId: admin.id,
          credentialId: credentialId,  // Use credential.id directly
          publicKey: isoBase64URL.fromBuffer(credentialData.publicKey),
          counter: BigInt(credentialData.counter ?? 0),
          deviceName: deviceName || 'Security Key',
          transports: credential.response.transports || []
        }
      });

      // Clear challenge
      await prisma.admin.update({
        where: { id: admin.id },
        data: { currentChallenge: null }
      });

      return {
        verified: true,
        message: 'Security key registered successfully'
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(400);
      return { error: error.message };
    }
  });

  // Step 3: Generate authentication options (login challenge)
  fastify.post('/authenticate/options', async (request, reply) => {
    try {
      fastify.log.info('🔐 Authentication options request received');
      const { email } = request.body;

      if (!email) {
        fastify.log.warn('❌ Authentication options: Missing email');
        reply.code(400);
        return { error: 'Email is required' };
      }

      fastify.log.info({ email }, '🔍 Looking up admin for authentication');

      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          webauthnCredentials: true
        }
      });

      if (!admin) {
        fastify.log.warn({ email }, '❌ Admin not found');
        reply.code(404);
        return { error: 'Admin not found' };
      }

      if (!admin.isActive) {
        fastify.log.warn({ email, adminId: admin.id }, '❌ Account is inactive');
        reply.code(403);
        return { error: 'Account is inactive' };
      }

      if (admin.webauthnCredentials.length === 0) {
        fastify.log.warn({ email, adminId: admin.id }, '❌ No security keys registered');
        reply.code(400);
        return { error: 'No security keys registered. Please register a key first.' };
      }

      // Filter out any credentials with invalid credential IDs
      const validCredentials = admin.webauthnCredentials.filter(
        cred => cred.credentialId && typeof cred.credentialId === 'string' && cred.credentialId.length > 0
      );

      fastify.log.info({ 
        adminId: admin.id,
        credentialCount: validCredentials.length,
        rpID: RP_ID
      }, '🔑 Generating authentication options');

      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: validCredentials.map(cred => ({
          id: isoBase64URL.toBuffer(cred.credentialId),
          type: 'public-key',
          transports: Array.isArray(cred.transports) ? cred.transports : []
        })),
        userVerification: 'preferred'
      });

      fastify.log.info({ challengeLength: options.challenge.length }, '💾 Storing authentication challenge');

      // Store challenge
      await prisma.admin.update({
        where: { id: admin.id },
        data: { currentChallenge: options.challenge }
      });

      fastify.log.info('✅ Authentication options generated successfully');
      return options;
    } catch (error) {
      fastify.log.error({ 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      }, '❌ Error generating authentication options');
      reply.code(500);
      return { 
        error: 'Failed to generate authentication options',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  });

  // Step 4: Verify authentication response and log in
  fastify.post('/authenticate/verify', async (request, reply) => {
    const { email, credential } = request.body;

    if (!email || !credential) {
      reply.code(400);
      return { error: 'Email and credential are required' };
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        webauthnCredentials: true
      }
    });

    if (!admin || !admin.currentChallenge) {
      reply.code(400);
      return { error: 'Invalid authentication session' };
    }

    // Find the credential being used
    // In SimpleWebAuthn v9+, credential.id is already a base64url string
    const credentialId = credential.id;
    const dbCredential = admin.webauthnCredentials.find(
      cred => cred.credentialId === credentialId
    );

    if (!dbCredential) {
      fastify.log.error({
        credentialId,
        availableCredentials: admin.webauthnCredentials.map(c => c.credentialId)
      }, 'Credential not found in database');
      reply.code(400);
      return { error: 'Credential not found' };
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: admin.currentChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        authenticator: {
          credentialID: isoBase64URL.toBuffer(dbCredential.credentialId),
          credentialPublicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
          counter: Number(dbCredential.counter)
        }
      });

      if (!verification.verified) {
        reply.code(401);
        return { error: 'Authentication failed' };
      }

      // Update counter and last used (counter defaults to current value if newCounter is undefined)
      await prisma.webAuthnCredential.update({
        where: { id: dbCredential.id },
        data: {
          counter: BigInt(verification.authenticationInfo.newCounter ?? dbCredential.counter),
          lastUsedAt: new Date()
        }
      });

      // Update admin last login and clear challenge
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
          currentChallenge: null
        }
      });

      // Set session
      request.session.adminId = admin.id;

      return {
        verified: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(401);
      return { error: error.message };
    }
  });

  // List registered credentials for current admin
  fastify.get('/credentials', async (request, reply) => {
    if (!request.session?.adminId) {
      reply.code(401);
      return { error: 'Not authenticated' };
    }

    const credentials = await prisma.webAuthnCredential.findMany({
      where: { adminId: request.session.adminId },
      select: {
        id: true,
        deviceName: true,
        transports: true,
        lastUsedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return { credentials };
  });

  // Delete a credential
  fastify.delete('/credentials/:id', async (request, reply) => {
    if (!request.session?.adminId) {
      reply.code(401);
      return { error: 'Not authenticated' };
    }

    const { id } = request.params;

    // Make sure they own this credential
    const credential = await prisma.webAuthnCredential.findFirst({
      where: {
        id,
        adminId: request.session.adminId
      }
    });

    if (!credential) {
      reply.code(404);
      return { error: 'Credential not found' };
    }

    // Don't allow deleting the last credential
    const count = await prisma.webAuthnCredential.count({
      where: { adminId: request.session.adminId }
    });

    if (count === 1) {
      reply.code(400);
      return { error: 'Cannot delete your last security key' };
    }

    await prisma.webAuthnCredential.delete({
      where: { id }
    });

    return { success: true };
  });
}
