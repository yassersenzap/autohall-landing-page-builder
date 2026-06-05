import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShadButton } from '@/components/ui/primitives';

type StudioV2LoadErrorProps = {
  backTo: string;
  backLabel: string;
  backState?: Record<string, unknown>;
  message: string;
  onRetry: () => void;
};

export function StudioV2LoadError({
  backTo,
  backLabel,
  backState,
  message,
  onRetry,
}: StudioV2LoadErrorProps) {
  return (
    <div className="visual-studio-v2-load-error">
      <h2 className="text-base font-semibold text-foreground">
        Impossible de charger la landing
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ShadButton type="button" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Réessayer
        </ShadButton>
        <Link to={backTo} state={backState}>
          <ShadButton type="button" size="sm" variant="secondary">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {backLabel}
          </ShadButton>
        </Link>
      </div>
    </div>
  );
}
