const CORE_LAYOUTS = new Set<string>([
  'image_left_form_right',
  'form_left_image_right',
  'background_image_form_card',
  'full_width_banner_form_side',
]);

const LAYOUT_VARIANTS = new Set<string>(['split', 'background', 'banner']);
const LAYOUT_DIRECTIONS = new Set<string>(['image-left', 'image-right']);

export type CoreLayoutDirection = 'image-left' | 'image-right';
export type CoreLayoutVariant = 'split' | 'background' | 'banner';
export type CoreCampaignLayout =
  | 'image_left_form_right'
  | 'form_left_image_right'
  | 'background_image_form_card'
  | 'full_width_banner_form_side';

function propString(props: Record<string, unknown>, key: string): string | null {
  const value = props[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function isCoreLayoutDirection(value: string): value is CoreLayoutDirection {
  return LAYOUT_DIRECTIONS.has(value);
}

function resolveCoreLayoutVariant(props: Record<string, unknown>): CoreLayoutVariant {
  const raw = propString(props, 'layoutVariant');
  if (raw === 'background' || raw === 'banner') return raw;
  const legacyLayout = propString(props, 'coreLayout');
  if (legacyLayout === 'background_image_form_card') return 'background';
  if (legacyLayout === 'full_width_banner_form_side') return 'banner';
  return 'split';
}

function resolveCoreLayoutDirection(props: Record<string, unknown>): CoreLayoutDirection {
  const raw = propString(props, 'layoutDirection');
  const direction = raw ?? '';
  if (isCoreLayoutDirection(direction)) return direction;

  const legacyLayout = propString(props, 'coreLayout');
  if (legacyLayout === 'form_left_image_right') return 'image-right';
  return 'image-left';
}

function coreLayoutFromBusinessProps(
  direction: CoreLayoutDirection,
  variant: CoreLayoutVariant,
): CoreCampaignLayout {
  if (variant === 'background') return 'background_image_form_card';
  if (variant === 'banner') return 'full_width_banner_form_side';
  return direction === 'image-right' ? 'form_left_image_right' : 'image_left_form_right';
}

export function resolveCoreCampaignLayout(props: Record<string, unknown>): CoreCampaignLayout {
  const legacy = propString(props, 'coreLayout');
  if (legacy && CORE_LAYOUTS.has(legacy) && !propString(props, 'layoutDirection')) {
    return legacy as CoreCampaignLayout;
  }

  const variant = resolveCoreLayoutVariant(props);
  const direction = resolveCoreLayoutDirection(props);
  return coreLayoutFromBusinessProps(direction, variant);
}
