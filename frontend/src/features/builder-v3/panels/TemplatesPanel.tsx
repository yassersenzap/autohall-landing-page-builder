import { LayoutTemplate, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  CATALOG_TIER_META,
} from '@/features/builder-engine/foundation/catalog-tiers';
import {
  getFullPageStarters,
  getSectionStarters,
} from '@/features/builder-engine/foundation/page-starters';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ScrollArea, Separator } from '@/components/ui/primitives';

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

export function TemplatesPanel() {
  const applyPageStarter = useBuilderDocumentStore((s) => s.applyPageStarter);

  return (
    <ScrollArea className="h-full min-h-0" data-testid="studio-templates-panel">
      <div className="space-y-4 p-3 pb-6">
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
              onClick={() => applyPageStarter(section.blockTypes, 'append')}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
