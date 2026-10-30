/** Hero+Form V2 — two product modes only. */
export type HeroLayoutMode = 'split' | 'floating';

export type HeroContentAnchor = 'top-left' | 'center-left' | 'bottom-left';

export type HeroSafeInset = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export type HeroFormColumnMode = 'ratio' | 'fixed';

export type HeroRootGeometry = {
  layoutMode: HeroLayoutMode;
  leftRatio: number;
  rightRatio: number;
  gap: number;
  padding: number;
  /** Desktop hero section height (px) — SSOT for campaign min-height */
  minHeight?: number;
  formColumnMode?: HeroFormColumnMode;
  formColumnWidth?: number;
  contentSafeInset?: HeroSafeInset;
};

export type GeometryRole =
  | 'hero-root'
  | 'hero-image'
  | 'hero-content-layer'
  | 'hero-content'
  | 'hero-overlay-text'
  | 'form-layer';

/** Per-node placement constraints (Canva-style bounded manipulation). */
export type NodeConstraints = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  /** Node `name` of the bounding parent zone */
  boundsParent?: string;
  canOverflow?: boolean;
};

export type RoleCapabilities = {
  drag: boolean;
  resize: boolean;
  cropInner: boolean;
};

export const HERO_SAFE_PADDING = 64;
export const HERO_CONTENT_MAX_WIDTH = 480;
export const DEFAULT_HERO_MIN_HEIGHT = 720;
export const DEFAULT_FORM_COLUMN_WIDTH = 400;
/** Horizontal padding inside FormZone (split mode) — both sides. */
export const FORM_ZONE_PADDING = 40;
export const FORM_ZONE_INNER_OFFSET = FORM_ZONE_PADDING * 2;

export const DEFAULT_HERO_GEOMETRY: HeroRootGeometry = {
  layoutMode: 'split',
  leftRatio: 68,
  rightRatio: 32,
  gap: 0,
  padding: 0,
  minHeight: DEFAULT_HERO_MIN_HEIGHT,
  formColumnMode: 'ratio',
  formColumnWidth: 400,
  contentSafeInset: {
    top: HERO_SAFE_PADDING,
    left: HERO_SAFE_PADDING,
    right: HERO_SAFE_PADDING,
    bottom: HERO_SAFE_PADDING,
  },
};

export const HERO_RATIO_PRESETS: Array<{ label: string; leftRatio: number; rightRatio: number }> = [
  { label: '68 / 32', leftRatio: 68, rightRatio: 32 },
  { label: '70 / 30', leftRatio: 70, rightRatio: 30 },
  { label: '60 / 40', leftRatio: 60, rightRatio: 40 },
  { label: '50 / 50', leftRatio: 50, rightRatio: 50 },
  { label: '40 / 60', leftRatio: 40, rightRatio: 60 },
  { label: '30 / 70', leftRatio: 30, rightRatio: 70 },
];

export type HeroLayoutPreset =
  | {
      id: string;
      label: string;
      layoutMode: 'split';
      leftRatio?: number;
      rightRatio?: number;
      formColumnMode?: HeroFormColumnMode;
      formColumnWidth?: number;
    }
  | {
      id: string;
      label: string;
      layoutMode: 'floating';
    };

/** Business-only hero layout presets — Split ratios + Floating Card. */
export const HERO_LAYOUT_PRESETS: HeroLayoutPreset[] = [
  {
    id: 'split-thermique',
    label: 'Thermique',
    layoutMode: 'split',
    leftRatio: 68,
    rightRatio: 32,
    formColumnMode: 'fixed',
    formColumnWidth: 400,
  },
  { id: 'split-68-32', label: '68 / 32', layoutMode: 'split', leftRatio: 68, rightRatio: 32, formColumnMode: 'ratio' },
  { id: 'split-70-30', label: '70 / 30', layoutMode: 'split', leftRatio: 70, rightRatio: 30, formColumnMode: 'ratio' },
  { id: 'split-60-40', label: '60 / 40', layoutMode: 'split', leftRatio: 60, rightRatio: 40, formColumnMode: 'ratio' },
  { id: 'split-50-50', label: '50 / 50', layoutMode: 'split', leftRatio: 50, rightRatio: 50, formColumnMode: 'ratio' },
  { id: 'floating', label: 'Floating Card', layoutMode: 'floating' },
];

/** Normalize legacy layout modes stored in localStorage. */
export function normalizeHeroLayoutMode(mode: string | undefined): HeroLayoutMode {
  if (mode === 'floating') return 'floating';
  if (mode === 'fullscreen' || mode === 'centered') return 'floating';
  return 'split';
}

export const FORM_WIDTH = { min: 360, max: 440 } as const;
