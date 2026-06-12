import { PREMIUM_ANIMATED_BLOCK_TYPES } from '@/features/builder/block-motion';
import { buildFooterLegalDefaults } from '../constants/campaign-block-defaults';
import { buildFAQDefaults } from '../constants/conversion-block-defaults';
import type {
  CampaignPageTemplate,
  CampaignPageTemplateUseCase,
  CampaignTemplateBlockSpec,
} from './campaign-page-templates.types';

export type SectionRhythm = 'hero' | 'elevated' | 'muted' | 'brand' | 'compact';

const RHYTHM_STYLES: Record<
  SectionRhythm,
  { sectionPaddingY: string; sectionBackground: string }
> = {
  hero: { sectionPaddingY: 'xl', sectionBackground: 'default' },
  elevated: { sectionPaddingY: 'lg', sectionBackground: 'default' },
  muted: { sectionPaddingY: 'lg', sectionBackground: 'muted' },
  brand: { sectionPaddingY: 'lg', sectionBackground: 'brand' },
  compact: { sectionPaddingY: 'md', sectionBackground: 'default' },
};

export function withRhythm(rhythm: SectionRhythm): { sectionStyle: Record<string, string> } {
  return { sectionStyle: { ...RHYTHM_STYLES[rhythm] } };
}

export function withMotion(
  preset: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    motionPreset: preset,
    motionDuration: 'normal',
    motionDelay: 'none',
    motionIntensity: 'standard',
    ...extra,
  };
}

export const BRAND_PAGE_FOOTER = buildFooterLegalDefaults({
  legalText:
    '© Auto Hall — Page à personnaliser avant publication. Offre soumise à conditions. Photos non contractuelles.',
});

export const BRAND_PAGE_FAQ = buildFAQDefaults({
  heading: 'Vos questions, nos réponses',
  subtitle: 'Un conseiller Auto Hall vous recontacte pour préciser votre demande.',
  items: [
    {
      question: 'Comment réserver un essai ?',
      answer:
        'Remplissez le formulaire ou contactez une concession Auto Hall. Un conseiller confirme votre créneau.',
    },
    {
      question: 'Les prix affichés sont-ils définitifs ?',
      answer:
        'Les montants « À partir de — DH » sont indicatifs. Une proposition personnalisée vous sera transmise.',
    },
    {
      question: 'Proposez-vous du financement ?',
      answer:
        'Oui — crédit, LOA ou LLD selon votre profil. Simulation en concession sans engagement.',
    },
  ],
});

export const TEMPLATE_USE_CASE_GROUPS: Array<{
  id: CampaignPageTemplateUseCase;
  label: string;
  description: string;
}> = [
  {
    id: 'brand-page',
    label: 'Pages marque',
    description: 'Showcases marque Ford, Opel ou réseau — gamme, confiance et conversion.',
  },
  {
    id: 'vehicle-offer',
    label: 'Pages offre véhicule',
    description: 'Fiche modèle, finitions, galerie et CTA pour une offre précise.',
  },
  {
    id: 'conversion',
    label: 'Pages conversion',
    description: 'Campagnes lead, essai et acquisition avec parcours optimisé.',
  },
  {
    id: 'service',
    label: 'Pages service',
    description: 'SAV, entretien et accompagnement après-vente.',
  },
];

const PREMIUM_TYPES = new Set<string>(PREMIUM_ANIMATED_BLOCK_TYPES);

export function countPremiumBlocks(template: CampaignPageTemplate): number {
  return template.blocks.filter((block) => PREMIUM_TYPES.has(block.type)).length;
}

export function templateHasMotion(template: CampaignPageTemplate): boolean {
  return template.blocks.some((block) => {
    if (PREMIUM_TYPES.has(block.type)) return true;
    const preset = block.props?.motionPreset;
    return typeof preset === 'string' && preset !== 'none';
  });
}

export function getCampaignPageTemplatesByUseCase(
  templates: CampaignPageTemplate[],
): Array<{
  group: (typeof TEMPLATE_USE_CASE_GROUPS)[number];
  templates: CampaignPageTemplate[];
}> {
  return TEMPLATE_USE_CASE_GROUPS.map((group) => ({
    group,
    templates: templates.filter((template) => template.useCase === group.id),
  })).filter((entry) => entry.templates.length > 0);
}

export function mergeBlockProps(
  spec: CampaignTemplateBlockSpec,
  rhythm?: SectionRhythm,
): CampaignTemplateBlockSpec {
  if (!rhythm) return spec;
  return {
    ...spec,
    props: {
      ...withRhythm(rhythm),
      ...spec.props,
    },
  };
}
