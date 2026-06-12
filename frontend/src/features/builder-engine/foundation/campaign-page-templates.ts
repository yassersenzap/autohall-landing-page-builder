import {
  buildBenefitsDefaults,
  buildFooterLegalDefaults,
  buildGalleryDefaults,
  buildLeadFormDefaults,
  buildTrustBarDefaults,
  buildVehicleFeaturesDefaults,
  buildVehicleOfferDefaults,
  buildVehicleRangeDefaults,
} from '../constants/campaign-block-defaults';
import {
  buildCTABandDefaults,
  buildFAQDefaults,
  buildTestimonialsDefaults,
} from '../constants/conversion-block-defaults';
import type { CampaignPageTemplate } from './campaign-page-templates.types';

const GENERIC_FOOTER = buildFooterLegalDefaults({
  legalText:
    '© Auto Hall — Exemple de page à personnaliser. Offre soumise à conditions. Photos non contractuelles. Mentions légales à valider avant publication.',
});

const GENERIC_FAQ = buildFAQDefaults({
  heading: 'Vos questions, nos réponses',
  subtitle: 'Retrouvez les informations essentielles avant de nous contacter.',
});

export const CAMPAIGN_PAGE_TEMPLATE_BLOCK_TYPES = new Set([
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'lead_form',
  'vehicle_offer',
  'offer_highlights',
  'benefits',
  'vehicle_range',
  'vehicle_features',
  'gallery',
  'pricing_trim',
  'cta_band',
  'trust_bar',
  'testimonials',
  'faq',
  'footer_legal',
]);

