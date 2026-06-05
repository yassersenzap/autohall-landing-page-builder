import type { StudioV2ImageStyle, StudioV2Typography } from '../design-tokens/types';

export function typographyClassName(typography?: StudioV2Typography | Record<string, unknown>): string {
  if (!typography || typeof typography !== 'object') return '';
  const t = typography as StudioV2Typography;
  const parts: string[] = [];
  if (t.titleSize) parts.push(`vs2-typo-title-${t.titleSize}`);
  if (t.titleWeight) parts.push(`vs2-typo-weight-${t.titleWeight}`);
  if (t.lineHeight) parts.push(`vs2-typo-leading-${t.lineHeight}`);
  if (t.letterSpacing) parts.push(`vs2-typo-tracking-${t.letterSpacing}`);
  if (t.textAlign) parts.push(`vs2-typo-align-${t.textAlign}`);
  if (t.textTransform === 'uppercase') parts.push('vs2-typo-uppercase');
  return parts.join(' ');
}

export function typographyInlineStyle(
  typography?: StudioV2Typography | Record<string, unknown>,
): Record<string, string> {
  if (!typography || typeof typography !== 'object') return {};
  const t = typography as StudioV2Typography;
  const style: Record<string, string> = {};
  if (t.titleColor?.trim()) style['--vs2-block-title-color'] = t.titleColor.trim();
  if (t.textColor?.trim()) style['--vs2-block-text-color'] = t.textColor.trim();
  return style;
}

export function imageStyleClassName(image?: StudioV2ImageStyle | Record<string, unknown>): string {
  if (!image || typeof image !== 'object') return '';
  const i = image as StudioV2ImageStyle;
  const parts: string[] = [];
  if (i.imageFit) parts.push(`vs2-img-fit-${i.imageFit}`);
  if (i.imagePosition) parts.push(`vs2-img-pos-${i.imagePosition}`);
  if (i.aspectRatio) parts.push(`vs2-img-ratio-${String(i.aspectRatio).replace(':', '_')}`);
  if (i.imageRadius) parts.push(`vs2-img-radius-${i.imageRadius}`);
  if (i.imageShadow) parts.push(`vs2-img-shadow-${i.imageShadow}`);
  if (typeof i.overlayOpacity === 'number' && i.overlayOpacity > 0) {
    parts.push('vs2-img-has-overlay');
  }
  return parts.join(' ');
}
