import { describe, expect, it } from 'vitest';
import { isBuilderDocumentDirty } from './compare-builder-document';
import type { BuilderDocumentBlock } from '../types';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';

describe('isBuilderDocumentDirty', () => {
  const baseline: EditorPageBlock[] = [
    {
      id: 'block-1',
      pageVersionId: 'v1',
      blockKey: 'hero',
      blockType: 'hero',
      sortOrder: 1,
      propsJson: { title: 'Hello', imageAssetId: 'asset-1' },
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('returns false when blocks match baseline', () => {
    const blocks: BuilderDocumentBlock[] = [
      {
        id: 'block-1',
        type: 'hero',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Hello', imageAssetId: 'asset-1' },
      },
    ];
    expect(isBuilderDocumentDirty(blocks, baseline, false)).toBe(false);
  });

  it('returns true when imageAssetId changed', () => {
    const blocks: BuilderDocumentBlock[] = [
      {
        id: 'block-1',
        type: 'hero',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Hello', imageAssetId: 'asset-2' },
      },
    ];
    expect(isBuilderDocumentDirty(blocks, baseline, false)).toBe(true);
  });

  it('returns true when theme is dirty', () => {
    const blocks: BuilderDocumentBlock[] = [
      {
        id: 'block-1',
        type: 'hero',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Hello', imageAssetId: 'asset-1' },
      },
    ];
    expect(isBuilderDocumentDirty(blocks, baseline, true)).toBe(true);
  });
});
