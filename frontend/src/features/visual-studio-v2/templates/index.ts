import type { Data } from '@puckeditor/core';
import { DEFAULT_AUTOHALL_CONSENT_LABEL } from '@/features/builder-engine/constants/autohall-lead-form';
import { ensurePuckIds } from '../lib/ensure-puck-ids';
import type { StudioV2ThemePresetId } from '../design-tokens/types';

export type StudioV2TemplateId =
  | 'offre-sav'
  | 'ford-promo'
  | 'gamme-thermique'
  | 'gamme-hev'
  | 'capture-lead-rapide';

export type StudioV2Template = {
  id: StudioV2TemplateId;
  label: string;
  description: string;
  themePreset: StudioV2ThemePresetId;
  build: () => Data;
};

const DEFAULT_CONSENT = DEFAULT_AUTOHALL_CONSENT_LABEL;

function buildTemplateDocument(data: Record<string, unknown>): Data {
  return ensurePuckIds(data as Data);
}

function baseLeadForm(overrides: Record<string, unknown> = {}) {
  return {
    type: 'LeadFormAutoHall',
    props: {
      title: 'Demandez votre offre',
      subtitle: 'Remplissez le formulaire, un conseiller vous rappelle sous 24 h.',
      submitText: 'Envoyer ma demande',
      showCity: true,
      showVehicleModel: true,
      showMessage: false,
      consentText: DEFAULT_CONSENT,
      alignment: 'left',
      spacingPreset: 'normal',
      ...overrides,
    },
  };
}

function baseFooter() {
  return {
    type: 'FooterLegal',
    props: {
      brandName: 'Auto Hall',
      legalText:
        'Offres soumises à conditions. Visuels non contractuels. Auto Hall se réserve le droit de modifier les offres à tout moment.',
      links: [
        { label: 'Mentions légales', href: '#' },
        { label: 'Politique de confidentialité', href: '#' },
        { label: 'Contact', href: '#lead-form' },
      ],
    },
  };
}

