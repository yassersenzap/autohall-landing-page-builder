import { DEFAULT_BLOCK_MOTION } from '../../block-motion';

type CardItem = { title: string; description: string; icon?: string };
type MetricItem = { value: string; label: string; helper?: string };
type TestimonialItem = { quote: string; author: string; role?: string };
type SpecItem = { label: string; value: string };
type CtaItem = { label: string; href: string; variant?: 'primary' | 'secondary' };
type StepItem = { title: string; description: string };

function withMotion(overrides?: Record<string, unknown>) {
  return { ...DEFAULT_BLOCK_MOTION, ...overrides };
}

export function buildPremiumBentoDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    eyebrow: 'Avantages exclusifs',
    title: 'Pourquoi choisir Auto Hall',
    subtitle: 'Un accompagnement complet, de la sélection du véhicule à l’après-vente.',
    layout: '2x2',
    visualStyle: 'glass',
    cards: [
      {
        title: 'Réseau national',
        description: 'Des concessions proches de chez vous, partout au Maroc.',
        icon: 'network',
      },
      {
        title: 'Financement sur mesure',
        description: 'Des solutions adaptées à votre budget et votre projet.',
        icon: 'finance',
      },
      {
        title: 'Garantie constructeur',
        description: 'Sérénité et transparence sur l’ensemble de la gamme.',
        icon: 'shield',
      },
      {
        title: 'Essai en concession',
        description: 'Prenez le volant avant de vous décider.',
        icon: 'drive',
      },
    ] satisfies CardItem[],
    sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'muted' },
    ...withMotion(),
    ...overrides,
  };
}

export function buildAnimatedStatsDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    metrics: [
      { value: '50+', label: 'Concessions', helper: 'Réseau national' },
      { value: '15', label: 'Marques', helper: 'Thermique & électrique' },
      { value: '24h', label: 'Réponse lead', helper: 'Engagement service' },
      { value: '98%', label: 'Satisfaction', helper: 'Clients accompagnés' },
    ] satisfies MetricItem[],
    layout: 'grid',
    style: 'premium',
    countAnimation: 'count_up',
    sectionStyle: { sectionPaddingY: 'lg', sectionBackground: 'brand' },
    ...withMotion({ motionPreset: 'fade_in' }),
    ...overrides,
  };
}

export function buildPremiumTestimonialsDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: 'Ils nous font confiance',
    testimonials: [
      {
        quote:
          'Un conseiller m’a accompagné de A à Z. Essai, financement et livraison sans stress.',
        author: 'Karim B.',
        role: 'Client Auto Hall — Casablanca',
      },
      {
        quote:
          'Service après-vente réactif et transparent. Je recommande le réseau Auto Hall.',
        author: 'Salma E.',
        role: 'Cliente Auto Hall — Rabat',
      },
      {
        quote:
          'Une expérience premium en concession, avec une offre claire et des délais tenus.',
        author: 'Youssef M.',
        role: 'Client Auto Hall — Marrakech',
      },
    ] satisfies TestimonialItem[],
    style: 'cards',
    sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'default' },
    ...withMotion({ motionPreset: 'stagger_children' }),
    ...overrides,
  };
}

export function buildVehicleShowcaseDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    brand: 'Auto Hall',
    model: 'Modèle phare',
    headline: 'Design affirmé, technologie de pointe',
    subtitle: 'Découvrez un véhicule pensé pour le quotidien comme pour les longs trajets.',
    imageUrl: '',
    imageAssetId: '',
    alt: 'Véhicule en vedette',
    price: 'À partir de — DH',
    specs: [
      { label: 'Motorisation', value: 'Hybride rechargeable' },
      { label: 'Autonomie', value: 'Jusqu’à — km' },
      { label: 'Garantie', value: '— ans' },
    ] satisfies SpecItem[],
    ctas: [
      { label: 'Réserver un essai', href: '#lead-form', variant: 'primary' },
      { label: 'Voir l’offre', href: '#offer', variant: 'secondary' },
    ] satisfies CtaItem[],
    layout: 'image_right',
    visualStyle: 'dark_card',
    imageFit: 'cover',
    focalPointX: 50,
    focalPointY: 50,
    sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'dark' },
    ...withMotion({ motionPreset: 'reveal' }),
    ...overrides,
  };
}

export function buildStickyLeadCtaDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    label: 'Offre en cours',
    title: 'Recevez votre proposition personnalisée',
    primaryCtaLabel: 'Demander un rappel',
    primaryCtaHref: '#lead-form',
    secondaryCtaLabel: 'Voir les modèles',
    secondaryCtaHref: '#offer',
    stickyMode: 'bottom',
    style: 'brand',
    sectionStyle: { sectionPaddingY: 'md', sectionBackground: 'brand' },
    ...withMotion({ motionPreset: 'slide_left' }),
    ...overrides,
  };
}

export function buildCampaignTimelineDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: 'Votre parcours en 3 étapes',
    steps: [
      {
        title: 'Choisissez votre modèle',
        description: 'Comparez les finitions et motorisations disponibles.',
      },
      {
        title: 'Remplissez le formulaire',
        description: 'Un conseiller étudie votre demande sous 24 h.',
      },
      {
        title: 'On vous contacte',
        description: 'Essai, financement et livraison en concession Auto Hall.',
      },
    ] satisfies StepItem[],
    style: 'cards',
    sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'muted' },
    ...withMotion({ motionPreset: 'fade_up' }),
    ...overrides,
  };
}

/** Defaults riches à l’insertion depuis le catalogue. */
export const PREMIUM_BLOCK_INSERT_DEFAULTS: Record<string, Record<string, unknown>> = {
  premium_bento_features: buildPremiumBentoDefaults(),
  animated_stats_strip: buildAnimatedStatsDefaults(),
  premium_testimonials: buildPremiumTestimonialsDefaults(),
  vehicle_showcase_split: buildVehicleShowcaseDefaults(),
  sticky_lead_cta: buildStickyLeadCtaDefaults(),
  campaign_timeline_steps: buildCampaignTimelineDefaults(),
};

export const PREMIUM_BLOCK_NEUTRAL_DEFAULTS: Record<string, Record<string, unknown>> = {
  premium_bento_features: buildPremiumBentoDefaults({
    eyebrow: '',
    title: '',
    subtitle: '',
    cards: [
      { title: '', description: '', icon: 'star' },
      { title: '', description: '', icon: 'star' },
    ],
  }),
  animated_stats_strip: buildAnimatedStatsDefaults({
    metrics: [{ value: '', label: '', helper: '' }],
    countAnimation: 'none',
  }),
  premium_testimonials: buildPremiumTestimonialsDefaults({
    title: '',
    testimonials: [{ quote: '', author: '', role: '' }],
  }),
  vehicle_showcase_split: buildVehicleShowcaseDefaults({
    brand: '',
    model: '',
    headline: '',
    subtitle: '',
    price: '',
    specs: [],
    ctas: [],
  }),
  sticky_lead_cta: buildStickyLeadCtaDefaults({
    label: '',
    title: '',
    primaryCtaLabel: '',
    primaryCtaHref: '#lead-form',
    secondaryCtaLabel: '',
    secondaryCtaHref: '#offer',
    stickyMode: 'none',
  }),
  campaign_timeline_steps: buildCampaignTimelineDefaults({
    title: '',
    steps: [{ title: '', description: '' }],
  }),
};
