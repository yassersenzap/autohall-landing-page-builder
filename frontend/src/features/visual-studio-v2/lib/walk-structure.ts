import type { Config, Data } from '@puckeditor/core';
import { resolveOutlineLabel } from './outline-labels';

export type StructureEntry = {
  id: string;
  type: string;
  label: string;
  zone: string;
  index: number;
  depth: number;
};

function isSlotField(field: unknown): field is { type: 'slot' } {
  return Boolean(field && typeof field === 'object' && 'type' in field && field.type === 'slot');
}

export function flattenDocumentStructure(data: Data, config: Config): StructureEntry[] {
  const entries: StructureEntry[] = [];

  function walkItems(items: unknown[], zone: string, depth: number) {
    if (!Array.isArray(items)) return;

    items.forEach((raw, index) => {
      if (!raw || typeof raw !== 'object' || !('type' in raw)) return;
      const item = raw as { type: string; props?: Record<string, unknown> };
      const props = item.props ?? {};
      const id = typeof props.id === 'string' ? props.id : `${item.type}-${zone}-${index}`;

      entries.push({
        id,
        type: item.type,
        label: resolveOutlineLabel(item.type, props),
        zone,
        index,
        depth,
      });

      const componentConfig = config.components[item.type];
      if (!componentConfig?.fields) return;

      for (const [fieldName, field] of Object.entries(componentConfig.fields)) {
        if (!isSlotField(field)) continue;
        const slotItems = props[fieldName];
        if (!Array.isArray(slotItems)) continue;
        walkItems(slotItems, `${id}:${fieldName}`, depth + 1);
      }
    });
  }

  walkItems(data.content ?? [], 'root:default-zone', 0);
  return entries;
}
