import { asPropString } from '@/features/builder-engine/lib/block-props';
import type {
  InspectorControl,
  InspectorPropStore,
  InspectorTab,
  InspectorVisibilityCondition,
} from '@/features/builder/block-registry/inspector-control.types';

export function readDesignProps(propsJson: Record<string, unknown>): Record<string, unknown> {
  const raw = propsJson.design;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function readControlValue(
  propsJson: Record<string, unknown>,
  control: InspectorControl,
): string | number | boolean {
  const store: InspectorPropStore = control.store ?? 'content';
  const source = store === 'design' ? readDesignProps(propsJson) : propsJson;
  const raw = source[control.propKey];

  if (control.type === 'boolean') {
    if (typeof raw === 'boolean') return raw;
    return Boolean(control.defaultValue ?? false);
  }

  if (control.type === 'number' || control.type === 'range') {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    const parsed = Number(asPropString(raw));
    if (Number.isFinite(parsed)) return parsed;
    return typeof control.defaultValue === 'number' ? control.defaultValue : 0;
  }

  if (raw === null || raw === undefined) {
    return asPropString(control.defaultValue ?? '');
  }

  return asPropString(raw) || asPropString(control.defaultValue ?? '');
}

export function buildControlPatch(
  propsJson: Record<string, unknown>,
  control: InspectorControl,
  value: string | number | boolean,
): Record<string, unknown> {
  if (control.store === 'design') {
    return {
      design: {
        ...readDesignProps(propsJson),
        [control.propKey]: value,
      },
    };
  }

  return { [control.propKey]: value };
}

export function isControlVisible(
  propsJson: Record<string, unknown>,
  condition?: InspectorVisibilityCondition,
): boolean {
  if (!condition) return true;

  const store = condition.store ?? 'content';
  const source = store === 'design' ? readDesignProps(propsJson) : propsJson;
  const raw = source[condition.prop];
  const value =
    typeof raw === 'boolean' || typeof raw === 'number'
      ? raw
      : asPropString(raw) || (typeof raw === 'string' ? raw : '');

  if (condition.equals !== undefined && value !== condition.equals) return false;
  if (condition.notEquals !== undefined && value === condition.notEquals) return false;
  if (condition.oneOf && !condition.oneOf.includes(value as string | number | boolean)) {
    return false;
  }

  return true;
}

export function groupControlsBySection(
  controls: InspectorControl[],
): Array<{ group: string | null; controls: InspectorControl[] }> {
  const groups = new Map<string | null, InspectorControl[]>();

  for (const control of controls) {
    const key = control.group ?? null;
    const list = groups.get(key) ?? [];
    list.push(control);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([group, items]) => ({ group, controls: items }));
}

export function filterVisibleControls(
  propsJson: Record<string, unknown>,
  controls: InspectorControl[],
): InspectorControl[] {
  return controls.filter((control) => isControlVisible(propsJson, control.visibleWhen));
}

export function filterControlsByTab(
  controls: InspectorControl[],
  tab: InspectorTab,
): InspectorControl[] {
  return controls.filter((control) => control.tab === tab);
}
