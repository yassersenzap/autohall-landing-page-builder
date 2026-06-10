import type { ComponentProps } from 'react';
import {
  IconDashboard,
  IconHome,
  IconLayoutGrid,
  IconPencil,
  IconUsers,
} from '@tabler/icons-react';
import { Link, NavLink, useMatch } from 'react-router-dom';

import autoHallLogo from '@/assets/Logo_Auto_Hall-removebg-preview.png';

import { AutoHallTargetNavUser } from '@/ui-lab/autohall-dashboard-target/components/AutoHallTargetNavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui-lab/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/ui-lab/ui/tooltip';

const NAV_ITEMS = [
  { to: '/dashboard', title: 'Tableau de bord', icon: IconDashboard, end: true },
  { to: '/campaigns', title: 'Campagnes', icon: IconLayoutGrid, end: false },
  { to: '/leads', title: 'Leads', icon: IconUsers, end: false },
] as const;

function TargetNavItem({
  to,
  title,
  icon: IconComponent,
  end,
}: {
  to: string;
  title: string;
  icon: typeof IconDashboard;
  end?: boolean;
}) {
  const match = useMatch({ path: to, end: end ?? false });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={Boolean(match)} tooltip={title}>
        <NavLink to={to} end={end}>
          <IconComponent />
          <span>{title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AutoHallTargetSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="ah-target-brand">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:px-2! data-[slot=sidebar-menu-button]:py-2!"
            >
              <Link to="/ui-lab/autohall-dashboard-target">
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
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      disabled
                      className="ah-sidebar-studio-cta min-w-8 duration-200 ease-linear"
                      aria-disabled
                    >
                      <IconPencil className="ah-brand-accent-icon" />
                      <span>Ouvrir le Studio</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Cible visuelle — connectez-vous pour ouvrir le Studio.
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <TargetNavItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Accueil public">
                  <Link to="/">
                    <IconHome />
                    <span>Accueil public</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <AutoHallTargetNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
