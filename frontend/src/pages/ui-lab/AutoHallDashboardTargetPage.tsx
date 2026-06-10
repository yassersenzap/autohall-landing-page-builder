import type { CSSProperties } from 'react';

import { AutoHallTargetCards } from '@/ui-lab/autohall-dashboard-target/components/AutoHallTargetCards';
import { AutoHallTargetChart } from '@/ui-lab/autohall-dashboard-target/components/AutoHallTargetChart';
import { AutoHallTargetHeader } from '@/ui-lab/autohall-dashboard-target/components/AutoHallTargetHeader';
import { AutoHallTargetSidebar } from '@/ui-lab/autohall-dashboard-target/components/AutoHallTargetSidebar';
import { AutoHallTargetTable } from '@/ui-lab/autohall-dashboard-target/components/AutoHallTargetTable';
import {
  TargetThemeProvider,
  useTargetTheme,
} from '@/ui-lab/autohall-dashboard-target/context/TargetThemeContext';
import { SidebarInset, SidebarProvider } from '@/ui-lab/ui/sidebar';
import { TooltipProvider } from '@/ui-lab/ui/tooltip';

import '@/ui-lab/autohall-dashboard-target/styles/target-theme.css';

function AutoHallDashboardTargetShell() {
  const { mode } = useTargetTheme();

  return (
    <div
      className="ui-lab-autohall-dashboard-target"
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
          <AutoHallTargetSidebar variant="inset" />
          <SidebarInset>
            <AutoHallTargetHeader />
            <div className="ah-target-main flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <AutoHallTargetCards />
                  <div className="px-4 lg:px-6">
                    <AutoHallTargetChart />
                  </div>
                  <AutoHallTargetTable />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}

export default function AutoHallDashboardTargetPage() {
  return (
    <TargetThemeProvider>
      <AutoHallDashboardTargetShell />
    </TargetThemeProvider>
  );
}
