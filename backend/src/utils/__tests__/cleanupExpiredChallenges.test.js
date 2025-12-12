import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { cleanupExpiredChallenges, isValidChallenge } from '../cleanupExpiredChallenges.js';

const prisma = new PrismaClient();

describe('cleanupExpiredChallenges', () => {
  let testAdmin;

  beforeEach(async () => {
    // Create a test admin
    testAdmin = await prisma.admin.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test Admin',
        role: 'admin',
        isActive: true
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testAdmin) {
      await prisma.admin.delete({
        where: { id: testAdmin.id }
      }).catch(() => {});
    }
  });

  it('should clean up expired challenges', async () => {
    // Set an expired challenge
    await prisma.admin.update({
      where: { id: testAdmin.id },
      data: {
        currentChallenge: 'test-challenge',
        challengeExpiresAt: new Date(Date.now() - 1000) // 1 second ago
      }
    });

    // Run cleanup
    const count = await cleanupExpiredChallenges(prisma);

    expect(count).toBe(1);

    // Verify challenge was cleared
    const admin = await prisma.admin.findUnique({
      where: { id: testAdmin.id }
    });

    expect(admin.currentChallenge).toBeNull();
    expect(admin.challengeExpiresAt).toBeNull();
  });

  it('should not clean up valid challenges', async () => {
    // Set a valid challenge (expires in 5 minutes)
    await prisma.admin.update({
      where: { id: testAdmin.id },
      data: {
        currentChallenge: 'test-challenge',
        challengeExpiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // Run cleanup
    const count = await cleanupExpiredChallenges(prisma);

    expect(count).toBe(0);

    // Verify challenge is still there
    const admin = await prisma.admin.findUnique({
      where: { id: testAdmin.id }
    });

    expect(admin.currentChallenge).toBe('test-challenge');
    expect(admin.challengeExpiresAt).not.toBeNull();
  });

  it('should return 0 when no expired challenges exist', async () => {
    const count = await cleanupExpiredChallenges(prisma);
    expect(count).toBe(0);
  });
});

describe('isValidChallenge', () => {
  it('should return false when challenge is missing', () => {
    const admin = {
      currentChallenge: null,
      challengeExpiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };

    expect(isValidChallenge(admin)).toBe(false);
  });

  it('should return false when expiration is missing', () => {
    const admin = {
      currentChallenge: 'test-challenge',
      challengeExpiresAt: null
    };

    expect(isValidChallenge(admin)).toBe(false);
  });

  it('should return false when challenge is expired', () => {
    const admin = {
      currentChallenge: 'test-challenge',
      challengeExpiresAt: new Date(Date.now() - 1000) // 1 second ago
    };

    expect(isValidChallenge(admin)).toBe(false);
  });

  it('should return true when challenge is valid', () => {
    const admin = {
      currentChallenge: 'test-challenge',
      challengeExpiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    };

    expect(isValidChallenge(admin)).toBe(true);
  });
});
