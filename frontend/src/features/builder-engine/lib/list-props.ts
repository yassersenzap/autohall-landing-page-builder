export function asObjectList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  );
}

export type MetricItem = { value: string; label: string };
export type ListItem = { title: string; description: string };
export type LinkItem = { label: string; href: string };

export function parseMetrics(propsJson: Record<string, unknown>): MetricItem[] {
  return asObjectList(propsJson.metrics)
    .map((row) => ({
      value: typeof row.value === 'string' ? row.value : '',
      label: typeof row.label === 'string' ? row.label : '',
    }))
    .filter((row) => row.value.trim() || row.label.trim());
}

export function parseListItems(
  propsJson: Record<string, unknown>,
  key: 'items' | 'highlights' = 'items',
): ListItem[] {
  const raw = propsJson[key] ?? propsJson.items;
  return asObjectList(raw)
    .map((row) => ({
      title: typeof row.title === 'string' ? row.title : '',
      description: typeof row.description === 'string' ? row.description : '',
    }))
    .filter((row) => row.title.trim() || row.description.trim());
}

export function parseFooterLinks(propsJson: Record<string, unknown>): LinkItem[] {
  return asObjectList(propsJson.links)
    .map((row) => ({
      label: typeof row.label === 'string' ? row.label : '',
      href: typeof row.href === 'string' ? row.href : '#',
    }))
    .filter((row) => row.label.trim());
}
