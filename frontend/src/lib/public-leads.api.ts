import { apiRequest } from './api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export type SubmitPublicLeadPayload = {
  campaignId?: string;
  landingPageId?: string;
  pageVersionId?: string;
  landingSlug?: string;
  fullName: string;
  phone: string;
  email?: string;
  vehicleModel?: string;
  city?: string;
  message?: string;
  sourceUrl?: string;
  rawPayload?: Record<string, unknown>;
};

/** Soumission publique de lead — endpoint sans authentification. */
export async function submitPublicLead(payload: SubmitPublicLeadPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/public/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(body?.message ?? 'Impossible d’envoyer votre demande.');
  }
}

/** Variante authentifiée (tests / back-office). */
export async function submitPublicLeadAuthed(payload: SubmitPublicLeadPayload) {
  return apiRequest<{ leadId: string; status: string }>('/api/public/leads', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}
