import { LeadPriority, LeadRequestType, LeadEventStatus } from '@prisma/client';

export type LeadAssigneeSummary = {
  id: string;
  fullName: string;
  email: string;
} | null;

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
  priority: LeadPriority;
  assignedToUserId: string | null;
  assignedTo: LeadAssigneeSummary;
  nextFollowUpAt: string | null;
  lastContactAt: string | null;
  isFollowUpOverdue: boolean;
  sourceUrl: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  campaignName: string;
  landingPageTitle: string;
  landingPageSlug: string;
};

type AssignedToSelect = {
  id: string;
  fullName: string;
  email: string;
} | null;

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
  priority: LeadPriority;
  assignedToUserId: string | null;
  assignedTo: AssignedToSelect;
  nextFollowUpAt: Date | null;
  lastContactAt: Date | null;
  sourceUrl: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  campaign: { name: string };
  landingPage: { title: string; slug: string };
};

export function isFollowUpOverdue(
  nextFollowUpAt: Date | null,
  status: LeadEventStatus,
): boolean {
  if (!nextFollowUpAt) {
    return false;
  }
  if (status === LeadEventStatus.ARCHIVED || status === LeadEventStatus.REJECTED) {
    return false;
  }
  return nextFollowUpAt.getTime() < Date.now();
}

export function toLeadAssigneeSummary(
  assignedTo: AssignedToSelect,
): LeadAssigneeSummary {
  if (!assignedTo) {
    return null;
  }
  return {
    id: assignedTo.id,
    fullName: assignedTo.fullName,
    email: assignedTo.email,
  };
}

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
    priority: item.priority,
    assignedToUserId: item.assignedToUserId,
    assignedTo: toLeadAssigneeSummary(item.assignedTo),
    nextFollowUpAt: item.nextFollowUpAt?.toISOString() ?? null,
    lastContactAt: item.lastContactAt?.toISOString() ?? null,
    isFollowUpOverdue: isFollowUpOverdue(item.nextFollowUpAt, item.status),
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

export const leadAssigneeSelect = {
  id: true,
  fullName: true,
  email: true,
} as const;

export const leadEventDetailInclude = {
  campaign: { select: { name: true } },
  landingPage: { select: { title: true, slug: true } },
  assignedTo: { select: leadAssigneeSelect },
} as const;
