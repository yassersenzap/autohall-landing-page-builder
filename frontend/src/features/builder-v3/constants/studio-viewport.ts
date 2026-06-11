import type { BuilderDeviceMode } from '@/features/builder-engine/lib/block-design-props';

export const STUDIO_VIEWPORT_WIDTHS: Record<BuilderDeviceMode, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};

export const STUDIO_VIEWPORT_LABELS: Record<BuilderDeviceMode, string> = {
  desktop: 'Desktop',
  tablet: 'Tablette',
  mobile: 'Mobile',
};
