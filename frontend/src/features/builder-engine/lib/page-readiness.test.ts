import { describe, expect, it } from 'vitest';
import { getPageReadinessIssues } from './page-readiness';

describe('getPageReadinessIssues', () => {
  it('detects hero without title', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero',
          propsJson: { title: '', buttonText: 'Go', imageUrl: 'https://x.test/a.jpg' },
        },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code.startsWith('hero-title'))).toBe(true);
  });

  it('detects hero without image', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero',
          propsJson: { title: 'Offre', buttonText: 'Go', imageUrl: '', imageAssetId: '' },
        },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code.startsWith('hero-image'))).toBe(true);
  });

  it('detects missing SEO fields', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero',
          propsJson: { title: 'T', buttonText: 'Go', imageAssetId: 'asset-1', alt: 'x' },
        },
      ],
      { seoTitle: '', seoDescription: '' },
    );
    expect(issues.some((i) => i.code === 'seo-title')).toBe(true);
    expect(issues.some((i) => i.code === 'seo-description')).toBe(true);
  });

  it('detects image block without media', () => {
    const issues = getPageReadinessIssues(
      [{ type: 'image', propsJson: { imageUrl: '', imageAssetId: '' } }],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code.startsWith('image-block'))).toBe(true);
  });
});
