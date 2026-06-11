import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StudioCanvasPlaceholderProps = {
  className?: string;
  message?: string;
  detail?: string;
};

/** Lightweight skeleton shown while the document or iframe canvas is booting. */
export function StudioCanvasPlaceholder({
  className,
  message = 'Chargement du canvas…',
  detail = 'Préparation des styles et du document',
}: StudioCanvasPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[720px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-8',
        className,
      )}
      data-testid="studio-canvas-placeholder"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex w-full max-w-md flex-col gap-3">
        <div className="h-3 w-2/5 animate-pulse rounded bg-neutral-800" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-neutral-800/80" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 animate-pulse rounded bg-neutral-800/60" />
          <div className="h-16 animate-pulse rounded bg-neutral-800/60" />
          <div className="h-16 animate-pulse rounded bg-neutral-800/60" />
        </div>
        <div className="h-32 w-full animate-pulse rounded-lg bg-neutral-800/70" />
      </div>
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>{message}</span>
      </div>
      {detail ? <p className="text-xs text-neutral-600">{detail}</p> : null}
    </div>
  );
}
