import { describe, expect, it } from 'vitest';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import {
  clearLocalDraft,
  readLocalDraft,
  shouldOfferLocalDraftRestore,
  writeLocalDraft,
} from './builder-local-draft';
import type { BuilderDocumentBlock } from '../types';

const PAGE_ID = 'page-version-test';

function heroBlock(id: string): BuilderDocumentBlock {
  return {
    id,
    type: 'hero',
    label: 'Hero',
    sortOrder: 0,
    propsJson: { title: 'Local title', buttonText: 'Go' },
  };
}

describe('builder-local-draft', () => {
  it('writes and reads a local draft', () => {
    clearLocalDraft(PAGE_ID);
    writeLocalDraft({
      version: 1,
      pageVersionId: PAGE_ID,
      updatedAt: Date.now(),
      blocks: [heroBlock('hero-1')],
      pageTheme: {
        primaryColor: '#000',
        secondaryColor: '#111',
        mode: 'dark',
        fontFamily: 'Inter',
        headingFont: 'Inter',
        bodyFont: 'Roboto',
        headingScale: 'normal',
        sectionSpacing: 'normal',
        buttonStyle: 'pill',
        seoTitle: '',
        seoDescription: '',
      },
      themeDirty: false,
      selectedBlockId: 'hero-1',
    });

    const draft = readLocalDraft(PAGE_ID);
    expect(draft?.blocks).toHaveLength(1);
    expect(draft?.blocks[0]?.propsJson.title).toBe('Local title');
    clearLocalDraft(PAGE_ID);
  });

  it('offers restore when draft differs from server', () => {
    const server: EditorPageBlock[] = [
      {
        id: 'hero-1',
        pageVersionId: PAGE_ID,
        blockKey: 'hero',
        blockType: 'hero',
        sortOrder: 1,
        propsJson: { title: 'Server', buttonText: 'Go' },
        createdAt: '',
        updatedAt: '',
      },
    ];

    const draft = {
      version: 1 as const,
      pageVersionId: PAGE_ID,
      updatedAt: Date.now(),
      blocks: [heroBlock('hero-1')],
      pageTheme: {
        primaryColor: '#000',
        secondaryColor: '#111',
        mode: 'dark' as const,
        fontFamily: 'Inter',
        headingFont: 'Inter',
        bodyFont: 'Roboto',
        headingScale: 'normal' as const,
        sectionSpacing: 'normal' as const,
        buttonStyle: 'pill' as const,
        seoTitle: '',
        seoDescription: '',
      },
      themeDirty: false,
      selectedBlockId: null,
    };

    expect(shouldOfferLocalDraftRestore(draft, server)).toBe(true);
  });

  it('clears draft after clearLocalDraft', () => {
    writeLocalDraft({
      version: 1,
      pageVersionId: PAGE_ID,
      updatedAt: Date.now(),
      blocks: [heroBlock('hero-1')],
      pageTheme: {
        primaryColor: '#000',
        secondaryColor: '#111',
        mode: 'dark',
        fontFamily: 'Inter',
        headingFont: 'Inter',
        bodyFont: 'Roboto',
        headingScale: 'normal',
        sectionSpacing: 'normal',
        buttonStyle: 'pill',
        seoTitle: '',
        seoDescription: '',
      },
      themeDirty: false,
      selectedBlockId: null,
    });
    clearLocalDraft(PAGE_ID);
    expect(readLocalDraft(PAGE_ID)).toBeNull();
  });
});
