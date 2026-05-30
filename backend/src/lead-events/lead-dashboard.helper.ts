import { LeadEventStatus, Prisma } from '@prisma/client';

export function getStartOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Début de semaine (lundi) en heure locale. */
export function getStartOfWeek(): Date {
  const date = new Date();
  const day = date.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysFromMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const overdueFollowUpWhere = (): Prisma.LeadEventWhereInput => ({
  nextFollowUpAt: { lt: new Date() },
  status: {
    notIn: [LeadEventStatus.ARCHIVED, LeadEventStatus.REJECTED],
  },
});

export const CONTACTED_STATUSES: LeadEventStatus[] = [
  LeadEventStatus.CONTACTED,
  LeadEventStatus.QUALIFIED,
  LeadEventStatus.ARCHIVED,
];
