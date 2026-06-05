import { describe, expect, it } from 'vitest';
import {
  STUDIO_V2_ALL_COMPONENTS,
  STUDIO_V2_BLOCK_COMPONENTS,
  STUDIO_V2_COLUMN_SLOT_ALLOW,
  STUDIO_V2_CONTAINER_SLOT_ALLOW,
  STUDIO_V2_LAYOUT_COMPONENTS,
  STUDIO_V2_SECTION_COMPONENTS,
  STUDIO_V2_SECTION_SLOT_ALLOW,
} from './puck-constants';
import { studioV2PuckConfig } from './puck-config/index';

describe('studioV2PuckConfig', () => {
  it('exposes all eleven production components', () => {
    expect(Object.keys(studioV2PuckConfig.components).sort()).toEqual(
      [...STUDIO_V2_ALL_COMPONENTS].sort(),
    );
  });

  it('groups layout, sections and block categories', () => {
    expect(studioV2PuckConfig.categories?.layout?.title).toBe('Layout');
    expect(studioV2PuckConfig.categories?.layout?.components).toEqual([
      ...STUDIO_V2_LAYOUT_COMPONENTS,
    ]);
    expect(studioV2PuckConfig.categories?.sections?.title).toBe('Sections');
    expect(studioV2PuckConfig.categories?.sections?.components).toEqual([
      ...STUDIO_V2_SECTION_COMPONENTS,
    ]);
    expect(studioV2PuckConfig.categories?.components?.title).toBe('Composants');
    expect(studioV2PuckConfig.categories?.components?.components).toEqual([
      ...STUDIO_V2_BLOCK_COMPONENTS,
    ]);
  });

  it('whitelists slot children for layout components', () => {
    const sectionItems = studioV2PuckConfig.components.Section.fields!.items as {
      allow?: string[];
    };
    const containerItems = studioV2PuckConfig.components.Container.fields!.items as {
      allow?: string[];
    };
    const columnsLeft = studioV2PuckConfig.components.Columns.fields!.left as {
      allow?: string[];
    };

    expect(sectionItems.allow).toEqual([...STUDIO_V2_SECTION_SLOT_ALLOW]);
    expect(containerItems.allow).toEqual([...STUDIO_V2_CONTAINER_SLOT_ALLOW]);
    expect(columnsLeft.allow).toEqual([...STUDIO_V2_COLUMN_SLOT_ALLOW]);
  });

  it('defines root fields for theme, tokens and seo', () => {
    expect(studioV2PuckConfig.root?.fields?.themePreset).toBeTruthy();
    expect(studioV2PuckConfig.root?.fields?.designTokens).toBeTruthy();
    expect(studioV2PuckConfig.root?.fields?.seo).toBeTruthy();
    expect(studioV2PuckConfig.root?.render).toBeTypeOf('function');
  });

  it('configures lead form with consent field', () => {
    expect(studioV2PuckConfig.components.LeadFormAutoHall.fields?.consentText).toBeTruthy();
  });
});
