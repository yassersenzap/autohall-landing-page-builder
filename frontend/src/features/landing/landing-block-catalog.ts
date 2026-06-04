import { DEFAULT_LEAD_FORM_PROPS } from '../../lib/lead-form-block';

export const EDITOR_BLOCK_TYPES = [
  'hero',
  'trust_bar',
  'text',
  'image',
  'button',
  'lead_form',
  'benefits',
  'offer_highlights',
  'features',
  'financing',
  'after_sales',
  'testimonials',
  'faq',
  'final_cta',
  'footer_legal',
] as const;

export type EditorBlockType = (typeof EDITOR_BLOCK_TYPES)[number];

export type EditorBlockCategory =
  | 'hero'
  | 'conversion'
  | 'offer'
  | 'trust'
  | 'content'
  | 'footer';

export const BLOCK_CATEGORY_LABELS: Record<EditorBlockCategory, string> = {
  hero: 'Hero',
  conversion: 'Conversion',
  offer: 'Offre',
  trust: 'Confiance',
  content: 'Contenu',
  footer: 'Pied de page',
};

export type EditorPageBlock = {
  id: string;
  pageVersionId: string;
  blockKey: string;
  blockType: string;
  sortOrder: number;
  propsJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type EditorCreateBlockPayload = {
  blockType: EditorBlockType;
  propsJson: Record<string, unknown>;
  sortOrder?: number;
};

export type EditorUpdateBlockPayload = {
  blockType?: EditorBlockType;
  sortOrder?: number;
  propsJson?: Record<string, unknown>;
};

export type EditorBlockDefinition = {
  type: EditorBlockType;
  label: string;
  description: string;
  icon: string;
  category: EditorBlockCategory;
  landingClassName: string;
};

const VEHICLE_IMAGE =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80';

export const EDITOR_BLOCK_LIBRARY: EditorBlockDefinition[] = [
  {
    type: 'hero',
    category: 'hero',
    label: 'Bannière principale',
    description: 'Titre, visuel véhicule et appel à l’action.',
    icon: 'H',
    landingClassName: 'lp-hero',
  },
  {
    type: 'trust_bar',
    category: 'trust',
    label: 'Bandeau de réassurance',
    description: 'Chiffres clés et preuves de confiance.',
    icon: '+',
    landingClassName: 'lp-trust-bar',
  },
  {
    type: 'lead_form',
    category: 'conversion',
    label: 'Formulaire de contact',
    description: 'Collecte les demandes clients et leads.',
    icon: 'F',
    landingClassName: 'lp-lead-form',
  },
  {
    type: 'benefits',
    category: 'trust',
    label: 'Avantages & confiance',
    description: 'Points forts et réassurance.',
    icon: '✓',
    landingClassName: 'lp-benefits',
  },
  {
    type: 'offer_highlights',
    category: 'offer',
    label: 'Points forts de l’offre',
    description: 'Met en avant les bénéfices clés.',
    icon: '★',
    landingClassName: 'lp-offer-highlights',
  },
  {
    type: 'features',
    category: 'offer',
    label: 'Équipements & caractéristiques',
    description: 'Détails véhicule ou services.',
    icon: '⚙',
    landingClassName: 'lp-features',
  },
  {
    type: 'financing',
    category: 'offer',
    label: 'Financement / offre commerciale',
    description: 'Conditions et simulation financement.',
    icon: '€',
    landingClassName: 'lp-financing',
  },
  {
    type: 'after_sales',
    category: 'trust',
    label: 'Après-vente & services',
    description: 'Entretien, garantie, SAV.',
    icon: 'S',
    landingClassName: 'lp-after-sales',
  },
  {
    type: 'testimonials',
    category: 'trust',
    label: 'Témoignages clients',
    description: 'Preuve sociale et avis.',
    icon: '“',
    landingClassName: 'lp-testimonials',
  },
  {
    type: 'faq',
    category: 'content',
    label: 'Questions fréquentes',
    description: 'Réponses aux objections courantes.',
    icon: '?',
    landingClassName: 'lp-faq',
  },
  {
    type: 'text',
    category: 'content',
    label: 'Bloc de texte',
    description: 'Paragraphe éditorial libre.',
    icon: 'T',
    landingClassName: 'lp-text',
  },
  {
    type: 'image',
    category: 'content',
    label: 'Visuel pleine largeur',
    description: 'Photo véhicule ou ambiance.',
    icon: 'M',
    landingClassName: 'lp-media',
  },
  {
    type: 'button',
    category: 'conversion',
    label: 'Bandeau d’action',
    description: 'CTA intermédiaire.',
    icon: 'C',
    landingClassName: 'lp-cta-band',
  },
  {
    type: 'final_cta',
    category: 'conversion',
    label: 'Appel à l’action final',
    description: 'Dernière incitation avant le footer.',
    icon: '→',
    landingClassName: 'lp-final-cta',
  },
  {
    type: 'footer_legal',
    category: 'footer',
    label: 'Mentions légales',
    description: 'Texte légal et liens obligatoires.',
    icon: '§',
    landingClassName: 'lp-footer-legal',
  },
];

export const DEFAULT_EDITOR_BLOCK_PROPS: Record<
  EditorBlockType,
  Record<string, unknown>
> = {
  hero: {
    eyebrow: 'Offre Auto Hall',
    title: 'Votre prochaine voiture, en toute sérénité',
    subtitle:
      'Essai, financement et accompagnement personnalisé par nos conseillers.',
    buttonText: 'Réserver un essai',
    buttonTarget: '#lead-form',
    secondaryButtonText: 'Découvrir l’offre',
    secondaryButtonTarget: '#offer',
    imageUrl: VEHICLE_IMAGE,
    alt: 'Véhicule Auto Hall',
    imageAlignment: 'right',
    backgroundTheme: 'dark',
  },
  trust_bar: {
    metrics: [
      { value: '4.8/5', label: 'Satisfaction clients' },
      { value: '48h', label: 'Réponse conseiller' },
      { value: '15+', label: 'Années d’expertise' },
      { value: '100%', label: 'Véhicules contrôlés' },
    ],
  },
  text: {
    heading: 'Une expérience premium en concession',
    content:
      'Auto Hall vous accompagne de la recherche à la livraison.\n\nTransparence, conseil et services après-vente de qualité.',
  },
  image: {
    imageUrl: VEHICLE_IMAGE,
    alt: 'Véhicule en concession Auto Hall',
    caption: 'Modèles disponibles immédiatement.',
  },
  button: {
    label: 'Découvrir l’offre',
    target: '#lead-form',
    description: 'Nos équipes vous rappellent sous 24h ouvrées.',
  },
  lead_form: DEFAULT_LEAD_FORM_PROPS,
  benefits: {
    heading: 'Pourquoi choisir Auto Hall',
    subtitle: 'Des garanties concrètes pour acheter en confiance.',
    items: [
      { title: 'Conseillers dédiés', description: 'Un interlocuteur unique du début à la fin.' },
      { title: 'Véhicules contrôlés', description: 'Historique et état vérifiés avant livraison.' },
      { title: 'Financement adapté', description: 'Solutions mensualisées selon votre budget.' },
    ],
  },
  offer_highlights: {
    heading: 'Les points forts de l’offre',
    subtitle: 'Des avantages immédiats pour passer à l’action.',
    highlights: [
      { title: 'Remise exceptionnelle', description: 'Jusqu’à -15 % sur une sélection de modèles.' },
      { title: 'Reprise valorisée', description: 'Estimation rapide de votre véhicule actuel.' },
      { title: 'Livraison rapide', description: 'Disponibilité sous 15 jours sur stock.' },
    ],
  },
  features: {
    layout: 'showcase',
    modelName: 'Modèle phare',
    modelTagline: 'Design, technologie et efficience pour votre quotidien.',
    imageUrl: VEHICLE_IMAGE,
    heading: 'Équipements & services inclus',
    subtitle: 'Tout ce qui fait la différence au quotidien.',
    items: [
      { title: 'Sécurité avancée', description: 'Aides à la conduite et freinage renforcé.' },
      { title: 'Connectivité', description: 'Navigation, Bluetooth et recharge USB.' },
      { title: 'Confort', description: 'Climatisation, sellerie premium et hayon électrique.' },
    ],
    imageAlignment: 'right',
    backgroundTheme: 'light',
  },
  financing: {
    heading: 'Financez votre véhicule sereinement',
    subtitle: 'Simulation personnalisée avec nos partenaires.',
    paymentExample: '299 € / mois',
    bullets: [
      'Apport à partir de 0 €',
      'Durée flexible jusqu’à 84 mois',
      'Réponse de principe rapide',
    ],
    ctaLabel: 'Demander une simulation',
    ctaTarget: '#lead-form',
  },
  after_sales: {
    heading: 'Service après-vente Auto Hall',
    subtitle: 'Nous restons à vos côtés après la livraison.',
    items: [
      { title: 'Entretien', description: 'Ateliers agréés et pièces d’origine.' },
      { title: 'Garantie', description: 'Extensions possibles selon le modèle.' },
      { title: 'Assistance', description: 'Support dédié 6j/7.' },
    ],
  },
  testimonials: {
    heading: 'Ils nous font confiance',
    subtitle: 'Retours d’expérience de nos clients.',
    quotes: [
      {
        text: 'Accueil impeccable et livraison dans les délais. Je recommande Auto Hall.',
        author: 'Karim B.',
        role: 'Client particulier',
      },
      {
        text: 'Financement clair et sans surprise. Très bon suivi commercial.',
        author: 'Sophie L.',
        role: 'Cliente fleet',
      },
    ],
  },
  faq: {
    heading: 'Questions fréquentes',
    subtitle: 'Tout ce qu’il faut savoir avant de nous contacter.',
    items: [
      {
        question: 'Puis-je réserver un essai en ligne ?',
        answer: 'Oui, remplissez le formulaire et un conseiller vous rappelle pour fixer un créneau.',
      },
      {
        question: 'Proposez-vous la reprise de mon véhicule ?',
        answer: 'Oui, une estimation est réalisée lors de votre visite ou sur rendez-vous.',
      },
    ],
  },
  final_cta: {
    title: 'Prêt à passer à l’action ?',
    subtitle: 'Réservez votre essai ou demandez un rappel en quelques clics.',
    buttonText: 'Je réserve mon essai',
    buttonTarget: '#lead-form',
  },
  footer_legal: {
    legalText:
      'Offre réservée aux particuliers, sous réserve de disponibilité. Photos non contractuelles. Auto Hall — informations légales sur demande.',
    links: [
      { label: 'Mentions légales', href: '#' },
      { label: 'Politique de confidentialité', href: '#' },
    ],
  },
};

export type EditorDeviceMode = 'desktop' | 'mobile';

export function getBlockLabel(blockType: string): string {
  const match = EDITOR_BLOCK_LIBRARY.find((item) => item.type === blockType);
  return match?.label ?? blockType;
}
