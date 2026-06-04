import { describe, expect, it } from '@jest/globals';
import { renderBlockHtml } from './block-renderer';

describe('block-renderer style integration', () => {
  it('renders hero split_image_left with media-first order class', () => {
    const html = renderBlockHtml({
      blockType: 'hero',
      sortOrder: 0,
      propsJson: {
        title: 'Test',
        buttonText: 'CTA',
        design: { layoutVariant: 'split_image_left', backgroundMode: 'light' },
      },
    });
    expect(html).toContain('lp-hero--layout-split_image_left');
    expect(html).toContain('lp-hero--bg-light');
    expect(html).not.toContain('<style>');
    expect(html).not.toContain('javascript:');
  });

  it('renders hero background_image with overlay', () => {
    const html = renderBlockHtml({
      blockType: 'hero',
      sortOrder: 0,
      propsJson: {
        title: 'Offre',
        imageUrl: 'https://cdn.example.com/car.jpg',
        design: {
          layoutVariant: 'background_image',
          overlayOpacity: 'strong',
          mediaFit: 'cover',
          mediaFocal: 'top',
        },
      },
    });
    expect(html).toContain('lp-hero--layout-background_image');
    expect(html).toContain('lp-hero__bg');
    expect(html).toContain('lp-hero__img--focus-top');
    expect(html).toContain('lp-hero__overlay');
  });

  it('applies object-fit class on image block', () => {
    const html = renderBlockHtml({
      blockType: 'image',
      sortOrder: 0,
      propsJson: {
        imageUrl: 'https://cdn.example.com/a.jpg',
        alt: 'Photo',
        design: { mediaFit: 'contain', mediaFocal: 'center' },
      },
    });
    expect(html).toContain('lp-media__img--fit-contain');
  });
});
