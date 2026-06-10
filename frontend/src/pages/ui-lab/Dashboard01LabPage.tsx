import type { CSSProperties } from 'react';

import { AppSidebar } from '@/ui-lab/dashboard-01/components/app-sidebar';
import { ChartAreaInteractive } from '@/ui-lab/dashboard-01/components/chart-area-interactive';
import { DataTable } from '@/ui-lab/dashboard-01/components/data-table';
import { SectionCards } from '@/ui-lab/dashboard-01/components/section-cards';
import { SiteHeader } from '@/ui-lab/dashboard-01/components/site-header';
import data from '@/ui-lab/dashboard-01/data.json';
import { SidebarInset, SidebarProvider } from '@/ui-lab/ui/sidebar';
import { Toaster } from '@/ui-lab/ui/sonner';
import { TooltipProvider } from '@/ui-lab/ui/tooltip';

import '@/ui-lab/styles/dashboard-01-theme.css';

export default function Dashboard01LabPage() {
  return (
    <div className="ui-lab-dashboard-01 dark">
      <TooltipProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <SectionCards />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                  <DataTable data={data} />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}
