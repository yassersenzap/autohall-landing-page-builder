/** Defaults des blocs conversion & réassurance V3. */

export function buildVideoEmbedDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    videoUrl: '',
    title: 'Découvrez le véhicule en vidéo',
    design: { variant: 'standard', tone: 'neutral', alignment: 'center' },
    ...overrides,
  };
}

export function buildCTABandDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: 'Prêt à essayer votre prochain véhicule ?',
    buttonText: 'Réserver un essai',
    buttonHref: '#lead-form',
    ...overrides,
  };
}

export function buildPricingTrimDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Finitions & financement',
    subtitle: 'Comparez les équipements et trouvez la finition adaptée à votre budget.',
    trims: [
      {
        name: 'Active',
        price: '189 900 DH',
        features: ['Climatisation manuelle', 'Écran tactile 8"', 'Aide au stationnement arrière'],
        buttonText: 'Choisir Active',
        featured: false,
      },
      {
        name: 'Style',
        price: '209 900 DH',
        features: ['Jantes alliage 17"', 'Caméra de recul', 'Apple CarPlay / Android Auto'],
        buttonText: 'Choisir Style',
        featured: true,
      },
      {
        name: 'Excellence',
        price: '239 900 DH',
        features: ['Sellerie cuir', 'Toit panoramique', 'Pack assistance avancée'],
        buttonText: 'Choisir Excellence',
        featured: false,
      },
    ],
    ...overrides,
  };
}

export function buildFAQDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Questions fréquentes',
    items: [
      {
        question: 'Quelle est la garantie constructeur ?',
        answer:
          'Tous nos véhicules neufs bénéficient de la garantie constructeur officielle, généralement 3 ans ou 100 000 km.',
      },
      {
        question: 'Proposez-vous des solutions de financement ?',
        answer:
          'Oui, nos conseillers Auto Hall étudient avec vous crédit classique, LOA ou LLD selon votre profil.',
      },
      {
        question: 'Puis-je essayer le véhicule avant achat ?',
        answer:
          'Bien sûr. Réservez un essai gratuit en concession ou à domicile via le formulaire de contact.',
      },
      {
        question: 'Quels délais de livraison ?',
        answer:
          'Les délais varient selon le modèle et la finition. Votre conseiller vous confirme la date lors de la commande.',
      },
    ],
    ...overrides,
  };
}

export function buildTestimonialsDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Ils nous font confiance',
    items: [
      {
        quote:
          'Accueil impeccable et conseils transparents. J’ai trouvé la finition idéale pour mon budget.',
        author: 'Karim B.',
        verified: true,
      },
      {
        quote:
          'Essai à domicile très pratique. La livraison s’est faite dans les délais annoncés.',
        author: 'Sophie L.',
        verified: true,
      },
      {
        quote:
          'Financement clair, sans mauvaise surprise. Je recommande Auto Hall les yeux fermés.',
        author: 'Mehdi A.',
        verified: true,
      },
    ],
    ...overrides,
  };
}
