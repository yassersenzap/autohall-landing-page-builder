import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUILDER_PALETTE, paletteDragId } from '../constants/palette';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';

function PaletteDraggableItem({
  type,
  label,
  description,
}: {
  type: string;
  label: string;
  description: string;
}) {
  const { canWrite } = useBuilderEditorContext();
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteDragId(type),
    data: { kind: 'palette', type, label },
    disabled: !canWrite,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex gap-2 rounded-md border border-border/80 bg-card p-2 transition-colors',
        'hover:border-border hover:bg-accent/30',
        isDragging && 'opacity-40',
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 cursor-grab text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <p className="text-xs font-semibold leading-tight text-foreground">{label}</p>
        <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">
          {description}
        </p>
      </button>
      <button
        type="button"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        title="Ajouter en bas de page"
        disabled={!canWrite}
        onClick={() => addBlock(type)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LeftPanel() {
  return (
    <aside className="builder-panel builder-panel--left flex h-full min-h-0 w-full flex-col border-b border-border bg-builder lg:max-h-none lg:border-b-0 lg:border-r">
      <header className="shrink-0 border-b border-border px-3 py-2.5">
        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
          Composants
        </p>
        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">Glisser ou +</p>
      </header>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {BUILDER_PALETTE.map((item) => (
          <PaletteDraggableItem
            key={item.type}
            type={item.type}
            label={item.label}
            description={item.description}
          />
        ))}
      </div>
    </aside>
  );
}
