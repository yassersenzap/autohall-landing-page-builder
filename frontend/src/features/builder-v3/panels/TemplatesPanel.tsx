import { useState } from 'react';
import { AlertTriangle, LayoutTemplate, Sparkles, Wand2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATALOG_TIER_META } from '@/features/builder-engine/foundation/catalog-tiers';
import {
  countPremiumBlocks,
  getCampaignPageTemplateById,
  getCampaignPageTemplates,
  getGroupedCampaignPageTemplates,
  templateHasMotion,
} from '@/features/builder-engine/foundation/campaign-page-templates';
import type { CampaignPageTemplate } from '@/features/builder-engine/foundation/campaign-page-templates.types';
import { getCoreCampaignTemplates } from '@/features/builder-engine/foundation/core-campaign-templates';
import {
  getFullPageStarters,
  getSectionStarters,
} from '@/features/builder-engine/foundation/page-starters';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { getPageBrandTheme, resolvePageBrandThemeId } from '@/features/builder/brand-presets/brand-theme-presets';
import { ScrollArea, Separator, ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import {
  TemplateThumbnailPreview,
  templateCategoryLabel,
} from './template-thumbnail';

function TierHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-0.5 px-1">
      <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </p>
      <p className="text-[0.625rem] leading-relaxed text-neutral-600">{description}</p>
    </div>
  );
}

function StarterCard({
  label,
  description,
  icon: Icon,
  onClick,
  actionLabel,
}: {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  actionLabel?: string;
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
      {actionLabel ? (
        <p className="mt-2 text-[0.6875rem] font-medium text-blue-400/90">{actionLabel}</p>
      ) : null}
    </button>
  );
}

function brandBadgeLabel(brandId: CampaignPageTemplate['brandId']): string {
  if (brandId === 'autohall') return 'Auto Hall';
  return brandId.charAt(0).toUpperCase() + brandId.slice(1).replace('_', ' ');
}

function CoreTemplateCard({
  template,
  onUse,
}: {
  template: CampaignPageTemplate;
  onUse: () => void;
}) {
  const theme = getPageBrandTheme(resolvePageBrandThemeId(template.brandId));

  return (
    <article
      className="overflow-hidden rounded-xl border border-blue-500/20 bg-neutral-950/60 shadow-sm transition hover:border-blue-500/40"
      data-testid={`core-template-card-${template.id}`}
    >
      <div className="space-y-3 p-3">
        <TemplateThumbnailPreview template={template} />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-sm font-medium text-neutral-100">{template.name}</h4>
            <span
              className="rounded-full px-2 py-0.5 text-[0.625rem] font-medium"
              style={{ backgroundColor: theme.primarySoft, color: theme.primaryColor }}
            >
              {brandBadgeLabel(template.brandId)}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-500">{template.description}</p>
          <p className="text-[0.6875rem] text-neutral-600">
            <span className="font-medium text-neutral-500">Usage · </span>
            {template.recommendedUse}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-800/80 px-3 py-2.5">
        <span className="text-[0.625rem] text-neutral-600">Image + formulaire · {template.blocks.length} blocs</span>
        <ShadButton
          type="button"
          size="sm"
          className="h-7 shrink-0 px-2.5 text-xs"
          onClick={onUse}
          data-testid={`core-template-use-${template.id}`}
        >
          Utiliser
        </ShadButton>
      </div>
    </article>
  );
}

