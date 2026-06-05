import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import '../styles/builder-workspace.css';

type BuilderWorkspaceLayoutProps = {
  topbar: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
};

/**
 * Workspace canvas-first plein viewport (inspiré EditorStudioLayout).
 */
export function BuilderWorkspaceLayout({ topbar, banner, children }: BuilderWorkspaceLayoutProps) {
  return (
    <div
      className={cn(
        'builder-workspace flex h-[100dvh] min-h-0 w-full max-w-none flex-col overflow-hidden',
        'bg-background font-sans text-foreground',
      )}
    >
      {topbar}
      {banner ? (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {banner}
        </div>
      ) : null}
      <div className="builder-workspace__body min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
