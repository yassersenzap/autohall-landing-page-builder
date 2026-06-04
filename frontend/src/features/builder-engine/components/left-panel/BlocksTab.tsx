import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paletteDragId } from '../../constants/palette';
import { useBuilderEditorContext } from '../../context/BuilderEditorContext';
import {
  getActivePaletteBlocks,
  getDisabledPaletteBlocks,
  type BlockRegistryEntry,
} from '../../registry/block-registry';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

function PaletteDraggableItem({ entry }: { entry: BlockRegistryEntry }) {
  const { canWrite } = useBuilderEditorContext();
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteDragId(entry.type),
    data: { kind: 'palette', type: entry.type, label: entry.label },
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
        className="flex min-w-0 flex-1 cursor-grab gap-2 text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
          {entry.icon}
        </span>
        <span className="min-w-0">
          <p className="text-xs font-semibold leading-tight text-foreground">
            {entry.label}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">
            {entry.description}
          </p>
        </span>
      </button>
      <button
        type="button"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        title="Ajouter en bas de page"
        disabled={!canWrite}
        onClick={() => addBlock(entry.type)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DisabledBlockItem({ entry }: { entry: BlockRegistryEntry }) {
  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-2 py-2 opacity-70">
      <p className="text-xs font-medium text-muted-foreground">
        {entry.label}
        <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[0.55rem] font-semibold uppercase">
          Bientôt
        </span>
      </p>
      <p className="mt-0.5 text-[0.65rem] text-muted-foreground/80">
        {entry.description}
      </p>
    </div>
  );
}

export function BlocksTab() {
  const active = getActivePaletteBlocks();
  const disabled = getDisabledPaletteBlocks();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {active.map((entry) => (
          <PaletteDraggableItem key={entry.type} entry={entry} />
        ))}
      </div>
      {disabled.length > 0 ? (
        <div className="shrink-0 border-t border-border p-2">
          <p className="mb-1.5 px-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-muted-foreground">
            À venir
          </p>
          <div className="space-y-1">
            {disabled.slice(0, 4).map((entry) => (
              <DisabledBlockItem key={entry.type} entry={entry} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
