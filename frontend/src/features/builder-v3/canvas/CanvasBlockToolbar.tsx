import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  PanelRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { getCatalogItem } from '@/features/builder-engine/foundation/builder-catalog';
import { getRegistryEntry } from '@/features/builder-engine/registry/block-registry';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { getCanvasInsertBlockOptions } from '../constants/canvas-insert-blocks';

type CanvasBlockToolbarProps = {
  block: BuilderDocumentBlock;
  blockIndex: number;
  blockCount: number;
};

function focusInspector() {
  window.dispatchEvent(new CustomEvent('studio:focus-inspector'));
}

export function CanvasBlockToolbar({
  block,
  blockIndex,
  blockCount,
}: CanvasBlockToolbarProps) {
  const moveBlockUp = useBuilderDocumentStore((s) => s.moveBlockUp);
  const moveBlockDown = useBuilderDocumentStore((s) => s.moveBlockDown);
  const duplicateBlock = useBuilderDocumentStore((s) => s.duplicateBlock);
  const deleteBlock = useBuilderDocumentStore((s) => s.deleteBlock);
  const insertBlockAt = useBuilderDocumentStore((s) => s.insertBlockAt);

  const [insertOpen, setInsertOpen] = useState<'above' | 'below' | null>(null);

  const catalog = getCatalogItem(block.type);
  const registry = getRegistryEntry(block.type);
  const label = catalog?.sidebarLabel ?? block.label;
  const typeLabel = registry?.label ?? block.type;

  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < blockCount - 1;
  const insertOptions = getCanvasInsertBlockOptions();

  function handleInsert(type: string, position: 'above' | 'below') {
    const index = position === 'above' ? blockIndex : blockIndex + 1;
    insertBlockAt(type, index);
    setInsertOpen(null);
  }

  return (
    <div
      className="v3-block-toolbar"
      data-studio-only="true"
      data-testid="canvas-block-toolbar"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="toolbar"
      aria-label={`Actions pour ${label}`}
    >
      <div className="v3-block-toolbar__label">
        <span className="v3-block-toolbar__name">{label}</span>
        <span className="v3-block-toolbar__type">{typeLabel}</span>
      </div>

      <div className="v3-block-toolbar__actions">
        <button
          type="button"
          className="v3-block-toolbar__btn"
          disabled={!canMoveUp}
          onClick={() => moveBlockUp(block.id)}
          aria-label="Monter le bloc"
          data-testid="canvas-toolbar-move-up"
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="v3-block-toolbar__btn"
          disabled={!canMoveDown}
          onClick={() => moveBlockDown(block.id)}
          aria-label="Descendre le bloc"
          data-testid="canvas-toolbar-move-down"
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="v3-block-toolbar__btn"
          onClick={() => duplicateBlock(block.id)}
          aria-label="Dupliquer le bloc"
          data-testid="canvas-toolbar-duplicate"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="v3-block-toolbar__btn"
          onClick={focusInspector}
          aria-label="Ouvrir l’inspecteur"
          data-testid="canvas-toolbar-focus-inspector"
        >
          <PanelRight className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="v3-block-toolbar__btn v3-block-toolbar__btn--insert"
          onClick={() => setInsertOpen(insertOpen === 'below' ? null : 'below')}
          aria-label="Insérer une section"
          aria-expanded={insertOpen === 'below'}
          data-testid="canvas-toolbar-insert-below"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="v3-block-toolbar__btn v3-block-toolbar__btn--danger"
          onClick={() => deleteBlock(block.id)}
          aria-label="Supprimer le bloc"
          data-testid="canvas-toolbar-delete"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {insertOpen ? (
        <div className="v3-block-toolbar__insert-menu" data-testid="canvas-insert-menu">
          <p className="v3-block-toolbar__insert-title">Insérer en dessous</p>
          <ul className="v3-block-toolbar__insert-list">
            {insertOptions.map((option) => (
              <li key={option.type}>
                <button
                  type="button"
                  className="v3-block-toolbar__insert-item"
                  onClick={() => handleInsert(option.type, 'below')}
                  data-testid={`canvas-insert-${option.type}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="v3-block-toolbar__insert-cancel"
            onClick={() => setInsertOpen(null)}
          >
            Annuler
          </button>
        </div>
      ) : null}
    </div>
  );
}
