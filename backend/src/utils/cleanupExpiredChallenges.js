/**
 * Cleanup utility for expired WebAuthn challenges
 *
 * Challenges expire after 5 minutes to prevent replay attacks.
 * This utility can be run as:
 * 1. Middleware - auto-cleanup on each request
 * 2. Scheduled job - batch cleanup via cron
 */

/**
 * Clean up expired WebAuthn challenges from the database
 * @param {Object} prisma - Prisma client instance
 * @param {Object} logger - Logger instance (optional)
 * @returns {Promise<number>} Number of challenges cleaned up
 */
export async function cleanupExpiredChallenges(prisma, logger = console) {
  try {
    const now = new Date();

    // Find admins with expired challenges
    const result = await prisma.admin.updateMany({
      where: {
        currentChallenge: {
          not: null
        },
        challengeExpiresAt: {
          lte: now
        }
      },
      data: {
        currentChallenge: null,
        challengeExpiresAt: null
      }
    });

    if (result.count > 0) {
      logger.info({ count: result.count }, '🧹 Cleaned up expired challenges');
    }

    return result.count;
  } catch (error) {
    logger.error({ error: error.message }, '❌ Error cleaning up expired challenges');
    throw error;
  }
}

/**
 * Validate that a challenge hasn't expired
 * @param {Object} admin - Admin record with currentChallenge and challengeExpiresAt
 * @returns {boolean} true if challenge is valid, false if expired or missing
 */
export function isValidChallenge(admin) {
  if (!admin.currentChallenge || !admin.challengeExpiresAt) {
    return false;
  }

  const now = new Date();
  return admin.challengeExpiresAt > now;
}

/**
 * Fastify middleware to cleanup expired challenges on each request
 * Usage: fastify.addHook('onRequest', cleanupMiddleware)
 */
export function cleanupMiddleware(request, reply, done) {
  const { prisma, log } = request.server;

  // Run cleanup asynchronously without blocking the request
  cleanupExpiredChallenges(prisma, log).catch(error => {
    log.error({ error: error.message }, 'Background cleanup failed');
  });

  done();
}
