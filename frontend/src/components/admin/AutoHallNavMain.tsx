import {
  IconDashboard,
  IconLayoutGrid,
  IconPencil,
  IconUserCog,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { NavLink, useMatch } from 'react-router-dom';

import type { AuthUser } from '@/lib/api';
import { Permission, hasPermission } from '@/lib/permissions';
import type { StudioSession } from '@/lib/studio-session';
import { getStudioRoute } from '@/lib/landing-studio-routes';
import { studioNavState } from '@/lib/studio-session';
import { STUDIO_EMPTY_MESSAGE } from '@/lib/studio-entry';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/shadcn/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';

const NAV_ITEMS: { to: string; title: string; icon: Icon; end: boolean; permission?: string }[] = [
  { to: '/dashboard',  title: 'Tableau de bord', icon: IconDashboard,    end: true },
  { to: '/campaigns',  title: 'Campagnes',        icon: IconLayoutGrid,   end: false, permission: Permission.MANAGE_CAMPAIGNS },
  { to: '/leads',      title: 'Leads',            icon: IconUsers,        end: false, permission: Permission.VIEW_LEADS },
];

const ADMIN_NAV_ITEMS: { to: string; title: string; icon: Icon }[] = [
  { to: '/admin/users', title: 'Utilisateurs', icon: IconUserCog },
];

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
  loading?: boolean;
  user?: AuthUser | null;
};

export function AutoHallNavMain({ session, loading = false, user }: AutoHallNavMainProps) {
  const canAccessStudio =
    hasPermission(user ?? null, Permission.CREATE_PAGE) ||
    hasPermission(user ?? null, Permission.EDIT_PAGE) ||
    hasPermission(user ?? null, Permission.PREVIEW_PAGE);

  const isAdmin = hasPermission(user ?? null, Permission.MANAGE_USERS);

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user ?? null, item.permission as any),
  );

  const studioButton = !canAccessStudio ? null : loading ? (
    <SidebarMenuButton
      disabled
      className="ah-sidebar-studio-cta min-w-8"
      aria-disabled
    >
      <IconPencil className="ah-brand-accent-icon" />
      <span>Chargement du Studio…</span>
    </SidebarMenuButton>
  ) : session ? (
    <SidebarMenuButton
      asChild
      tooltip="Ouvrir le Studio"
      className="ah-sidebar-studio-cta min-w-8 duration-200 ease-linear"
    >
      <NavLink
        to={getStudioRoute(session.pageVersionId)}
        state={studioNavState(session)}
      >
        <IconPencil className="ah-brand-accent-icon" />
        <span>Ouvrir le Studio</span>
      </NavLink>
    </SidebarMenuButton>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarMenuButton
          disabled
          className="ah-sidebar-studio-cta min-w-8"
          aria-disabled
        >
          <IconPencil className="ah-brand-accent-icon" />
          <span>Aucune version</span>
        </SidebarMenuButton>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        {STUDIO_EMPTY_MESSAGE}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          {studioButton && (
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                {studioButton}
              </SidebarMenuItem>
            </SidebarMenu>
          )}
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavItem key={item.to} to={item.to} title={item.title} icon={item.icon} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