export const CAMPAIGN_PAGE_TEMPLATES: CampaignPageTemplate[] = [
  {
    id: 'chery-campaign-offer',
    name: 'Campagne offre Chery',
    description:
      'Landing acquisition complète : hero lead, points forts offre, gamme modèles, réassurance SAV et FAQ.',
    brandId: 'chery',
    category: 'campaign',
    previewLabel: 'Chery · Campagne',
    recommendedUse: 'Promotions Tiggo / Tigo — capture lead rapide avec preuves de confiance.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero campagne Chery',
        variant: { variantId: 'campaign-hero-split-premium-form' },
        props: {
          brandId: 'chery',
          campaignTitle: 'Offre Chery du moment',
          campaignSubtitle:
            'Découvrez la gamme SUV Chery et profitez d’avantages exclusifs en concession Auto Hall.',
          offerBadge: 'Offre à durée limitée',
          formTitle: 'Recevez votre offre personnalisée',
          formSubtitle: 'Un conseiller Auto Hall vous rappelle sous 24 h ouvrées.',
          formCtaLabel: 'Obtenir mon offre',
          layoutVariant: 'media_left_form_right',
          design: { tone: 'light', formTheme: 'light', showOfferBadge: true, showProgressBar: true },
        },
      },
      {
        type: 'offer_highlights',
        label: 'Points forts offre',
        props: {
          sectionStyle: { sectionPaddingY: 'lg', sectionBackground: 'default' },
          heading: 'Les avantages de l’offre',
          subtitle: 'Un pack valeur pensé pour faciliter votre projet automobile.',
          modelName: 'Chery Tiggo',
          tagline: 'SUV compact technologique',
          priceLabel: 'À partir de',
          priceValue: '— DH',
          monthlyValue: 'ou — DH / mois',
          buttonText: 'Demander le détail',
          buttonTarget: '#lead-form',
          imageUrl: '',
          imageAssetId: '',
          highlights: [
            { title: 'Garantie constructeur', description: 'Sérénité sur plusieurs années.' },
            { title: 'Reprise simplifiée', description: 'Estimation rapide de votre véhicule actuel.' },
            { title: 'Financement flexible', description: 'Solutions adaptées à votre budget.' },
          ],
        },
      },
      {
        type: 'vehicle_range',
        label: 'Gamme Chery',
        props: {
          ...buildVehicleRangeDefaults({
          heading: 'Explorez la gamme Chery',
          subtitle: 'SUV urbains et familiaux — comparez les motorisations disponibles.',
          vehicles: [
            {
              name: 'Tiggo 4 Pro',
              energy: 'Thermique',
              tag: 'Urbain',
              imageUrl: '',
              imageAssetId: '',
              alt: 'Chery Tiggo 4 Pro',
              ctaText: 'Découvrir',
              ctaTarget: '#lead-form',
            },
            {
              name: 'Tiggo 7 Pro',
              energy: 'Hybride',
              tag: 'Familial',
              imageUrl: '',
              imageAssetId: '',
              alt: 'Chery Tiggo 7 Pro',
              ctaText: 'Découvrir',
              ctaTarget: '#lead-form',
            },
            {
              name: 'Tiggo 8 Pro',
              energy: 'Thermique',
              tag: '7 places',
              imageUrl: '',
              imageAssetId: '',
              alt: 'Chery Tiggo 8 Pro',
              ctaText: 'Découvrir',
              ctaTarget: '#lead-form',
            },
          ],
        }),
          sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'muted' },
        },
      },
      {
        type: 'benefits',
        label: 'Réassurance SAV',
        props: {
          ...buildBenefitsDefaults({
          heading: 'Un accompagnement Auto Hall',
          subtitle: 'Vente, financement et après-vente dans le même réseau.',
          items: [
            {
              title: 'Entretien en concession',
              description: 'Techniciens formés et pièces d’origine.',
            },
            {
              title: 'Assistance réactive',
              description: 'Une équipe SAV à votre écoute après l’achat.',
            },
            {
              title: 'Réseau national',
              description: 'Des points de service proches de chez vous.',
            },
          ],
        }),
          sectionStyle: { sectionPaddingY: 'lg', sectionBackground: 'muted' },
        },
      },
      {
        type: 'faq',
        props: {
          ...GENERIC_FAQ,
          blockVisual: { faqStyle: 'boxed', faqDensity: 'comfortable', iconStyle: 'chevron' },
          sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'default' },
        },
      },
      {
        type: 'footer_legal',
        props: GENERIC_FOOTER,
      },
    ],
  },
  {
    id: 'chery-model-landing',
    name: 'Landing modèle Chery',
    description:
      'Page modèle premium : hero véhicule, caractéristiques, galerie, finitions, formulaire et CTA.',
    brandId: 'chery',
    category: 'model',
    previewLabel: 'Chery · Modèle',
    recommendedUse: 'Lancement ou mise en avant d’un modèle précis (ex. Tiggo 7 Pro).',
    blocks: [
      {
        type: 'hero_vehicle_offer',
        label: 'Hero modèle Chery',
        variant: { variantId: 'vehicle-hero-focus-split' },
        props: {
          brandId: 'chery',
          modelName: 'Chery Tiggo 7 Pro',
          headline: 'Le SUV familial qui vous ressemble',
          subheadline:
            'Technologie embarquée, habitacle modulable et motorisations efficientes — à découvrir en concession.',
          offerLabel: 'Offre de lancement',
          priceText: 'À partir de — DH',
          primaryCtaLabel: 'Réserver un essai',
          secondaryCtaLabel: 'Voir les finitions',
          layoutVariant: 'split-media-right',
          design: { tone: 'brand', density: 'comfortable', ctaStyle: 'primary', showOfferBadge: true, alignContent: 'left' },
        },
      },
      {
        type: 'vehicle_features',
        props: buildVehicleFeaturesDefaults({
          heading: 'Caractéristiques clés',
          subtitle: 'Confort, sécurité et connectivité au quotidien.',
          items: [
            { title: 'Habitacle modulable', description: 'Espace généreux et rangements pratiques.', icon: 'settings' },
            { title: 'Aides à la conduite', description: 'Technologies pour rouler en confiance.', icon: 'gauge' },
            { title: 'Connectivité complète', description: 'Écran tactile et smartphone intégré.', icon: 'fuel' },
          ],
        }),
      },
      {
        type: 'gallery',
        props: buildGalleryDefaults({
          heading: 'Le modèle en images',
          subtitle: 'Extérieur, intérieur et détails — à personnaliser avec vos visuels.',
        }),
      },
      {
        type: 'pricing_trim',
        label: 'Finitions & tarifs',
        props: {
          heading: 'Choisissez votre finition',
          subtitle: 'Comparez les équipements et demandez une simulation financement.',
          trims: [
            {
              name: 'Comfort',
              price: '— DH',
              features: ['Climatisation automatique', 'Écran 10"', 'Caméra de recul'],
              buttonText: 'Configurer Comfort',
              featured: false,
            },
            {
              name: 'Luxury',
              price: '— DH',
              features: ['Sellerie cuir', 'Toit panoramique', 'Pack sécurité avancé'],
              buttonText: 'Configurer Luxury',
              featured: true,
            },
            {
              name: 'Flagship',
              price: '— DH',
              features: ['Audio premium', 'Sièges chauffants', 'Affichage tête haute'],
              buttonText: 'Configurer Flagship',
              featured: false,
            },
          ],
        },
      },
      {
        type: 'lead_form',
        label: 'Formulaire essai',
        props: buildLeadFormDefaults({
          title: 'Planifiez votre essai',
          subtitle: 'Choisissez votre créneau — un conseiller confirme votre rendez-vous.',
          submitText: 'Demander un essai',
        }),
      },
      {
        type: 'cta_band',
        props: buildCTABandDefaults({
          title: 'Prêt à prendre le volant ?',
          buttonText: 'Réserver mon essai',
          buttonHref: '#lead-form',
        }),
      },
      {
        type: 'footer_legal',
        props: GENERIC_FOOTER,
      },
    ],
  },
  {
    id: 'ford-offer-campaign',
    name: 'Campagne offre Ford',
    description:
      'Parcours conversion Ford : hero lead, fiche offre, caractéristiques, galerie, CTA et FAQ.',
    brandId: 'ford',
    category: 'campaign',
    previewLabel: 'Ford · Offre',
    recommendedUse: 'Opérations commerciales Ranger, Puma ou Mustang — lead + preuve produit.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero campagne Ford',
        variant: { variantId: 'campaign-hero-background-image' },
        props: {
          brandId: 'ford',
          campaignTitle: 'L’aventure Ford commence ici',
          campaignSubtitle:
            'Profitez d’offres exclusives sur la gamme Ford et d’un accompagnement personnalisé Auto Hall.',
          offerBadge: 'Offre Ford',
          formTitle: 'Demandez votre offre Ford',
          formSubtitle: 'Réponse sous 24 h par un conseiller du réseau.',
          formCtaLabel: 'Continuer',
          layoutVariant: 'form_left_media_right',
          design: { tone: 'brand', formTheme: 'light', showOfferBadge: true, showProgressBar: true },
        },
      },
      {
        type: 'vehicle_offer',
        label: 'Fiche offre véhicule',
        props: buildVehicleOfferDefaults('image_right_offer_left', {
          modelName: 'Ford Ranger',
          heading: 'Ford Ranger — prêt pour tous les terrains',
          subtitle: 'Robustesse, technologie et capacités de remorquage pour le travail comme les loisirs.',
          priceValue: '— DH',
          monthlyValue: 'ou — DH / mois',
          buttonText: 'Recevoir une proposition',
        }),
      },
      {
        type: 'vehicle_features',
        props: buildVehicleFeaturesDefaults({
          heading: 'Points forts Ranger',
          subtitle: 'Un pick-up pensé pour durer et évoluer avec vos besoins.',
        }),
      },
      {
        type: 'gallery',
        props: buildGalleryDefaults({
          heading: 'Galerie Ford Ranger',
          subtitle: 'Ajoutez vos visuels officiels ou de concession.',
        }),
      },
      {
        type: 'cta_band',
        variant: { variantId: 'cta-band-dark-conversion' },
        props: {
          ...buildCTABandDefaults({
          title: 'Une question sur l’offre Ford ?',
          buttonText: 'Parler à un conseiller',
        }),
          blockVisual: { ctaLayout: 'split', ctaIntensity: 'dark', ctaAlignment: 'left' },
          sectionStyle: { sectionPaddingY: 'lg' },
        },
      },
      {
        type: 'faq',
        props: {
          ...GENERIC_FAQ,
          blockVisual: { faqStyle: 'divided', faqDensity: 'comfortable' },
          sectionStyle: { sectionPaddingY: 'xl', sectionBackground: 'muted' },
        },
      },
      {
        type: 'footer_legal',
        props: GENERIC_FOOTER,
      },
    ],
  },
  {
    id: 'opel-test-drive',
    name: 'Essai Opel',
    description:
      'Landing essai / test-drive : hero lead Opel, formulaire dédié, avantages, confiance et FAQ.',
    brandId: 'opel',
    category: 'test-drive',
    previewLabel: 'Opel · Essai',
    recommendedUse: 'Campagnes essai Corsa, Mokka ou Grandland — conversion formulaire prioritaire.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero essai Opel',
        variant: { variantId: 'campaign-hero-compact-lead' },
        props: {
          brandId: 'opel',
          campaignTitle: 'Réservez votre essai Opel',
          campaignSubtitle:
            'Découvrez le design allemand et les motorisations efficientes en concession Auto Hall.',
          offerBadge: 'Essai gratuit',
          formTitle: 'Choisissez votre modèle',
          formSubtitle: 'Sélectionnez un créneau — confirmation par SMS ou e-mail.',
          formCtaLabel: 'Réserver',
          layoutVariant: 'background_media_form_right',
          contentPlacement: 'overlay_media',
          design: { tone: 'light', formTheme: 'glass', showOfferBadge: true, showProgressBar: true },
        },
      },
      {
        type: 'lead_form',
        label: 'Formulaire essai détaillé',
        props: buildLeadFormDefaults({
          title: 'Planifier un essai Opel',
          subtitle: 'Indiquez vos disponibilités — nous adaptons le rendez-vous à votre agenda.',
          submitText: 'Confirmer ma demande',
          reassurance: [
            'Essai sans engagement',
            'Conseiller dédié Auto Hall',
            'Essai en concession ou à domicile selon disponibilité',
          ],
        }),
      },
      {
        type: 'benefits',
        props: buildBenefitsDefaults({
          heading: 'Pourquoi essayer chez Auto Hall',
          subtitle: 'Une expérience simple, de la prise de contact à la remise des clés.',
        }),
      },
      {
        type: 'trust_bar',
        props: {
          ...buildTrustBarDefaults(),
          blockVisual: { trustLayout: 'grid', trustDensity: 'comfortable', trustStyle: 'cards' },
          sectionStyle: { sectionPaddingY: 'md', sectionBackground: 'muted' },
        },
      },
      {
        type: 'faq',
        props: buildFAQDefaults({
          heading: 'Essai & démarches',
          items: [
            {
              question: 'Que dois-je apporter pour l’essai ?',
              answer: 'Une pièce d’identité et votre permis de conduire en cours de validité.',
            },
            {
              question: 'L’essai est-il gratuit ?',
              answer: 'Oui, l’essai en concession est gratuit et sans obligation d’achat.',
            },
            {
              question: 'Puis-je essayer plusieurs modèles ?',
              answer: 'Votre conseiller peut organiser plusieurs essais selon les disponibilités.',
            },
          ],
        }),
      },
      {
        type: 'footer_legal',
        props: GENERIC_FOOTER,
      },
    ],
  },
  {
    id: 'autohall-generic-campaign',
    name: 'Campagne Auto Hall',
    description:
      'Gabarit marque neutre : hero lead, highlights offre, formulaire, témoignages et FAQ.',
    brandId: 'autohall',
    category: 'generic',
    previewLabel: 'Auto Hall · Générique',
    recommendedUse: 'Opérations multi-marques ou pages réseau à personnaliser rapidement.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero campagne',
        variant: { variantId: 'campaign-hero-minimal-offer' },
        props: {
          brandId: 'ford',
          campaignTitle: 'Votre mobilité, notre expertise',
          campaignSubtitle:
            'Auto Hall vous accompagne pour choisir, financer et entretenir votre prochain véhicule.',
          offerBadge: 'Offre du moment',
          formTitle: 'Contactez-nous',
          formSubtitle: 'Laissez vos coordonnées — un conseiller vous rappelle rapidement.',
          formCtaLabel: 'Envoyer',
          layoutVariant: 'media_left_form_right',
          design: { tone: 'light', formTheme: 'light', showOfferBadge: true, showProgressBar: false },
        },
      },
      {
        type: 'offer_highlights',
        label: 'Points forts',
        props: {
          heading: 'Ce que nous vous proposons',
          subtitle: 'Des services pensés pour simplifier votre parcours automobile.',
          modelName: 'Votre projet auto',
          tagline: 'Sur-mesure en concession',
          priceLabel: 'Exemple',
          priceValue: 'Offre à personnaliser',
          buttonText: 'En savoir plus',
          buttonTarget: '#lead-form',
          imageUrl: '',
          imageAssetId: '',
          highlights: [
            { title: 'Large choix de marques', description: 'Véhicules neufs et solutions adaptées.' },
            { title: 'Financement étudié', description: 'Plusieurs formules selon votre profil.' },
            { title: 'SAV de proximité', description: 'Entretien et réparation dans le réseau.' },
          ],
        },
      },
      {
        type: 'lead_form',
        props: buildLeadFormDefaults({
          title: 'Parlez-nous de votre projet',
          subtitle: 'Essai, offre ou reprise — précisez votre besoin.',
        }),
      },
      {
        type: 'testimonials',
        props: buildTestimonialsDefaults({
          heading: 'Ils nous font confiance',
          subtitle: 'Retours clients à adapter avec vos témoignages réels.',
        }),
      },
      {
        type: 'faq',
        props: GENERIC_FAQ,
      },
      {
        type: 'footer_legal',
        props: GENERIC_FOOTER,
      },
    ],
  },
];

export function getCampaignPageTemplateById(id: string): CampaignPageTemplate | undefined {
  return CAMPAIGN_PAGE_TEMPLATES.find((template) => template.id === id);
}

export function getCampaignPageTemplates(): CampaignPageTemplate[] {
  return CAMPAIGN_PAGE_TEMPLATES;
}
