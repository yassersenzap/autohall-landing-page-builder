import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles, Zap } from 'lucide-react';
import {
  countCatalogBlocks,
  type CatalogBlockItem,
} from '@/features/builder-engine/foundation/builder-catalog';
import {
  CATALOG_TIER_META,
  getBasicBlockCatalog,
  getCompleteSectionsByCategory,
  getPremiumAnimatedSectionCatalog,
} from '@/features/builder-engine/foundation/catalog-tiers';
import { paletteDragId } from '@/features/builder-engine/constants/palette';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
  ShadButton,
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

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-40')}>
      <Card className="border-neutral-800 bg-neutral-900/60 text-neutral-100 transition-colors hover:border-neutral-600">
        <CardHeader className="gap-1 p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
              {block.sidebarLabel}
            </CardTitle>
            <button
              type="button"
              className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              aria-label={`Glisser ${block.sidebarLabel}`}
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
          <CardDescription className="text-xs text-neutral-500">
            {block.businessUseCase ?? block.description}
          </CardDescription>
          {block.isPremium ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-amber-200">
                <Sparkles className="h-3 w-3" aria-hidden />
                Premium
              </span>
              {block.motionReady ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[0.625rem] font-medium text-sky-200">
                  <Zap className="h-3 w-3" aria-hidden />
                  Motion
                </span>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="w-full border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
            onClick={() => onAdd(block.type)}
          >
            Insérer
          </ShadButton>
        </CardContent>
      </Card>
    </div>
  );
}

function CatalogTierHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-0.5 px-1">
      <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-neutral-500">{title}</p>
      <p className="text-[0.625rem] leading-relaxed text-neutral-600">{description}</p>
    </div>
  );
}

function PremiumAnimatedTier({
  blocks,
  onAdd,
}: {
  blocks: CatalogBlockItem[];
  onAdd: (blockType: string) => void;
}) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-2" data-testid="catalog-premium-animated-group">
      <CatalogTierHeader
        title={CATALOG_TIER_META.premiumAnimated.title}
        description={CATALOG_TIER_META.premiumAnimated.description}
      />
      {blocks.map((block) => (
        <DraggableBlockCard key={block.type} block={block} onAdd={onAdd} />
      ))}
    </div>
  );
}

export function BlocksCatalogPanel() {
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const sectionGroups = getCompleteSectionsByCategory();
  const premiumBlocks = getPremiumAnimatedSectionCatalog();
  const basicBlocks = getBasicBlockCatalog();

  return (
    <ScrollArea className="h-full min-h-0" data-testid="studio-blocks-panel">
      <div className="space-y-4 p-3 pb-6">
        <div className="space-y-2">
          <CatalogTierHeader
            title={CATALOG_TIER_META.sections.title}
            description={CATALOG_TIER_META.sections.description}
          />
          <Accordion type="multiple" defaultValue={sectionGroups.map((g) => g.categoryId)}>
            {sectionGroups.map(({ categoryId, categoryLabel, blocks }) => (
              <AccordionItem key={categoryId} value={categoryId} className="border-none">
                <AccordionTrigger className="rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200 hover:no-underline">
                  {categoryLabel}
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-1">
                  {blocks.map((block) => (
                    <DraggableBlockCard key={block.type} block={block} onAdd={addBlock} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Separator className="bg-neutral-800" />

        <PremiumAnimatedTier blocks={premiumBlocks} onAdd={addBlock} />

        <Separator className="bg-neutral-800" />

        <div className="space-y-2">
          <CatalogTierHeader
            title={CATALOG_TIER_META.basics.title}
            description={CATALOG_TIER_META.basics.description}
          />
          {basicBlocks.map((block) => (
            <DraggableBlockCard key={block.type} block={block} onAdd={addBlock} />
          ))}
        </div>

        <p className="px-1 text-[0.625rem] text-neutral-600">
          {countCatalogBlocks()} blocs disponibles · glisser-déposer ou Insérer
        </p>
      </div>
    </ScrollArea>
  );
}
