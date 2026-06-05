import { beforeEach, describe, expect, it } from 'vitest';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { isBuilderDocumentDirty } from '../lib/compare-builder-document';
import { useBuilderDocumentStore } from './builder-document.store';
import type { BuilderDocumentBlock } from '../types';

function hero(id: string, sortOrder = 0): BuilderDocumentBlock {
  return {
    id,
    type: 'hero',
    label: 'Hero',
    sortOrder,
    propsJson: { title: 'Hero title', buttonText: 'Go' },
  };
}

function form(id: string, sortOrder = 1): BuilderDocumentBlock {
  return {
    id,
    type: 'lead_form',
    label: 'Formulaire',
    sortOrder,
    propsJson: { title: 'Contact', submitText: 'Envoyer' },
  };
}

describe('builder-document.store removeBlock', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('clears selectedBlockId when deleting the selected block', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    useBuilderDocumentStore.getState().removeBlock('hero-1');

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(0);
    expect(state.selectedBlockId).toBeNull();
    expect(state.hoveredBlockId).toBeNull();
  });

  it('supports deleting the last block without crash', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1')]);
    useBuilderDocumentStore.getState().removeBlock('hero-1');

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(0);
    expect(state.selectedBlockId).toBeNull();
  });

  it('keeps selection when deleting a non-selected block', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1'), form('form-1')]);
    useBuilderDocumentStore.getState().selectBlock('form-1');

    useBuilderDocumentStore.getState().removeBlock('hero-1');

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.id).toBe('form-1');
    expect(state.selectedBlockId).toBe('form-1');
  });

  it('is idempotent when deleting the same block twice', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1'), form('form-1')]);

    useBuilderDocumentStore.getState().removeBlock('hero-1');
    useBuilderDocumentStore.getState().removeBlock('hero-1');

    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);
  });

  it('marks document dirty after deleting a saved block', () => {
    const baseline: EditorPageBlock[] = [
      {
        id: 'hero-1',
        pageVersionId: 'v1',
        blockKey: 'hero',
        blockType: 'hero',
        sortOrder: 1,
        propsJson: { title: 'Hero title', buttonText: 'Go' },
        createdAt: '',
        updatedAt: '',
      },
    ];

    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1')]);
    useBuilderDocumentStore.getState().removeBlock('hero-1');

    const dirty = isBuilderDocumentDirty(
      useBuilderDocumentStore.getState().blocks,
      baseline,
      false,
    );
    expect(dirty).toBe(true);
  });

  it('selectBlock ignores unknown block ids', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('missing-id');
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBeNull();
  });

  it('moveBlockUp and moveBlockDown reorder blocks', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1'), form('form-1')]);
    useBuilderDocumentStore.getState().selectBlock('form-1');

    useBuilderDocumentStore.getState().moveBlockUp('form-1');
    expect(useBuilderDocumentStore.getState().blocks[0]?.id).toBe('form-1');

    useBuilderDocumentStore.getState().moveBlockDown('form-1');
    expect(useBuilderDocumentStore.getState().blocks[1]?.id).toBe('form-1');
  });

  it('deleteBlock removes block like removeBlock', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1')]);
    useBuilderDocumentStore.getState().deleteBlock('hero-1');
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(0);
  });

  it('restoreLocalDraft reapplies blocks and marks theme dirty', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('server-hero')]);

    useBuilderDocumentStore.getState().restoreLocalDraft({
      blocks: [hero('local-hero')],
      pageTheme: {
        primaryColor: '#003B73',
        secondaryColor: '#18181b',
        mode: 'light',
        fontFamily: 'Inter',
        headingFont: 'Inter',
        bodyFont: 'Roboto',
        headingScale: 'normal',
        sectionSpacing: 'normal',
        buttonStyle: 'pill',
        seoTitle: 'SEO',
        seoDescription: 'Desc',
      },
      themeDirty: true,
      selectedBlockId: 'local-hero',
    });

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.id).toBe('local-hero');
    expect(state.themeDirty).toBe(true);
    expect(state.selectedBlockId).toBe('local-hero');
  });
});
