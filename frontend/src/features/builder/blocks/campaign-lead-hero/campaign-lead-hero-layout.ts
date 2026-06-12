import type { CampaignLeadHeroLayoutVariant } from './campaign-lead-hero.types';

export type CampaignLeadHeroFormSide = 'left' | 'right';

const SPLIT_LAYOUTS = new Set<CampaignLeadHeroLayoutVariant>([
  'media_left_form_right',
  'form_left_media_right',
  'dual_media_form_right',
  'dual_media_form_left',
]);

const BACKGROUND_LAYOUTS = new Set<CampaignLeadHeroLayoutVariant>([
  'background_media_form_right',
  'background_media_form_left',
]);

/** Canonical form column side implied by layoutVariant. */
export function deriveFormSideFromLayout(
  layoutVariant: CampaignLeadHeroLayoutVariant | string,
): CampaignLeadHeroFormSide {
  switch (layoutVariant) {
    case 'form_left_media_right':
    case 'background_media_form_left':
    case 'dual_media_form_left':
      return 'left';
    default:
      return 'right';
  }
}

export function isSplitLayout(layoutVariant: string): boolean {
  return SPLIT_LAYOUTS.has(layoutVariant as CampaignLeadHeroLayoutVariant);
}

export function isBackgroundLayoutVariant(layoutVariant: string): boolean {
  return BACKGROUND_LAYOUTS.has(layoutVariant as CampaignLeadHeroLayoutVariant);
}

/**
 * Reconciles blockVisual.formPosition with layoutVariant.
 * Split/dual/background layouts fix form side structurally — conflicting values fall back.
 */
export function normalizeFormPosition(
  layoutVariant: string,
  requested: unknown,
): CampaignLeadHeroFormSide {
  const derived = deriveFormSideFromLayout(layoutVariant);
  if (requested === 'left' || requested === 'right') {
    return requested === derived ? requested : derived;
  }
  return derived;
}

export function formPositionConflictsWithLayout(
  layoutVariant: string,
  requested: unknown,
): boolean {
  if (requested !== 'left' && requested !== 'right') return false;
  return requested !== deriveFormSideFromLayout(layoutVariant);
}

/** formPosition bv classes only apply when they add meaning beyond layoutVariant. */
export function shouldEmitFormPositionVisualClass(_layoutVariant: string): boolean {
  return false;
}
