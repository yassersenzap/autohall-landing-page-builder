import type { CSSProperties } from 'react';
import type { StudioV2ImageStyle } from '../design-tokens/types';

const RADIUS_MAP: Record<NonNullable<StudioV2ImageStyle['imageRadius']>, string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

const SHADOW_MAP: Record<NonNullable<StudioV2ImageStyle['imageShadow']>, string> = {
  none: 'none',
  soft: '0 8px 24px rgba(15, 23, 42, 0.1)',
  medium: '0 16px 40px rgba(15, 23, 42, 0.14)',
  strong: '0 24px 56px rgba(15, 23, 42, 0.2)',
};

const ASPECT_RATIO_MAP: Record<NonNullable<StudioV2ImageStyle['aspectRatio']>, string | undefined> = {
  auto: undefined,
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  portrait: '3 / 4',
};

export function readImageStyleProps(props: Record<string, unknown>): StudioV2ImageStyle {
  return {
    imageFit: props.imageFit === 'contain' ? 'contain' : 'cover',
    imagePosition:
      typeof props.imagePosition === 'string' ? (props.imagePosition as StudioV2ImageStyle['imagePosition']) : 'center',
    aspectRatio:
      typeof props.aspectRatio === 'string'
        ? (props.aspectRatio as StudioV2ImageStyle['aspectRatio'])
        : 'auto',
    imageRadius:
      typeof props.imageRadius === 'string'
        ? (props.imageRadius as StudioV2ImageStyle['imageRadius'])
        : 'md',
    imageShadow:
      typeof props.imageShadow === 'string'
        ? (props.imageShadow as StudioV2ImageStyle['imageShadow'])
        : 'none',
  };
}

export function buildImageMediaStyle(props: Record<string, unknown>): CSSProperties {
  const style = readImageStyleProps(props);
  const css: CSSProperties = {};

  if (style.aspectRatio && style.aspectRatio !== 'auto') {
    const ratio = ASPECT_RATIO_MAP[style.aspectRatio];
    if (ratio) css.aspectRatio = ratio;
  }

  const radius = style.imageRadius ? RADIUS_MAP[style.imageRadius] : RADIUS_MAP.md;
  if (radius) css.borderRadius = radius;

  const shadow = style.imageShadow ? SHADOW_MAP[style.imageShadow] : SHADOW_MAP.none;
  if (shadow && shadow !== 'none') css.boxShadow = shadow;

  return css;
}

export function buildImageElementStyle(props: Record<string, unknown>): CSSProperties {
  const style = readImageStyleProps(props);
  return {
    objectFit: style.imageFit ?? 'cover',
    objectPosition: style.imagePosition ?? 'center',
  };
}

export function imageStyleDefaults(): StudioV2ImageStyle {
  return {
    imageFit: 'cover',
    imagePosition: 'center',
    aspectRatio: 'auto',
    imageRadius: 'md',
    imageShadow: 'none',
  };
}
