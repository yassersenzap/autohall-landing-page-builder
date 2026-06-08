import { LayoutTemplate, Sparkles } from 'lucide-react';
import {
  getFullPageStarters,
  getSectionStarters,
} from '@/features/builder-engine/foundation/page-starters';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ShadButton } from '@/components/ui/primitives';

export function CanvasEmptyState() {
  const applyPageStarter = useBuilderDocumentStore((s) => s.applyPageStarter);
  const fullStarters = getFullPageStarters().slice(0, 3);

  return (
    <div
      className="v3-canvas-empty-wrap m-8 flex min-h-[500px] h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 text-center"
      data-builder-v3-empty
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200/80 text-neutral-500">
        <LayoutTemplate className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">Commencez votre landing page</h2>
      <p className="mt-2 max-w-lg text-sm text-neutral-600">
        Choisissez un gabarit métier Auto Hall ou parcourez le catalogue à gauche pour
        composer section par section.
      </p>

      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-3">
        {fullStarters.map((starter) => (
          <button
            key={starter.id}
            type="button"
            onClick={() => applyPageStarter(starter.blockTypes, 'replace')}
            className="rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
          >
            <Sparkles className="mb-2 h-4 w-4 text-blue-600" aria-hidden />
            <p className="text-sm font-semibold text-neutral-900">{starter.label}</p>
            <p className="mt-1 text-xs text-neutral-500 line-clamp-3">{starter.description}</p>
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        Ou glissez un module depuis le catalogue · {getSectionStarters().length} sections
        prêtes à insérer
      </p>

      <ShadButton
        type="button"
        variant="secondary"
        className="mt-4 border-neutral-300 text-neutral-700"
        onClick={() =>
          applyPageStarter(getSectionStarters()[0]?.blockTypes ?? ['hero_campaign'], 'append')
        }
      >
        Insérer une section essai véhicule
      </ShadButton>
    </div>
  );
}
