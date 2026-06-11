/**
 * URLs that must not be persisted to the API / export pipeline.
 */
export function isUnsafePersistedMediaUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('blob:')) return true;
  if (/\/studio(\/|$)/i.test(trimmed)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(trimmed)) return true;
  return false;
}

export function sanitizePersistedMediaUrl(url: string | undefined): string {
  if (!url || isUnsafePersistedMediaUrl(url)) return '';
  return url;
}

export function sanitizeMediaFieldPatch(patch: Record<string, unknown>): Record<string, unknown> {
  const next = { ...patch };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === 'string' && key.toLowerCase().includes('url') && isUnsafePersistedMediaUrl(value)) {
      next[key] = '';
    }
  }
  return next;
}
