import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { persistBuilderDocument } from './persist-builder-document';
import type { BuilderDocumentBlock } from '../types';

const deleteEditorBlock = vi.fn();
const updateEditorBlock = vi.fn();
const createEditorBlock = vi.fn();
const fetchEditorBlocks = vi.fn();

vi.mock('@/features/editor/api/editorApi', () => ({
  deleteEditorBlock: (...args: unknown[]) => deleteEditorBlock(...args),
  updateEditorBlock: (...args: unknown[]) => updateEditorBlock(...args),
  createEditorBlock: (...args: unknown[]) => createEditorBlock(...args),
  fetchEditorBlocks: (...args: unknown[]) => fetchEditorBlocks(...args),
}));

describe('persistBuilderDocument deletions', () => {
  beforeEach(() => {
    deleteEditorBlock.mockReset();
    updateEditorBlock.mockReset();
    createEditorBlock.mockReset();
    fetchEditorBlocks.mockReset();
    deleteEditorBlock.mockResolvedValue(undefined);
    updateEditorBlock.mockResolvedValue(undefined);
    createEditorBlock.mockResolvedValue(undefined);
    fetchEditorBlocks.mockResolvedValue({ data: [] });
  });

  it('calls delete API for blocks removed from the document', async () => {
    const baseline: EditorPageBlock[] = [
      {
        id: 'hero-1',
        pageVersionId: 'v1',
        blockKey: 'hero',
        blockType: 'hero_campaign',
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
    expect(fetchEditorBlocks).toHaveBeenCalledWith('version-1');
  });

  it('creates new blocks with stable blockKey from client id', async () => {
    const baseline: EditorPageBlock[] = [];
    const current: BuilderDocumentBlock[] = [
      {
        id: '550E8400-E29B-41D4-A716-446655440000',
        type: 'hero_campaign',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Hero' },
      },
    ];

    await persistBuilderDocument('version-1', current, baseline);

    expect(createEditorBlock).toHaveBeenCalledWith('version-1', {
      blockType: 'hero_campaign',
      propsJson: { title: 'Hero' },
      sortOrder: 1,
      blockKey: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('rejects blob URLs before hitting the API', async () => {
    await expect(
      persistBuilderDocument(
        'version-1',
        [
          {
            id: 'local-hero',
            type: 'hero_campaign',
            label: 'Hero',
            sortOrder: 0,
            propsJson: { imageUrl: 'blob:http://localhost/abc' },
          },
        ],
        [],
      ),
    ).rejects.toThrow(/Médias non enregistrés/);

    expect(createEditorBlock).not.toHaveBeenCalled();
  });
});
