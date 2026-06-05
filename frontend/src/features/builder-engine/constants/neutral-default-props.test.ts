import { describe, expect, it } from 'vitest';
import { getDefaultBlockProps } from './default-block-props';
import { BUILDER_NEUTRAL_DEFAULT_PROPS } from './neutral-default-props';
import { MARKETING_SECTIONS } from '../registry/marketing-sections';

const EXTERNAL_IMAGE_PATTERN = /^https?:\/\//i;

function collectImageUrls(value: unknown, urls: string[]): void {
  if (typeof value === 'string' && EXTERNAL_IMAGE_PATTERN.test(value.trim())) {
    urls.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectImageUrls(item, urls));
  } else if (value !== null && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((v) =>
      collectImageUrls(v, urls),
    );
  }
}

describe('neutral-default-props', () => {
  it('hero defaults have no external image URL', () => {
    const hero = getDefaultBlockProps('hero');
    const urls: string[] = [];
    collectImageUrls(hero, urls);
    expect(urls).toEqual([]);
    expect(hero.imageAssetId).toBe('');
    expect(hero.imageUrl).toBe('');
  });

  it('hero defaults have no finalized marketing slogan', () => {
    const hero = getDefaultBlockProps('hero');
    expect(hero.title).toBe('');
    expect(hero.subtitle).toBe('');
    expect(hero.eyebrow).toBe('');
    expect(hero.buttonText).toBe('');
  });

  it('marketing sections use neutral defaults without external images', () => {
    for (const section of MARKETING_SECTIONS) {
      for (const type of section.blockTypes) {
        const props = getDefaultBlockProps(type);
        const urls: string[] = [];
        collectImageUrls(props, urls);
        expect(urls, `${section.id}/${type}`).toEqual([]);
      }
    }
  });

  it('exposes neutral props for all stable builder block types', () => {
    expect(Object.keys(BUILDER_NEUTRAL_DEFAULT_PROPS).sort()).toEqual(
      [
        'benefits',
        'faq',
        'features',
        'final_cta',
        'financing',
        'footer_legal',
        'hero',
        'image',
        'lead_form',
        'offer_highlights',
        'text',
        'trust_bar',
        'vehicle_range',
      ].sort(),
    );
  });
});
