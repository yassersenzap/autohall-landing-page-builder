export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#')) return trimmed || '#';
  if (/^https?:\/\//i.test(trimmed)) return escapeHtml(trimmed);
  return '#';
}
