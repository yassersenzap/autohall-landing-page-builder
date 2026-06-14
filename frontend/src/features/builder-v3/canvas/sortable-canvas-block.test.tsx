import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { SortableCanvasBlock } from './SortableCanvasBlock';

function richTextBlock(hidden?: boolean): BuilderDocumentBlock {
  return {
    id: 'rich-ghost',
    type: 'rich_text',
    label: 'Bloc texte',
    sortOrder: 0,
    propsJson: {
      titre: 'Titre',
      contenu: 'Corps',
      ...(hidden ? { hidden: true } : {}),
    },
  };
}

describe('SortableCanvasBlock ghost mode', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  function renderShell(block: BuilderDocumentBlock) {
    render(
      <DndContext>
        <SortableContext items={[block.id]} strategy={verticalListSortingStrategy}>
          <SortableCanvasBlock
            block={block}
            blockIndex={0}
            blockCount={1}
            selected={false}
            onSelect={() => {}}
          >
            <section>Preview</section>
          </SortableCanvasBlock>
        </SortableContext>
      </DndContext>,
    );
  }

  it('applies studio-hidden attributes when rich_text block is globally hidden', () => {
    renderShell(richTextBlock(true));

    const shell = screen.getByRole('button', { name: 'Sélectionner Bloc texte (masqué)' });
    expect(shell).toHaveAttribute('data-studio-hidden', 'true');
    expect(shell.className).toContain('v3-block-shell--studio-hidden');
    expect(screen.getByText('Masqué')).toBeInTheDocument();
  });

  it('does not mark visible rich_text blocks as hidden', () => {
    renderShell(richTextBlock(false));

    const shell = screen.getByRole('button', { name: 'Sélectionner Bloc texte' });
    expect(shell).toHaveAttribute('data-studio-hidden', 'false');
    expect(screen.queryByText('Masqué')).not.toBeInTheDocument();
  });
});
