import type { ComponentPropsWithoutRef } from 'react';
import { IconHome, type Icon } from '@tabler/icons-react';
import { NavLink, useMatch } from 'react-router-dom';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/shadcn/sidebar';

const SECONDARY_ITEMS = [
  { to: '/', title: 'Accueil public', icon: IconHome, end: true },
] as const;

function SecondaryItem({
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

export function AutoHallNavSecondary(
  props: ComponentPropsWithoutRef<typeof SidebarGroup>,
) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {SECONDARY_ITEMS.map((item) => (
            <SecondaryItem key={item.to} {...item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
