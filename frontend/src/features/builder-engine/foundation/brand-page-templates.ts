import {
  buildGalleryDefaults,
  buildVehicleRangeDefaults,
} from '../constants/campaign-block-defaults';
import { buildFAQDefaults, buildPricingTrimDefaults } from '../constants/conversion-block-defaults';
import {
  buildAnimatedStatsDefaults,
  buildCampaignTimelineDefaults,
  buildPremiumBentoDefaults,
  buildPremiumTestimonialsDefaults,
  buildStickyLeadCtaDefaults,
  buildVehicleShowcaseDefaults,
} from '@/features/builder/blocks/premium-animated/premium-block-defaults';
import {
  BRAND_PAGE_FAQ,
  BRAND_PAGE_FOOTER,
  withMotion,
  withRhythm,
} from './brand-page-template-recipes';
import type { CampaignPageTemplate } from './campaign-page-templates.types';

const STICKY_CTA = (overrides: Record<string, unknown> = {}) =>
  buildStickyLeadCtaDefaults({
    label: 'Offre en cours',
    title: 'Recevez votre proposition personnalisée',
    primaryCtaLabel: 'Réservez un essai',
    primaryCtaHref: '#lead-form',
    secondaryCtaLabel: 'Voir l’offre',
    secondaryCtaHref: '#offer',
    stickyMode: 'bottom',
    style: 'brand',
    ...withRhythm('compact'),
    ...withMotion('slide_left'),
    ...overrides,
  });

