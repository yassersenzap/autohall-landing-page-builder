import {
  buildAutoHallLeadFormFields,
  DEFAULT_AUTOHALL_CONSENT_LABEL,
  DEFAULT_AUTOHALL_FORM_CONFIG,
  DEFAULT_AUTOHALL_REQUIRED_NOTE,
  type LeadFormConfig,
} from '@/features/builder-engine/constants/autohall-lead-form';
import { DEFAULT_FORM_DESIGN, DEFAULT_HERO_DESIGN } from '@/features/builder-engine/constants/default-block-design';

export type CoreCampaignLayout =
  | 'image_left_form_right'
  | 'form_left_image_right'
  | 'background_image_form_card'
  | 'full_width_banner_form_side';

export type CoreVisualType = 'campaign_image' | 'vehicle_image';

export type CoreFormMode = 'test_drive' | 'contact' | 'callback' | 'model_interest';

export type CoreFieldsPreset = 'city_date' | 'model_city' | 'name_phone' | 'contact_preference';

export type CoreStepCount = 2 | 3;

const FORM_CONFIG_BY_PRESET: Record<CoreFieldsPreset, Partial<LeadFormConfig>> = {
  city_date: {
    showCivility: true,
    useSplitName: true,
    showCity: true,
    showVehicleModel: false,
    showMessage: false,
    showEmail: true,
    showConsent: true,
  },
  model_city: {
    showCivility: true,
    useSplitName: true,
    showCity: true,
    showVehicleModel: true,
    showMessage: false,
    showEmail: true,
    showConsent: true,
  },
  name_phone: {
    showCivility: false,
    useSplitName: true,
    showCity: false,
    showVehicleModel: false,
    showMessage: false,
    showEmail: false,
    showConsent: true,
  },
  contact_preference: {
    showCivility: true,
    useSplitName: true,
    showCity: true,
    showVehicleModel: false,
    showMessage: true,
    showEmail: true,
    showConsent: true,
  },
};

const PRESET_BY_MODE: Record<CoreFormMode, CoreFieldsPreset> = {
  test_drive: 'city_date',
  contact: 'name_phone',
  callback: 'contact_preference',
  model_interest: 'model_city',
};

export function resolveCoreFieldsPreset(
  formMode: CoreFormMode,
  override?: CoreFieldsPreset,
): CoreFieldsPreset {
  return override ?? PRESET_BY_MODE[formMode] ?? 'city_date';
}

export function buildCoreFormConfig(
  formMode: CoreFormMode,
  fieldsPreset?: CoreFieldsPreset,
): LeadFormConfig {
  const preset = resolveCoreFieldsPreset(formMode, fieldsPreset);
  return { ...DEFAULT_AUTOHALL_FORM_CONFIG, ...FORM_CONFIG_BY_PRESET[preset] };
}

export function buildCoreCampaignFormLandingDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const coreLayout: CoreCampaignLayout = 'image_left_form_right';
  const visualType = 'campaign_image' as CoreVisualType;
  const formMode: CoreFormMode = 'test_drive';
  const stepCount: CoreStepCount = 2;
  const fieldsPreset = resolveCoreFieldsPreset(formMode);
  const formConfig = buildCoreFormConfig(formMode, fieldsPreset);

  return {
    coreLayout,
    visualType,
    formMode,
    stepCount,
    fieldsPreset,
    overlayStrength: 'medium',
    brandLogoText: 'Auto Hall',
    title: 'Votre prochaine aventure commence ici',
    subtitle: 'Offres exclusives, financement sur mesure et essai en concession.',
    offerLine: 'À partir de — DH / mois',
    legalNote: 'Offre soumise à conditions. Photos non contractuelles.',
    primaryCtaLabel: '',
    imageAssetId: '',
    imageUrl: '',
    alt: 'Visuel campagne Auto Hall',
    formTitle: 'Réservez votre essai',
    formSubtitle: 'Un conseiller vous recontacte sous 24 h ouvrées.',
    submitText: 'Envoyer ma demande',
    consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
    requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
    footerCopyright: '© Auto Hall — Tous droits réservés.',
    formConfig,
    fields: buildAutoHallLeadFormFields(formConfig),
    design: {
      ...DEFAULT_HERO_DESIGN,
      tone: visualType === 'vehicle_image' ? 'light' : 'dark',
      mediaPosition: 'left',
      alignment: 'left',
    },
    form: {
      title: 'Réservez votre essai',
      subtitle: 'Un conseiller vous recontacte sous 24 h ouvrées.',
      submitText: 'Envoyer ma demande',
      consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
      requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
      formConfig,
      fields: buildAutoHallLeadFormFields(formConfig),
      design: { ...DEFAULT_FORM_DESIGN, layoutVariant: 'card_below' },
    },
    ...overrides,
  };
}
