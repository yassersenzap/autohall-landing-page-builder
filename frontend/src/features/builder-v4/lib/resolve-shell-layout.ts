import type { BuilderNode, NodeLayout, NodeStyle } from '../types/nodes.types';
import { sanitizeFlowLayout } from './layout-flow';
import { DEFAULT_FORM_COLUMN_WIDTH, DEFAULT_HERO_MIN_HEIGHT, FORM_ZONE_INNER_OFFSET } from '../types/geometry.types';
import type { FrameNodeProps } from '../types/nodes.types';
import { layoutToCss, styleToCss } from '../canvas/resolve-node-style';
import type { CSSProperties } from 'react';

function parseNodeCssVariables(raw?: string): CSSProperties {
  if (!raw?.trim()) return {};
  const out: Record<string, string> = {};
  for (const chunk of raw.split(';')) {
    const idx = chunk.indexOf(':');
    if (idx === -1) continue;
    const key = chunk.slice(0, idx).trim();
    const value = chunk.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out as CSSProperties;
}

function layoutForImageShell(layout: NodeLayout): NodeLayout {
  const {
    display: _display,
    direction: _direction,
    align: _align,
    justify: _justify,
    gap: _gap,
    flexWrap: _flexWrap,
    ...gridSizing
  } = layout;
  return gridSizing;
}

function styleForImageShell(style: NodeStyle): NodeStyle {
  const { objectFit: _objectFit, objectPositionX: _x, objectPositionY: _y, ...rest } = style;
  return rest;
}

/** Campaign CSS variables — Frame is neutral; vars only for HeroBlock descendants. */
function heroGeometryCssVars(node: BuilderNode, rootId?: string): CSSProperties {
  if (node.kind !== 'frame' || !rootId || node.id !== rootId) return {};
  const hero = (node.props as FrameNodeProps).heroGeometry;
  if (!hero) return {};
  const formColumnWidth = hero.formColumnWidth ?? DEFAULT_FORM_COLUMN_WIDTH;
  const formCardInner = Math.max(280, formColumnWidth - FORM_ZONE_INNER_OFFSET);
  return {
    ['--v4-hero-min-height' as string]: `${hero.minHeight ?? DEFAULT_HERO_MIN_HEIGHT}px`,
    ['--v4-form-column-width' as string]: `${formColumnWidth}px`,
    ['--v4-form-card-width' as string]: `${formCardInner}px`,
  };
}

/**
 * STORE → CSS. Frame never receives hero grid — HeroBlock owns layout (V2).
 */
export function resolveShellStyles(
  node: BuilderNode,
  parentNode: BuilderNode | null | undefined,
  rootId?: string,
): CSSProperties {
  const sanitized = sanitizeFlowLayout(node.layout, node, parentNode ?? null);
  const layout = node.kind === 'image' ? layoutForImageShell(sanitized) : sanitized;
  const style = node.kind === 'image' ? styleForImageShell(node.style) : node.style;

  return {
    ...layoutToCss(layout),
    ...styleToCss(style),
    ...heroGeometryCssVars(node, rootId),
    ...parseNodeCssVariables(node.advanced?.cssVariables),
  };
}
