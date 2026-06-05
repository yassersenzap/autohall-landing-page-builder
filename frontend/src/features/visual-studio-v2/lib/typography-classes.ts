import type { CSSProperties } from 'react';

const TITLE_SIZE: Record<string, string> = {
  s: 'clamp(1.25rem, 2.5vw, 1.5rem)',
  m: 'clamp(1.5rem, 3vw, 2rem)',
  l: 'clamp(1.75rem, 3.5vw, 2.5rem)',
  xl: 'clamp(2rem, 4vw, 3rem)',
};

const TITLE_WEIGHT: Record<string, string> = {
  normal: '400',
  medium: '500',
  bold: '700',
  extrabold: '800',
};

const CTA_SIZE: Record<string, string> = {
  s: '0.8125rem',
  m: '0.9375rem',
  l: '1.0625rem',
};

export function heroTitleStyle(props: Record<string, unknown>): CSSProperties {
  const size = typeof props.titleSize === 'string' ? props.titleSize : 'l';
  const weight = typeof props.titleWeight === 'string' ? props.titleWeight : 'bold';
  const style: CSSProperties = {
    fontSize: TITLE_SIZE[size] ?? TITLE_SIZE.l,
    fontWeight: TITLE_WEIGHT[weight] ?? '700',
    textAlign: props.titleAlign === 'center' || props.titleAlign === 'right' ? props.titleAlign : 'left',
  };
  if (typeof props.titleColor === 'string' && props.titleColor.trim()) {
    style.color = props.titleColor.trim();
  }
  return style;
}

export function heroSubtitleStyle(props: Record<string, unknown>): CSSProperties {
  const style: CSSProperties = {
    textAlign: props.bodyAlign === 'center' || props.bodyAlign === 'right' ? props.bodyAlign : 'left',
  };
  if (typeof props.bodyColor === 'string' && props.bodyColor.trim()) {
    style.color = props.bodyColor.trim();
  }
  return style;
}

export function ctaClassName(variant?: string, size?: string): string {
  const v = variant === 'secondary' || variant === 'outline' || variant === 'link' ? variant : 'primary';
  const s = size === 's' || size === 'l' ? size : 'm';
  return `vs2-hero__cta vs2-hero__cta--${v} vs2-hero__cta--size-${s}`;
}

export function ctaInlineStyle(size?: string): CSSProperties {
  const s = size === 's' || size === 'l' ? size : 'm';
  return { fontSize: CTA_SIZE[s] };
}
