/**
 * Defaults pour nouveaux blocs du builder — contenu vide, structure conservée.
 * Ne pas confondre avec DEFAULT_EDITOR_BLOCK_PROPS (templates / legacy).
 */

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
    imageAlignment: 'right',
    backgroundTheme: 'light',
  },
  lead_form: {
    title: '',
    subtitle: '',
    submitText: 'Envoyer ma demande',
    privacyNote:
      'Vos données sont traitées conformément à notre politique de confidentialité.',
    reassurance: [],
    fields: STANDARD_LEAD_FORM_FIELDS.map((f) => ({ ...f })),
  },
  trust_bar: {
    metrics: [],
  },
  features: {
    layout: 'showcase',
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
    imageAlignment: 'right',
    backgroundTheme: 'light',
  },
  text: {
    heading: '',
    content: '',
  },
  image: {
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    caption: '',
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
  },
  footer_legal: {
    legalText: '',
    links: [],
  },
};
