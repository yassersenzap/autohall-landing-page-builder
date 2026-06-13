import { clampFocalPercent } from '@/features/builder/blocks/hero-vehicle-offer/hero-image-controls';
import { sanitizeBlockTypographyPatch } from '@/features/builder/block-typography';
import { sanitizeSectionStylePatch } from '@/features/builder/section-style/section-style.registry';
import { sanitizeBlockVisualPatch, sanitizeBlockVisualPatchUnion } from '@/features/builder/block-visual';
import {
  sanitizeCollectionArray,
  sanitizeSafeUrl,
} from '@/features/builder/collection-editor/collection-sanitizer';
import { getCollectionSchema } from '@/features/builder/collection-editor/collection-schemas';
import { sanitizeBlockDesignProps } from './block-design-props';

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

const FORM_CONFIG_KEYS = new Set([
  'showCivility',
  'useSplitName',
  'showCity',
  'showVehicleModel',
  'showMessage',
  'showEmail',
  'showConsent',
]);

function sanitizeFormConfigObject(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!FORM_CONFIG_KEYS.has(key)) continue;
    if (typeof raw === 'boolean') {
      out[key] = raw;
    }
  }
  return out;
}

function sanitizeDesignObject(value: Record<string, unknown>): Record<string, unknown> {
  return sanitizeBlockDesignProps(value);
}

const URL_LIKE_PROP_KEYS = new Set([
  'buttonTarget',
  'buttonHref',
  'ctaTarget',
  'ctaHref',
  'href',
  'target',
  'primaryCtaHref',
  'secondaryCtaHref',
]);

function sanitizeUrlLikeProp(key: string, value: string, fallback = '#lead-form'): string {
  if (!URL_LIKE_PROP_KEYS.has(key) && !key.toLowerCase().endsWith('href') && !key.toLowerCase().endsWith('target')) {
    return value;
  }
  return sanitizeSafeUrl(value, fallback);
}

export function sanitizePropsPatch(
  patch: Record<string, unknown>,
  blockType?: string,
  contextProps?: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null) continue;

    if (typeof key !== 'string' || key.length === 0 || key.length > 64) continue;
    if (key.startsWith('_studio')) continue;

    if (
      key === 'design' &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const sanitized = sanitizeDesignObject(value as Record<string, unknown>);
      if (Object.keys(sanitized).length > 0) {
        out[key] = sanitized;
      }
      continue;
    }

    if (
      key === 'formConfig' &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const sanitized = sanitizeFormConfigObject(value as Record<string, unknown>);
      if (Object.keys(sanitized).length > 0) {
        out[key] = sanitized;
      }
      continue;
    }

    if (
      key === 'sectionStyle' &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const sanitized = sanitizeSectionStylePatch(value as Record<string, unknown>);
      if (Object.keys(sanitized).length > 0) {
        out[key] = sanitized;
      }
      continue;
    }

    if (
      key === 'blockVisual' &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const sanitized = blockType
        ? sanitizeBlockVisualPatch(blockType, value as Record<string, unknown>, contextProps)
        : sanitizeBlockVisualPatchUnion(value as Record<string, unknown>);
      if (Object.keys(sanitized).length > 0) {
        out[key] = sanitized;
      }
      continue;
    }

    if (
      key === 'typography' &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const sanitized = blockType
        ? sanitizeBlockTypographyPatch(blockType, value as Record<string, unknown>)
        : {};
      if (Object.keys(sanitized).length > 0) {
        out[key] = sanitized;
      }
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = trimString(value, MAX_STRING_LENGTH);
      if (trimmed.toLowerCase().startsWith('data:')) {
        continue;
      }
      out[key] = sanitizeUrlLikeProp(key, trimmed);
      continue;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (key === 'focalPointX' || key === 'focalPointY') {
        out[key] = clampFocalPercent(value, 50);
      } else {
        out[key] = value;
      }
      continue;
    }

    if (typeof value === 'boolean') {
      out[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      const schema = blockType ? getCollectionSchema(blockType, key) : undefined;
      const sanitized = schema
        ? sanitizeCollectionArray(blockType!, key, value)
        : sanitizeArrayValue(value);
      if (sanitized.length > 0 || (schema && (schema.minItems ?? 0) === 0)) {
        out[key] = sanitized;
      }
    }
  }

  return out;
}
