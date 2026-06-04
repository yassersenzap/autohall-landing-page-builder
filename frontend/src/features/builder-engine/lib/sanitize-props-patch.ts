/**
 * Nettoie les patches avant fusion dans propsJson.
 * Limite aux scalaires et listes d'objets plats — prêt pour validation Zod côté store/API.
 */
const MAX_STRING_LENGTH = 8_000;
const MAX_ARRAY_ITEMS = 12;
const MAX_OBJECT_KEYS = 8;

function trimString(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

function sanitizeRecordObject(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let keyCount = 0;

  for (const [key, raw] of Object.entries(value)) {
    if (keyCount >= MAX_OBJECT_KEYS) break;
    if (typeof key !== 'string' || key.length === 0 || key.length > 64) continue;

    if (typeof raw === 'string') {
      out[key] = trimString(raw, MAX_STRING_LENGTH);
      keyCount += 1;
    } else if (typeof raw === 'boolean') {
      out[key] = raw;
      keyCount += 1;
    } else if (typeof raw === 'number' && Number.isFinite(raw)) {
      out[key] = raw;
      keyCount += 1;
    }
  }

  return out;
}

function sanitizeArrayValue(value: unknown[]): unknown[] {
  return value
    .slice(0, MAX_ARRAY_ITEMS)
    .map((item) => {
      if (typeof item === 'string') {
        return trimString(item, MAX_STRING_LENGTH);
      }
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        return sanitizeRecordObject(item as Record<string, unknown>);
      }
      return null;
    })
    .filter((item) => item !== null && (typeof item !== 'object' || Object.keys(item).length > 0));
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
      continue;
    }

    if (Array.isArray(value)) {
      const sanitized = sanitizeArrayValue(value);
      if (sanitized.length > 0) {
        out[key] = sanitized;
      }
    }
  }

  return out;
}
