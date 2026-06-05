import {
  appointmentForm,
  buildDoc,
  container,
  footer,
  hero,
  leadForm,
  section,
} from '../templates/builders';
import type { CreativeStarter, CreativeStarterId } from './types';

export type { CreativeStarter, CreativeStarterId };

export const STUDIO_V2_STARTERS: CreativeStarter[] = [
  {
    id: 'lead-capture-simple',
    label: 'Lead Capture — Simple Form',
    category: 'Conversion',
    goal: 'Capture rapide',
    description: 'Page minimaliste : hero centré, formulaire visible, 3 arguments, footer légal.',
    themePreset: 'autohall-blue',
    previewTone: 'vs2-starter-preview--blue',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Contact — Auto Hall',
            themePreset: 'autohall-blue',
            seo: {
              title: 'Contactez Auto Hall',
              description: 'Laissez vos coordonnées, réponse sous 24 h.',
            },
          },
        },
        content: [
          section('gradient', 'hero', [
            container('wide', 'center', [
              {
                type: 'Columns',
                props: {
                  columnRatio: '60-40',
                  columnGap: 'large',
                  stackOnMobile: true,
                  verticalAlign: 'center',
                  alignment: 'center',
                  left: [
                    hero({
                      eyebrow: 'Auto Hall',
                      title: 'Parlez à un conseiller',
                      subtitle: 'Essai, devis ou information — réponse sous 24 h.',
                      layout: 'stacked',
                      alignment: 'center',
                      titleSize: 'l',
                      ctaPrimaryLabel: 'Accéder au formulaire',
                      ctaPrimaryHref: '#lead-form',
                    }),
                  ],
                  right: [leadForm({ title: 'Vos coordonnées', showMessage: true })],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'center', [
              {
                type: 'Benefits',
                props: {
                  title: 'Pourquoi nous contacter ?',
                  layout: 'icons',
                  items: [
                    { icon: 'phone', title: 'Réponse rapide', description: 'Rappel sous 24 h.' },
                    { icon: 'car', title: 'Large choix', description: 'Neuf, occasion, LOA.' },
                    { icon: 'map', title: 'Réseau national', description: 'Partout au Maroc.' },
                  ],
                },
              },
            ]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'vehicle-offer-promo',
    label: 'Vehicle Offer — Promo Campaign',
    category: 'Véhicule',
    goal: 'Offre modèle',
    description: 'Hero sombre promo, bloc offre/prix, galerie, avantages, formulaire et FAQ.',
    themePreset: 'ford-promo',
    previewTone: 'vs2-starter-preview--dark',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Offre véhicule — Auto Hall',
            themePreset: 'ford-promo',
            seo: { title: 'Offre exceptionnelle Auto Hall', description: 'Profitez de conditions avantageuses.' },
          },
        },
        content: [
          section('dark', 'hero', [
            container('wide', 'left', [
              hero({
                promoBadge: 'Offre limitée',
                title: 'Votre prochaine Ford',
                subtitle: 'Mensualités maîtrisées, garantie constructeur incluse.',
                layout: 'split_right',
                tone: 'dark',
                titleSize: 'xl',
                ctaPrimaryLabel: 'Voir l\'offre',
                ctaPrimaryHref: '#offer',
                imageAlt: 'Véhicule en promotion',
              }),
            ]),
          ]),
          section('light', 'normal', [
            container('default', 'left', [
              {
                type: 'VehicleOffer',
                props: {
                  layout: 'split',
                  modelName: 'Ford Ranger',
                  offerLabel: 'Offre du mois',
                  priceText: 'À partir de 3 490 DH / mois',
                  highlights: ['Garantie 5 ans', 'Entretien offert 2 ans', 'Reprise valorisée'],
                  ctaLabel: 'Demander un essai',
                  ctaHref: '#lead-form',
                  imageAlt: 'Ford Ranger',
                },
              },
            ]),
          ], 'offer'),
          section('soft', 'normal', [
            container('wide', 'left', [
              {
                type: 'VehicleRange',
                props: {
                  title: 'Explorez la gamme',
                  columns: 3,
                  cardStyle: 'elevated',
                  vehicles: [
                    { name: 'Ranger', priceText: 'Dès … DH/mois', imageAlt: 'Ranger' },
                    { name: 'Puma', priceText: 'Dès … DH/mois', imageAlt: 'Puma' },
                    { name: 'Kuga', priceText: 'Dès … DH/mois', imageAlt: 'Kuga' },
                  ],
                },
              },
            ]),
          ]),
          section('white', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Les avantages Auto Hall',
                  layout: 'cards',
                  items: [
                    { icon: 'shield', title: 'Garantie', description: 'Tranquillité d\'esprit.' },
                    { icon: 'wrench', title: 'SAV expert', description: 'Ateliers certifiés.' },
                    { icon: 'star', title: 'Financement', description: 'Solutions sur mesure.' },
                  ],
                },
              },
              leadForm({ title: 'Recevez votre offre personnalisée' }),
            ]),
          ]),
          section('light', 'normal', [
            container('narrow', 'left', [
              {
                type: 'FAQ',
                props: {
                  title: 'Questions fréquentes',
                  items: [
                    { question: 'L\'offre est-elle cumulable ?', answer: 'Voir conditions en concession.' },
                    { question: 'Puis-je essayer le véhicule ?', answer: 'Oui, sur rendez-vous.' },
                  ],
                },
              },
            ]),
          ]),
          section('dark', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'after-sales-appointment',
    label: 'After-Sales Appointment — SAV',
    category: 'Service',
    goal: 'Rendez-vous atelier',
    description: 'Hero service rouge, confiance, étapes SAV, formulaire rendez-vous, légal.',
    themePreset: 'sav-red',
    previewTone: 'vs2-starter-preview--red',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Rendez-vous SAV — Auto Hall',
            themePreset: 'sav-red',
            seo: { title: 'Entretien Auto Hall', description: 'Prenez rendez-vous atelier en ligne.' },
          },
        },
        content: [
          section('brand', 'hero', [
            container('wide', 'left', [
              hero({
                eyebrow: 'Service Auto Hall',
                title: 'Votre entretien à prix maîtrisé',
                subtitle: 'Révision, diagnostic, pièces d\'origine — prise de rendez-vous en 2 min.',
                layout: 'split_left',
                tone: 'brand',
                titleSize: 'xl',
                ctaPrimaryLabel: 'Prendre rendez-vous',
                ctaPrimaryHref: '#lead-form',
                imageAlt: 'Atelier Auto Hall',
              }),
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'center', [
              {
                type: 'Benefits',
                props: {
                  title: 'Pourquoi choisir Auto Hall ?',
                  layout: 'trust',
                  items: [
                    { icon: 'wrench', title: 'Techniciens certifiés', description: 'Expertise constructeur.' },
                    { icon: 'clock', title: 'Créneaux flexibles', description: 'Matin, midi ou soir.' },
                    { icon: 'shield', title: 'Pièces d\'origine', description: 'Qualité garantie.' },
                  ],
                },
              },
            ]),
          ]),
          section('white', 'normal', [
            container('default', 'left', [
              {
                type: 'StepsBlock',
                props: {
                  title: 'Comment ça marche ?',
                  steps: [
                    { title: 'Choisissez votre créneau', description: 'Indiquez ville et véhicule.' },
                    { title: 'Confirmation rapide', description: 'Un conseiller valide sous 24 h.' },
                    { title: 'Accueil en atelier', description: 'Diagnostic et devis transparent.' },
                  ],
                },
              },
            ]),
          ]),
          section('light', 'large', [
            container('narrow', 'center', [
              appointmentForm({
                title: 'Prenez rendez-vous',
                subtitle: 'Atelier le plus proche selon votre ville.',
              }),
            ]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'event-landing',
    label: 'Event Landing — Portes ouvertes',
    category: 'Événement',
    goal: 'Journée portes ouvertes',
    description: 'Hero événementiel, programme horaire, témoignages, inscription.',
    themePreset: 'gamme-hev-green',
    previewTone: 'vs2-starter-preview--green',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Portes ouvertes — Auto Hall',
            themePreset: 'gamme-hev-green',
            seo: { title: 'Portes ouvertes Auto Hall', description: 'Essais, offres exclusives, animations.' },
          },
        },
        content: [
          section('gradient', 'hero', [
            container('wide', 'center', [
              hero({
                promoBadge: 'Événement',
                title: 'Portes ouvertes Auto Hall',
                subtitle: 'Essais, démonstrations et offres exclusives ce week-end.',
                layout: 'stacked',
                alignment: 'center',
                titleSize: 'xl',
                ctaPrimaryLabel: 'S\'inscrire',
                ctaPrimaryHref: '#lead-form',
                imageAlt: 'Événement concession',
              }),
            ]),
          ]),
          section('white', 'normal', [
            container('default', 'left', [
              {
                type: 'EventScheduleBlock',
                props: {
                  title: 'Programme de la journée',
                  events: [
                    { time: '10:00', title: 'Accueil & café', description: 'Accueil des visiteurs.' },
                    { time: '11:30', title: 'Essais route', description: 'Essais encadrés sur route.' },
                    { time: '15:00', title: 'Offres flash', description: 'Conditions exceptionnelles 2 h.' },
                  ],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'center', [
              {
                type: 'TestimonialsBlock',
                props: {
                  title: 'Ils étaient présents',
                  items: [
                    { quote: 'Une organisation impeccable et des offres intéressantes.', author: 'Sanaa M.' },
                    { quote: 'J\'ai pu essayer 3 modèles en une matinée.', author: 'Youssef K.' },
                  ],
                },
              },
            ]),
          ]),
          section('light', 'normal', [
            container('narrow', 'center', [
              leadForm({ title: 'Inscrivez-vous à l\'événement', showMessage: true }),
            ]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'premium-launch',
    label: 'Premium Launch — Hero immersif',
    category: 'Lancement',
    goal: 'Lancement premium',
    description: 'Hero plein écran sombre, citation, gamme élevée, CTA fort.',
    themePreset: 'premium-dark',
    previewTone: 'vs2-starter-preview--premium',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Lancement premium — Auto Hall',
            themePreset: 'premium-dark',
            seo: { title: 'Nouvelle gamme premium', description: 'Découvrez l\'excellence Auto Hall.' },
          },
        },
        content: [
          section('dark', 'hero', [
            container('full', 'center', [
              hero({
                eyebrow: 'Lancement',
                title: 'L\'excellence réinventée',
                subtitle: 'Design, technologie et performance — une nouvelle ère commence.',
                layout: 'stacked',
                alignment: 'center',
                tone: 'dark',
                titleSize: 'xl',
                ctaPrimaryLabel: 'Découvrir la gamme',
                ctaPrimaryHref: '#range',
                imageAlt: 'Véhicule premium',
              }),
            ]),
          ], 'hero', true),
          section('dark', 'normal', [
            container('narrow', 'center', [
              {
                type: 'QuoteBlock',
                props: {
                  quote: 'Une présentation à la hauteur de nos ambitions.',
                  author: 'Direction Auto Hall',
                  role: 'Lancement 2026',
                  alignment: 'center',
                },
              },
            ]),
          ]),
          section('light', 'large', [
            container('wide', 'center', [
              {
                type: 'VehicleRange',
                props: {
                  title: 'La nouvelle gamme',
                  subtitle: 'Élégance, innovation et finitions premium.',
                  columns: 3,
                  cardStyle: 'elevated',
                  vehicles: [
                    { name: 'Série Platinum', priceText: 'Sur demande', imageAlt: 'Platinum' },
                    { name: 'Série Executive', priceText: 'Sur demande', imageAlt: 'Executive' },
                    { name: 'Série Sport', priceText: 'Sur demande', imageAlt: 'Sport' },
                  ],
                },
              },
            ]),
          ], 'range'),
          section('brand', 'normal', [
            container('default', 'center', [
              {
                type: 'CTASection',
                props: {
                  layout: 'card',
                  tone: 'dark',
                  title: 'Réservez votre présentation privée',
                  buttonLabel: 'Demander un essai VIP',
                  buttonHref: '#lead-form',
                },
              },
            ]),
          ]),
          section('dark', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'racing-sport-campaign',
    label: 'Racing / Sport Campaign',
    category: 'Campagne',
    goal: 'Visuel dynamique',
    description: 'Campagne sportive sombre : stats, hero racing, offre, formulaire.',
    themePreset: 'racing-sport',
    previewTone: 'vs2-starter-preview--racing',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Campagne Racing — Auto Hall',
            themePreset: 'racing-sport',
            seo: { title: 'Performance Auto Hall', description: 'Campagne sportive — essais et exclusivités.' },
          },
        },
        content: [
          section('dark', 'hero', [
            container('wide', 'center', [
              hero({
                promoBadge: 'Performance',
                title: 'Dominez la route',
                subtitle: 'Puissance, adhérence et design agressif — l\'esprit compétition.',
                layout: 'stacked',
                alignment: 'center',
                tone: 'dark',
                titleSize: 'xl',
                ctaPrimaryLabel: 'Rejoindre la campagne',
                ctaPrimaryHref: '#lead-form',
                imageAlt: 'Véhicule sport',
              }),
              {
                type: 'StatsBlock',
                props: {
                  tone: 'dark',
                  items: [
                    { value: '3,2 s', label: '0 à 100 km/h' },
                    { value: '280', label: 'km/h max' },
                    { value: '24 h', label: 'Réponse conseiller' },
                  ],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'left', [
              {
                type: 'TextImageBlock',
                props: {
                  title: 'Technologie de pointe',
                  text: 'Moteurs turbo, châssis affiné, modes de conduite sport.',
                  layout: 'image_left',
                  imageAlt: 'Détail sport',
                },
              },
            ]),
          ]),
          section('brand', 'normal', [
            container('default', 'center', [
              leadForm({ title: 'Réservez votre essai sport', showVehicleModel: true }),
            ]),
          ]),
          section('dark', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'financing-offer',
    label: 'Financing Offer — Crédit / LOA',
    category: 'Financement',
    goal: 'Simulation crédit',
    description: 'Hero promo financement, bloc conditions, avantages, formulaire.',
    themePreset: 'ford-promo',
    previewTone: 'vs2-starter-preview--finance',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Financement — Auto Hall',
            themePreset: 'ford-promo',
            seo: { title: 'Financez votre véhicule', description: 'LOA, crédit, facilités de paiement.' },
          },
        },
        content: [
          section('gradient', 'hero', [
            container('wide', 'center', [
              hero({
                eyebrow: 'Financement',
                title: 'Roulez maintenant, payez intelligemment',
                subtitle: 'LOA, crédit classique ou apport flexible.',
                layout: 'stacked',
                alignment: 'center',
                titleSize: 'xl',
                ctaPrimaryLabel: 'Simuler ma mensualité',
                ctaPrimaryHref: '#financing',
              }),
            ]),
          ]),
          section('light', 'normal', [
            container('default', 'center', [
              {
                type: 'FinancingHighlightBlock',
                props: {
                  title: 'Votre simulation en 2 minutes',
                  rateText: 'À partir de 2 990 DH / mois',
                  conditions: [
                    { text: 'Apport à partir de 10 %' },
                    { text: 'Durée 12 à 84 mois' },
                    { text: 'Assurance tous risques recommandée' },
                  ],
                  ctaLabel: 'Demander une simulation',
                  ctaHref: '#lead-form',
                },
              },
            ]),
          ], 'financing'),
          section('soft', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Pourquoi financer chez Auto Hall ?',
                  layout: 'trust',
                  items: [
                    { icon: 'shield', title: 'Transparence', description: 'Pas de frais cachés.' },
                    { icon: 'clock', title: 'Réponse rapide', description: 'Accord sous 48 h.' },
                    { icon: 'car', title: 'Large choix', description: 'Neuf et occasion éligibles.' },
                  ],
                },
              },
            ]),
          ]),
          section('white', 'normal', [
            container('narrow', 'center', [
              leadForm({ title: 'Recevez votre simulation', showMessage: true }),
            ]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'minimal-landing',
    label: 'Minimal Landing — Conversion-first',
    category: 'Minimal',
    goal: 'Ultra rapide',
    description: 'Une section hero minimaliste + formulaire + footer — rien de superflu.',
    themePreset: 'autohall-blue',
    previewTone: 'vs2-starter-preview--minimal',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Contact rapide',
            themePreset: 'autohall-blue',
            seo: { title: 'Contact Auto Hall', description: 'Formulaire de contact rapide.' },
          },
        },
        content: [
          section('white', 'hero', [
            container('narrow', 'center', [
              {
                type: 'StackBlock',
                props: {
                  alignment: 'center',
                  maxWidth: 'narrow',
                  gap: 'normal',
                  items: [
                    {
                      type: 'BadgeBlock',
                      props: { text: 'Auto Hall', tone: 'brand', alignment: 'center' },
                    },
                    {
                      type: 'HeadingBlock',
                      props: {
                        text: 'Laissez-nous vos coordonnées',
                        level: 'h1',
                        fontSize: 'xl',
                        alignment: 'center',
                      },
                    },
                    {
                      type: 'ParagraphBlock',
                      props: {
                        text: 'Un conseiller vous rappelle sous 24 h ouvrées.',
                        alignment: 'center',
                        colorPreset: 'light',
                      },
                    },
                    leadForm({ title: '', subtitle: '', layout: 'card' }),
                  ],
                },
              },
            ]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
];

export function getStarter(id: string): CreativeStarter | undefined {
  const resolved = resolveStarterId(id) ?? id;
  return STUDIO_V2_STARTERS.find((s) => s.id === resolved);
}

export function resolveStarterId(id: string): CreativeStarterId | undefined {
  const aliases: Record<string, CreativeStarterId> = {
    'capture-lead-rapide': 'lead-capture-simple',
    'offre-vehicule': 'vehicle-offer-promo',
    'prise-rendez-vous': 'after-sales-appointment',
    'lancement-gamme': 'premium-launch',
    'offre-financement': 'financing-offer',
    'ford-promo': 'vehicle-offer-promo',
    'offre-sav': 'after-sales-appointment',
    'gamme-thermique': 'premium-launch',
    'gamme-hev': 'event-landing',
  };
  const resolved = (aliases[id] ?? id) as CreativeStarterId;
  return STUDIO_V2_STARTERS.some((s) => s.id === resolved) ? resolved : undefined;
}

export function buildStarterDocument(id: string) {
  const starter = getStarter(resolveStarterId(id) ?? id);
  if (!starter) throw new Error(`Unknown starter: ${id}`);
  return starter.build();
}
