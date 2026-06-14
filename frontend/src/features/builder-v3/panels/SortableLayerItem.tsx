import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import { getCatalogItem } from '@/features/builder-engine/foundation/builder-catalog';
import { getRegistryEntry } from '@/features/builder-engine/registry/block-registry';
import { isBlockGloballyHidden, isBlockHiddenInStudio } from '@/features/builder-engine/lib/block-visibility';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type SortableLayerItemProps = {
  block: BuilderDocumentBlock;
  index: number;
  isSelected: boolean;
  onSelect: (blockId: string) => void;
  onRemove: (blockId: string) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onToggleHidden: (blockId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function SortableLayerItem({
  block,
  index,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onToggleHidden,
  canMoveUp,
  canMoveDown,
}: SortableLayerItemProps) {
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const catalog = getCatalogItem(block.type);
  const registry = getRegistryEntry(block.type);
  const displayLabel = catalog?.sidebarLabel ?? block.label;
  const typeLabel = registry?.label ?? block.type;
  const isHidden = isBlockHiddenInStudio(block.propsJson, deviceMode);
  const isGloballyHidden = isBlockGloballyHidden(block.propsJson);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'z-10 opacity-90')}
      data-testid={`studio-layer-item-${block.id}`}
      data-selected={isSelected ? 'true' : 'false'}
      data-canvas-block-id={block.id}
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg border px-2 py-2 text-left transition-colors',
          isSelected
            ? 'border-blue-500/50 bg-blue-500/10 text-neutral-100 shadow-sm shadow-blue-500/10'
            : 'border-transparent bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900',
        )}
      >
        <button
          type="button"
          className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-neutral-600 hover:text-neutral-400 active:cursor-grabbing"
          aria-label={`Glisser ${displayLabel}`}
          data-testid={`studio-layer-drag-${block.id}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3.5 w-3.5" aria-hidden />
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onSelect(block.id)}
          data-testid={`studio-layer-select-${block.id}`}
        >
          <span className="mr-1.5 font-mono text-[0.625rem] text-neutral-600">{index + 1}</span>
          <span className="block truncate text-xs font-medium text-neutral-200">{displayLabel}</span>
          <span className="block truncate text-[0.625rem] text-neutral-500">
            {typeLabel}
            {isHidden ? ' · Masqué' : ''}
          </span>
        </button>

        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="h-6 px-1.5 text-[0.625rem] border-neutral-700"
          disabled={!canMoveUp}
          onClick={() => onMoveUp(block.id)}
          aria-label="Monter"
        >
          ↑
        </ShadButton>
        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="h-6 px-1.5 text-[0.625rem] border-neutral-700"
          disabled={!canMoveDown}
          onClick={() => onMoveDown(block.id)}
          aria-label="Descendre"
        >
          ↓
        </ShadButton>
        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="h-6 w-6 p-0 border-neutral-700"
          onClick={() => onToggleHidden(block.id)}
          aria-label={isGloballyHidden ? 'Afficher le bloc' : 'Masquer le bloc'}
          aria-pressed={isGloballyHidden}
          data-testid={`studio-layer-toggle-hidden-${block.id}`}
        >
          {isGloballyHidden ? (
            <EyeOff className="h-3 w-3" aria-hidden />
          ) : (
            <Eye className="h-3 w-3" aria-hidden />
          )}
        </ShadButton>
        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="h-6 w-6 p-0 border-red-900/40 text-red-400"
          onClick={() => onRemove(block.id)}
          aria-label="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </ShadButton>
      </div>
    </li>
  );
}
