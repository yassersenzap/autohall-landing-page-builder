import { describe, expect, it } from 'vitest';
import { buildDefaultStudioV2Document } from '../default-document';
import { insertBlockIntoDocument, insertSectionByLibraryId } from './document-insert';

describe('document-insert', () => {
  it('inserts a section from library', () => {
    const doc = { root: { props: {} }, content: [] };
    const next = insertSectionByLibraryId(doc, 'cta-band');
    expect(next?.content?.length).toBe(1);
    expect(JSON.stringify(next)).toContain('CTASection');
  });

  it('inserts a block into last section', () => {
    const doc = buildDefaultStudioV2Document();
    const before = JSON.stringify(doc);
    const next = insertBlockIntoDocument(doc, 'heading');
    expect(next).not.toBeNull();
    expect(JSON.stringify(next)).toContain('HeadingBlock');
    expect(JSON.stringify(next)).not.toBe(before);
  });
});
