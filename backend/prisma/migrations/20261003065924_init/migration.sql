-- CreateEnum
CREATE TYPE "FollowUpOutcome" AS ENUM ('CONNECTED', 'NO_RESPONSE', 'INTERESTED', 'NOT_INTERESTED', 'QUALIFIED', 'PROPOSAL_REQUIRED', 'NEGOTIATION', 'WON', 'WRONG_NUMBER', 'RESCHEDULED');

-- AlterTable
ALTER TABLE "LeadFollowUp" ADD COLUMN     "outcome" "FollowUpOutcome";

-- CreateIndex
CREATE INDEX "LeadFollowUp_assignedToUserId_isDeleted_status_scheduledAt_idx" ON "LeadFollowUp"("assignedToUserId", "isDeleted", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "LeadFollowUp_leadId_isDeleted_scheduledAt_idx" ON "LeadFollowUp"("leadId", "isDeleted", "scheduledAt");

-- CreateIndex
CREATE INDEX "LeadFollowUp_scheduledAt_status_idx" ON "LeadFollowUp"("scheduledAt", "status");
