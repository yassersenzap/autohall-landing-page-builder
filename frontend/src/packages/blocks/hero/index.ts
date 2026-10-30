import type { InspectorControl } from '../shared/inspector-control.types';
import type { V4BlockCategory, V4BlockRenderProps, V4HtmlDeps } from '../shared/types';
import type { ComponentType } from 'react';
import { escapeHtml } from '../shared/media';
import { HERO_UNIVERSAL_DEFAULTS, HERO_ART_DEFAULTS } from './defaults';
import { HeroUniversalRender } from './hero-universal';
import { HeroArtRender } from './hero-art';
import { HERO_UNIVERSAL_CONTROLS, HERO_ART_CONTROLS } from './inspector';

export type HeroBlockEntry = {
  type: string;
  label: string;
  description: string;
  category: V4BlockCategory;
  defaultProps: () => Record<string, unknown>;
  inspectorControls: InspectorControl[];
  renderReact: ComponentType<V4BlockRenderProps>;
  renderHtml: (props: Record<string, unknown>, deps: V4HtmlDeps) => string;
};

function htmlSection(type: string, inner: string): string {
  return `<section class="lp-v4-section lp-v4-section--${type}" data-v4-block="${type}"><div class="lp-v4-section__inner">${inner}</div></section>`;
}

function heroPreviewHtml(props: Record<string, unknown>): string {
  const title = typeof props.title === 'string' ? escapeHtml(props.title) : '';
  return htmlSection('hero_universal', title ? `<h1>${title}</h1>` : '');
}

function heroArtPreviewHtml(props: Record<string, unknown>): string {
  const title = typeof props.title === 'string' ? escapeHtml(props.title) : '';
  return htmlSection('hero_art', title ? `<h1>${title}</h1>` : '');
}

export const HERO_BLOCK_ENTRY: HeroBlockEntry = {
  type: 'hero_universal',
  label: 'Hero',
  description: 'Hero universel — split, fond, badge, double CTA, overlay.',
  category: 'hero',
  defaultProps: () => ({ ...HERO_UNIVERSAL_DEFAULTS }),
  inspectorControls: HERO_UNIVERSAL_CONTROLS,
  renderReact: HeroUniversalRender,
  renderHtml: (props) => heroPreviewHtml(props),
};

export const HERO_ART_ENTRY: HeroBlockEntry = {
  type: 'hero_art',
  label: 'Hero Artistique',
  description: 'Hero Artistique — titre et image d\'arrière-plan configurable.',
  category: 'hero',
  defaultProps: () => ({ ...HERO_ART_DEFAULTS }),
  inspectorControls: HERO_ART_CONTROLS,
  renderReact: HeroArtRender,
  renderHtml: (props) => heroArtPreviewHtml(props),
};

export const BLOCK_ENTRIES: HeroBlockEntry[] = [HERO_BLOCK_ENTRY, HERO_ART_ENTRY];

export { HERO_UNIVERSAL_DEFAULTS, HERO_ART_DEFAULTS } from './defaults';
export { HeroUniversalRender } from './hero-universal';
export { HeroArtRender } from './hero-art';
export { HERO_UNIVERSAL_CONTROLS, HERO_ART_CONTROLS } from './inspector';
export {
  heroPresetForVariant,
  parseHeroCampaignVariant,
  HERO_CAMPAIGN_LABELS,
  type HeroCampaignVariant,
} from './hero-campaign-presets';
