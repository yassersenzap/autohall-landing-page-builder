/** Backend mirror — keep in sync with frontend campaign-lead-hero-layout.ts */

export type CampaignLeadHeroFormSide = 'left' | 'right';

export function deriveFormSideFromLayout(layoutVariant: string): CampaignLeadHeroFormSide {
  switch (layoutVariant) {
    case 'form_left_media_right':
    case 'background_media_form_left':
    case 'dual_media_form_left':
      return 'left';
    default:
      return 'right';
  }
}

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
