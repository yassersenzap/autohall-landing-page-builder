/**
 * Defaults pour nouveaux blocs du builder — contenu vide, structure conservée.
 * Ne pas confondre avec DEFAULT_EDITOR_BLOCK_PROPS (templates / legacy).
 */
import {
  DEFAULT_CTA_DESIGN,
  DEFAULT_FEATURES_DESIGN,
  DEFAULT_FOOTER_DESIGN,
  DEFAULT_FORM_DESIGN,
  DEFAULT_HERO_DESIGN,
  DEFAULT_IMAGE_DESIGN,
  DEFAULT_TEXT_DESIGN,
} from './default-block-design';

const STANDARD_LEAD_FORM_FIELDS = [
  { name: 'fullName', label: 'Nom complet', type: 'text', required: true },
  { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email', required: false },
  {
    name: 'vehicleModel',
    label: 'Modèle souhaité',
    type: 'text',
    required: false,
  },
] as const;

export const BUILDER_NEUTRAL_DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  hero: {
    eyebrow: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    secondaryButtonText: '',
    secondaryButtonTarget: '#offer',
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    design: { ...DEFAULT_HERO_DESIGN },
  },
  lead_form: {
    title: '',
    subtitle: '',
    submitText: 'Envoyer ma demande',
    privacyNote:
      'Vos données sont traitées conformément à notre politique de confidentialité.',
    reassurance: [],
    fields: STANDARD_LEAD_FORM_FIELDS.map((f) => ({ ...f })),
    design: { ...DEFAULT_FORM_DESIGN },
  },
  trust_bar: {
    metrics: [],
  },
  features: {
    modelName: '',
    modelTagline: '',
    heading: '',
    subtitle: '',
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    items: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    design: { ...DEFAULT_FEATURES_DESIGN },
  },
  text: {
    heading: '',
    content: '',
    design: { ...DEFAULT_TEXT_DESIGN },
  },
  image: {
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    caption: '',
    design: { ...DEFAULT_IMAGE_DESIGN },
  },
  faq: {
    heading: '',
    subtitle: '',
    items: [{ question: '', answer: '' }],
  },
  final_cta: {
    title: '',
    subtitle: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    design: { ...DEFAULT_CTA_DESIGN },
  },
  footer_legal: {
    legalText: '',
    links: [],
    design: { ...DEFAULT_FOOTER_DESIGN },
  },
};
