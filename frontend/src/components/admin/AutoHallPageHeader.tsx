import type { ReactNode } from 'react';

type AutoHallPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AutoHallPageHeader({
  title,
  description,
  actions,
}: AutoHallPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between lg:px-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
