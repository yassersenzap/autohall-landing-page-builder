import { apiRequest } from './api';

export type LeadDashboardKpis = {
  totalLeads: number;
  receivedToday: number;
  receivedThisWeek: number;
  overdueFollowUps: number;
  contactedRatePercent: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byCampaign: {
    campaignId: string;
    campaignName: string;
    count: number;
  }[];
  byLandingPage: {
    landingPageId: string;
    title: string;
    slug: string;
    count: number;
  }[];
  overdueLeads: {
    id: string;
    fullName: string;
    status: string;
    priority: string;
    nextFollowUpAt: string;
    campaignName: string;
    landingPageTitle: string;
  }[];
};

export type LeadDashboardResponse = {
  success: true;
  data: LeadDashboardKpis;
  message: string;
};

export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Reçu',
  CONTACTED: 'Contacté',
  QUALIFIED: 'Qualifié',
  REJECTED: 'Rejeté',
  ARCHIVED: 'Archivé',
};

export async function getLeadDashboardKpis(): Promise<LeadDashboardResponse> {
  const response = await apiRequest<LeadDashboardKpis>(
    '/api/lead-events/dashboard',
  );
  return response as LeadDashboardResponse;
}
