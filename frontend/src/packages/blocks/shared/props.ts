export function str(props: Record<string, unknown>, key: string, fallback = ''): string {
  const v = props[key];
  return typeof v === 'string' ? v : fallback;
}

export function num(props: Record<string, unknown>, key: string, fallback: number): number {
  const v = props[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function bool(props: Record<string, unknown>, key: string, fallback = false): boolean {
  const v = props[key];
  return typeof v === 'boolean' ? v : fallback;
}

export function list<T extends Record<string, unknown>>(
  props: Record<string, unknown>,
  key: string,
): T[] {
  const v = props[key];
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is T => item !== null && typeof item === 'object' && !Array.isArray(item));
}
