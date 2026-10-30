import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { HERO_FIXTURE_PATHS } from '../media/media-constants';
import { healDocumentMedia } from './heal-document-media';

describe('heal-document-media', () => {
  it('syncs stale upload image src from asset library', () => {
    const doc = createPopulatedHeroFormDocument();
    const heroImage = Object.values(doc.nodes).find((node) => node.name === 'ImageLayer')!;
    doc.nodes[heroImage.id] = {
      ...heroImage,
      props: {
        ...heroImage.props,
        src: 'https://dead.example/old.jpg',
        assetId: 'user-upload-1',
      },
    };

    const healed = healDocumentMedia(doc, (id) =>
      id === 'user-upload-1'
        ? {
            id,
            name: 'Upload',
            src: HERO_FIXTURE_PATHS.chery,
            mimeType: 'image/webp',
            source: 'upload',
            tags: [],
            createdAt: '',
          }
        : undefined,
    );

    const healedProps = healed.nodes[heroImage.id].props as { src: string };
    expect(healedProps.src).toBe(HERO_FIXTURE_PATHS.chery);
  });

  it('does not inject engine assets when hero is in empty state', () => {
    const doc = createPopulatedHeroFormDocument();
    const heroImage = Object.values(doc.nodes).find((node) => node.name === 'ImageLayer')!;
    (heroImage.props as any).src = '';
    expect((heroImage.props as { src: string }).src).toBe('');

    const healed = healDocumentMedia(doc, (id) =>
      id === 'autohall-gamme-thermique'
        ? {
            id,
            name: 'Chery',
            src: HERO_FIXTURE_PATHS.chery,
            mimeType: 'image/webp',
            source: 'builtin',
            tags: [],
            createdAt: '',
          }
        : undefined,
    );

    expect(healed).toBe(doc);
  });

  it('returns same document reference when nothing changed', () => {
    const doc = createPopulatedHeroFormDocument();
    const healed = healDocumentMedia(doc, () => undefined);
    expect(healed).toBe(doc);
  });
});
