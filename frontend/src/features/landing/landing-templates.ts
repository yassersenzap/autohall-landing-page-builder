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
    description: 'Landing orientée prise de rendez-vous essai et conversion lead.',
    audience: 'Prospects en phase de découverte',
    blocks: [
      block('hero', {
        eyebrow: 'Essai Auto Hall',
        title: 'Essayez le modèle qui vous correspond',
        subtitle: 'Réservez votre créneau en concession en moins de 2 minutes.',
        buttonText: 'Réserver mon essai',
      }),
      block('benefits'),
      block('features'),
      block('lead_form', {
        title: 'Demander un essai',
        subtitle: 'Un conseiller vous rappelle pour confirmer date et lieu.',
      }),
      block('testimonials'),
      block('faq'),
      block('final_cta'),
      block('footer_legal'),
    ],
  },
  {
    id: 'seasonal_offer',
    name: 'Offre saisonnière',
    description: 'Mise en avant d’une promotion limitée avec preuves et financement.',
    audience: 'Campagnes promotionnelles',
    blocks: [
      block('hero', {
        eyebrow: 'Offre limitée',
        title: 'Profitez de conditions exceptionnelles',
        subtitle: 'Stock limité — offre valable jusqu’à épuisement des véhicules.',
        buttonText: 'Voir l’offre',
      }),
      block('offer_highlights'),
      block('financing'),
      block('lead_form'),
      block('benefits'),
      block('final_cta', {
        title: 'Ne manquez pas cette offre',
        buttonText: 'Je profite de l’offre',
      }),
      block('footer_legal'),
    ],
  },
  {
    id: 'after_sales',
    name: 'Après-vente & services',
    description: 'Landing service, entretien et fidélisation client.',
    audience: 'Clients existants et SAV',
    blocks: [
      block('hero', {
        eyebrow: 'Service Auto Hall',
        title: 'Entretien, garantie et tranquillité',
        subtitle: 'Prenez rendez-vous atelier ou demandez un rappel conseiller.',
        buttonText: 'Prendre rendez-vous',
        imageUrl:
          'https://images.unsplash.com/photo-1486262715619-67b85ebc5f6c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Atelier Auto Hall',
      }),
      block('after_sales'),
      block('benefits', {
        heading: 'Nos engagements qualité',
        items: [
          { title: 'Techniciens certifiés', description: 'Diagnostic et réparations conformes constructeur.' },
          { title: 'Pièces d’origine', description: 'Traçabilité et durabilité garanties.' },
          { title: 'Véhicule de courtoisie', description: 'Sur demande selon disponibilité.' },
        ],
      }),
      block('lead_form', {
        title: 'Demander un rendez-vous',
        submitText: 'Envoyer ma demande',
      }),
      block('faq'),
      block('footer_legal'),
    ],
  },
  {
    id: 'vehicle_launch',
    name: 'Lancement véhicule',
    description: 'Présentation d’un nouveau modèle avec visuels et équipements.',
    audience: 'Lancement produit / nouveau modèle',
    blocks: [
      block('hero', {
        eyebrow: 'Nouveau modèle',
        title: 'Découvrez le nouveau modèle Auto Hall',
        subtitle: 'Design, technologie et performance réunis pour votre quotidien.',
        buttonText: 'Découvrir le modèle',
      }),
      block('image'),
      block('features', {
        heading: 'Caractéristiques clés',
        items: [
          { title: 'Motorisation hybride', description: 'Consommation réduite et conduite fluide.' },
          { title: 'Intérieur connecté', description: 'Écran tactile et services embarqués.' },
          { title: 'Sécurité 5 étoiles', description: 'Équipements ADAS de série.' },
        ],
      }),
      block('offer_highlights'),
      block('lead_form', {
        title: 'Être informé du lancement',
        subtitle: 'Recevez les disponibilités et offres de lancement.',
      }),
      block('testimonials'),
      block('final_cta'),
      block('footer_legal'),
    ],
  },
];

export function getLandingTemplate(id: LandingTemplateId): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((template) => template.id === id);
}
