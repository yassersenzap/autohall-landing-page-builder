import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { AlertTriangle, LayoutTemplate, Sparkles, Wand2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATALOG_TIER_META } from '@/features/builder-engine/foundation/catalog-tiers';
import {
  countArchivedStudioTemplates,
  getArchivedGroupedCampaignPageTemplates,
  getCampaignPageTemplateById,
} from '@/features/builder-engine/foundation/campaign-page-templates';
import type { CampaignPageTemplate } from '@/features/builder-engine/foundation/campaign-page-templates.types';
import { getArchivedCoreCampaignTemplates } from '@/features/builder-engine/foundation/core-campaign-templates';
import {
  getArchivedFullPageStarters,
  getArchivedSectionStarters,
} from '@/features/builder-engine/foundation/page-starters';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
  ShadButton,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

function PanelSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-2 pb-1.5 pt-1">
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function ArchiveSubsectionHeader({ title }: { title: string }) {
  return (
    <p className="px-2 pb-1 pt-2 text-xs font-medium text-zinc-500">{title}</p>
  );
}

function TemplateListRow({
  label,
  description,
  meta,
  icon: Icon,
  onApply,
  testId,
  applyTestId,
}: {
  label: string;
  description: string;
  meta?: string;
  icon: LucideIcon;
  onApply: () => void;
  testId: string;
  applyTestId: string;
}) {
  function handleApply(event?: MouseEvent | KeyboardEvent) {
    event?.stopPropagation();
    onApply();
  }

  return (
    <div className="group relative" data-testid={testId}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Appliquer ${label}`}
        onClick={onApply}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onApply();
          }
        }}
        className={cn(
          'relative flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent px-2 py-2',
          'bg-transparent transition-all duration-150 ease-out',
          'hover:border-zinc-700/80 hover:bg-zinc-900/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600/60 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950',
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
          <p className="text-sm font-medium leading-snug text-zinc-100">{label}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{description}</p>
          {meta ? (
            <p className="mt-1 text-[0.6875rem] leading-relaxed text-zinc-600">{meta}</p>
          ) : null}
        </div>

        <div
          className={cn(
            'flex shrink-0 opacity-0 transition-opacity duration-150',
            'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          <button
            type="button"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-zinc-500',
              'hover:bg-zinc-800 hover:text-zinc-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600',
            )}
            aria-label={`Appliquer ${label}`}
            data-testid={applyTestId}
            onClick={handleApply}
          >
            <Wand2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignTemplateRow({
  template,
  onApply,
}: {
  template: CampaignPageTemplate;
  onApply: () => void;
}) {
  const isCore = template.id.startsWith('core-');
  const cardTestId = isCore
    ? `core-template-card-${template.id}`
    : `campaign-template-card-${template.id}`;
  const applyTestId = isCore
    ? `core-template-use-${template.id}`
    : `campaign-template-use-${template.id}`;

  return (
    <TemplateListRow
      label={template.name}
      description={template.description}
      meta={`${template.blocks.length} blocs · ${template.previewLabel}`}
      icon={LayoutTemplate}
      onApply={onApply}
      testId={cardTestId}
      applyTestId={applyTestId}
    />
  );
}

export function TemplatesPanel() {
  const applyPageStarter = useBuilderDocumentStore((s) => s.applyPageStarter);
  const applyCampaignTemplate = useBuilderDocumentStore((s) => s.applyCampaignTemplate);
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  const pendingTemplate = pendingTemplateId
    ? getCampaignPageTemplateById(pendingTemplateId)
    : undefined;

  const archivedCoreTemplates = getArchivedCoreCampaignTemplates();
  const archivedTemplateGroups = getArchivedGroupedCampaignPageTemplates();
  const archivedFullPageStarters = getArchivedFullPageStarters();
  const archivedSectionStarters = getArchivedSectionStarters();
  const archivedCount = countArchivedStudioTemplates();

  function requestCampaignTemplate(templateId: string) {
    if (blocks.length > 0) {
      setPendingTemplateId(templateId);
      return;
    }
    applyCampaignTemplate(templateId);
  }

  function confirmReplaceTemplate() {
    if (!pendingTemplateId) return;
    applyCampaignTemplate(pendingTemplateId);
    setPendingTemplateId(null);
  }

  return (
    <ScrollArea
      className="h-full min-h-0 bg-zinc-950"
      data-testid="studio-templates-panel"
    >
      <div className="space-y-3 px-2 py-3 pb-6">
        {pendingTemplate ? (
          <div
            className="mx-1 space-y-3 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3"
            data-testid="campaign-template-replace-warning"
          >
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">Remplacer le contenu actuel ?</p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Le modèle « {pendingTemplate.name} » remplacera les {blocks.length} bloc
                  {blocks.length > 1 ? 's' : ''} du canevas.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ShadButton
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 flex-1 border-zinc-700 bg-zinc-900 text-xs text-zinc-200"
                onClick={confirmReplaceTemplate}
                data-testid="campaign-template-confirm-replace"
              >
                Remplacer et appliquer
              </ShadButton>
              <ShadButton
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 flex-1 border-zinc-700 text-xs text-zinc-400"
                onClick={() => setPendingTemplateId(null)}
                data-testid="campaign-template-cancel-replace"
              >
                Annuler
              </ShadButton>
            </div>
          </div>
        ) : null}

        <div data-testid="templates-active-section">
          <PanelSectionHeader
            title={CATALOG_TIER_META.starters.title}
            description="Nouveaux gabarits métier à venir — composez votre page depuis l’onglet Blocs."
          />
          {blocks.length === 0 ? (
            <p
              className="mx-1 mt-1 flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-800/80 px-3 py-2 text-xs text-zinc-500"
              data-testid="templates-empty-page-hint"
            >
              <Wand2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Page vide — ajoutez une landing depuis Blocs ou ouvrez les modèles archivés.
            </p>
          ) : null}
        </div>

        <div className="mx-2 h-px bg-zinc-800/80" aria-hidden />

        <div data-testid="templates-archived-section">
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
                Modèles archivés
                <span className="ml-1.5 text-xs font-normal text-zinc-600">({archivedCount})</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <p className="mb-2 px-2 text-xs leading-relaxed text-zinc-500">
                  Gabarits legacy — toujours applicables, remplacent ou complètent le canevas.
                </p>

                {archivedCoreTemplates.length > 0 ? (
                  <div data-testid="core-campaign-templates">
                    <ArchiveSubsectionHeader title={CATALOG_TIER_META.coreTemplates.title} />
                    <div className="space-y-0.5">
                      {archivedCoreTemplates.map((template) => (
                        <CampaignTemplateRow
                          key={template.id}
                          template={template}
                          onApply={() => requestCampaignTemplate(template.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {archivedTemplateGroups.length > 0 ? (
                  <div className="space-y-1" data-testid="campaign-templates-by-use-case">
                    <ArchiveSubsectionHeader title={CATALOG_TIER_META.campaignTemplates.title} />
                    {archivedTemplateGroups.map(({ group, templates }) => (
                      <section
                        key={group.id}
                        className="space-y-0.5"
                        data-testid={`template-use-case-group-${group.id}`}
                      >
                        <p className="px-2 pb-0.5 pt-1 text-[0.6875rem] text-zinc-600">
                          {group.label}
                        </p>
                        {templates.map((template) => (
                          <CampaignTemplateRow
                            key={template.id}
                            template={template}
                            onApply={() => requestCampaignTemplate(template.id)}
                          />
                        ))}
                      </section>
                    ))}
                  </div>
                ) : null}

                {archivedFullPageStarters.length > 0 ? (
                  <div className="space-y-0.5">
                    <ArchiveSubsectionHeader title="Pages types" />
                    {archivedFullPageStarters.map((starter) => (
                      <TemplateListRow
                        key={starter.id}
                        label={starter.label}
                        description={starter.description}
                        meta={`${starter.blockTypes.length} blocs · page complète`}
                        icon={LayoutTemplate}
                        onApply={() => applyPageStarter(starter.blockTypes, 'replace')}
                        testId={`page-starter-card-${starter.id}`}
                        applyTestId={`page-starter-use-${starter.id}`}
                      />
                    ))}
                  </div>
                ) : null}

                {archivedSectionStarters.length > 0 ? (
                  <div className="space-y-0.5">
                    <ArchiveSubsectionHeader title={CATALOG_TIER_META.sectionStarters.title} />
                    {archivedSectionStarters.map((section) => (
                      <TemplateListRow
                        key={section.id}
                        label={section.label}
                        description={section.description}
                        meta={`${section.blockTypes.length} blocs · ajout au canevas`}
                        icon={Sparkles}
                        onApply={() => applyPageStarter(section.blockTypes, 'append')}
                        testId={`section-starter-card-${section.id}`}
                        applyTestId={`section-starter-use-${section.id}`}
                      />
                    ))}
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <p className="px-2 pt-1 text-xs text-zinc-600">
          {archivedCount} modèles archivés · clic ou icône baguette pour appliquer
        </p>
      </div>
    </ScrollArea>
  );
}