/** Production-grade brand & vehicle page recipes — V1. */
export const BRAND_PAGE_TEMPLATES: CampaignPageTemplate[] = [
  {
    id: 'ford-brand-showcase',
    name: 'Page marque Ford',
    description:
      'Showcase Ford premium : visuel modèle phare, bento avantages, gamme, chiffres clés et parcours client.',
    brandId: 'ford',
    category: 'brand',
    useCase: 'brand-page',
    previewLabel: 'Ford · Marque',
    recommendedUse: 'Page marque Ford — Ranger, Puma ou gamme SUV / pick-up en concession Auto Hall.',
    blocks: [
      {
        type: 'vehicle_showcase_split',
        label: 'Showcase Ford',
        props: {
          brand: 'Ford',
          model: 'Modèle phare',
          headline: 'L’esprit Ford, signé Auto Hall',
          subtitle:
            'Robustesse, technologie et design affirmé — découvrez la gamme Ford en concession.',
          price: 'À partir de — DH',
          imageUrl: '',
          imageAssetId: '',
          alt: 'Véhicule Ford',
          layout: 'image_right',
          visualStyle: 'dark_card',
          specs: [
            { label: 'Motorisation', value: 'À configurer' },
            { label: 'Garantie', value: 'Selon conditions constructeur' },
            { label: 'Essai', value: 'Sur rendez-vous' },
          ],
          ctas: [
            { label: 'Réservez un essai', href: '#lead-form', variant: 'primary' },
            { label: 'Voir l’offre', href: '#offer', variant: 'secondary' },
          ],
          ...withRhythm('hero'),
          ...withMotion('reveal'),
        },
      },
      {
        type: 'premium_bento_features',
        label: 'Avantages Ford',
        props: buildPremiumBentoDefaults({
          eyebrow: 'Ford chez Auto Hall',
          title: 'Pourquoi choisir Ford',
          subtitle: 'Un réseau national, des conseillers dédiés et un accompagnement sur mesure.',
          layout: '2x2',
          visualStyle: 'cards',
          cards: [
            { title: 'Gamme complète', description: 'SUV, pick-up et utilitaires — comparez en concession.' },
            { title: 'Financement étudié', description: 'Solutions adaptées à votre budget et votre usage.' },
            { title: 'Essai en concession', description: 'Réservez un créneau — un conseiller vous accompagne.' },
            { title: 'SAV réseau', description: 'Entretien et pièces d’origine dans les concessions Auto Hall.' },
          ],
          ...withRhythm('muted'),
          ...withMotion('stagger_children'),
        }),
      },
      {
        type: 'vehicle_range',
        label: 'Gamme Ford',
        props: {
          ...buildVehicleRangeDefaults({
            heading: 'Explorez la gamme Ford',
            subtitle: 'Modèles à personnaliser avec vos visuels et offres du moment.',
            vehicles: [
              {
                name: 'Ford Ranger',
                energy: 'Thermique',
                tag: 'Pick-up',
                imageUrl: '',
                imageAssetId: '',
                alt: 'Ford Ranger',
                ctaText: 'Découvrir',
                ctaTarget: '#lead-form',
              },
              {
                name: 'Ford Puma',
                energy: 'Hybride',
                tag: 'SUV urbain',
                imageUrl: '',
                imageAssetId: '',
                alt: 'Ford Puma',
                ctaText: 'Découvrir',
                ctaTarget: '#lead-form',
              },
              {
                name: 'Ford Kuga',
                energy: 'Hybride',
                tag: 'SUV familial',
                imageUrl: '',
                imageAssetId: '',
                alt: 'Ford Kuga',
                ctaText: 'Découvrir',
                ctaTarget: '#lead-form',
              },
            ],
          }),
          ...withRhythm('elevated'),
        },
      },
      {
        type: 'animated_stats_strip',
        label: 'Réassurance Ford',
        props: buildAnimatedStatsDefaults({
          metrics: [
            { value: '50+', label: 'Concessions', helper: 'Réseau Auto Hall' },
            { value: '24h', label: 'Réponse lead', helper: 'Engagement service' },
            { value: '—', label: 'Modèles Ford', helper: 'À personnaliser' },
          ],
          layout: 'grid',
          style: 'premium',
          countAnimation: 'count_up',
          ...withRhythm('brand'),
          ...withMotion('fade_in'),
        }),
      },
      {
        type: 'gallery',
        label: 'Galerie Ford',
        props: {
          ...buildGalleryDefaults({
            heading: 'La gamme en images',
            subtitle: 'Ajoutez vos visuels officiels ou de concession — photos non contractuelles.',
          }),
          ...withRhythm('muted'),
        },
      },
      {
        type: 'campaign_timeline_steps',
        label: 'Parcours client',
        props: buildCampaignTimelineDefaults({
          title: 'Votre projet Ford en 3 étapes',
          steps: [
            { title: 'Choisissez votre modèle', description: 'Comparez finitions et motorisations en ligne ou en concession.' },
            { title: 'Demandez une offre', description: 'Un conseiller Auto Hall vous recontacte sous 24 h ouvrées.' },
            { title: 'Essai & livraison', description: 'Essayez en concession puis finalisez financement et livraison.' },
          ],
          style: 'cards',
          ...withRhythm('elevated'),
          ...withMotion('fade_up'),
        }),
      },
      {
        type: 'sticky_lead_cta',
        label: 'CTA conversion',
        props: STICKY_CTA({
          label: 'Ford · Auto Hall',
          title: 'Un conseiller vous recontacte pour votre projet',
        }),
      },
      {
        type: 'faq',
        props: {
          ...BRAND_PAGE_FAQ,
          blockVisual: { faqStyle: 'divided', faqDensity: 'comfortable', iconStyle: 'chevron' },
          ...withRhythm('muted'),
        },
      },
      { type: 'footer_legal', props: BRAND_PAGE_FOOTER },
    ],
  },
  {
    id: 'opel-brand-showcase',
    name: 'Page marque Opel',
    description:
      'Landing marque Opel : hero lead, bento services, gamme, finitions, témoignages et conversion sticky.',
    brandId: 'opel',
    category: 'brand',
    useCase: 'brand-page',
    previewLabel: 'Opel · Marque',
    recommendedUse: 'Page marque Opel — Corsa, Mokka, Grandland et offres réseau Auto Hall.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero marque Opel',
        variant: { variantId: 'campaign-hero-split-premium-form' },
        props: {
          brandId: 'opel',
          campaignTitle: 'Opel — design allemand, esprit européen',
          campaignSubtitle:
            'Découvrez la gamme Opel en concession Auto Hall et profitez d’un accompagnement personnalisé.',
          offerBadge: 'Gamme Opel',
          formTitle: 'Recevez votre proposition',
          formSubtitle: 'Un conseiller Auto Hall vous recontacte rapidement.',
          formCtaLabel: 'Continuer',
          layoutVariant: 'media_left_form_right',
          design: { tone: 'light', formTheme: 'light', showOfferBadge: true, showProgressBar: true },
          ...withRhythm('hero'),
        },
      },
      {
        type: 'premium_bento_features',
        label: 'Points forts Opel',
        props: buildPremiumBentoDefaults({
          title: 'L’expérience Opel chez Auto Hall',
          subtitle: 'Conseil, essai et financement dans le même réseau de confiance.',
          visualStyle: 'glass',
          layout: '3_cards',
          cards: [
            { title: 'Design affirmé', description: 'Intérieurs modulables et finitions soignées.' },
            { title: 'Motorisations efficientes', description: 'Thermique et hybride — à comparer en concession.' },
            { title: 'SAV de proximité', description: 'Entretien et assistance dans le réseau Auto Hall.' },
          ],
          ...withRhythm('muted'),
          ...withMotion('stagger_children'),
        }),
      },
      {
        type: 'vehicle_range',
        label: 'Gamme Opel',
        props: {
          ...buildVehicleRangeDefaults({
            heading: 'Les modèles Opel',
            subtitle: 'Citadines, SUV et familiales — personnalisez visuels et offres.',
            vehicles: [
              {
                name: 'Opel Corsa',
                energy: 'Thermique',
                tag: 'Citadine',
                imageUrl: '',
                imageAssetId: '',
                alt: 'Opel Corsa',
                ctaText: 'Découvrir',
                ctaTarget: '#lead-form',
              },
              {
                name: 'Opel Mokka',
                energy: 'Hybride',
                tag: 'SUV',
                imageUrl: '',
                imageAssetId: '',
                alt: 'Opel Mokka',
                ctaText: 'Découvrir',
                ctaTarget: '#lead-form',
              },
              {
                name: 'Opel Grandland',
                energy: 'Hybride',
                tag: 'Familial',
                imageUrl: '',
                imageAssetId: '',
                alt: 'Opel Grandland',
                ctaText: 'Découvrir',
                ctaTarget: '#lead-form',
              },
            ],
          }),
          ...withRhythm('elevated'),
        },
      },
      {
        type: 'pricing_trim',
        label: 'Finitions Opel',
        props: {
          ...buildPricingTrimDefaults({
            heading: 'Finitions & tarifs indicatifs',
            subtitle: 'Montants à personnaliser — demandez une simulation financement.',
            trims: [
              {
                name: 'Edition',
                price: '— DH',
                features: ['Équipements essentiels', 'Écran tactile', 'Aides à la conduite'],
                buttonText: 'Configurer',
                featured: false,
              },
              {
                name: 'Elegance',
                price: '— DH',
                features: ['Finitions premium', 'Connectivité complète', 'Caméra de recul'],
                buttonText: 'Configurer',
                featured: true,
              },
              {
                name: 'Ultimate',
                price: '— DH',
                features: ['Pack confort', 'Sellerie haut de gamme', 'Technologies avancées'],
                buttonText: 'Configurer',
                featured: false,
              },
            ],
          }),
          ...withRhythm('muted'),
        },
      },
      {
        type: 'premium_testimonials',
        label: 'Témoignages',
        props: buildPremiumTestimonialsDefaults({
          title: 'Ils ont choisi Opel chez Auto Hall',
          style: 'cards',
          ...withRhythm('elevated'),
          ...withMotion('fade_up'),
        }),
      },
      {
        type: 'sticky_lead_cta',
        label: 'CTA sticky',
        props: STICKY_CTA({
          label: 'Opel · Auto Hall',
          title: 'Réservez un essai ou demandez une offre',
        }),
      },
      {
        type: 'faq',
        props: {
          ...BRAND_PAGE_FAQ,
          blockVisual: { faqStyle: 'boxed', faqDensity: 'comfortable', iconStyle: 'chevron' },
          ...withRhythm('muted'),
        },
      },
      { type: 'footer_legal', props: BRAND_PAGE_FOOTER },
    ],
  },
  {
    id: 'vehicle-offer-page',
    name: 'Page offre véhicule',
    description:
      'Fiche offre complète : hero modèle, showcase, finitions, bento valeur, galerie et conversion.',
    brandId: 'autohall',
    category: 'vehicle-offer',
    useCase: 'vehicle-offer',
    previewLabel: 'Offre · Véhicule',
    recommendedUse: 'Mise en avant d’un modèle et d’une offre commerciale — toutes marques.',
    blocks: [
      {
        type: 'hero_vehicle_offer',
        label: 'Hero offre véhicule',
        variant: { variantId: 'vehicle-hero-focus-split' },
        props: {
          brandId: 'ford',
          modelName: 'Modèle à renseigner',
          headline: 'Votre prochain véhicule vous attend',
          subheadline:
            'Offre à personnaliser — essai, financement et reprise étudiés par un conseiller Auto Hall.',
          offerLabel: 'Offre du moment',
          priceText: 'À partir de — DH',
          primaryCtaLabel: 'Réservez un essai',
          secondaryCtaLabel: 'Voir l’offre',
          layoutVariant: 'split-media-right',
          design: { tone: 'brand', density: 'comfortable', ctaStyle: 'primary', showOfferBadge: true },
          ...withRhythm('hero'),
        },
      },
      {
        type: 'vehicle_showcase_split',
        label: 'Showcase visuel',
        props: buildVehicleShowcaseDefaults({
          brand: 'Marque',
          model: 'Modèle',
          headline: 'Design, confort et technologie',
          subtitle: 'Visuel et arguments clés à personnaliser — photos non contractuelles.',
          price: 'À partir de — DH',
          layout: 'image_left',
          visualStyle: 'light_card',
          ...withRhythm('muted'),
          ...withMotion('reveal'),
        }),
      },
      {
        type: 'pricing_trim',
        label: 'Finitions & prix',
        props: {
          ...buildPricingTrimDefaults({
            heading: 'Comparez les finitions',
            subtitle: 'Tarifs indicatifs — une proposition personnalisée sur demande.',
            trims: [
              { name: 'Active', price: '— DH', features: ['Équipements de série'], buttonText: 'Choisir', featured: false },
              { name: 'Business', price: '— DH', features: ['Pack confort', 'Connectivité'], buttonText: 'Choisir', featured: true },
              { name: 'Premium', price: '— DH', features: ['Finitions haut de gamme'], buttonText: 'Choisir', featured: false },
            ],
          }),
          ...withRhythm('elevated'),
        },
      },
      {
        type: 'premium_bento_features',
        label: 'Points forts offre',
        props: buildPremiumBentoDefaults({
          title: 'Les atouts de cette offre',
          subtitle: 'Avantages à adapter selon votre campagne commerciale.',
          layout: 'asymmetric',
          visualStyle: 'cards',
          ...withRhythm('muted'),
          ...withMotion('stagger_children'),
        }),
      },
      {
        type: 'gallery',
        label: 'Galerie modèle',
        props: {
          ...buildGalleryDefaults({
            heading: 'Le véhicule en images',
            subtitle: 'Importez vos visuels concession ou constructeur.',
          }),
          ...withRhythm('elevated'),
        },
      },
      {
        type: 'sticky_lead_cta',
        label: 'CTA offre',
        props: STICKY_CTA({ title: 'Demandez le détail de l’offre' }),
      },
      {
        type: 'faq',
        props: {
          ...BRAND_PAGE_FAQ,
          blockVisual: { faqStyle: 'divided', faqDensity: 'comfortable' },
          ...withRhythm('muted'),
        },
      },
      { type: 'footer_legal', props: BRAND_PAGE_FOOTER },
    ],
  },
  {
    id: 'test-drive-conversion',
    name: 'Page conversion essai',
    description:
      'Parcours essai optimisé : hero lead, étapes, réassurance chiffrée, bento et CTA sticky.',
    brandId: 'autohall',
    category: 'test-drive',
    useCase: 'conversion',
    previewLabel: 'Conversion · Essai',
    recommendedUse: 'Campagnes essai / test-drive — toutes marques du réseau Auto Hall.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero essai',
        variant: { variantId: 'campaign-hero-compact-lead' },
        props: {
          brandId: 'opel',
          campaignTitle: 'Réservez votre essai en concession',
          campaignSubtitle:
            'Choisissez votre modèle et votre créneau — un conseiller Auto Hall confirme votre rendez-vous.',
          offerBadge: 'Essai gratuit',
          formTitle: 'Planifier un essai',
          formSubtitle: 'Un conseiller Auto Hall vous recontacte.',
          formCtaLabel: 'Réserver',
          layoutVariant: 'background_media_form_right',
          design: { tone: 'light', formTheme: 'glass', showOfferBadge: true, showProgressBar: true },
          ...withRhythm('hero'),
        },
      },
      {
        type: 'campaign_timeline_steps',
        label: 'Étapes essai',
        props: buildCampaignTimelineDefaults({
          title: 'Comment se déroule votre essai',
          steps: [
            { title: 'Sélectionnez un modèle', description: 'Indiquez le véhicule qui vous intéresse.' },
            { title: 'Choisissez un créneau', description: 'Nous adaptons le rendez-vous à votre agenda.' },
            { title: 'Essayez en concession', description: 'Accompagnement personnalisé, sans engagement.' },
          ],
          style: 'line',
          ...withRhythm('muted'),
          ...withMotion('fade_up'),
        }),
      },
      {
        type: 'animated_stats_strip',
        label: 'Réassurance',
        props: buildAnimatedStatsDefaults({
          metrics: [
            { value: '50+', label: 'Points de service', helper: 'Réseau national' },
            { value: '24h', label: 'Délai de rappel', helper: 'Objectif conseiller' },
            { value: '100%', label: 'Essai gratuit', helper: 'Sans obligation' },
          ],
          style: 'cards',
          countAnimation: 'none',
          ...withRhythm('brand'),
        }),
      },
      {
        type: 'premium_bento_features',
        label: 'Pourquoi essayer chez Auto Hall',
        props: buildPremiumBentoDefaults({
          title: 'Une expérience simple et transparente',
          layout: '2x2',
          visualStyle: 'glass',
          cards: [
            { title: 'Essai sans engagement', description: 'Prenez le volant en concession ou sur rendez-vous.' },
            { title: 'Conseiller dédié', description: 'Un interlocuteur unique pour votre projet.' },
            { title: 'Financement sur mesure', description: 'Simulation adaptée à votre profil.' },
            { title: 'Reprise possible', description: 'Estimation de votre véhicule actuel.' },
          ],
          ...withRhythm('elevated'),
          ...withMotion('stagger_children'),
        }),
      },
      {
        type: 'sticky_lead_cta',
        label: 'CTA essai',
        props: STICKY_CTA({
          label: 'Essai',
          title: 'Réservez votre créneau dès maintenant',
          primaryCtaLabel: 'Réservez un essai',
        }),
      },
      { type: 'footer_legal', props: BRAND_PAGE_FOOTER },
    ],
  },
  {
    id: 'sav-service-campaign',
    name: 'Page campagne SAV',
    description:
      'Landing service après-vente : hero lead, bento services, parcours entretien, témoignages et FAQ.',
    brandId: 'autohall',
    category: 'service',
    useCase: 'service',
    previewLabel: 'SAV · Service',
    recommendedUse: 'Campagnes entretien, révision, garantie et services réseau Auto Hall.',
    blocks: [
      {
        type: 'campaign_lead_hero',
        label: 'Hero SAV',
        variant: { variantId: 'campaign-hero-minimal-offer' },
        props: {
          brandId: 'ford',
          campaignTitle: 'Votre véhicule entre de bonnes mains',
          campaignSubtitle:
            'Entretien, révision et pièces d’origine — réservez votre passage en atelier Auto Hall.',
          offerBadge: 'Service réseau',
          formTitle: 'Prendre rendez-vous atelier',
          formSubtitle: 'Un conseiller SAV vous recontacte pour confirmer.',
          formCtaLabel: 'Envoyer',
          layoutVariant: 'media_left_form_right',
          design: { tone: 'light', formTheme: 'light', showOfferBadge: true, showProgressBar: false },
          ...withRhythm('hero'),
        },
      },
      {
        type: 'premium_bento_features',
        label: 'Services SAV',
        props: buildPremiumBentoDefaults({
          eyebrow: 'Après-vente Auto Hall',
          title: 'Des services pensés pour votre sérénité',
          layout: '3_cards',
          visualStyle: 'cards',
          cards: [
            { title: 'Entretien constructeur', description: 'Techniciens formés et protocoles respectés.' },
            { title: 'Pièces d’origine', description: 'Qualité et traçabilité pour votre véhicule.' },
            { title: 'Diagnostic rapide', description: 'Prise en charge transparente et devis avant intervention.' },
          ],
          ...withRhythm('muted'),
          ...withMotion('stagger_children'),
        }),
      },
      {
        type: 'campaign_timeline_steps',
        label: 'Parcours atelier',
        props: buildCampaignTimelineDefaults({
          title: 'Votre passage en concession',
          steps: [
            { title: 'Demande en ligne', description: 'Décrivez votre besoin ou choisissez une révision.' },
            { title: 'Confirmation', description: 'Un conseiller SAV valide date et prestation.' },
            { title: 'Intervention', description: 'Suivi et restitution avec conseils d’entretien.' },
          ],
          style: 'cards',
          ...withRhythm('elevated'),
        }),
      },
      {
        type: 'premium_testimonials',
        label: 'Satisfaction clients',
        props: buildPremiumTestimonialsDefaults({
          title: 'Ils nous confient leur véhicule',
          testimonials: [
            {
              quote: 'Prise en charge claire et délais respectés pour ma révision.',
              author: 'Client Auto Hall',
              role: 'Service après-vente',
            },
            {
              quote: 'Équipe réactive et devis détaillé avant toute intervention.',
              author: 'Cliente Auto Hall',
              role: 'Entretien véhicule',
            },
          ],
          ...withRhythm('muted'),
        }),
      },
      {
        type: 'sticky_lead_cta',
        label: 'CTA SAV',
        props: STICKY_CTA({
          label: 'Atelier Auto Hall',
          title: 'Prenez rendez-vous en quelques clics',
          primaryCtaLabel: 'Contacter le SAV',
        }),
      },
      {
        type: 'faq',
        props: {
          ...buildFAQDefaults({
            heading: 'Entretien & garantie',
            items: [
              {
                question: 'Dois-je réserver pour l’entretien ?',
                answer: 'Oui — la prise de rendez-vous garantit un créneau adapté et un suivi fluide.',
              },
              {
                question: 'Utilisez-vous des pièces d’origine ?',
                answer: 'Nos ateliers Auto Hall privilégient les pièces d’origine constructeur.',
              },
            ],
          }),
          blockVisual: { faqStyle: 'boxed', faqDensity: 'comfortable' },
          ...withRhythm('elevated'),
        },
      },
      { type: 'footer_legal', props: BRAND_PAGE_FOOTER },
    ],
  },
];
