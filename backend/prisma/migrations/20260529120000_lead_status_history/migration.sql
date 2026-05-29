-- Historique interne des changements de statut lead
CREATE TABLE "lead_status_history" (
    "id" UUID NOT NULL,
    "lead_event_id" UUID NOT NULL,
    "previous_status" "LeadEventStatus" NOT NULL,
    "new_status" "LeadEventStatus" NOT NULL,
    "internal_comment" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by_user_id" UUID,

    CONSTRAINT "lead_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lead_status_history_lead_event_id_idx" ON "lead_status_history"("lead_event_id");
CREATE INDEX "lead_status_history_changed_at_idx" ON "lead_status_history"("changed_at");

ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_lead_event_id_fkey" FOREIGN KEY ("lead_event_id") REFERENCES "lead_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
