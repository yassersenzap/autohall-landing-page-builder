import type { EditorBlockType } from './landing-block-catalog';
import { DEFAULT_EDITOR_BLOCK_PROPS } from './landing-block-catalog';

export type LandingTemplateId =
  | 'test_drive'
  | 'seasonal_offer'
  | 'after_sales'
  | 'vehicle_launch';

export type LandingTemplateBlock = {
  blockType: EditorBlockType;
  propsJson: Record<string, unknown>;
};

export type LandingTemplate = {
  id: LandingTemplateId;
  name: string;
  description: string;
  audience: string;
  blocks: LandingTemplateBlock[];
};

function block(
  blockType: EditorBlockType,
  overrides: Record<string, unknown> = {},
): LandingTemplateBlock {
  return {
    blockType,
    propsJson: {
      ...JSON.parse(JSON.stringify(DEFAULT_EDITOR_BLOCK_PROPS[blockType])) as Record<
        string,
        unknown
      >,
      ...overrides,
    },
  };
}

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: 'test_drive',
    name: 'Campagne essai',
    description: 'Landing complète pour générer des demandes d’essai en concession.',
    audience: 'Prospects en phase de découverte',
    blocks: [
      block('hero', {
        eyebrow: 'Essai Auto Hall',
        title: 'Essayez le modèle qui vous correspond',
        subtitle:
          'Réservez votre créneau en concession. Conseiller dédié, véhicule préparé, sans engagement.',
        buttonText: 'Réserver mon essai',
        secondaryButtonText: 'Voir les avantages',
        secondaryButtonTarget: '#offer',
      }),
      block('trust_bar'),
      block('benefits', {
        heading: 'Pourquoi réserver chez Auto Hall',
        items: [
          { title: 'Essai personnalisé', description: 'Parcours adapté à votre usage quotidien.' },
          { title: 'Conseiller dédié', description: 'Un interlocuteur unique avant et après l’essai.' },
          { title: 'Reprise possible', description: 'Estimation de votre véhicule actuel sur place.' },
        ],
      }),
      block('features', {
        layout: 'showcase',
        heading: 'Le modèle en un coup d’œil',
        modelName: 'SUV compact',
        modelTagline: 'Polyvalent, économique et prêt pour la route.',
        items: [
          { title: 'Motorisation', description: 'Hybride 150 ch — faible consommation.' },
          { title: 'Sécurité', description: 'Aides à la conduite et freinage d’urgence.' },
          { title: 'Connectivité', description: 'Écran tactile et services embarqués.' },
        ],
      }),
      block('testimonials'),
      block('faq', {
        items: [
          {
            question: 'Combien de temps dure un essai ?',
            answer: 'Environ 30 à 45 minutes, sur itinéraire validé avec votre conseiller.',
          },
          {
            question: 'Quels documents apporter ?',
            answer: 'Permis de conduire valide et pièce d’identité.',
          },
        ],
      }),
      block('lead_form', {
        title: 'Réserver mon essai',
        subtitle: 'Complétez le formulaire — nous vous rappelons pour confirmer date et lieu.',
      }),
      block('final_cta', {
        title: 'Prêt à prendre le volant ?',
        subtitle: 'Places limitées cette semaine en concession.',
        buttonText: 'Je réserve maintenant',
      }),
      block('footer_legal'),
    ],
  },
  {
    id: 'seasonal_offer',
    name: 'Offre saisonnière',
    description: 'Campagne promotionnelle avec offre, financement et conversion.',
    audience: 'Campagnes promotionnelles',
    blocks: [
      block('hero', {
        eyebrow: 'Offre limitée',
        title: 'Profitez de conditions exceptionnelles',
        subtitle:
          'Remise, reprise valorisée et financement sur mesure — stock limité.',
        buttonText: 'Profiter de l’offre',
        secondaryButtonText: 'Voir le détail',
        secondaryButtonTarget: '#offer',
      }),
      block('trust_bar', {
        metrics: [
          { value: '-15 %', label: 'Sur sélection' },
          { value: '0 €', label: 'Apport possible' },
          { value: '48h', label: 'Réponse financement' },
          { value: '15 j', label: 'Livraison stock' },
        ],
      }),
      block('offer_highlights'),
      block('financing'),
      block('benefits', {
        heading: 'Vos garanties Auto Hall',
      }),
      block('testimonials'),
      block('faq'),
      block('lead_form', {
        title: 'Recevoir mon offre personnalisée',
        subtitle: 'Un conseiller vous contacte avec le détail de la promotion.',
      }),
      block('final_cta', {
        title: 'Ne manquez pas cette offre',
        subtitle: 'Offre valable jusqu’à épuisement du stock.',
        buttonText: 'Je profite de l’offre',
      }),
      block('footer_legal'),
    ],
  },
  {
    id: 'after_sales',
    name: 'Après-vente & services',
    description: 'Landing SAV : entretien, garantie et prise de rendez-vous atelier.',
    audience: 'Clients existants et SAV',
    blocks: [
      block('hero', {
        eyebrow: 'Service Auto Hall',
        title: 'Entretien, garantie et tranquillité',
        subtitle:
          'Ateliers agréés, pièces d’origine et suivi transparent de votre véhicule.',
        buttonText: 'Prendre rendez-vous',
        secondaryButtonText: 'Nos services',
        secondaryButtonTarget: '#offer',
        imageUrl:
          'https://images.unsplash.com/photo-1486262715619-67b85ebc5f6c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Atelier Auto Hall',
      }),
      block('trust_bar', {
        metrics: [
          { value: '6j/7', label: 'Accueil atelier' },
          { value: '100%', label: 'Pièces d’origine' },
          { value: '2 ans', label: 'Garantie pièces' },
          { value: 'Rapide', label: 'Devis transparent' },
        ],
      }),
      block('after_sales'),
      block('benefits', {
        heading: 'Nos engagements qualité',
        items: [
          { title: 'Techniciens certifiés', description: 'Diagnostic et réparations conformes constructeur.' },
          { title: 'Véhicule de courtoisie', description: 'Sur demande selon disponibilité.' },
          { title: 'Suivi digital', description: 'Statut d’avancement de votre intervention.' },
        ],
      }),
      block('testimonials', {
        heading: 'Avis clients atelier',
        quotes: [
          {
            text: 'Prise en charge rapide et devis clair avant intervention.',
            author: 'Nadia R.',
            role: 'Cliente SAV',
          },
        ],
      }),
      block('faq', {
        heading: 'Questions atelier',
        items: [
          {
            question: 'Puis-je réserver un créneau en ligne ?',
            answer: 'Oui, via le formulaire un conseiller atelier vous rappelle pour confirmer.',
          },
          {
            question: 'Proposez-vous un véhicule de remplacement ?',
            answer: 'Oui, selon disponibilité et nature de l’intervention.',
          },
        ],
      }),
      block('lead_form', {
        title: 'Demander un rendez-vous atelier',
        submitText: 'Envoyer ma demande',
      }),
      block('final_cta', {
        title: 'Votre véhicule mérite le meilleur entretien',
        buttonText: 'Prendre rendez-vous',
      }),
      block('footer_legal'),
    ],
  },
  {
    id: 'vehicle_launch',
    name: 'Lancement véhicule',
    description: 'Présentation premium d’un nouveau modèle avec preuves et conversion.',
    audience: 'Lancement produit / nouveau modèle',
    blocks: [
      block('hero', {
        eyebrow: 'Nouveau modèle',
        title: 'Découvrez le nouveau modèle Auto Hall',
        subtitle:
          'Design affirmé, technologies embarquées et efficience au quotidien.',
        buttonText: 'Être informé du lancement',
        secondaryButtonText: 'Voir le modèle',
        secondaryButtonTarget: '#model',
      }),
      block('trust_bar'),
      block('features', {
        layout: 'showcase',
        heading: 'Présentation du modèle',
        modelName: 'Nouveau SUV',
        modelTagline: 'L’équilibre parfait entre style, confort et performance.',
        items: [
          { title: 'Motorisation hybride', description: 'Consommation réduite, conduite fluide.' },
          { title: 'Intérieur connecté', description: 'Écran tactile et services embarqués.' },
          { title: 'Sécurité 5 étoiles', description: 'Équipements ADAS de série.' },
        ],
      }),
      block('offer_highlights', {
        heading: 'Offre de lancement',
        highlights: [
          { title: 'Bonus lancement', description: 'Avantages réservés aux premiers clients.' },
          { title: 'Financement 0 %', description: 'Selon conditions et profil.' },
          { title: 'Livraison prioritaire', description: 'Sur véhicules en stock.' },
        ],
      }),
      block('financing'),
      block('testimonials'),
      block('faq'),
      block('lead_form', {
        title: 'Recevoir les infos de lancement',
        subtitle: 'Soyez alerté des disponibilités et des offres exclusives.',
      }),
      block('final_cta', {
        title: 'Soyez parmi les premiers informés',
        buttonText: 'Je m’inscris',
      }),
      block('footer_legal'),
    ],
  },
];

export function getLandingTemplate(id: LandingTemplateId): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((template) => template.id === id);
}
