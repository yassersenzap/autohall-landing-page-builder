/**
 * Nettoie les patches avant fusion dans propsJson.
 * Limite aux scalaires sûrs — prêt pour validation Zod côté store/API.
 */
const MAX_STRING_LENGTH = 8_000;

function trimString(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

export function sanitizePropsPatch(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null) continue;

    if (typeof key !== 'string' || key.length === 0 || key.length > 64) continue;

    if (typeof value === 'string') {
      out[key] = trimString(value, MAX_STRING_LENGTH);
      continue;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }

    if (typeof value === 'boolean') {
      out[key] = value;
    }
  }

  return out;
}
