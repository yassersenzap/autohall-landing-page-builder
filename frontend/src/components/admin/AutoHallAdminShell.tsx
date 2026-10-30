import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import { meRequest, type AuthUser } from '@/lib/api';
import { AutoHallAdminHeader } from '@/components/admin/AutoHallAdminHeader';
import { AutoHallDashboardSidebar } from '@/components/admin/AutoHallDashboardSidebar';
import {
  TargetThemeProvider,
  useTargetTheme,
} from '@/components/admin/TargetThemeContext';
import { SidebarInset, SidebarProvider } from '@/components/ui/shadcn/sidebar';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';

import '@/components/admin/admin-theme.css';

type AutoHallAdminShellProps = {
  children: ReactNode;
};

function AutoHallAdminShellInner({
  children,
  user,
}: AutoHallAdminShellProps & { user: AuthUser | null }) {
  const { mode } = useTargetTheme();

  return (
    <div
      className="auto-hall-admin-shell"
      data-ah-target-theme={mode}
    >
      <TooltipProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as CSSProperties
          }
        >
          <AutoHallDashboardSidebar user={user} variant="inset" />
          <SidebarInset>
            <AutoHallAdminHeader />
            <div className="ah-target-main flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}

export function AutoHallAdminShell({ children }: AutoHallAdminShellProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    void meRequest()
      .then((response) => {
        if (!cancelled) setUser(response.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TargetThemeProvider>
      <AutoHallAdminShellInner user={user}>{children}</AutoHallAdminShellInner>
    </TargetThemeProvider>
  );
}
