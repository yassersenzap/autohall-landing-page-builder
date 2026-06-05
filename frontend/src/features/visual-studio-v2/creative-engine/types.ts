import type { Data } from '@puckeditor/core';
import type { StudioV2ThemePresetId } from '../design-tokens/types';

export type CreativeStarterId =
  | 'lead-capture-simple'
  | 'vehicle-offer-promo'
  | 'after-sales-appointment'
  | 'event-landing'
  | 'premium-launch'
  | 'racing-sport-campaign'
  | 'financing-offer'
  | 'minimal-landing';

export type CreativeStarter = {
  id: CreativeStarterId;
  label: string;
  category: string;
  goal: string;
  description: string;
  themePreset: StudioV2ThemePresetId;
  previewTone: string;
  build: () => Data;
};

export type SectionLibraryCategory =
  | 'hero'
  | 'conversion'
  | 'marketing'
  | 'creative';

export type SectionLibraryEntry = {
  id: string;
  name: string;
  category: SectionLibraryCategory;
  description: string;
  previewClass: string;
  build: () => unknown[];
};

export type BlockLibraryCategory = 'text' | 'media' | 'layout' | 'conversion' | 'marketing';

export type BlockLibraryEntry = {
  id: string;
  name: string;
  category: BlockLibraryCategory;
  description: string;
  icon: string;
  componentType: string;
  defaultProps: Record<string, unknown>;
};
