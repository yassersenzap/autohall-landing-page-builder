import { useMemo, useState } from 'react';
import { Layers, LayoutTemplate, Plus, Search, Sparkles } from 'lucide-react';
import {
  ScrollArea,
  ShadButton,
  ShadInput,
  Tabs,
  TabsPanel,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import {
  BLOCK_CATEGORY_LABELS,
  getBlockLabel,
  type EditorBlockCategory,
  type EditorBlockDefinition,
  type EditorBlockType,
  type EditorPageBlock,
} from '../../landing/landing-block-catalog';
import { LANDING_TEMPLATES, type LandingTemplateId } from '../../landing/landing-templates';
import { BlockTypeIcon } from '../lib/block-icons';
import { EditorPanel } from './EditorStudioLayout';

export type BuilderSidebarTab = 'blocks' | 'templates' | 'layers';

type BuilderSidebarProps = {
  tab: BuilderSidebarTab;
  onTabChange: (tab: BuilderSidebarTab) => void;
  blocks: EditorBlockDefinition[];
  pageBlocks: EditorPageBlock[];
  selectedBlockId: string | null;
  canWrite: boolean;
  applyingTemplate: boolean;
  selectedTemplateId: LandingTemplateId | null;
  onAddBlock: (type: EditorBlockType) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectTemplate: (templateId: LandingTemplateId) => void;
};

const CATEGORY_ORDER: EditorBlockCategory[] = [
  'hero',
  'conversion',
  'offer',
  'trust',
  'content',
  'footer',
];

const SIDEBAR_TABS = [
  { id: 'blocks' as const, label: 'Blocs' },
  { id: 'templates' as const, label: 'Modèles' },
  { id: 'layers' as const, label: 'Calques' },
];

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function BuilderSidebar({
  tab,
  onTabChange,
  blocks,
  pageBlocks,
  selectedBlockId,
  canWrite,
  applyingTemplate,
  selectedTemplateId,
  onAddBlock,
  onSelectBlock,
  onSelectTemplate,
}: BuilderSidebarProps) {
  const [query, setQuery] = useState('');

  const filteredBlocks = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return blocks;
    return blocks.filter(
      (block) =>
        block.label.toLowerCase().includes(q) ||
        block.description.toLowerCase().includes(q) ||
        block.type.toLowerCase().includes(q),
    );
  }, [blocks, query]);

  const grouped = useMemo(() => {
    const groups = new Map<EditorBlockCategory, EditorBlockDefinition[]>();
    for (const block of filteredBlocks) {
      const list = groups.get(block.category) ?? [];
      list.push(block);
      groups.set(block.category, list);
    }
    return CATEGORY_ORDER.filter((category) => groups.has(category)).map((category) => [
      category,
      groups.get(category)!,
    ] as const);
  }, [filteredBlocks]);

  return (
    <EditorPanel side="left" className="w-full lg:w-auto">
      <div className="shrink-0 space-y-2 border-b border-border p-3">
        <div className="flex items-center gap-2 px-0.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Constructeur</span>
        </div>
        <Tabs items={SIDEBAR_TABS} value={tab} onChange={onTabChange} ariaLabel="Panneau constructeur" />
      </div>

      <TabsPanel>
        {tab === 'blocks' ? (
          <>
            <div className="shrink-0 border-b border-border px-3 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <ShadInput
                  type="search"
                  placeholder="Rechercher une section…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
            <ScrollArea className="px-3 py-3">
              {grouped.length === 0 ? (
                <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                  Aucun bloc ne correspond à votre recherche.
                </p>
              ) : (
                <div className="space-y-4">
                  {grouped.map(([category, items]) => (
                    <section key={category}>
                      <h3 className="mb-2 px-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        {BLOCK_CATEGORY_LABELS[category]}
                      </h3>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item.type}>
                            <div
                              className={cn(
                                'group flex gap-2.5 rounded-lg border border-border bg-card p-2.5 transition-colors',
                                'hover:border-border hover:bg-accent/50',
                                !canWrite && 'opacity-50',
                              )}
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                                <BlockTypeIcon type={item.type} className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold leading-tight text-foreground">
                                  {item.label}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                              <ShadButton
                                type="button"
                                variant="secondary"
                                size="icon-sm"
                                className="shrink-0 self-center opacity-80 group-hover:opacity-100"
                                disabled={!canWrite}
                                title={`Insérer ${item.label}`}
                                onClick={() => onAddBlock(item.type)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </ShadButton>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : null}

        {tab === 'templates' ? (
          <ScrollArea className="px-3 py-3">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Structure complète pour votre landing. Remplacer ou ajouter si la page contient déjà des
              sections.
            </p>
            <ul className="space-y-2">
              {LANDING_TEMPLATES.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                return (
                  <li key={template.id}>
                    <button
                      type="button"
                      disabled={!canWrite || applyingTemplate}
                      onClick={() => onSelectTemplate(template.id)}
                      className={cn(
                        'w-full rounded-xl border border-border bg-card p-3 text-left transition-all',
                        'hover:border-primary/30 hover:bg-accent/30',
                        isSelected && 'border-primary/40 ring-1 ring-primary/20',
                        (!canWrite || applyingTemplate) && 'opacity-50',
                      )}
                    >
                      <div className="mb-1.5 flex items-start gap-2">
                        <LayoutTemplate className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm font-semibold">{template.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{template.description}</p>
                      <p className="mt-2 text-[0.65rem] text-muted-foreground">
                        {template.blocks.length} sections · {template.audience}
                      </p>
                      <span className="mt-2 inline-block text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                        {applyingTemplate && isSelected ? 'Application…' : 'Utiliser'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : null}

        {tab === 'layers' ? (
          <ScrollArea className="px-3 py-3">
            {pageBlocks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">
                  Aucune section. Ajoutez un bloc ou un modèle.
                </p>
              </div>
            ) : (
              <ol className="space-y-1">
                {pageBlocks.map((block, index) => {
                  const selected = block.id === selectedBlockId;
                  return (
                    <li key={block.id}>
                      <button
                        type="button"
                        onClick={() => onSelectBlock(block.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
                          selected
                            ? 'border-primary/30 bg-primary/10 text-foreground'
                            : 'border-transparent hover:bg-accent',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded text-[0.65rem] font-bold',
                            selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {index + 1}
                        </span>
                        <BlockTypeIcon type={block.blockType} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate font-medium">{getBlockLabel(block.blockType)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </ScrollArea>
        ) : null}
      </TabsPanel>
    </EditorPanel>
  );
}
