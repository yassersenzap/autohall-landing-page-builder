import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type StudioPageHeaderProps = {
  title: string;
  description?: string;
  backTo?: string;
  backState?: unknown;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

export function StudioPageHeader({
  title,
  description,
  backTo,
  backState,
  backLabel = 'Retour',
  actions,
  className,
}: StudioPageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 space-y-1">
        {backTo ? (
          <Link
            to={backTo}
            state={backState}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="ah-page-title">{title}</h1>
        {description ? <p className="ah-muted mt-1 max-w-2xl">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
