import { describe, expect, it } from 'vitest';
import type { BuilderDocumentBlock } from '../types';
import {
  assertNoBlobUrlsInBlocks,
  assertNoBlobUrlsInDocument,
  BlobUrlValidationError,
  findBlobUrlsInBlocks,
  formatBlobUrlError,
} from './blob-url-guard';

const sampleBlock = (props: Record<string, unknown>): BuilderDocumentBlock => ({
  id: 'block-1',
  type: 'hero_campaign',
  label: 'Hero',
  sortOrder: 0,
  propsJson: props,
});

describe('blob-url-guard', () => {
  it('detects blob URLs in nested gallery images', () => {
    const issues = findBlobUrlsInBlocks([
      sampleBlock({
        images: [{ url: 'blob:http://localhost/abc', alt: 'test' }],
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.path).toContain('images');
  });

  it('throws a readable validation error', () => {
    expect(() =>
      assertNoBlobUrlsInBlocks([
        sampleBlock({ imageUrl: 'blob:http://localhost/deadbeef' }),
      ]),
    ).toThrow(BlobUrlValidationError);

    expect(formatBlobUrlError(findBlobUrlsInBlocks([sampleBlock({ imageUrl: 'blob:x' })]))).toMatch(
      /Médias non enregistrés/,
    );
  });

  it('allows asset IDs and https URLs', () => {
    expect(() =>
      assertNoBlobUrlsInDocument({
        blocks: [
          sampleBlock({
            imageAssetId: '550e8400-e29b-41d4-a716-446655440000',
            imageUrl: 'https://cdn.example.com/hero.jpg',
          }),
        ],
        pageSettings: {
          metaTitle: '',
          metaDescription: '',
          ogImageUrl: '',
          ogImageAssetId: 'asset-1',
          faviconUrl: '',
          faviconAssetId: '',
        },
      }),
    ).not.toThrow();
  });

  it('detects blob URLs in page settings', () => {
    expect(() =>
      assertNoBlobUrlsInDocument({
        blocks: [],
        pageSettings: {
          metaTitle: '',
          metaDescription: '',
          ogImageUrl: 'blob:http://localhost/og',
          faviconUrl: '',
        },
      }),
    ).toThrow(BlobUrlValidationError);
  });
});
