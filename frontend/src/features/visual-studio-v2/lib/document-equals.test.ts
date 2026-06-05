import { describe, expect, it } from 'vitest';
import { buildDefaultStudioV2Document } from '../default-document';
import { studioV2DocumentsEqual } from './document-equals';

describe('studioV2DocumentsEqual', () => {
  it('returns true for identical documents', () => {
    const doc = buildDefaultStudioV2Document();
    expect(studioV2DocumentsEqual(doc, JSON.parse(JSON.stringify(doc)))).toBe(true);
  });

  it('returns false when content differs', () => {
    const a = buildDefaultStudioV2Document();
    const b = buildDefaultStudioV2Document();
    b.root = { props: { title: 'Changed' } };
    expect(studioV2DocumentsEqual(a, b)).toBe(false);
  });
});
