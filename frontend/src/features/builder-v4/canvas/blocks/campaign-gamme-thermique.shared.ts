import type { MouseEvent } from 'react';
import type { CampaignGammeThermiqueBlockProps, CGTField } from '../../lib/pro-blocks';

/** Fixed Auto Hall form card radius — not user-configurable. */
export const CGT_FORM_CARD_RADIUS = '10px';

export const CGT_DEFAULT_PRIMARY = '#288fe3';
export const CGT_DEFAULT_FORM_BG = '#ffffff';
export const CGT_DEFAULT_LAYOUT_BG = '#f2f2f2';
export const CGT_DEFAULT_INPUT_BORDER = '#d1d5db';

export const DEFAULT_CHERY_MODELS = [
  'CHERY TIGGO 4 CROSS HEV',
  'CHERY TIGGO 7 PRO PHEV',
  'CHERY TIGGO 8 PHEV',
  'CHERY TIGGO 3X',
  'CHERY ARRIZO 6',
] as const;

/** Stable production URL — loads reliably in Studio without Vite static assets. */
export const CGT_DEFAULT_BANNER =
  'https://www.autohall.ma/assets/campagne/Gamme-Thermique-1200x628.jpg';
export const CGT_FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80';
export const CGT_DEFAULT_BANNER_ALT = 'Chery Gamme Thermique \u2014 Auto Hall';

/** Local / relative paths that fail in the Studio canvas — remap to production CDN. */
const STUDIO_UNRELIABLE_BANNERS = new Set([
  '/assets/campagne/Gamme-Thermique-1200x628.jpg',
  'assets/campagne/Gamme-Thermique-1200x628.jpg',
  '/assets/hero-fixtures/chery.webp',
  'assets/hero-fixtures/chery.webp',
]);

/** UTF-8 safe copy — Unicode escapes prevent encoding corruption. */
export const CGT_COPY = {
  step1Title: 'S\u00e9lectionnez le v\u00e9hicule que vous souhaitez essayer',
  step2Title: 'Commen\u00e7ons par confirmer votre disponibilit\u00e9',
  step3Title: 'Enfin, fournissez votre nom et t\u00e9l\u00e9phone',
  step1Desc:
    'S\u00e9lectionnez le type de v\u00e9hicule souhait\u00e9. Vous pourrez toujours essayer d\u2019autres v\u00e9hicules chez votre concessionnaire.',
  step2Desc: 'Veuillez indiquer vos disponibilit\u00e9s pour l\u2019essai.',
  step3Desc: 'Veuillez fournir vos informations pour r\u00e9server un essai.',
  stepLabel: '\u00c9tape',
  modelLabel: 'Mod\u00e8le souhait\u00e9',
  modelPlaceholder: '-- S\u00e9lectionner un mod\u00e8le --',
  cityPlaceholder: '-- S\u00e9lectionner une ville --',
  dateLabel: 'Date pr\u00e9f\u00e9r\u00e9e pour l\u2019essai',
  phoneLabel: 'T\u00e9l\u00e9phone',
  successMessage:
    'Notre \u00e9quipe Auto Hall prendra contact avec vous dans les plus brefs d\u00e9lais.',
  btnNext: 'Suivant',
  btnBack: 'Retour',
  btnSubmit: 'Soumettre',
  poweredBy: '\u00a9 2025 Auto Hall',
} as const;

export const CGT_DEFAULT_FIELDS: CGTField[] = [
  { id: 'modele', label: 'Modèle', placeholder: '', required: true, active: true },
  { id: 'ville', label: 'Ville', placeholder: '', required: true, active: true },
  { id: 'date', label: 'Date préférée pour l’essai', placeholder: '', required: true, active: true },
  { id: 'nom', label: 'Nom', placeholder: 'Entrez votre nom', required: true, active: true },
  { id: 'tel', label: 'Téléphone', placeholder: 'Entrez votre Téléphone', required: true, active: true },
  { id: 'email', label: 'Email', placeholder: 'Entrez votre adresse email', required: true, active: false },
];

