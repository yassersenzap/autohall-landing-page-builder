import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EditorStudioLayoutProps = {
  topbar: ReactNode;
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  banner?: ReactNode;
};

export function EditorStudioLayout({ topbar, left, center, right, banner }: EditorStudioLayoutProps) {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background font-sans text-foreground">
      {topbar}
      {banner ? (
        <div className="shrink-0 border-b border-border bg-destructive/10 px-4 py-2">{banner}</div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)_20rem] xl:grid-cols-[19rem_minmax(0,1fr)_22rem]">
        {left}
        <main className="relative min-h-0 min-w-0 bg-canvas" aria-label="Canvas">
          {center}
        </main>
        {right}
      </div>
    </div>
  );
}

export function EditorPanel({
  children,
  className,
  side = 'left',
}: {
  children: ReactNode;
  className?: string;
  side?: 'left' | 'right';
}) {
  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col border-border bg-builder',
        side === 'left' ? 'border-r' : 'border-l',
        'max-lg:max-h-48 max-lg:border-b max-lg:border-r-0',
        side === 'right' && 'max-lg:max-h-52 max-lg:border-t max-lg:border-l-0',
        className,
      )}
    >
      {children}
    </aside>
  );
}
