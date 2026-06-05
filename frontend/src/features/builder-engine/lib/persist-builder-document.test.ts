import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { persistBuilderDocument } from './persist-builder-document';
import type { BuilderDocumentBlock } from '../types';

const deleteEditorBlock = vi.fn();
const updateEditorBlock = vi.fn();
const createEditorBlock = vi.fn();

vi.mock('@/features/editor/api/editorApi', () => ({
  deleteEditorBlock: (...args: unknown[]) => deleteEditorBlock(...args),
  updateEditorBlock: (...args: unknown[]) => updateEditorBlock(...args),
  createEditorBlock: (...args: unknown[]) => createEditorBlock(...args),
}));

describe('persistBuilderDocument deletions', () => {
  beforeEach(() => {
    deleteEditorBlock.mockReset();
    updateEditorBlock.mockReset();
    createEditorBlock.mockReset();
    deleteEditorBlock.mockResolvedValue(undefined);
    updateEditorBlock.mockResolvedValue(undefined);
    createEditorBlock.mockResolvedValue(undefined);
  });

  it('calls delete API for blocks removed from the document', async () => {
    const baseline: EditorPageBlock[] = [
      {
        id: 'hero-1',
        pageVersionId: 'v1',
        blockKey: 'hero',
        blockType: 'hero',
        sortOrder: 1,
        propsJson: { title: 'Hero' },
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'form-1',
        pageVersionId: 'v1',
        blockKey: 'form',
        blockType: 'lead_form',
        sortOrder: 2,
        propsJson: { title: 'Form' },
        createdAt: '',
        updatedAt: '',
      },
    ];

    const current: BuilderDocumentBlock[] = [
      {
        id: 'form-1',
        type: 'lead_form',
        label: 'Formulaire',
        sortOrder: 0,
        propsJson: { title: 'Form' },
      },
    ];

    await persistBuilderDocument('version-1', current, baseline);

    expect(deleteEditorBlock).toHaveBeenCalledTimes(1);
    expect(deleteEditorBlock).toHaveBeenCalledWith('version-1', 'hero-1');
    expect(updateEditorBlock).toHaveBeenCalledWith('version-1', 'form-1', {
      blockType: 'lead_form',
      propsJson: { title: 'Form' },
      sortOrder: 1,
    });
    expect(createEditorBlock).not.toHaveBeenCalled();
  });

  it('does not call delete API for blocks never saved', async () => {
    const baseline: EditorPageBlock[] = [];
    const current: BuilderDocumentBlock[] = [
      {
        id: 'local-hero',
        type: 'hero',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Hero' },
      },
    ];

    await persistBuilderDocument('version-1', current, baseline);

    expect(deleteEditorBlock).not.toHaveBeenCalled();
    expect(createEditorBlock).toHaveBeenCalledTimes(1);
  });
});
