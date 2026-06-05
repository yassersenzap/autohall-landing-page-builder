/**
 * Normalisation props campagne — lecture compatible flat + groupes content/media/layout/design/cta.
 */
import { asPropString } from './block-props';

function readGroup(props: Record<string, unknown>, key: string): Record<string, unknown> {
  const raw = props[key];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function pickString(
  flat: Record<string, unknown>,
  group: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const fromGroup = asPropString(group[key]);
    if (fromGroup) return fromGroup;
    const fromFlat = asPropString(flat[key]);
    if (fromFlat) return fromFlat;
  }
  return '';
}

export function normalizeHeroCampaignProps(props: Record<string, unknown>) {
  const content = readGroup(props, 'content');
  const media = readGroup(props, 'media');
  const cta = readGroup(props, 'cta');
  const layout = readGroup(props, 'layout');
  const design = readGroup(props, 'design');

  return {
    layoutVariant: pickString(props, layout, 'layoutVariant') || 'promo_image_right',
    campaignType: pickString(props, content, 'campaignType') || asPropString(props.campaignType) || 'promo',
    eyebrow: pickString(props, content, 'eyebrow'),
    title: pickString(props, content, 'title'),
    subtitle: pickString(props, content, 'subtitle'),
    promoBadge: pickString(props, content, 'promoBadge'),
    buttonText: pickString(props, cta, 'primaryCtaLabel', 'buttonText'),
    buttonTarget: pickString(props, cta, 'primaryCtaHref', 'buttonTarget') || '#lead-form',
    secondaryButtonText: pickString(props, cta, 'secondaryCtaLabel', 'secondaryButtonText'),
    secondaryButtonTarget: pickString(props, cta, 'secondaryCtaHref', 'secondaryButtonTarget') || '#offer',
    imageAssetId: pickString(props, media, 'imageAssetId'),
    imageUrl: pickString(props, media, 'imageUrl'),
    alt: pickString(props, media, 'altText', 'alt'),
    design:
      Object.keys(design).length > 0
        ? design
        : (props.design as Record<string, unknown> | undefined) ?? {},
  };
}

export function normalizeFormPropsFromBlock(props: Record<string, unknown>): Record<string, unknown> {
  const form = readGroup(props, 'form');
  if (Object.keys(form).length === 0) return props;
  return { ...props, ...form };
}

export function normalizeHeroFormCampaignProps(props: Record<string, unknown>) {
  const hero = normalizeHeroCampaignProps(props);
  const form = readGroup(props, 'form');
  return { hero, form: Object.keys(form).length > 0 ? form : props };
}

export function normalizeVehicleOfferProps(props: Record<string, unknown>) {
  const content = readGroup(props, 'content');
  const media = readGroup(props, 'media');
  const cta = readGroup(props, 'cta');

  return {
    layoutVariant: pickString(props, readGroup(props, 'layout'), 'layoutVariant') || 'image_right_offer_left',
    modelName: pickString(props, content, 'modelName'),
    heading: pickString(props, content, 'offerTitle', 'heading'),
    subtitle: pickString(props, content, 'offerSubtitle', 'subtitle'),
    priceLabel: pickString(props, content, 'priceLabel') || 'À partir de',
    priceValue: pickString(props, content, 'priceValue'),
    legalNote: pickString(props, content, 'legalNote'),
    buttonText: pickString(props, cta, 'ctaLabel', 'buttonText'),
    buttonTarget: pickString(props, cta, 'ctaHref', 'buttonTarget') || '#lead-form',
    imageAssetId: pickString(props, media, 'imageAssetId'),
    imageUrl: pickString(props, media, 'imageUrl'),
    alt: pickString(props, media, 'altText', 'alt'),
    highlights: Array.isArray(props.highlights) ? props.highlights : [],
    design: (props.design as Record<string, unknown> | undefined) ?? {},
  };
}
