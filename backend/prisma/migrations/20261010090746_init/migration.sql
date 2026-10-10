-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "leadCode" SET DEFAULT concat('CRM-', lpad(nextval('lead_code_seq'::regclass)::text, 6, '0'));

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);
