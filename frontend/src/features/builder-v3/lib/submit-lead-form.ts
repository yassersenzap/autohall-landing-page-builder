import { submitPublicLead } from '@/lib/public-leads.api';
import type { BuilderLeadContextValue } from '../context/BuilderPreviewContext';

function readField(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!el) return '';
  if (el instanceof HTMLSelectElement || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.value.trim();
  }
  return '';
}

function buildFullName(form: HTMLFormElement): string {
  const fullName = readField(form, 'fullName');
  if (fullName) return fullName;

  const firstName = readField(form, 'firstName');
  const lastName = readField(form, 'lastName');
  return `${firstName} ${lastName}`.trim();
}

export type LeadFormSubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function resolveSourceUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const currentUrl = window.location.href || '';
  if (currentUrl.startsWith('file://')) {
    return 'http://offline-test.autohall.local';
  }
  return currentUrl || 'http://offline-test.autohall.local';
}

export async function submitLeadFormFromDom(
  form: HTMLFormElement,
  context: BuilderLeadContextValue,
): Promise<LeadFormSubmitResult> {
  const consent = form.querySelector<HTMLInputElement>('input[name="consent"]');
  if (consent && !consent.checked) {
    return {
      ok: false,
      message: 'Veuillez accepter le traitement de vos données personnelles.',
    };
  }

  const fullName = buildFullName(form);
  const phone = readField(form, 'phone');

  if (!fullName || !phone) {
    return { ok: false, message: 'Nom et téléphone sont obligatoires.' };
  }

  if (!context.landingPageId && !context.landingSlug) {
    return {
      ok: false,
      message: 'Configuration landing incomplète — identifiant page manquant.',
    };
  }

  await submitPublicLead({
    campaignId: context.campaignId,
    landingPageId: context.landingPageId,
    landingSlug: context.landingSlug,
    pageVersionId: context.pageVersionId,
    fullName,
    phone,
    email: readField(form, 'email') || undefined,
    city: readField(form, 'city') || undefined,
    vehicleModel: readField(form, 'vehicleModel') || undefined,
    message: readField(form, 'message') || undefined,
    sourceUrl: resolveSourceUrl(),
    rawPayload: {
      civility: readField(form, 'civility') || undefined,
    },
  });

  return {
    ok: true,
    message: 'Merci, un conseiller Auto Hall vous contactera sous 24h.',
  };
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
