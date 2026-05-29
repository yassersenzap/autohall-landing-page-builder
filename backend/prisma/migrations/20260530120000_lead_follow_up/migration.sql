-- Suivi interne CRM léger : priorité, assignation, relances
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "LeadHistoryEventType" AS ENUM ('STATUS_CHANGE', 'FOLLOW_UP_UPDATE');

ALTER TABLE "lead_events" ADD COLUMN "assigned_to_user_id" UUID;
ALTER TABLE "lead_events" ADD COLUMN "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "lead_events" ADD COLUMN "next_follow_up_at" TIMESTAMP(3);
ALTER TABLE "lead_events" ADD COLUMN "last_contact_at" TIMESTAMP(3);

ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_assigned_to_user_id_fkey"
  FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "lead_events_assigned_to_user_id_idx" ON "lead_events"("assigned_to_user_id");
CREATE INDEX "lead_events_priority_idx" ON "lead_events"("priority");
CREATE INDEX "lead_events_next_follow_up_at_idx" ON "lead_events"("next_follow_up_at");

ALTER TABLE "lead_status_history" ADD COLUMN "event_type" "LeadHistoryEventType" NOT NULL DEFAULT 'STATUS_CHANGE';
ALTER TABLE "lead_status_history" ADD COLUMN "activity_note" TEXT;
