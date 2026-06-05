import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CommandHeroProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function CommandHero({ title, description, actions, className }: CommandHeroProps) {
  return (
    <section className={cn('ds-command-hero', className)} aria-label="Centre de commande">
      <div className="ds-command-hero__grid">
        <div className="min-w-0 flex-1">
          <h1 className="ds-display">{title}</h1>
          {description ? <p className="ds-muted mt-2 max-w-2xl">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
