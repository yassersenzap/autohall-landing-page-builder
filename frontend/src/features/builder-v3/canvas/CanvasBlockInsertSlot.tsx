import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { getCanvasInsertBlockOptions } from '../constants/canvas-insert-blocks';

type CanvasBlockInsertSlotProps = {
  insertIndex: number;
};

export function CanvasBlockInsertSlot({ insertIndex }: CanvasBlockInsertSlotProps) {
  const insertBlockAt = useBuilderDocumentStore((s) => s.insertBlockAt);
  const [open, setOpen] = useState(false);
  const options = getCanvasInsertBlockOptions();

  return (
    <div
      className="v3-block-insert-slot"
      data-studio-only="true"
      data-testid={`canvas-insert-slot-${insertIndex}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="v3-block-insert-slot__trigger"
        aria-label="Insérer une section"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-testid={`canvas-insert-slot-trigger-${insertIndex}`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        <span>Ajouter une section</span>
      </button>

      {open ? (
        <div className="v3-block-insert-slot__menu" data-testid="canvas-insert-slot-menu">
          <ul>
            {options.map((option) => (
              <li key={option.type}>
                <button
                  type="button"
                  className="v3-block-insert-slot__item"
                  onClick={() => {
                    insertBlockAt(option.type, insertIndex);
                    setOpen(false);
                  }}
                  data-testid={`canvas-insert-slot-${option.type}-${insertIndex}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