export const STUDIO_V2_TEMPLATES: StudioV2Template[] = [
  {
    id: 'offre-sav',
    label: 'Offre SAV',
    description: 'Campagne après-vente avec offre entretien et formulaire lead.',
    themePreset: 'sav-red',
    build: () =>
      buildTemplateDocument({
        root: {
          props: {
            title: 'Auto Hall SAV — Offre entretien',
            themePreset: 'sav-red',
            seo: {
              title: 'Offre SAV Auto Hall — Entretien à prix avantageux',
              description:
                'Profitez de notre offre après-vente : révision, pneus et pièces d’origine. Prenez rendez-vous en ligne.',
            },
          },
        },
        content: [
          {
            type: 'Section',
            props: {
              backgroundTone: 'brand',
              spacingPreset: 'hero',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'wide',
                    alignment: 'left',
                    items: [
                      {
                        type: 'HeroAutoHall',
                        props: {
                          eyebrow: 'Service Après-Vente',
                          promoBadge: 'Offre limitée',
                          title: 'Votre entretien à prix maîtrisé',
                          subtitle:
                            'Révision complète, contrôle sécurité et diagnostic offerts selon conditions.',
                          ctaPrimaryLabel: 'Réserver mon entretien',
                          ctaPrimaryHref: '#lead-form',
                          layout: 'split_right',
                          tone: 'brand',
                          imageAlt: 'Atelier SAV Auto Hall',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'left',
                    items: [
                      {
                        type: 'Benefits',
                        props: {
                          title: 'Pourquoi choisir le SAV Auto Hall ?',
                          subtitle: 'Des techniciens certifiés et des pièces d’origine.',
                          layout: 'cards',
                          items: [
                            {
                              icon: 'wrench',
                              title: 'Pièces d’origine',
                              description: 'Garantie constructeur préservée sur votre véhicule.',
                            },
                            {
                              icon: 'clock',
                              title: 'Rapidité',
                              description: 'Prise en charge sous 48 h dans nos ateliers partenaires.',
                            },
                            {
                              icon: 'shield',
                              title: 'Transparence',
                              description: 'Devis détaillé avant toute intervention.',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'soft',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'narrow',
                    alignment: 'center',
                    items: [
                      baseLeadForm({
                        title: 'Prenez rendez-vous SAV',
                        subtitle: 'Indiquez votre véhicule et votre ville, nous vous rappelons.',
                        showVehicleModel: true,
                      }),
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'compact',
              items: [baseFooter()],
            },
          },
        ],
      }),
  },
  {
    id: 'ford-promo',
    label: 'Ford Promo',
    description: 'Landing promotionnelle sombre pour une offre Ford.',
    themePreset: 'ford-promo',
    build: () =>
      buildTemplateDocument({
        root: {
          props: {
            title: 'Ford — Offre promotionnelle Auto Hall',
            themePreset: 'ford-promo',
            seo: {
              title: 'Promo Ford chez Auto Hall — Offres exceptionnelles',
              description:
                'Découvrez les promotions Ford du moment : financement avantageux et reprise valorisée.',
            },
          },
        },
        content: [
          {
            type: 'Section',
            props: {
              backgroundTone: 'dark',
              spacingPreset: 'hero',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'wide',
                    alignment: 'left',
                    items: [
                      {
                        type: 'HeroAutoHall',
                        props: {
                          promoBadge: 'Jusqu’au 30 juin',
                          eyebrow: 'Ford chez Auto Hall',
                          title: 'La route vous appartient',
                          subtitle:
                            'Profitez d’une offre de lancement sur la gamme Ford avec financement sur mesure.',
                          ctaPrimaryLabel: 'Voir l’offre',
                          ctaPrimaryHref: '#lead-form',
                          ctaSecondaryLabel: 'Découvrir la gamme',
                          ctaSecondaryHref: '#gamme',
                          layout: 'split_right',
                          tone: 'dark',
                          imageAlt: 'Véhicule Ford promotion',
                          showBadges: true,
                          badges: ['Reprise valorisée', 'Financement 0 %*'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'dark',
              spacingPreset: 'normal',
              anchorId: 'gamme',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'left',
                    items: [
                      {
                        type: 'VehicleOffer',
                        props: {
                          layout: 'split',
                          offerLabel: 'Offre du mois',
                          title: 'Ford Ranger',
                          modelName: 'Ranger Wildtrak',
                          priceText: 'À partir de 4 990 DH / mois*',
                          highlights: [
                            '4x4 permanent',
                            'Pack technologie',
                            'Garantie 5 ans',
                          ],
                          ctaLabel: 'Demander un essai',
                          ctaHref: '#lead-form',
                          imageAlt: 'Ford Ranger',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'brand',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'center',
                    items: [
                      {
                        type: 'CTASection',
                        props: {
                          layout: 'band',
                          tone: 'brand',
                          title: 'Une question sur le financement ?',
                          subtitle: 'Nos conseillers Ford vous accompagnent pour monter votre dossier.',
                          buttonLabel: 'Être rappelé',
                          buttonHref: '#lead-form',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'dark',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'narrow',
                    alignment: 'center',
                    items: [baseLeadForm({ title: 'Recevez votre offre Ford' })],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'dark',
              spacingPreset: 'compact',
              items: [baseFooter()],
            },
          },
        ],
      }),
  },
  {
    id: 'gamme-thermique',
    label: 'Gamme thermique',
    description: 'Présentation de la gamme essence / diesel avec grille véhicules.',
    themePreset: 'autohall-blue',
    build: () =>
      buildTemplateDocument({
        root: {
          props: {
            title: 'Gamme thermique Auto Hall',
            themePreset: 'autohall-blue',
            seo: {
              title: 'Gamme thermique — Véhicules neufs Auto Hall',
              description:
                'Explorez notre sélection de véhicules thermiques : citadines, SUV et utilitaires disponibles en concession.',
            },
          },
        },
        content: [
          {
            type: 'Section',
            props: {
              backgroundTone: 'brand',
              spacingPreset: 'hero',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'wide',
                    alignment: 'left',
                    items: [
                      {
                        type: 'HeroAutoHall',
                        props: {
                          eyebrow: 'Gamme thermique',
                          title: 'Trouvez le véhicule qui vous correspond',
                          subtitle:
                            'Citadines économiques, SUV familiaux ou pick-up : comparez nos modèles disponibles.',
                          ctaPrimaryLabel: 'Voir la gamme',
                          ctaPrimaryHref: '#gamme',
                          layout: 'split_right',
                          tone: 'brand',
                          imageAlt: 'Gamme thermique Auto Hall',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'normal',
              anchorId: 'gamme',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'wide',
                    alignment: 'left',
                    items: [
                      {
                        type: 'VehicleRange',
                        props: {
                          title: 'Notre sélection thermique',
                          subtitle: 'Des motorisations essence et diesel pour tous les usages.',
                          columns: 3,
                          cardStyle: 'clean',
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
                              energy: 'Diesel',
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
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'soft',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'left',
                    items: [
                      {
                        type: 'Benefits',
                        props: {
                          title: 'Avantages Auto Hall',
                          layout: 'cards',
                          items: [
                            {
                              icon: 'car',
                              title: 'Large choix',
                              description: 'Des dizaines de modèles en stock ou sur commande.',
                            },
                            {
                              icon: 'star',
                              title: 'Reprise facilitée',
                              description: 'Estimation rapide de votre véhicule actuel.',
                            },
                            {
                              icon: 'map',
                              title: 'Réseau national',
                              description: 'Concessions dans les principales villes du Maroc.',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'narrow',
                    alignment: 'center',
                    items: [baseLeadForm({ title: 'Demandez un devis personnalisé' })],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'compact',
              items: [baseFooter()],
            },
          },
        ],
      }),
  },
  {
    id: 'gamme-hev',
    label: 'Gamme HEV',
    description: 'Landing hybride / électrique avec thème vert.',
    themePreset: 'gamme-hev-green',
    build: () =>
      buildTemplateDocument({
        root: {
          props: {
            title: 'Gamme HEV & électrique — Auto Hall',
            themePreset: 'gamme-hev-green',
            seo: {
              title: 'Véhicules hybrides et électriques — Auto Hall',
              description:
                'Passez à l’hybride ou à l’électrique avec Auto Hall : autonomie, recharge et aides à la conversion.',
            },
          },
        },
        content: [
          {
            type: 'Section',
            props: {
              backgroundTone: 'gradient',
              spacingPreset: 'hero',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'wide',
                    alignment: 'left',
                    items: [
                      {
                        type: 'HeroAutoHall',
                        props: {
                          promoBadge: 'Nouvelle gamme HEV',
                          eyebrow: 'Mobilité durable',
                          title: 'Roulez plus propre, roulez malin',
                          subtitle:
                            'Hybrides auto-rechargeables et 100 % électriques : réduisez votre empreinte sans compromis.',
                          ctaPrimaryLabel: 'Découvrir les modèles HEV',
                          ctaPrimaryHref: '#gamme-hev',
                          layout: 'split_right',
                          tone: 'gradient',
                          imageAlt: 'Véhicule hybride Auto Hall',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'normal',
              anchorId: 'gamme-hev',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'wide',
                    alignment: 'left',
                    items: [
                      {
                        type: 'VehicleRange',
                        props: {
                          title: 'Notre gamme hybride & électrique',
                          subtitle: 'Des motorisations adaptées à votre quotidien.',
                          columns: 3,
                          cardStyle: 'elevated',
                          vehicles: [
                            {
                              name: 'Urban HEV',
                              category: 'Citadine',
                              energy: 'Hybride',
                              priceText: 'À partir de 199 900 DH',
                              ctaLabel: 'En savoir plus',
                              ctaHref: '#lead-form',
                            },
                            {
                              name: 'E-Cross',
                              category: 'SUV',
                              energy: '100 % électrique',
                              priceText: 'À partir de 349 900 DH',
                              ctaLabel: 'En savoir plus',
                              ctaHref: '#lead-form',
                            },
                            {
                              name: 'E-Van Pro',
                              category: 'Utilitaire',
                              energy: '100 % électrique',
                              priceText: 'Sur devis',
                              ctaLabel: 'En savoir plus',
                              ctaHref: '#lead-form',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'soft',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'left',
                    items: [
                      {
                        type: 'Benefits',
                        props: {
                          title: 'Les atouts de l’hybride',
                          layout: 'icons',
                          items: [
                            {
                              icon: 'battery',
                              title: 'Autonomie optimisée',
                              description: 'Combinez moteur thermique et électrique au quotidien.',
                            },
                            {
                              icon: 'fuel',
                              title: 'Consommation réduite',
                              description: 'Jusqu’à 30 % d’économie de carburant en usage mixte.',
                            },
                            {
                              icon: 'check',
                              title: 'Zéro compromis',
                              description: 'Même confort et mêmes finitions que la gamme thermique.',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'left',
                    items: [
                      {
                        type: 'FAQ',
                        props: {
                          title: 'Questions fréquentes',
                          defaultOpenFirst: true,
                          items: [
                            {
                              question: 'Quelle est l’autonomie en mode électrique ?',
                              answer:
                                'L’autonomie varie selon le modèle. Nos conseillers vous fournissent une estimation selon votre usage.',
                            },
                            {
                              question: 'Où recharger mon véhicule électrique ?',
                              answer:
                                'À domicile avec une wallbox ou sur le réseau de bornes publiques partenaires.',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'normal',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'narrow',
                    alignment: 'center',
                    items: [baseLeadForm({ title: 'Essai HEV ou devis recharge' })],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'compact',
              items: [baseFooter()],
            },
          },
        ],
      }),
  },
  {
    id: 'capture-lead-rapide',
    label: 'Capture lead rapide',
    description: 'Page minimaliste hero + formulaire pour conversion rapide.',
    themePreset: 'autohall-blue',
    build: () =>
      buildTemplateDocument({
        root: {
          props: {
            title: 'Contact rapide — Auto Hall',
            themePreset: 'autohall-blue',
            seo: {
              title: 'Contactez Auto Hall — Réponse sous 24 h',
              description:
                'Laissez vos coordonnées, un conseiller Auto Hall vous recontacte rapidement pour votre projet automobile.',
            },
          },
        },
        content: [
          {
            type: 'Section',
            props: {
              backgroundTone: 'light',
              spacingPreset: 'hero',
              items: [
                {
                  type: 'Container',
                  props: {
                    maxWidth: 'default',
                    alignment: 'left',
                    items: [
                      {
                        type: 'Columns',
                        props: {
                          columnRatio: '60-40',
                          columnGap: 'large',
                          stackOnMobile: true,
                          alignment: 'left',
                          left: [
                            {
                              type: 'HeroAutoHall',
                              props: {
                                eyebrow: 'Auto Hall',
                                title: 'Un conseiller à votre écoute',
                                subtitle:
                                  'Essai, devis ou information : décrivez votre besoin en quelques clics.',
                                ctaPrimaryLabel: 'Accéder au formulaire',
                                ctaPrimaryHref: '#lead-form',
                                layout: 'stacked',
                                tone: 'brand',
                                imageAlt: 'Conseiller Auto Hall',
                              },
                            },
                          ],
                          right: [
                            baseLeadForm({
                              title: 'Vos coordonnées',
                              subtitle: 'Nous vous rappelons sous 24 h ouvrées.',
                              showMessage: true,
                            }),
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'Section',
            props: {
              backgroundTone: 'soft',
              spacingPreset: 'compact',
              items: [baseFooter()],
            },
          },
        ],
      }),
  },
];

export function getStudioV2Template(id: StudioV2TemplateId): StudioV2Template | undefined {
  return STUDIO_V2_TEMPLATES.find((template) => template.id === id);
}

export function buildStudioV2TemplateDocument(id: StudioV2TemplateId): Data {
  const template = getStudioV2Template(id);
  if (!template) {
    throw new Error(`Unknown Studio V2 template: ${id}`);
  }
  return template.build();
}
