import { LeadEventStatus, LeadHistoryEventType } from '@prisma/client';

export type LeadStatusHistoryItem = {
  id: string;
  leadEventId: string;
  eventType: LeadHistoryEventType;
  previousStatus: LeadEventStatus;
  newStatus: LeadEventStatus;
  internalComment: string | null;
  activityNote: string | null;
  changedAt: string;
  changedByUserId: string | null;
  changedByName: string | null;
};

type HistoryRow = {
  id: string;
  leadEventId: string;
  eventType: LeadHistoryEventType;
  previousStatus: LeadEventStatus;
  newStatus: LeadEventStatus;
  internalComment: string | null;
  activityNote: string | null;
  changedAt: Date;
  changedByUserId: string | null;
  changedBy: { fullName: string } | null;
};

export function toLeadStatusHistoryItem(row: HistoryRow): LeadStatusHistoryItem {
  return {
    id: row.id,
    leadEventId: row.leadEventId,
    eventType: row.eventType,
    previousStatus: row.previousStatus,
    newStatus: row.newStatus,
    internalComment: row.internalComment,
    activityNote: row.activityNote,
    changedAt: row.changedAt.toISOString(),
    changedByUserId: row.changedByUserId,
    changedByName: row.changedBy?.fullName ?? null,
  };
}

export const leadStatusHistoryInclude = {
  changedBy: { select: { fullName: true } },
} as const;
