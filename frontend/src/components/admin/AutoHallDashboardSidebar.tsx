import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';

import autoHallLogo from '@/assets/Logo_Auto_Hall-removebg-preview.png';

import { AutoHallNavMain } from '@/components/admin/AutoHallNavMain';
import { AutoHallNavSecondary } from '@/components/admin/AutoHallNavSecondary';
import { AutoHallNavUser } from '@/components/admin/AutoHallNavUser';
import type { AuthUser } from '@/lib/api';
import { readStudioSession } from '@/lib/studio-session';
import { useStudioSession } from '@/hooks/useStudioSession';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui-lab/ui/sidebar';

const DEFAULT_USER = {
  name: 'Administrateur Auto Hall',
  email: 'admin@autohall.local',
};

type AutoHallDashboardSidebarProps = {
  user: AuthUser | null;
};

export function AutoHallDashboardSidebar({
  user,
  ...props
}: AutoHallDashboardSidebarProps & ComponentProps<typeof Sidebar>) {
  const session = useStudioSession() ?? readStudioSession();
  const displayUser = user
    ? { name: user.fullName, email: user.email }
    : DEFAULT_USER;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="ah-target-brand">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:px-2! data-[slot=sidebar-menu-button]:py-2!"
            >
              <Link to="/dashboard">
                <span className="ah-brand-logo-wrap">
                  <img
                    src={autoHallLogo}
                    alt=""
                    className="ah-brand-logo"
                    width={36}
                    height={32}
                  />
                </span>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-base font-semibold">Auto Hall</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Landing Studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <AutoHallNavMain session={session} />
        <AutoHallNavSecondary className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <AutoHallNavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
