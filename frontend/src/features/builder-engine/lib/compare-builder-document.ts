import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import type { BuilderDocumentBlock } from '../types';
import type { PageThemeDraft } from '../store/builder-document.store';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

function propsEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  return stableStringify(a) === stableStringify(b);
}

/**
 * Compare le document Zustand au baseline API (dernier état sauvegardé).
 */
export function isBuilderDocumentDirty(
  documentBlocks: BuilderDocumentBlock[],
  baseline: EditorPageBlock[],
  themeDirty: boolean,
): boolean {
  if (themeDirty) return true;

  const sortedBaseline = [...baseline].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedCurrent = [...documentBlocks].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedBaseline.length !== sortedCurrent.length) {
    return true;
  }

  const baselineById = new Map(sortedBaseline.map((block) => [block.id, block]));

  for (let index = 0; index < sortedCurrent.length; index += 1) {
    const current = sortedCurrent[index];
    const base = baselineById.get(current.id);

    if (!base) {
      return true;
    }

    const baseProps =
      base.propsJson && typeof base.propsJson === 'object' && !Array.isArray(base.propsJson)
        ? (base.propsJson as Record<string, unknown>)
        : {};

    if (base.blockType.toLowerCase() !== current.type) {
      return true;
    }

    if (!propsEqual(current.propsJson, baseProps)) {
      return true;
    }
  }

  return false;
}

export function themePayloadEqual(
  current: PageThemeDraft,
  initial: PageThemeDraft,
): boolean {
  return stableStringify(current) === stableStringify(initial);
}
