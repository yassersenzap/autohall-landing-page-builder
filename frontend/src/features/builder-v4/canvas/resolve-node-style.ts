import type { CSSProperties } from 'react';
import type { BuilderNode, DeviceMode, NodeLayout, NodeStyle } from '../types/nodes.types';

export function resolveNodeForDevice(node: BuilderNode, device: DeviceMode): BuilderNode {
  if (device === 'desktop') return node;

  const slot = device === 'tablet' ? node.responsive.tablet : node.responsive.mobile;
  if (!slot) return node;

  return {
    ...node,
    layout: { ...node.layout, ...slot.layout },
    style: { ...node.style, ...slot.style },
    visibility: {
      ...node.visibility,
      hidden: slot.hidden ?? node.visibility.hidden,
    },
  };
}

export function layoutToCss(layout: NodeLayout): CSSProperties {
  const css: CSSProperties = {};

  if (layout.display === 'grid') {
    css.display = 'grid';
    if (layout.columns) css.gridTemplateColumns = layout.columns;
    if (layout.rows) css.gridTemplateRows = layout.rows;
  } else if (layout.display === 'flex') {
    css.display = 'flex';
    css.flexDirection = layout.direction === 'row' ? 'row' : 'column';
  } else if (layout.display) {
    css.display = layout.display;
  }

  if (layout.gap !== undefined) css.gap = layout.gap;
  if (layout.align) css.alignItems = mapAlign(layout.align);
  if (layout.alignSelf) css.alignSelf = mapAlign(layout.alignSelf);
  if (layout.justify) css.justifyContent = mapJustify(layout.justify);
  if (layout.justifySelf) css.justifySelf = mapAlign(layout.justifySelf);
  if (layout.padding !== undefined) css.padding = layout.padding;
  if (layout.minHeight !== undefined) css.minHeight = layout.minHeight;
  if (layout.width !== undefined) css.width = layout.width;
  if (layout.maxWidth !== undefined) css.maxWidth = layout.maxWidth;
  if (layout.height !== undefined) css.height = layout.height;
  if (layout.flex !== undefined) css.flex = layout.flex;
  if (layout.position) css.position = layout.position;
  if (layout.top !== undefined) css.top = layout.top;
  if (layout.right !== undefined) css.right = layout.right;
  if (layout.bottom !== undefined) css.bottom = layout.bottom;
  if (layout.left !== undefined) css.left = layout.left;
  if (layout.zIndex !== undefined) css.zIndex = layout.zIndex;
  if (layout.flexWrap) css.flexWrap = layout.flexWrap;
  if (layout.minWidth !== undefined) css.minWidth = layout.minWidth;
  if (layout.maxHeight !== undefined) css.maxHeight = layout.maxHeight;
  if (layout.marginTop !== undefined) css.marginTop = layout.marginTop;
  if (layout.marginLeft !== undefined) css.marginLeft = layout.marginLeft;
  if (layout.overflow) css.overflow = layout.overflow;
  if ('gridColumn' in layout && layout.gridColumn) css.gridColumn = layout.gridColumn as string;
  if ('gridRow' in layout && layout.gridRow) css.gridRow = layout.gridRow as string;

  return css;
}

export function styleToCss(style: NodeStyle): CSSProperties {
  const css: CSSProperties = {};
  if (style.backgroundGradient) {
    css.background = style.backgroundGradient;
  } else if (style.background) {
    css.background = style.background;
  }
  if (style.color) css.color = style.color;
  if (style.borderRadius !== undefined) css.borderRadius = style.borderRadius;
  if (style.borderWidth !== undefined && style.borderWidth > 0) {
    css.borderWidth = style.borderWidth;
    css.borderStyle = 'solid';
    css.borderColor = style.borderColor ?? '#e4e4e7';
  }
  if (style.opacity !== undefined) css.opacity = style.opacity / 100;
  if (style.fontSize !== undefined) css.fontSize = style.fontSize;
  if (style.fontWeight !== undefined) css.fontWeight = style.fontWeight;
  if (style.fontFamily) css.fontFamily = style.fontFamily;
  if (style.lineHeight !== undefined) css.lineHeight = style.lineHeight;
  if (style.letterSpacing !== undefined) css.letterSpacing = style.letterSpacing;
  if (style.blur || style.brightness !== undefined || style.saturation !== undefined) {
    const parts: string[] = [];
    if (style.brightness !== undefined && style.brightness !== 100) {
      parts.push(`brightness(${style.brightness / 100})`);
    }
    if (style.saturation !== undefined && style.saturation !== 100) {
      parts.push(`saturate(${style.saturation / 100})`);
    }
    if (style.blur) parts.push(`blur(${style.blur}px)`);
    if (parts.length) css.filter = parts.join(' ');
  } else if (style.blur) {
    css.filter = `blur(${style.blur}px)`;
  }
  if (style.backdropBlur) css.backdropFilter = `blur(${style.backdropBlur}px)`;
  if (style.blendMode) css.mixBlendMode = style.blendMode;
  if (style.shadow || style.shadowBlur || style.shadowX || style.shadowY) {
    const x = style.shadowX ?? 0;
    const y = style.shadowY ?? 4;
    const blur = style.shadowBlur ?? 12;
    const spread = style.shadowSpread ?? 0;
    const color = style.shadowColor ?? 'rgba(15, 23, 42, 0.14)';
    css.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }
  return css;
}

function mapAlign(value: NonNullable<NodeLayout['align']>): CSSProperties['alignItems'] {
  const map = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' } as const;
  return map[value];
}

function mapJustify(value: NonNullable<NodeLayout['justify']>): CSSProperties['justifyContent'] {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    stretch: 'stretch',
  } as const;
  return map[value];
}

export function imageOverlayGradient(
  color: string,
  opacity: number,
  direction: string,
  gradient: boolean,
): string {
  const alpha = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  const rgba = `${color}${alpha}`;

  if (!gradient) return rgba;

  if (direction === 'radial') return `radial-gradient(ellipse at center, ${rgba} 0%, transparent 72%)`;
  if (direction === 'to-top') return `linear-gradient(0deg, transparent 20%, ${rgba})`;
  if (direction === 'to-left') return `linear-gradient(270deg, transparent 20%, ${rgba})`;
  if (direction === 'to-right') return `linear-gradient(90deg, transparent 20%, ${rgba})`;
  return `linear-gradient(180deg, transparent 30%, ${rgba})`;
}
