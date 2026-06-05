import {
  appointmentForm,
  container,
  footer,
  hero,
  leadForm,
  section,
} from '../templates/builders';
import type { SectionLibraryEntry } from './types';

export const SECTION_LIBRARY: SectionLibraryEntry[] = [
  {
    id: 'hero-split-image',
    name: 'Hero image split',
    category: 'hero',
    description: 'Hero avec visuel à droite et texte à gauche.',
    previewClass: 'vs2-lib-preview--hero-split',
    build: () => [
      section('brand', 'hero', [
        container('wide', 'left', [
          {
            type: 'Columns',
            props: {
              columnRatio: '50-50',
              columnGap: 'large',
              stackOnMobile: true,
              verticalAlign: 'center',
              alignment: 'left',
              left: [
                hero({
                  title: 'Votre prochaine voiture',
                  subtitle: 'Découvrez nos offres du moment.',
                  layout: 'split_left',
                  titleSize: 'xl',
                  ctaPrimaryLabel: 'Voir l\'offre',
                  ctaPrimaryHref: '#lead-form',
                }),
              ],
              right: [],
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'hero-centered',
    name: 'Hero centré',
    category: 'hero',
    description: 'Titre centré, message fort, CTA visible.',
    previewClass: 'vs2-lib-preview--hero-center',
    build: () => [
      section('gradient', 'hero', [
        container('narrow', 'center', [
          hero({
            title: 'Bienvenue chez Auto Hall',
            subtitle: 'L\'excellence automobile à votre portée.',
            layout: 'stacked',
            alignment: 'center',
            titleSize: 'xl',
            ctaPrimaryLabel: 'Commencer',
            ctaPrimaryHref: '#lead-form',
          }),
        ]),
      ]),
    ],
  },
  {
    id: 'hero-fullscreen',
    name: 'Hero plein écran',
    category: 'hero',
    description: 'Section immersive hauteur pleine pour lancement premium.',
    previewClass: 'vs2-lib-preview--hero-full',
    build: () => [
      section('dark', 'hero', [
        container('wide', 'center', [
          hero({
            eyebrow: 'Nouveau',
            title: 'Une expérience immersive',
            subtitle: 'Design, performance et innovation.',
            layout: 'stacked',
            alignment: 'center',
            tone: 'dark',
            titleSize: 'xl',
            ctaPrimaryLabel: 'Réserver un essai',
            ctaPrimaryHref: '#lead-form',
          }),
        ]),
      ], 'hero', true),
    ],
  },
  {
    id: 'hero-with-form',
    name: 'Hero + formulaire',
    category: 'hero',
    description: 'Hero et formulaire côte à côte above the fold.',
    previewClass: 'vs2-lib-preview--hero-form',
    build: () => [
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
                  title: 'Demandez votre offre',
                  subtitle: 'Réponse sous 24 h.',
                  layout: 'stacked',
                  titleSize: 'l',
                }),
              ],
              right: [leadForm({ title: 'Vos coordonnées' })],
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'hero-racing',
    name: 'Hero racing / événement',
    category: 'hero',
    description: 'Hero sombre dynamique avec chiffres clés.',
    previewClass: 'vs2-lib-preview--hero-racing',
    build: () => [
      section('dark', 'hero', [
        container('wide', 'center', [
          hero({
            eyebrow: 'Performance',
            promoBadge: 'Édition limitée',
            title: 'Sentez la puissance',
            subtitle: 'Campagne sportive Auto Hall — essais, démos, exclusivités.',
            layout: 'stacked',
            alignment: 'center',
            tone: 'dark',
            titleSize: 'xl',
            ctaPrimaryLabel: 'Rejoindre l\'événement',
            ctaPrimaryHref: '#lead-form',
          }),
          {
            type: 'StatsBlock',
            props: {
              tone: 'dark',
              items: [
                { value: '0-100', label: 'En 3,2 s' },
                { value: '280', label: 'ch km/h' },
                { value: '24 h', label: 'Réponse' },
              ],
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'benefits-cards',
    name: 'Avantages cartes',
    category: 'marketing',
    description: '3 à 4 cartes avantages avec icônes.',
    previewClass: 'vs2-lib-preview--benefits',
    build: () => [
      section('soft', 'normal', [
        container('default', 'left', [
          {
            type: 'Benefits',
            props: {
              title: 'Pourquoi Auto Hall ?',
              layout: 'icons',
              items: [
                { icon: 'shield', title: 'Garantie', description: 'Véhicules contrôlés.' },
                { icon: 'car', title: 'Large choix', description: 'Neuf et occasion.' },
                { icon: 'phone', title: 'Conseiller dédié', description: 'Accompagnement complet.' },
              ],
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'cta-band',
    name: 'Bandeau CTA',
    category: 'conversion',
    description: 'Bandeau de conversion avec bouton.',
    previewClass: 'vs2-lib-preview--cta',
    build: () => [
      section('brand', 'normal', [
        container('default', 'center', [
          {
            type: 'CTASection',
            props: {
              layout: 'band',
              tone: 'brand',
              title: 'Prêt à passer à l\'action ?',
              subtitle: 'Un conseiller vous rappelle sous 24 h.',
              buttonLabel: 'Être recontacté',
              buttonHref: '#lead-form',
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'lead-form-section',
    name: 'Formulaire lead',
    category: 'conversion',
    description: 'Bloc formulaire de contact complet.',
    previewClass: 'vs2-lib-preview--form',
    build: () => [
      section('light', 'normal', [
        container('narrow', 'center', [leadForm({ title: 'Contactez-nous', showMessage: true })]),
      ]),
    ],
  },
  {
    id: 'sav-form-section',
    name: 'Formulaire rendez-vous SAV',
    category: 'conversion',
    description: 'Formulaire orienté prise de rendez-vous atelier.',
    previewClass: 'vs2-lib-preview--sav',
    build: () => [
      section('light', 'normal', [
        container('narrow', 'center', [appointmentForm({ title: 'Prenez rendez-vous atelier' })]),
      ]),
    ],
  },
  {
    id: 'faq-section',
    name: 'FAQ',
    category: 'marketing',
    description: 'Questions fréquentes en accordéon.',
    previewClass: 'vs2-lib-preview--faq',
    build: () => [
      section('white', 'normal', [
        container('narrow', 'left', [
          {
            type: 'FAQ',
            props: {
              title: 'Questions fréquentes',
              defaultOpenFirst: true,
              items: [
                { question: 'Comment prendre rendez-vous ?', answer: 'Via le formulaire ou par téléphone.' },
                { question: 'Quels documents prévoir ?', answer: 'Carte grise et carnet d\'entretien.' },
              ],
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'text-image-section',
    name: 'Texte + image',
    category: 'creative',
    description: 'Bloc éditorial image et texte.',
    previewClass: 'vs2-lib-preview--text-image',
    build: () => [
      section('light', 'normal', [
        container('default', 'left', [
          {
            type: 'TextImageBlock',
            props: {
              title: 'Votre histoire commence ici',
              text: 'Présentez votre offre avec un visuel impactant.',
              layout: 'image_right',
              imageAlt: 'Visuel Auto Hall',
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'stats-section',
    name: 'Chiffres clés',
    category: 'creative',
    description: 'Bandeau de statistiques pour crédibilité.',
    previewClass: 'vs2-lib-preview--stats',
    build: () => [
      section('brand', 'compact', [
        container('wide', 'center', [
          {
            type: 'StatsBlock',
            props: {
              tone: 'brand',
              items: [
                { value: '30+', label: 'Ans d\'expérience' },
                { value: '50+', label: 'Modèles' },
                { value: '24 h', label: 'Réponse' },
              ],
            },
          },
        ]),
      ]),
    ],
  },
  {
    id: 'legal-footer',
    name: 'Pied de page légal',
    category: 'marketing',
    description: 'Mentions légales et liens obligatoires.',
    previewClass: 'vs2-lib-preview--footer',
    build: () => [section('light', 'compact', [footer()])],
  },
];

export function getSectionLibraryEntry(id: string): SectionLibraryEntry | undefined {
  return SECTION_LIBRARY.find((s) => s.id === id);
}
