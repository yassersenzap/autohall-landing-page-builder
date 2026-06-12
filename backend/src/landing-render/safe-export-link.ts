export function sanitizeExportHref(value: string | null | undefined, fallback = '#lead-form'): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('blob:')) {
    return fallback;
  }
  if (lower.includes('/studio') || lower.includes('localhost:5173') || lower.includes('/api/assets/')) {
    return fallback;
  }
  if (trimmed.startsWith('#')) {
    return trimmed.slice(0, 128);
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.slice(0, 2048);
  }
  return fallback;
}