export type ResolvedCgtProps = {
  primary: string;
  formBg: string;
  inputBorder: string;
  layoutBg: string;
  imgUrl: string;
  imgAlt: string;
  imageSizing: 'cover' | 'contain';
  formShadow: boolean;
  formOnLeft: boolean;
  modelsList: string[];
  villesList: string[];
  step1Title: string;
  step2Title: string;
  step3Title: string;
  btnNext: string;
  btnBack: string;
  btnSubmit: string;
  autoHallApiUrl: string;
  studioPreviewStep?: 1 | 2 | 3;
  borderRadius?: 'none' | 'md' | 'lg';
  formBgOpacity?: number;
  bgOpacity?: number;
  customizeVehicles?: boolean;
  fields: CGTField[];
};

export function resolveCgtBannerUrl(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) return CGT_DEFAULT_BANNER;
  // Ephemeral upload previews (blob/data) break in the Studio canvas — use stable CDN.
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return CGT_DEFAULT_BANNER;
  if (STUDIO_UNRELIABLE_BANNERS.has(trimmed)) return CGT_DEFAULT_BANNER;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `/${trimmed.replace(/^\//, '')}`;
}

export function resolveCgtImageSizing(
  raw?: string | null,
): 'cover' | 'contain' {
  const normalized = raw?.trim().toLowerCase();
  return normalized === 'contain' ? 'contain' : 'cover';
}

export function resolveCgtProps(
  props: Partial<CampaignGammeThermiqueBlockProps> | undefined,
): ResolvedCgtProps {
  const sp = props ?? {};
  const imageSizing = resolveCgtImageSizing(sp.imageSizing);

  return {
    primary: sp.colorPrimary || (sp as { primaryColor?: string }).primaryColor || CGT_DEFAULT_PRIMARY,
    formBg: (sp.formBgColor || sp.formBg) ?? CGT_DEFAULT_FORM_BG,
    inputBorder: sp.inputBorderColor || CGT_DEFAULT_INPUT_BORDER,
    layoutBg: sp.layoutBackground || CGT_DEFAULT_LAYOUT_BG,
    imgUrl: resolveCgtBannerUrl(sp.bannerImage || (sp as { campaignImage?: string }).campaignImage),
    imgAlt: sp.bannerAlt || (sp as { altText?: string }).altText || CGT_DEFAULT_BANNER_ALT,
    imageSizing,
    formShadow: sp.formShadow !== false,
    formOnLeft: sp.formPosition === 'left' || (sp as { formPosition?: string }).formPosition === 'Gauche',
    modelsList: Array.isArray(sp.modelsList) ? sp.modelsList : [],
    villesList: Array.isArray(sp.villesList) ? sp.villesList : [],
    step1Title: sp.step1Title ?? CGT_COPY.step1Title,
    step2Title: sp.step2Title ?? CGT_COPY.step2Title,
    step3Title: sp.step3Title ?? CGT_COPY.step3Title,
    btnNext: sp.btnNextLabel ?? CGT_COPY.btnNext,
    btnBack: sp.btnBackLabel ?? CGT_COPY.btnBack,
    btnSubmit: sp.btnSubmitLabel ?? CGT_COPY.btnSubmit,
    autoHallApiUrl: sp.autoHallApiUrl ?? '/api/public/leads',
    studioPreviewStep: sp.studioPreviewStep,
    borderRadius: sp.borderRadius ?? 'none',
    formBgOpacity: sp.bgOpacity ?? sp.formBgOpacity ?? 95,
    bgOpacity: sp.bgOpacity ?? sp.formBgOpacity ?? 95,
    customizeVehicles: sp.customizeVehicles ?? false,
    fields: Array.isArray(sp.fields) ? sp.fields : CGT_DEFAULT_FIELDS,
  };
}

export function openNativeDatePicker(event: MouseEvent<HTMLElement>) {
  const input = event.currentTarget.querySelector('input[type="date"]') as HTMLInputElement | null;
  input?.showPicker?.();
}
