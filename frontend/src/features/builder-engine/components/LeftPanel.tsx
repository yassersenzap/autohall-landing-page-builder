import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUILDER_PALETTE, paletteDragId } from '../constants/palette';
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
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteDragId(type),
    data: { kind: 'palette', type, label },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex gap-2 rounded-lg border border-border bg-card/60 p-2.5 transition-colors',
        'hover:border-border/80 hover:bg-accent/40',
        isDragging && 'opacity-40',
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 cursor-grab text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">
          {description}
        </p>
      </button>
      <button
        type="button"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        title="Ajouter en bas de page"
        onClick={() => addBlock(type)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LeftPanel() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      <header className="shrink-0 border-b border-border px-3 py-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
          Composants
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Glissez sur le canvas ou utilisez +
        </p>
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
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
