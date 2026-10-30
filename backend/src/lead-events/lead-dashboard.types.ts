import { LeadEventStatus, LeadPriority } from '@prisma/client';

export type LeadCountByStatus = {
  status: LeadEventStatus;
  count: number;
};

export type LeadCountByPriority = {
  priority: LeadPriority;
  count: number;
};

export type LeadCountByCampaign = {
  campaignId: string;
  campaignName: string;
  count: number;
};

export type LeadCountByLandingPage = {
  landingPageId: string;
  title: string;
  slug: string;
  count: number;
};

export type OverdueLeadSummary = {
  id: string;
  fullName: string;
  status: LeadEventStatus;
  priority: LeadPriority;
  nextFollowUpAt: string;
  campaignName: string;
  landingPageTitle: string;
};

export type LeadDashboardKpis = {
  totalLeads: number;
  receivedToday: number;
  receivedThisWeek: number;
  overdueFollowUps: number;
  contactedRatePercent: number;
  byStatus: LeadCountByStatus[];
  byPriority: LeadCountByPriority[];
  byCampaign: LeadCountByCampaign[];
  byLandingPage: LeadCountByLandingPage[];
  overdueLeads: OverdueLeadSummary[];
};
