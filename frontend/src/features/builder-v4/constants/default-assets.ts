import type { MediaAsset } from '../types/assets.types';
import {
  CHERY_ASSET_ID,
  HERO_FIXTURE_PATHS,
  PLACEHOLDER_ASSET_ID,
} from '../media/media-constants';

/**
 * Engine registry — resolved via getAsset() / resolveMediaSrc(), never listed in the library UI.
 * User-facing bibliothèque = uploads only (source: 'upload').
 */
export const ENGINE_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: CHERY_ASSET_ID,
    name: 'Chery Gamme Thermique',
    src: HERO_FIXTURE_PATHS.chery,
    mimeType: 'image/webp',
    width: 1200,
    height: 628,
    source: 'builtin',
    tags: ['campaign', 'chery', 'autohall', 'hero', 'landscape'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: PLACEHOLDER_ASSET_ID,
    name: 'Placeholder Hero',
    src: HERO_FIXTURE_PATHS.placeholder,
    mimeType: 'image/webp',
    width: 1200,
    height: 628,
    source: 'builtin',
    tags: ['placeholder', 'hero'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

/** @deprecated Use ENGINE_MEDIA_ASSETS — kept for store merge helper naming. */
export const BUILTIN_MEDIA_ASSETS = ENGINE_MEDIA_ASSETS;
