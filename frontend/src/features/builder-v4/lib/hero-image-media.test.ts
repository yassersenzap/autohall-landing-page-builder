import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { CHERY_ASSET_ID, HERO_FIXTURE_PATHS } from '../media/media-constants';
import { isBakedHeroMedia, stripBakedHeroMedia } from './hero-image-media';

describe('hero-image-media', () => {
  it('detects engine-seeded hero media', () => {
    expect(isBakedHeroMedia({ src: HERO_FIXTURE_PATHS.chery, alt: '', assetId: CHERY_ASSET_ID })).toBe(true);
    expect(isBakedHeroMedia({ src: HERO_FIXTURE_PATHS.chery, alt: '' })).toBe(true);
    expect(isBakedHeroMedia({ src: 'data:image/png;base64,abc', alt: '' })).toBe(false);
  });

  it('strips baked hero media on rehydrate migration', () => {
    const doc = createPopulatedHeroFormDocument();
    const heroImage = Object.values(doc.nodes).find((node) => node.name === 'ImageLayer')!;
    doc.nodes[heroImage.id] = {
      ...heroImage,
      props: {
        ...heroImage.props,
        src: HERO_FIXTURE_PATHS.chery,
        assetId: CHERY_ASSET_ID,
        alt: 'Chery',
      },
    };

    const migrated = stripBakedHeroMedia(doc);
    const props = migrated.nodes[heroImage.id].props as { src: string; assetId?: string };
    expect(props.src).toBe('');
    expect(props.assetId).toBeUndefined();
  });
});
