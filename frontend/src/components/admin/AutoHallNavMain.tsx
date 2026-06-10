import {
  IconDashboard,
  IconLayoutGrid,
  IconPencil,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { NavLink, useMatch } from 'react-router-dom';

import type { StudioSession } from '@/lib/studio-session';
import { getStudioRoute } from '@/lib/landing-studio-routes';
import { studioNavState } from '@/lib/studio-session';
import {
  SidebarGroup,
  SidebarGroupContent,
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

function NavItem({
  to,
  title,
  icon: IconComponent,
  end,
}: {
  to: string;
  title: string;
  icon: Icon;
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

type AutoHallNavMainProps = {
  session: StudioSession | null;
};

export function AutoHallNavMain({ session }: AutoHallNavMainProps) {
  const studioButton = session ? (
    <SidebarMenuButton
      asChild
      tooltip="Ouvrir le Studio"
      className="min-w-8 ah-cta-primary duration-200 ease-linear hover:opacity-95 active:opacity-95"
    >
      <NavLink
        to={getStudioRoute(session.pageVersionId)}
        state={studioNavState(session)}
      >
        <IconPencil />
        <span>Ouvrir le Studio</span>
      </NavLink>
    </SidebarMenuButton>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarMenuButton
          disabled
          className="min-w-8 ah-cta-primary"
          aria-disabled
        >
          <IconPencil />
          <span>Studio indisponible</span>
        </SidebarMenuButton>
      </TooltipTrigger>
      <TooltipContent side="right">
        Ouvrez une version de landing pour activer le Studio.
      </TooltipContent>
    </Tooltip>
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {studioButton}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
