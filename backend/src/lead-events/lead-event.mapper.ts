import { LeadRequestType, LeadEventStatus } from '@prisma/client';

export type LeadEventDetail = {
  id: string;
  campaignId: string;
  landingPageId: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  brand: string | null;
  model: string | null;
  requestType: LeadRequestType;
  message: string | null;
  internalComment: string | null;
  status: LeadEventStatus;
  sourceUrl: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  campaignName: string;
  landingPageTitle: string;
  landingPageSlug: string;
};

type LeadEventWithRelations = {
  id: string;
  campaignId: string;
  landingPageId: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  brand: string | null;
  model: string | null;
  requestType: LeadRequestType;
  message: string | null;
  internalComment: string | null;
  status: LeadEventStatus;
  sourceUrl: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  campaign: { name: string };
  landingPage: { title: string; slug: string };
};

export function toLeadEventDetail(item: LeadEventWithRelations): LeadEventDetail {
  return {
    id: item.id,
    campaignId: item.campaignId,
    landingPageId: item.landingPageId,
    fullName: item.fullName,
    phone: item.phone,
    email: item.email,
    city: item.city,
    brand: item.brand,
    model: item.model,
    requestType: item.requestType,
    message: item.message,
    internalComment: item.internalComment,
    status: item.status,
    sourceUrl: item.sourceUrl,
    userAgent: item.userAgent,
    ipAddress: item.ipAddress,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    campaignName: item.campaign.name,
    landingPageTitle: item.landingPage.title,
    landingPageSlug: item.landingPage.slug,
  };
}

export const leadEventDetailInclude = {
  campaign: { select: { name: true } },
  landingPage: { select: { title: true, slug: true } },
} as const;
