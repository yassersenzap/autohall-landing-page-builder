/**
 * Block Registry — single source of truth for the Builder catalog.
 */
import type { BuilderLeadContextValue } from '@/features/builder-v4/context/BuilderPreviewContext';
import type { InspectorControl } from './shared/inspector-control.types';
import type { ComponentType } from 'react';
import { BLOCK_ENTRIES, type HeroBlockEntry } from './hero';
import type { V4BlockCategory, V4HtmlDeps } from './shared/types';

export type { HeroBlockEntry as V4BlockEntry, V4BlockCategory, V4HtmlDeps };

export type V4BlockDefinition = {
  type: string;
  label: string;
  description: string;
  category: V4BlockCategory;
  badge?: string;
  defaultProps: () => Record<string, unknown>;
  inspectorControls: InspectorControl[];
  renderReact: ComponentType<{
    propsJson: Record<string, unknown>;
    interactive?: boolean;
    previewContext?: BuilderLeadContextValue;
  }>;
  renderHtml: (props: Record<string, unknown>, deps: V4HtmlDeps) => string;
};

const HERO_ALIASES: Record<string, string> = {
  hero_simple: 'hero_universal',
  hero_split: 'hero_universal',
  hero_background: 'hero_universal',
};

export function resolveBlockTypeAlias(type: string): string {
  return HERO_ALIASES[type] ?? type;
}

const REGISTRY_MAP = new Map<string, V4BlockDefinition>(
  BLOCK_ENTRIES.map((entry) => [entry.type, entry]),
);

export const BLOCK_REGISTRY: readonly V4BlockDefinition[] = BLOCK_ENTRIES;

/** @deprecated Use BLOCK_REGISTRY */
export const V4_BLOCK_ENTRIES = BLOCK_ENTRIES;

export function getBlockDefinition(type: string): V4BlockDefinition | undefined {
  const resolved = resolveBlockTypeAlias(type);
  return REGISTRY_MAP.get(resolved);
}

export function isV4Block(type: string): boolean {
  return REGISTRY_MAP.has(resolveBlockTypeAlias(type));
}

export function getAllV4BlockTypes(): string[] {
  return BLOCK_ENTRIES.map((e) => e.type);
}

export function getBlocksByCategory(category: V4BlockCategory): V4BlockDefinition[] {
  return BLOCK_ENTRIES.filter((e) => e.category === category);
}
