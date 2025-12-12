-- AlterTable
ALTER TABLE "admins" ADD COLUMN "challengeExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "admins_challengeExpiresAt_idx" ON "admins"("challengeExpiresAt");
