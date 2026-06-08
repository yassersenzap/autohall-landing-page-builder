import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { LucideIcon } from 'lucide-react';
import { GripVertical, LayoutTemplate, Sparkles } from 'lucide-react';
import {
  countCatalogBlocks,
  getCatalogByBusinessCategory,
  type CatalogBlockItem,
} from '@/features/builder-engine/foundation/builder-catalog';
import {
  getFullPageStarters,
  getSectionStarters,
} from '@/features/builder-engine/foundation/page-starters';
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
  Tabs,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { StructureOutlinePanel } from './StructureOutlinePanel';

type SidebarTab = 'catalog' | 'structure';

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
          <CardDescription className="text-xs text-neutral-500">{block.description}</CardDescription>
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

function StarterCard({
  label,
  description,
  icon: Icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 p-3 text-left transition hover:border-blue-500/40 hover:bg-neutral-900"
    >
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-blue-400" aria-hidden />
        <span className="text-sm font-medium text-neutral-200">{label}</span>
      </div>
      <p className="text-xs text-neutral-500">{description}</p>
    </button>
  );
}

function CatalogPanel() {
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const applyPageStarter = useBuilderDocumentStore((s) => s.applyPageStarter);
  const catalogGroups = getCatalogByBusinessCategory();

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-3 p-3">
        <div className="space-y-2">
          <p className="px-1 text-[0.625rem] font-semibold uppercase tracking-wider text-neutral-500">
            Démarrer une page
          </p>
          {getFullPageStarters().map((starter) => (
            <StarterCard
              key={starter.id}
              label={starter.label}
              description={starter.description}
              icon={LayoutTemplate}
              onClick={() => applyPageStarter(starter.blockTypes, 'replace')}
            />
          ))}
        </div>

        <Separator className="bg-neutral-800" />

        <div className="space-y-2">
          <p className="px-1 text-[0.625rem] font-semibold uppercase tracking-wider text-neutral-500">
            Insérer une section
          </p>
          {getSectionStarters().map((section) => (
            <StarterCard
              key={section.id}
              label={section.label}
              description={section.description}
              icon={Sparkles}
              onClick={() => applyPageStarter(section.blockTypes, 'append')}
            />
          ))}
        </div>

        <Separator className="bg-neutral-800" />

        <Accordion type="multiple" defaultValue={catalogGroups.map((g) => g.category.id)}>
          {catalogGroups.map(({ category, blocks }) => (
            <AccordionItem key={category.id} value={category.id} className="border-none">
              <AccordionTrigger className="rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200 hover:no-underline">
                {category.label}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <p className="px-2 text-[0.625rem] text-neutral-600">{category.description}</p>
                {blocks.map((block) => (
                  <DraggableBlockCard key={block.type} block={block} onAdd={addBlock} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
}

export function LeftSidebar() {
  const [tab, setTab] = useState<SidebarTab>('catalog');

  return (
    <aside
      className="flex h-full w-[300px] shrink-0 flex-col border-r border-neutral-800 bg-neutral-950"
      data-builder-v3-left-sidebar
    >
      <div className="border-b border-neutral-800 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Landing Studio
        </p>
        <p className="mt-0.5 text-sm text-neutral-300">Sections · blocs · structure</p>
      </div>

      <div className="border-b border-neutral-800 px-3 py-2">
        <Tabs
          items={[
            { id: 'catalog', label: 'Catalogue' },
            { id: 'structure', label: 'Structure' },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Panneau gauche studio"
          className="border-neutral-800 bg-neutral-900/80"
        />
      </div>

      {tab === 'catalog' ? <CatalogPanel /> : <StructureOutlinePanel className="min-h-0 flex-1" />}

      <Separator className="bg-neutral-800" />
      <div className="px-4 py-2">
        <p className="text-[0.625rem] text-neutral-600">
          {countCatalogBlocks()} blocs · catalogue unifié
        </p>
      </div>
    </aside>
  );
}
