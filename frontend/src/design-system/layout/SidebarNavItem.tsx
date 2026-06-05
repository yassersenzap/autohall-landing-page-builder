import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  variant?: 'default' | 'studio';
  state?: unknown;
  forceActive?: boolean;
};

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  end,
  variant = 'default',
  state,
  forceActive,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      state={state}
      className={({ isActive }) =>
        cn(
          'ds-nav-item',
          variant === 'studio' && 'ds-nav-item--studio',
          (forceActive ?? isActive) && 'ds-nav-item--active',
        )
      }
    >
      <span className="ds-nav-item__icon-box" aria-hidden>
        <Icon className="ds-nav-item__icon" />
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </NavLink>
  );
}
