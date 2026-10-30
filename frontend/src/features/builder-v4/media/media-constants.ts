/** Bundled hero fixtures — zero external CDN dependency. */
export const HERO_FIXTURE_BASE = '/assets/hero-fixtures';

export const HERO_FIXTURE_FILES = {
  chery: 'chery.webp',
  bmw: 'bmw.webp',
  ford: 'ford.webp',
  jeep: 'jeep.webp',
  mercedes: 'mercedes.webp',
  opel: 'opel.webp',
  nissan: 'nissan.webp',
  seres: 'seres.webp',
  placeholder: 'placeholder.webp',
} as const;

export const HERO_FIXTURE_PATHS = {
  chery: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.chery}`,
  bmw: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.bmw}`,
  ford: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.ford}`,
  jeep: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.jeep}`,
  mercedes: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.mercedes}`,
  opel: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.opel}`,
  nissan: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.nissan}`,
  seres: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.seres}`,
  placeholder: `${HERO_FIXTURE_BASE}/${HERO_FIXTURE_FILES.placeholder}`,
} as const;

export const PLACEHOLDER_ASSET_ID = 'autohall-placeholder-hero';
export const CHERY_ASSET_ID = 'autohall-gamme-thermique';

export const MEDIA_IMAGE_MAX_RETRIES = 3;
