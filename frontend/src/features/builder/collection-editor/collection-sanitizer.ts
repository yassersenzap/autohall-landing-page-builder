import { getCollectionSchema } from './collection-schemas';
import type { CollectionItemField, CollectionSchema } from './collection-field.types';

const MAX_STRING_LENGTH = 4_000;
const STUDIO_KEY_PREFIX = '_studio';

export function sanitizeSafeUrl(value: unknown, fallback = '#lead-form'): string {
  if (typeof value !== 'string') return fallback;
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

function trimString(value: string, max = MAX_STRING_LENGTH): string {
  return value.length <= max ? value : value.slice(0, max);
}

function stripStudioKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => stripStudioKeysDeep(entry));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const record = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(record)) {
    if (key.startsWith(STUDIO_KEY_PREFIX)) continue;
    out[key] = stripStudioKeysDeep(nested);
  }
  return out;
}

function sanitizeAssetId(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = trimString(value.trim(), 64);
  if (!trimmed || trimmed.toLowerCase().startsWith('data:')) return '';
  return trimmed;
}

function sanitizeImageUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('data:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('javascript:') ||
    lower.includes('/studio') ||
    lower.includes('/api/assets/')
  ) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimString(trimmed, 2048);
  }
  return '';
}

function pickEnum(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

function fieldMaxLength(field: CollectionItemField): number {
  if (field.type === 'text' || field.type === 'textarea') {
    return field.maxLength ?? MAX_STRING_LENGTH;
  }
  return MAX_STRING_LENGTH;
}

function sanitizeItemField(
  field: CollectionItemField,
  raw: unknown,
): string | boolean | string[] | number | undefined {
  if (field.type === 'boolean') {
    return typeof raw === 'boolean' ? raw : false;
  }

  if (field.type === 'number') {
    const num = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(num) ? num : 0;
  }

  if (field.type === 'string-list') {
    const maxLines = 12;
    if (Array.isArray(raw)) {
      return raw
        .filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
        .map((line) => trimString(line.trim(), fieldMaxLength(field)))
        .slice(0, maxLines);
    }
    if (typeof raw === 'string') {
      return raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => trimString(line, fieldMaxLength(field)))
        .slice(0, maxLines);
    }
    return [];
  }

  if (field.type === 'url') {
    return sanitizeSafeUrl(raw);
  }

  if (field.type === 'asset') {
    return undefined;
  }

  if (field.type === 'select') {
    const values = field.options.map((opt) => opt.value);
    const fallback =
      typeof field.defaultValue === 'string'
        ? field.defaultValue
        : (values[0] ?? '');
    return pickEnum(raw, values, fallback);
  }

  if (typeof raw !== 'string') {
    return '';
  }

  if (field.key.toLowerCase().includes('assetid')) {
    return sanitizeAssetId(raw);
  }

  if (
    field.key === 'imageUrl' ||
    field.key === 'url' ||
    field.key.toLowerCase().endsWith('url')
  ) {
    return sanitizeImageUrl(raw);
  }

  return trimString(raw, fieldMaxLength(field));
}

export function createDefaultCollectionItem(schema: CollectionSchema): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const field of schema.itemFields) {
    if (field.type === 'boolean') {
      item[field.key] = false;
    } else if (field.type === 'string-list') {
      item[field.key] = [];
    } else if (field.type === 'select') {
      item[field.key] =
        field.defaultValue ?? field.options[0]?.value ?? '';
    } else if (field.type === 'url') {
      item[field.key] = '#lead-form';
    } else if (field.type === 'number') {
      item[field.key] = 0;
    } else if (field.type === 'asset') {
      item[field.assetKey] = '';
      item[field.urlKey] = '';
      if (field.altKey) item[field.altKey] = '';
    } else {
      item[field.key] = '';
    }
  }
  return item;
}

function itemHasFieldContent(
  field: CollectionItemField,
  out: Record<string, unknown>,
): boolean {
  if (field.type === 'boolean') return true;
  if (field.type === 'string-list') {
    const val = out[field.key];
    return Array.isArray(val) && val.length > 0;
  }
  if (field.type === 'asset') {
    return Boolean(out[field.assetKey]) || Boolean(out[field.urlKey]) || Boolean(field.altKey && out[field.altKey]);
  }
  const val = out[field.key];
  return typeof val === 'string' && val.length > 0;
}

export function sanitizeCollectionItem(
  schema: CollectionSchema,
  item: unknown,
): Record<string, unknown> | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;

  const raw = stripStudioKeysDeep(item) as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const field of schema.itemFields) {
    if (field.type === 'asset') {
      const assetId = sanitizeAssetId(raw[field.assetKey]);
      const url = sanitizeImageUrl(raw[field.urlKey]);
      if (assetId) out[field.assetKey] = assetId;
      if (url) out[field.urlKey] = url;
      if (field.altKey && typeof raw[field.altKey] === 'string') {
        const alt = trimString(String(raw[field.altKey]).trim(), 240);
        if (alt) out[field.altKey] = alt;
      }
      continue;
    }

    const value = sanitizeItemField(field, raw[field.key]);
    if (field.type === 'string-list') {
      out[field.key] = value as string[];
    } else if (field.type === 'boolean') {
      out[field.key] = Boolean(value);
    } else if (field.type === 'number') {
      out[field.key] = typeof value === 'number' ? value : 0;
    } else if (field.type === 'url') {
      out[field.key] = String(value ?? '#lead-form');
    } else if (typeof value === 'string' && value.length > 0) {
      out[field.key] = value;
    }
  }

  const hasContent = schema.itemFields.some((field) => itemHasFieldContent(field, out));
  return hasContent ? out : null;
}

export function sanitizeCollectionArray(
  blockType: string,
  propKey: string,
  value: unknown[],
): Record<string, unknown>[] {
  const schema = getCollectionSchema(blockType, propKey);
  if (!schema) return [];

  const max = schema.maxItems ?? 12;
  const sanitized = value
    .slice(0, max)
    .map((item) => sanitizeCollectionItem(schema, item))
    .filter((item): item is Record<string, unknown> => item !== null);

  const min = schema.minItems ?? 0;
  while (sanitized.length < min) {
    sanitized.push(createDefaultCollectionItem(schema));
  }

  return sanitized;
}

export function readCollectionArray(
  propsJson: Record<string, unknown>,
  propKey: string,
): Record<string, unknown>[] {
  const raw = propsJson[propKey];
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  );
}
