-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailOtpCode" TEXT,
ADD COLUMN     "emailOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
