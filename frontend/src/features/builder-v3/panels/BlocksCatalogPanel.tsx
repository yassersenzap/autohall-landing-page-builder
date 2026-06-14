import { type KeyboardEvent, type MouseEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, LayoutTemplate, Plus } from 'lucide-react';
import {
  countArchivedCatalogBlocks,
  countCatalogBlocks,
  type CatalogBlockItem,
} from '@/features/builder-engine/foundation/builder-catalog';
import {
  CATALOG_TIER_META,
  getArchivedBlockCatalog,
} from '@/features/builder-engine/foundation/catalog-tiers';
import { paletteDragId } from '@/features/builder-engine/constants/palette';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

function DraggableBlockCard({
  block,
  onAdd,
}: {
  block: CatalogBlockItem;
  onAdd: (blockType: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: paletteDragId(block.type),
    data: { blockType: block.type },
  });
  const Icon = block.icon;
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  function handleInsert(event?: MouseEvent | KeyboardEvent) {
    event?.stopPropagation();
    onAdd(block.type);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'z-20 scale-[0.98] opacity-50',
      )}
      data-catalog-block={block.type}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Insérer ${block.sidebarLabel}`}
        onClick={() => onAdd(block.type)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onAdd(block.type);
          }
        }}
        className={cn(
          'relative flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent px-2 py-2',
          'bg-transparent transition-all duration-150 ease-out',
          'hover:border-zinc-700/80 hover:bg-zinc-900/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600/60 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950',
          isDragging && 'border-zinc-600/50 bg-zinc-900/60 shadow-sm',
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
            'bg-zinc-900/60 text-zinc-500 ring-1 ring-zinc-800/60',
            'transition-colors duration-150 group-hover:text-zinc-300 group-hover:ring-zinc-700/80',
          )}
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-zinc-100">{block.sidebarLabel}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {block.description}
          </p>
        </div>

        <div
          className={cn(
            'flex shrink-0 flex-col items-center gap-0.5 opacity-0 transition-opacity duration-150',
            'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          <button
            type="button"
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md text-zinc-500',
              'hover:bg-zinc-800 hover:text-zinc-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600',
            )}
            aria-label={`Insérer ${block.sidebarLabel}`}
            onClick={handleInsert}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className={cn(
              'flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-zinc-600',
              'hover:bg-zinc-800/80 hover:text-zinc-400 active:cursor-grabbing',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600',
            )}
            aria-label={`Glisser ${block.sidebarLabel}`}
            onClick={(event) => event.stopPropagation()}
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function CatalogTierHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-2 pb-1.5 pt-1">
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function CatalogBlockList({
  blocks,
  onAdd,
  className,
}: {
  blocks: CatalogBlockItem[];
  onAdd: (blockType: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {blocks.map((block) => (
        <DraggableBlockCard key={block.type} block={block} onAdd={onAdd} />
      ))}
    </div>
  );
}

export function BlocksCatalogPanel() {
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const archivedBlocks = getArchivedBlockCatalog();
  const archivedCount = countArchivedCatalogBlocks();

  return (
    <ScrollArea
      className="h-full min-h-0 bg-zinc-950"
      data-testid="studio-blocks-panel"
    >
      <div className="space-y-3 px-2 py-3 pb-6">
        <div data-testid="catalog-core-business-group">
          <CatalogTierHeader
            title={CATALOG_TIER_META.coreBusiness.title}
            description="Nouveau bloc métier à venir — composez votre page depuis les blocs archivés."
          />
          {blocks.length === 0 ? (
            <p
              className="mx-1 mt-1 flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-800/80 px-3 py-2 text-xs text-zinc-500"
              data-testid="blocks-empty-page-hint"
            >
              <LayoutTemplate className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Page vide — ouvrez Blocs archivés pour insérer une landing.
            </p>
          ) : null}
        </div>

        {archivedBlocks.length > 0 ? (
          <>
            <div className="mx-2 h-px bg-zinc-800/80" aria-hidden />

            <div data-testid="catalog-archived-blocks-section">
              <Accordion type="single" collapsible className="space-y-0.5">
                <AccordionItem value="archived" className="border-none">
                  <AccordionTrigger
                    className={cn(
                      'rounded-md px-2 py-2 text-sm font-medium text-zinc-400',
                      'hover:bg-zinc-900/40 hover:text-zinc-200 hover:no-underline',
                      'data-[state=open]:text-zinc-300',
                      '[&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:ease-out',
                      '[&[data-state=open]>svg]:rotate-180',
                    )}
                  >
                    {CATALOG_TIER_META.archived.title}
                    <span className="ml-1.5 text-xs font-normal text-zinc-600">
                      ({archivedCount})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-0">
                    <p className="mb-2 px-2 text-xs leading-relaxed text-zinc-500">
                      {CATALOG_TIER_META.archived.description}
                    </p>
                    <CatalogBlockList blocks={archivedBlocks} onAdd={addBlock} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </>
        ) : null}

        <p className="px-2 pt-1 text-xs text-zinc-600">
          {countCatalogBlocks()} actif · {archivedCount} archivés · clic ou glisser-déposer
        </p>
      </div>
    </ScrollArea>
  );
}
