-- AlterEnum
ALTER TYPE "FollowUpStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "LeadFollowUp" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
