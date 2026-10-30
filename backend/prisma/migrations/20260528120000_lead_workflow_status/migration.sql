-- Workflow métier interne : statuts lead + commentaire interne
ALTER TABLE "lead_events" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "LeadEventStatus_new" AS ENUM (
  'RECEIVED',
  'CONTACTED',
  'QUALIFIED',
  'REJECTED',
  'ARCHIVED'
);

ALTER TABLE "lead_events"
  ALTER COLUMN "status" TYPE "LeadEventStatus_new"
  USING (
    CASE "status"::text
      WHEN 'RECEIVED' THEN 'RECEIVED'
      WHEN 'VALIDATED' THEN 'QUALIFIED'
      WHEN 'SYNCED' THEN 'ARCHIVED'
      WHEN 'FAILED' THEN 'REJECTED'
      WHEN 'PENDING_RETRY' THEN 'RECEIVED'
      WHEN 'DUPLICATE' THEN 'REJECTED'
      ELSE 'RECEIVED'
    END::"LeadEventStatus_new"
  );

DROP TYPE "LeadEventStatus";
ALTER TYPE "LeadEventStatus_new" RENAME TO "LeadEventStatus";
ALTER TABLE "lead_events" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';

ALTER TABLE "lead_events" ADD COLUMN "internal_comment" TEXT;
