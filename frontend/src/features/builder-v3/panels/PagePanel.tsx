import { Settings } from 'lucide-react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ShadButton, ScrollArea } from '@/components/ui/primitives';

type PagePanelProps = {
  onOpenPageSettings?: () => void;
};

export function PagePanel({ onOpenPageSettings }: PagePanelProps) {
  const pageSettings = useBuilderDocumentStore((s) => s.pageSettings);
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);
  const blocks = useBuilderDocumentStore((s) => s.blocks);

  return (
    <ScrollArea className="h-full min-h-0" data-testid="studio-page-panel">
      <div className="space-y-4 p-4 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Page</p>
          <p className="mt-1 text-sm font-medium text-neutral-200">
            {pageSettings.metaTitle || 'Sans titre SEO'}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {blocks.length} section{blocks.length === 1 ? '' : 's'} sur le canvas
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-xs text-neutral-400">
          <p>
            <span className="text-neutral-500">Couleur primaire · </span>
            <span className="font-mono text-neutral-300">{pageTheme.primaryColor}</span>
          </p>
          {pageSettings.metaDescription ? (
            <p className="mt-2 line-clamp-3 text-neutral-500">{pageSettings.metaDescription}</p>
          ) : (
            <p className="mt-2 text-neutral-600">Aucune meta description définie.</p>
          )}
        </div>

        {onOpenPageSettings ? (
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="w-full border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
            onClick={onOpenPageSettings}
          >
            <Settings className="mr-2 h-3.5 w-3.5" aria-hidden />
            Paramètres de la page
          </ShadButton>
        ) : null}

        <p className="text-[0.625rem] leading-relaxed text-neutral-600">
          SEO, favicon et image Open Graph se configurent dans les paramètres page (barre supérieure).
        </p>
      </div>
    </ScrollArea>
  );
}
