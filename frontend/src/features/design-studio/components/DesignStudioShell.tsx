import type { ReactNode } from 'react';

type DesignStudioShellProps = {
  topbar: ReactNode;
  children: ReactNode;
};

export function DesignStudioShell({ topbar, children }: DesignStudioShellProps) {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      {topbar}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
