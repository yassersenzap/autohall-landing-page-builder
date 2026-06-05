import type { Data } from '@puckeditor/core';
import type { StudioV2ThemePresetId } from '../design-tokens/types';
import {
  appointmentForm,
  buildDoc,
  container,
  footer,
  hero,
  leadForm,
  section,
} from './builders';

export type StudioV2TemplateId =
  | 'capture-lead-rapide'
  | 'offre-vehicule'
  | 'prise-rendez-vous'
  | 'lancement-gamme'
  | 'offre-financement';

export type StudioV2Template = {
  id: StudioV2TemplateId;
  label: string;
  description: string;
  useCase: string;
  themePreset: StudioV2ThemePresetId;
  build: () => Data;
};

export const STUDIO_V2_TEMPLATES: StudioV2Template[] = [
  {
    id: 'capture-lead-rapide',
    label: 'Capture lead rapide',
    useCase: 'Conversion immédiate',
    description:
      'Page courte : hero + formulaire visible + 3 arguments. Idéal pour une campagne digitale ciblée.',
    themePreset: 'autohall-blue',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Contact rapide — Auto Hall',
            themePreset: 'autohall-blue',
            seo: {
              title: 'Contactez Auto Hall — Réponse sous 24 h',
              description: 'Laissez vos coordonnées, un conseiller vous recontacte rapidement.',
            },
          },
        },
        content: [
          section('light', 'hero', [
            container('wide', 'left', [
              {
                type: 'Columns',
                props: {
                  columnRatio: '60-40',
                  columnGap: 'large',
                  stackOnMobile: true,
                  verticalAlign: 'center',
                  alignment: 'left',
                  left: [
                    hero({
                      eyebrow: 'Auto Hall',
                      title: 'Parlez à un conseiller',
                      subtitle: 'Essai, devis ou information — réponse sous 24 h ouvrées.',
                      ctaPrimaryLabel: 'Accéder au formulaire',
                      ctaPrimaryHref: '#lead-form',
                      layout: 'stacked',
                      tone: 'brand',
                      titleSize: 'l',
                      imageAlt: 'Conseiller Auto Hall',
                    }),
                  ],
                  right: [leadForm({ title: 'Vos coordonnées', showMessage: true })],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Pourquoi nous contacter ?',
                  layout: 'icons',
                  items: [
                    { icon: 'phone', title: 'Réponse rapide', description: 'Rappel sous 24 h.' },
                    { icon: 'car', title: 'Large choix', description: 'Neuf, occasion, financement.' },
                    { icon: 'map', title: 'Réseau national', description: 'Concessions partout au Maroc.' },
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
    id: 'offre-vehicule',
    label: 'Offre véhicule',
    useCase: 'Promotion modèle',
    description:
      'Hero offre, bloc prix/modèle, visuel véhicule, avantages, formulaire et FAQ. Exemple : Ford Ranger.',
    themePreset: 'ford-promo',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Offre véhicule — Auto Hall',
            themePreset: 'ford-promo',
            seo: {
              title: 'Offre véhicule Auto Hall — Promotion du moment',
              description: 'Découvrez notre offre véhicule : financement, reprise et essai.',
            },
          },
        },
        content: [
          section('dark', 'hero', [
            container('wide', 'left', [
              hero({
                promoBadge: 'Offre du moment',
                eyebrow: 'Auto Hall',
                title: 'Votre prochain véhicule à conditions avantageuses',
                subtitle: 'Financement sur mesure, reprise valorisée et essai en concession.',
                ctaPrimaryLabel: 'Voir l’offre',
                ctaPrimaryHref: '#offre',
                ctaSecondaryLabel: 'Demander un essai',
                ctaSecondaryHref: '#lead-form',
                tone: 'dark',
                showBadges: true,
                badges: ['Reprise valorisée', 'Financement adapté', 'Essai gratuit'],
                imageAlt: 'Véhicule en promotion Auto Hall',
                aspectRatio: '16:9',
                imageRadius: 'lg',
              }),
            ]),
          ]),
          section('dark', 'normal', [
            container('default', 'left', [
              {
                type: 'VehicleOffer',
                props: {
                  layout: 'split',
                  offerLabel: 'Offre du mois',
                  title: 'Modèle en promotion',
                  modelName: 'Ex. Ford Ranger Wildtrak',
                  subtitle: 'Le pick-up premium pour le travail et l’aventure.',
                  priceText: 'À partir de 4 990 DH / mois*',
                  highlights: ['4x4 permanent', 'Pack technologie', 'Garantie constructeur'],
                  ctaLabel: 'Demander un essai',
                  ctaHref: '#lead-form',
                  imageAlt: 'Véhicule en promotion',
                  aspectRatio: '4:3',
                },
              },
            ]),
          ]),
          section('light', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Les avantages Auto Hall',
                  layout: 'cards',
                  items: [
                    { icon: 'shield', title: 'Garantie', description: 'Véhicules neufs garantis constructeur.' },
                    { icon: 'star', title: 'Reprise', description: 'Estimation rapide de votre véhicule actuel.' },
                    { icon: 'check', title: 'Financement', description: 'Solutions adaptées à votre budget.' },
                  ],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('narrow', 'center', [leadForm({ title: 'Recevez votre offre personnalisée' })]),
          ]),
          section('light', 'normal', [
            container('default', 'left', [
              {
                type: 'FAQ',
                props: {
                  title: 'Questions fréquentes',
                  defaultOpenFirst: true,
                  items: [
                    {
                      question: 'Quelles conditions pour l’offre ?',
                      answer: 'Offre soumise à conditions de financement et disponibilité du stock.',
                    },
                    {
                      question: 'Puis-je essayer le véhicule ?',
                      answer: 'Oui, prenez rendez-vous via le formulaire ou contactez votre concession.',
                    },
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
    id: 'prise-rendez-vous',
    label: 'Prise de rendez-vous après-vente',
    useCase: 'Service & SAV',
    description:
      'Hero service, arguments confiance, parcours en 3 étapes, formulaire rendez-vous. Exemple : entretien SAV.',
    themePreset: 'sav-red',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Rendez-vous après-vente — Auto Hall',
            themePreset: 'sav-red',
            seo: {
              title: 'Prenez rendez-vous SAV Auto Hall',
              description: 'Entretien, révision et pièces d’origine — prise de rendez-vous en ligne.',
            },
          },
        },
        content: [
          section('brand', 'hero', [
            container('wide', 'left', [
              hero({
                eyebrow: 'Service Après-Vente',
                promoBadge: 'Entretien à prix maîtrisé',
                title: 'Prenez rendez-vous en quelques clics',
                subtitle: 'Techniciens certifiés, pièces d’origine et devis transparent avant intervention.',
                ctaPrimaryLabel: 'Prendre rendez-vous',
                ctaPrimaryHref: '#lead-form',
                tone: 'brand',
                imageAlt: 'Atelier SAV Auto Hall',
                aspectRatio: '4:3',
              }),
            ]),
          ]),
          section('light', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Pourquoi choisir le SAV Auto Hall ?',
                  subtitle: 'Expertise constructeur et transparence à chaque étape.',
                  layout: 'trust',
                  items: [
                    { icon: 'wrench', title: 'Pièces d’origine', description: 'Garantie constructeur préservée.' },
                    { icon: 'clock', title: 'Rapidité', description: 'Prise en charge sous 48 h.' },
                    { icon: 'shield', title: 'Transparence', description: 'Devis détaillé avant intervention.' },
                  ],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'left', [
              {
                type: 'StepsBlock',
                props: {
                  title: 'Comment se déroule votre rendez-vous',
                  steps: [
                    { title: 'Demande en ligne', description: 'Remplissez le formulaire avec votre véhicule.' },
                    { title: 'Confirmation', description: 'Un conseiller SAV vous rappelle pour fixer le créneau.' },
                    { title: 'Intervention', description: 'Accueil en atelier et restitution avec compte-rendu.' },
                  ],
                },
              },
            ]),
          ]),
          section('light', 'normal', [
            container('narrow', 'center', [appointmentForm()]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'lancement-gamme',
    label: 'Lancement gamme',
    useCase: 'Présentation catalogue',
    description:
      'Hero gamme, grille véhicules, comparaison rapide (avantages), CTA et formulaire. Thermique ou HEV.',
    themePreset: 'autohall-blue',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Lancement gamme — Auto Hall',
            themePreset: 'autohall-blue',
            seo: {
              title: 'Découvrez la gamme Auto Hall',
              description: 'Citadines, SUV, utilitaires — comparez et configurez votre véhicule.',
            },
          },
        },
        content: [
          section('brand', 'hero', [
            container('wide', 'left', [
              hero({
                eyebrow: 'Nouvelle gamme',
                title: 'Trouvez le véhicule qui vous correspond',
                subtitle: 'Comparez motorisations, finitions et disponibilités en concession.',
                ctaPrimaryLabel: 'Voir la gamme',
                ctaPrimaryHref: '#gamme',
                tone: 'brand',
                imageAlt: 'Gamme véhicules Auto Hall',
              }),
            ]),
          ]),
          section('light', 'normal', [
            container('wide', 'left', [
              {
                type: 'VehicleRange',
                props: {
                  title: 'Notre sélection',
                  subtitle: 'Des modèles pour chaque usage — urbain, famille ou professionnel.',
                  columns: 3,
                  cardStyle: 'elevated',
                  vehicles: [
                    {
                      name: 'Citadine Élan',
                      category: 'Citadine',
                      energy: 'Essence',
                      priceText: 'À partir de 149 900 DH',
                      ctaLabel: 'Configurer',
                      ctaHref: '#lead-form',
                    },
                    {
                      name: 'SUV Horizon',
                      category: 'SUV',
                      energy: 'Diesel / Hybride',
                      priceText: 'À partir de 289 900 DH',
                      ctaLabel: 'Configurer',
                      ctaHref: '#lead-form',
                    },
                    {
                      name: 'Pick-up Atlas',
                      category: 'Utilitaire',
                      energy: 'Diesel',
                      priceText: 'À partir de 319 900 DH',
                      ctaLabel: 'Configurer',
                      ctaHref: '#lead-form',
                    },
                  ],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Comparer en un coup d’œil',
                  layout: 'list',
                  items: [
                    { icon: 'car', title: 'Motorisations', description: 'Essence, diesel, hybride ou électrique.' },
                    { icon: 'star', title: 'Finitions', description: 'Du confort essentiel au haut de gamme.' },
                    { icon: 'map', title: 'Disponibilité', description: 'Stock ou commande — renseignez-vous.' },
                  ],
                },
              },
            ]),
          ]),
          section('brand', 'normal', [
            container('default', 'center', [
              {
                type: 'CTASection',
                props: {
                  layout: 'band',
                  tone: 'brand',
                  title: 'Besoin d’aide pour choisir ?',
                  subtitle: 'Nos conseillers vous orientent vers le modèle adapté.',
                  buttonLabel: 'Être rappelé',
                  buttonHref: '#lead-form',
                },
              },
            ]),
          ]),
          section('light', 'normal', [
            container('narrow', 'center', [leadForm({ title: 'Demandez un devis personnalisé' })]),
          ]),
          section('light', 'compact', [footer()]),
        ],
      }),
  },
  {
    id: 'offre-financement',
    label: 'Offre financement / promotion',
    useCase: 'Financement & promo',
    description:
      'Hero promotion, conditions, simulateur visuel (bloc offre), preuves confiance et formulaire.',
    themePreset: 'ford-promo',
    build: () =>
      buildDoc({
        root: {
          props: {
            title: 'Offre financement — Auto Hall',
            themePreset: 'ford-promo',
            seo: {
              title: 'Financement Auto Hall — Offres promotionnelles',
              description: 'Profitez de conditions de financement avantageuses sur une sélection de véhicules.',
            },
          },
        },
        content: [
          section('dark', 'hero', [
            container('wide', 'left', [
              hero({
                promoBadge: 'Financement avantageux',
                title: 'Roulez maintenant, payez intelligemment',
                subtitle: 'Mensualités adaptées, apport flexible et reprise de votre véhicule actuel.',
                ctaPrimaryLabel: 'Simuler mon financement',
                ctaPrimaryHref: '#simulation',
                tone: 'dark',
                imageAlt: 'Financement véhicule Auto Hall',
              }),
            ]),
          ]),
          section('dark', 'normal', [
            container('default', 'left', [
              {
                type: 'VehicleOffer',
                props: {
                  layout: 'card',
                  offerLabel: 'Simulation indicative',
                  title: 'À partir de',
                  priceText: '3 490 DH / mois*',
                  subtitle: 'Exemple sur 60 mois — selon profil et véhicule sélectionné.',
                  highlights: [
                    'Apport modulable',
                    'Assurance facultative',
                    'Reprise possible',
                  ],
                  ctaLabel: 'Demander une simulation',
                  ctaHref: '#lead-form',
                  imageAlt: 'Simulation financement',
                },
              },
            ]),
          ]),
          section('light', 'normal', [
            container('default', 'left', [
              {
                type: 'Benefits',
                props: {
                  title: 'Pourquoi nous faire confiance',
                  layout: 'trust',
                  items: [
                    { icon: 'shield', title: 'Transparence', description: 'Conditions expliquées clairement.' },
                    { icon: 'check', title: 'Partenaires agréés', description: 'Financement via établissements reconnus.' },
                    { icon: 'phone', title: 'Accompagnement', description: 'Un conseiller dédié pour monter votre dossier.' },
                  ],
                },
              },
            ]),
          ]),
          section('soft', 'normal', [
            container('narrow', 'center', [
              leadForm({
                title: 'Recevez votre simulation',
                subtitle: 'Indiquez vos coordonnées — un conseiller financement vous contacte.',
                showMessage: true,
              }),
            ]),
          ]),
          section('dark', 'compact', [footer()]),
        ],
      }),
  },
];

export function resolveStudioV2TemplateId(id: string): StudioV2TemplateId | undefined {
  const resolved = (TEMPLATE_ID_ALIASES[id] ?? id) as StudioV2TemplateId;
  return STUDIO_V2_TEMPLATES.some((t) => t.id === resolved) ? resolved : undefined;
}

export function getStudioV2Template(id: string): StudioV2Template | undefined {
  const resolved = resolveStudioV2TemplateId(id);
  if (!resolved) return undefined;
  return STUDIO_V2_TEMPLATES.find((t) => t.id === resolved);
}

export function buildStudioV2TemplateDocument(id: string): Data {
  const template = getStudioV2Template(id);
  if (!template) throw new Error(`Unknown Studio V2 template: ${id}`);
  return template.build();
}

/** Legacy template ids → new ids (migration / bookmarks) */
export const TEMPLATE_ID_ALIASES: Record<string, StudioV2TemplateId> = {
  'offre-sav': 'prise-rendez-vous',
  'ford-promo': 'offre-vehicule',
  'gamme-thermique': 'lancement-gamme',
  'gamme-hev': 'lancement-gamme',
};
