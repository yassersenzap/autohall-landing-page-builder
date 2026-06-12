import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  useBuilderDocumentStore,
  setBuilderPersistPageVersionId,
  forcePersistBuilderDocument,
} from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import {
  BUILDER_HISTORY_MAX_SIZE,
  appendHistoryCheckpoint,
  createBuilderDocumentCheckpoint,
  sanitizeHistoryValue,
} from '@/features/builder-engine/history';
import { useStudioCanvasShortcuts } from '@/features/builder-v3/hooks/useStudioCanvasShortcuts';

function heroBlock(id: string, title = 'Hero'): BuilderDocumentBlock {
  return {
    id,
    type: 'hero_campaign',
    label: 'Hero',
    sortOrder: 0,
    propsJson: { title, buttonText: 'Go' },
  };
}

function campaignHero(id: string): BuilderDocumentBlock {
  return {
    id,
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder: 0,
    propsJson: {
      campaignTitle: 'Titre custom',
      formCtaLabel: 'CTA custom',
      layoutVariant: 'media_left_form_right',
    },
  };
}

describe('builder document history engine', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('starts with canUndo/canRedo false', () => {
    const state = useBuilderDocumentStore.getState();
    expect(state.canUndo()).toBe(false);
    expect(state.canRedo()).toBe(false);
    expect(state.historyPast).toHaveLength(0);
    expect(state.historyFuture).toHaveLength(0);
  });

  it('edit block props then undo/redo', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1', 'Before')]);
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'After' });
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('After');
    expect(useBuilderDocumentStore.getState().canUndo()).toBe(true);

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Before');
    expect(useBuilderDocumentStore.getState().canRedo()).toBe(true);

    useBuilderDocumentStore.getState().redo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('After');
  });

  it('blockVisual edit then undo/redo restores previous visual state', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([campaignHero('clh-1')]);
    useBuilderDocumentStore.getState().updateBlockProps('clh-1', {
      blockVisual: { heroHeight: 'tall', formWidth: 'lg' },
    });

    const after = useBuilderDocumentStore.getState().blocks[0]?.propsJson.blockVisual as Record<
      string,
      unknown
    >;
    expect(after?.heroHeight).toBe('tall');
    expect(after?.formWidth).toBe('lg');

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.blockVisual).toBeUndefined();

    useBuilderDocumentStore.getState().redo();
    const restored = useBuilderDocumentStore.getState().blocks[0]?.propsJson.blockVisual as Record<
      string,
      unknown
    >;
    expect(restored?.heroHeight).toBe('tall');
    expect(restored?.formWidth).toBe('lg');
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.campaignTitle).toBe('Titre custom');
  });

  it('typography and focal edits then undo/redo restore previous values', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([campaignHero('clh-1')]);
    useBuilderDocumentStore.getState().updateBlockProps('clh-1', {
      typography: { titleScale: 'display', titleWeight: 'black' },
      cropPreset: 'custom',
      focalPointX: 25,
      focalPointY: 75,
    });

    const after = useBuilderDocumentStore.getState().blocks[0]?.propsJson;
    expect(after?.typography).toMatchObject({ titleScale: 'display', titleWeight: 'black' });
    expect(after?.focalPointX).toBe(25);
    expect(after?.focalPointY).toBe(75);

    useBuilderDocumentStore.getState().undo();
    const undone = useBuilderDocumentStore.getState().blocks[0]?.propsJson;
    expect(undone?.typography).toBeUndefined();
    expect(undone?.focalPointX).toBeUndefined();

    useBuilderDocumentStore.getState().redo();
    const restored = useBuilderDocumentStore.getState().blocks[0]?.propsJson;
    expect(restored?.typography).toMatchObject({ titleScale: 'display', titleWeight: 'black' });
    expect(restored?.focalPointX).toBe(25);
    expect(restored?.focalPointY).toBe(75);
  });

  it('add block then undo/redo', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().addBlock('faq');
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(2);

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);

    useBuilderDocumentStore.getState().redo();
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(2);
  });

  it('delete block then undo/redo', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), heroBlock('hero-2')]);
    useBuilderDocumentStore.getState().deleteBlock('hero-2');
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(2);
  });

  it('duplicate block then undo/redo', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().duplicateBlock('hero-1');
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(2);

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);
  });

  it('reorder blocks then undo/redo', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), heroBlock('hero-2')]);
    useBuilderDocumentStore.getState().reorderBlocks('hero-2', 'hero-1');
    expect(useBuilderDocumentStore.getState().blocks[0]?.id).toBe('hero-2');

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.id).toBe('hero-1');
  });

  it('apply block variant then undo preserves content', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([campaignHero('hero-1')]);
    useBuilderDocumentStore.getState().applyBlockVariant('hero-1', 'campaign-hero-background-image');
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.layoutVariant).toBe(
      'background_media_form_right',
    );

    useBuilderDocumentStore.getState().undo();
    const props = useBuilderDocumentStore.getState().blocks[0]?.propsJson;
    expect(props?.campaignTitle).toBe('Titre custom');
    expect(props?.formCtaLabel).toBe('CTA custom');
    expect(props?.layoutVariant).toBe('media_left_form_right');
  });

  it('apply campaign template can be undone to previous document', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1', 'Original')]);
    useBuilderDocumentStore.getState().applyCampaignTemplate('chery-campaign-offer');
    expect(useBuilderDocumentStore.getState().blocks.length).toBeGreaterThan(1);
    expect(useBuilderDocumentStore.getState().blocks[0]?.type).toBe('campaign_lead_hero');

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Original');
  });

  it('marks themeDirty and bumps documentRevision on undo/redo', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1', 'A')]);
    const revisionBefore = useBuilderDocumentStore.getState().documentRevision;
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'B' });

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().themeDirty).toBe(true);
    expect(useBuilderDocumentStore.getState().documentRevision).toBeGreaterThan(revisionBefore);

    const afterUndo = useBuilderDocumentStore.getState().documentRevision;
    useBuilderDocumentStore.getState().redo();
    expect(useBuilderDocumentStore.getState().documentRevision).toBeGreaterThan(afterUndo);
  });

  it('clearHistory on server snapshot and reset', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'Changed' });
    expect(useBuilderDocumentStore.getState().canUndo()).toBe(true);

    useBuilderDocumentStore.getState().applyServerSnapshot({
      blocks: [heroBlock('hero-1')],
      pageTheme: useBuilderDocumentStore.getState().pageTheme,
      pageSettings: useBuilderDocumentStore.getState().pageSettings,
    });
    expect(useBuilderDocumentStore.getState().canUndo()).toBe(false);
  });

  it('sanitizes blob URLs from history checkpoints', () => {
    const checkpoint = createBuilderDocumentCheckpoint({
      blocks: [
        {
          id: 'b1',
          type: 'gallery',
          label: 'G',
          sortOrder: 0,
          propsJson: { imageUrl: 'blob:http://localhost/fake' },
        },
      ],
      selectedBlockId: 'b1',
      pageTheme: useBuilderDocumentStore.getState().pageTheme,
      pageSettings: useBuilderDocumentStore.getState().pageSettings,
      themeDirty: false,
    });
    expect(checkpoint.blocks[0]?.propsJson.imageUrl).toBe('');
    expect(sanitizeHistoryValue('data:image/png;base64,abc')).toBe('');
  });

  it('caps history stack size', () => {
    let past = [] as ReturnType<typeof createBuilderDocumentCheckpoint>[];
    const sample = createBuilderDocumentCheckpoint({
      blocks: [heroBlock('hero-1')],
      selectedBlockId: 'hero-1',
      pageTheme: useBuilderDocumentStore.getState().pageTheme,
      pageSettings: useBuilderDocumentStore.getState().pageSettings,
      themeDirty: false,
    });
    for (let i = 0; i < BUILDER_HISTORY_MAX_SIZE + 5; i += 1) {
      past = appendHistoryCheckpoint(past, { ...sample, reason: 'manual' });
    }
    expect(past.length).toBe(BUILDER_HISTORY_MAX_SIZE);
  });

  it('does not persist history stacks in localStorage payload', () => {
    setBuilderPersistPageVersionId('test-page-version');
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'Dirty' });

    forcePersistBuilderDocument();

    const payload = localStorage.getItem('autohall-builder-storage:test-page-version');
    expect(payload).toBeTruthy();
    expect(payload).not.toContain('historyPast');
    expect(payload).not.toContain('historyFuture');
  });
});

function HistoryShortcutHost() {
  useStudioCanvasShortcuts(true);
  return null;
}

describe('studio history keyboard shortcuts', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('calls undo/redo from keyboard shortcuts', () => {
    render(<HistoryShortcutHost />);
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1', 'Start')]);
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'Edited' });

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }),
    );
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Start');

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }),
    );
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Edited');

    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'Again' });
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }),
    );
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Edited');
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }),
    );
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Again');
  });

  it('does not undo builder state when focus is in textarea', () => {
    render(<HistoryShortcutHost />);
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1', 'Start')]);
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'Edited' });

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }),
    );

    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Edited');
    textarea.remove();
  });
});
