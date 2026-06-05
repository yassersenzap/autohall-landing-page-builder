import { describe, expect, it } from 'vitest';
import {
  STUDIO_V2_ALL_COMPONENTS,
  STUDIO_V2_CREATIVE_ATOMIC,
  STUDIO_V2_CREATIVE_COMPOUND,
  STUDIO_V2_CONVERSION_COMPONENTS,
  STUDIO_V2_LAYOUT_COMPONENTS,
  STUDIO_V2_MARKETING_COMPONENTS,
  STUDIO_V2_MEDIA_COMPONENTS,
  STUDIO_V2_COLUMN_SLOT_ALLOW,
  STUDIO_V2_CONTAINER_SLOT_ALLOW,
  STUDIO_V2_SECTION_SLOT_ALLOW,
} from './puck-constants';
import { studioV2PuckConfig } from './puck-config/index';

describe('studioV2PuckConfig', () => {
  it('exposes all production components including creative blocks', () => {
    expect(Object.keys(studioV2PuckConfig.components).sort()).toEqual(
      [...STUDIO_V2_ALL_COMPONENTS].sort(),
    );
    expect(STUDIO_V2_ALL_COMPONENTS.length).toBeGreaterThanOrEqual(25);
  });

  it('groups layout, marketing, conversion, media and creative categories', () => {
    expect(studioV2PuckConfig.categories?.layout?.title).toBe('Mise en page');
    expect(studioV2PuckConfig.categories?.layout?.components).toEqual([
      ...STUDIO_V2_LAYOUT_COMPONENTS,
    ]);
    expect(studioV2PuckConfig.categories?.marketing?.title).toBe('Sections marketing');
    expect(studioV2PuckConfig.categories?.creative?.title).toBe('Blocs créatifs');
    expect(studioV2PuckConfig.categories?.creative?.components).toEqual([
      ...STUDIO_V2_CREATIVE_ATOMIC,
      ...STUDIO_V2_CREATIVE_COMPOUND,
    ]);
    expect(studioV2PuckConfig.categories?.conversion?.components).toEqual([
      ...STUDIO_V2_CONVERSION_COMPONENTS,
    ]);
    expect(studioV2PuckConfig.categories?.media?.components).toEqual([
      ...STUDIO_V2_MEDIA_COMPONENTS,
    ]);
    expect(studioV2PuckConfig.categories?.marketing?.components).toEqual([
      ...STUDIO_V2_MARKETING_COMPONENTS,
    ]);
  });

  it('uses human-readable field labels on lead form', () => {
    const fields = studioV2PuckConfig.components.LeadFormAutoHall.fields ?? {};
    expect(fields.consentText?.label).toContain('consentement');
    expect(fields.submitText?.label).toContain('bouton');
    expect(JSON.stringify(fields)).not.toContain('imageAssetId');
  });

  it('whitelists slot children for layout components', () => {
    const sectionItems = studioV2PuckConfig.components.Section.fields!.items as {
      allow?: string[];
    };
    expect(sectionItems.allow).toEqual([...STUDIO_V2_SECTION_SLOT_ALLOW]);
    expect([...STUDIO_V2_CONTAINER_SLOT_ALLOW]).toContain('StackBlock');
    expect([...STUDIO_V2_COLUMN_SLOT_ALLOW]).toContain('HeadingBlock');
  });

  it('registers creative blocks HeadingBlock and StackBlock', () => {
    expect(studioV2PuckConfig.components.HeadingBlock).toBeTruthy();
    expect(studioV2PuckConfig.components.StackBlock).toBeTruthy();
    expect(studioV2PuckConfig.components.TestimonialsBlock).toBeTruthy();
  });
});
