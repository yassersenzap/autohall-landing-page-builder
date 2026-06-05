import type { PageThemeDraft } from '../builder-engine/store/builder-document.store';

/** Presets de style global — Auto Hall Premium Landing Kit */
export type PremiumStylePresetId =
  | 'premium_light'
  | 'premium_dark'
  | 'commercial_offer'
  | 'sav_service'
  | 'lead_minimal';

export type PremiumStylePreset = {
  id: PremiumStylePresetId;
  name: string;
  description: string;
  theme: Partial<PageThemeDraft>;
};

export const PREMIUM_STYLE_PRESETS: PremiumStylePreset[] = [
  {
    id: 'premium_light',
    name: 'Premium clair',
    description: 'Fond clair, titres équilibrés, boutons pilule.',
    theme: {
      mode: 'light',
      primaryColor: '#b91c1c',
      headingScale: 'normal',
      sectionSpacing: 'normal',
      buttonStyle: 'pill',
    },
  },
  {
    id: 'premium_dark',
    name: 'Premium sombre',
    description: 'Ambiance cinématique, contraste élevé.',
    theme: {
      mode: 'dark',
      primaryColor: '#dc2626',
      headingScale: 'large',
      sectionSpacing: 'spacious',
      buttonStyle: 'pill',
    },
  },
  {
    id: 'commercial_offer',
    name: 'Offre commerciale',
    description: 'Impact promotionnel, sections aérées.',
    theme: {
      mode: 'dark',
      primaryColor: '#b91c1c',
      headingScale: 'large',
      sectionSpacing: 'spacious',
      buttonStyle: 'rounded',
    },
  },
  {
    id: 'sav_service',
    name: 'SAV / Service',
    description: 'Sobre, lisible, espacement confortable.',
    theme: {
      mode: 'light',
      primaryColor: '#18181b',
      headingScale: 'normal',
      sectionSpacing: 'normal',
      buttonStyle: 'rounded',
    },
  },
  {
    id: 'lead_minimal',
    name: 'Capture lead minimal',
    description: 'Formulaire prioritaire, layout compact.',
    theme: {
      mode: 'light',
      primaryColor: '#b91c1c',
      headingScale: 'compact',
      sectionSpacing: 'compact',
      buttonStyle: 'pill',
    },
  },
];

export function getPremiumStylePreset(
  id: PremiumStylePresetId,
): PremiumStylePreset | undefined {
  return PREMIUM_STYLE_PRESETS.find((preset) => preset.id === id);
}
