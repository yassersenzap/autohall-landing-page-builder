export function typographyClassName(
  typography?: Record<string, unknown>,
): string {
  if (!typography || typeof typography !== 'object') return '';
  const parts: string[] = [];
  if (typeof typography.titleSize === 'string')
    parts.push(`vs2-typo-title-${typography.titleSize}`);
  if (typeof typography.titleWeight === 'string')
    parts.push(`vs2-typo-weight-${typography.titleWeight}`);
  if (typeof typography.lineHeight === 'string')
    parts.push(`vs2-typo-leading-${typography.lineHeight}`);
  if (typeof typography.letterSpacing === 'string')
    parts.push(`vs2-typo-tracking-${typography.letterSpacing}`);
  if (typeof typography.textAlign === 'string')
    parts.push(`vs2-typo-align-${typography.textAlign}`);
  if (typography.textTransform === 'uppercase')
    parts.push('vs2-typo-uppercase');
  return parts.join(' ');
}

export function imageStyleClassName(
  imageStyle?: Record<string, unknown>,
): string {
  if (!imageStyle || typeof imageStyle !== 'object') return '';
  const parts: string[] = [];
  if (typeof imageStyle.imageFit === 'string')
    parts.push(`vs2-img-fit-${imageStyle.imageFit}`);
  if (typeof imageStyle.imagePosition === 'string')
    parts.push(`vs2-img-pos-${imageStyle.imagePosition}`);
  if (typeof imageStyle.aspectRatio === 'string')
    parts.push(`vs2-img-ratio-${imageStyle.aspectRatio.replace(':', '_')}`);
  if (typeof imageStyle.imageRadius === 'string')
    parts.push(`vs2-img-radius-${imageStyle.imageRadius}`);
  if (typeof imageStyle.imageShadow === 'string')
    parts.push(`vs2-img-shadow-${imageStyle.imageShadow}`);
  return parts.join(' ');
}
