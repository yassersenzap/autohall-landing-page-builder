import { LayoutTemplate, MousePointerClick } from 'lucide-react';

export function CanvasEmptyState() {
  return (
    <div
      className="v3-canvas-empty-wrap flex flex-col items-center justify-center h-full min-h-[500px] bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl m-8"
      data-builder-v3-empty
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200/80 text-neutral-500">
        <LayoutTemplate className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">Canvas prêt</h2>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        Le canvas est vide. Glissez un bloc depuis le panneau de gauche ou cliquez pour
        l&apos;ajouter.
      </p>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
        <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
        Astuce : un clic sur « Ajouter Hero » suffit
      </p>
    </div>
  );
}