function ExtendedTemplateCard({
  template,
  onUse,
}: {
  template: CampaignPageTemplate;
  onUse: () => void;
}) {
  const theme = getPageBrandTheme(resolvePageBrandThemeId(template.brandId));
  const premiumCount = countPremiumBlocks(template);
  const motionReady = templateHasMotion(template);

  return (
    <article
      className="overflow-hidden rounded-xl border border-neutral-800/90 bg-neutral-950/60 shadow-sm transition hover:border-neutral-700"
      data-testid={`campaign-template-card-${template.id}`}
    >
      <div className="space-y-3 p-3">
        <TemplateThumbnailPreview template={template} />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-sm font-medium text-neutral-100">{template.name}</h4>
            <span
              className="rounded-full px-2 py-0.5 text-[0.625rem] font-medium"
              style={{ backgroundColor: theme.primarySoft, color: theme.primaryColor }}
            >
              Marque · {brandBadgeLabel(template.brandId)}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-500">{template.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[0.625rem] text-neutral-500">
          <span className="rounded-md border border-neutral-800 px-2 py-1">
            {templateCategoryLabel(template.category)}
          </span>
          <span className="rounded-md border border-neutral-800 px-2 py-1">
            {template.blocks.length} blocs
          </span>
          {premiumCount > 0 ? (
            <span className="rounded-md border border-neutral-800 px-2 py-1 text-neutral-600">
              +{premiumCount} premium
            </span>
          ) : null}
          {motionReady ? (
            <span className="rounded-md border border-neutral-800 px-2 py-1 text-neutral-600">
              Motion
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-neutral-800/80 px-3 py-2.5">
        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 shrink-0 px-2.5 text-xs border-neutral-700"
          onClick={onUse}
          data-testid={`campaign-template-use-${template.id}`}
        >
          Utiliser
        </ShadButton>
      </div>
    </article>
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

  const coreTemplates = getCoreCampaignTemplates();
  const templateGroups = getGroupedCampaignPageTemplates();

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
    <ScrollArea className="h-full min-h-0" data-testid="studio-templates-panel">
      <div className="space-y-4 p-3 pb-6">
        {pendingTemplate ? (
          <div
            className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3"
            data-testid="campaign-template-replace-warning"
          >
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">Remplacer le contenu actuel ?</p>
                <p className="text-xs leading-relaxed text-amber-200/80">
                  Le template « {pendingTemplate.name} » remplacera les {blocks.length} bloc
                  {blocks.length > 1 ? 's' : ''} du canevas.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ShadButton
                type="button"
                size="sm"
                className="h-8 flex-1 text-xs"
                onClick={confirmReplaceTemplate}
                data-testid="campaign-template-confirm-replace"
              >
                Remplacer et appliquer
              </ShadButton>
              <ShadButton
                type="button"
                size="sm"
                variant="secondary"
                className={cn('h-8 flex-1 text-xs border-neutral-700')}
                onClick={() => setPendingTemplateId(null)}
                data-testid="campaign-template-cancel-replace"
              >
                Annuler
              </ShadButton>
            </div>
          </div>
        ) : null}

        <div className="space-y-2.5" data-testid="core-campaign-templates">
          <TierHeader
            title={CATALOG_TIER_META.coreTemplates.title}
            description={CATALOG_TIER_META.coreTemplates.description}
          />
          {coreTemplates.map((template) => (
            <CoreTemplateCard
              key={template.id}
              template={template}
              onUse={() => requestCampaignTemplate(template.id)}
            />
          ))}
        </div>

        <Separator className="bg-neutral-800" />

        <div className="space-y-4" data-testid="campaign-templates-by-use-case">
          <TierHeader
            title={CATALOG_TIER_META.campaignTemplates.title}
            description={CATALOG_TIER_META.campaignTemplates.description}
          />
          {templateGroups.map(({ group, templates }) => (
            <section
              key={group.id}
              className="space-y-2.5"
              data-testid={`template-use-case-group-${group.id}`}
            >
              <TierHeader title={group.label} description={group.description} />
              {templates.map((template) => (
                <ExtendedTemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => requestCampaignTemplate(template.id)}
                />
              ))}
            </section>
          ))}
          <p className="px-1 text-[0.625rem] text-neutral-600">
            {getCampaignPageTemplates().length} templates étendus disponibles
          </p>
        </div>

        <Separator className="bg-neutral-800" />

        <div className="space-y-2">
          <TierHeader
            title={CATALOG_TIER_META.starters.title}
            description={CATALOG_TIER_META.starters.description}
          />
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
          <TierHeader
            title={CATALOG_TIER_META.sectionStarters.title}
            description={CATALOG_TIER_META.sectionStarters.description}
          />
          {getSectionStarters().map((section) => (
            <StarterCard
              key={section.id}
              label={section.label}
              description={section.description}
              icon={Sparkles}
              actionLabel="Ajouter au canevas"
              onClick={() => applyPageStarter(section.blockTypes, 'append')}
            />
          ))}
        </div>

        {blocks.length === 0 ? (
          <p
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-800 px-3 py-2 text-xs text-neutral-500"
            data-testid="templates-empty-page-hint"
          >
            <Wand2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Page vide — choisissez une landing métier image + formulaire pour démarrer.
          </p>
        ) : null}
      </div>
    </ScrollArea>
  );
}
