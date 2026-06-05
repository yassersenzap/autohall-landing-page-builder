import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, LayoutGrid, PenLine, Users } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStudioSession } from '@/hooks/useStudioSession';
import { readStudioSession, studioNavState as buildNavState } from '@/lib/studio-session';
import { getStudioRoute } from '@/lib/landing-studio-routes';
import { logoutClient, logoutRequest } from '../../lib/api';
import { ShadButton } from '../ui/primitives';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/campaigns', label: 'Campagnes', icon: LayoutGrid, end: false },
  { to: '/leads', label: 'Leads', icon: Users, end: false },
] as const;

type StudioShellProps = {
  children: ReactNode;
};

export default function StudioShell({ children }: StudioShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useStudioSession();
  const studioSession = session ?? readStudioSession();

  const shellClass = ['studio-shell'].filter(Boolean).join(' ');
  const contentClass = ['studio-content'].filter(Boolean).join(' ');

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // JWT stateless
    } finally {
      logoutClient();
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className={cn(shellClass, 'ah-mesh-app')}>
      <aside className="studio-sidebar" aria-label="Navigation principale">
        <div className="studio-sidebar__brand">
          <p className="studio-sidebar__logo">Auto Hall</p>
          <p className="studio-sidebar__title">Landing Studio</p>
          <p className="ah-caption mt-1">Production de landing pages</p>
        </div>

        <nav className="studio-sidebar__nav" aria-label="Menu">
          <p className="studio-sidebar__nav-label">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  ['studio-nav-link', isActive ? 'studio-nav-link--active' : '']
                    .filter(Boolean)
                    .join(' ')
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {item.label}
              </NavLink>
            );
          })}

          <p className="studio-sidebar__nav-label mt-4">Production</p>
          {studioSession ? (
            <NavLink
              to={getStudioRoute(studioSession.pageVersionId)}
              state={buildNavState(studioSession)}
              className={({ isActive }) =>
                [
                  'studio-nav-link studio-nav-link--studio',
                  isActive || location.pathname.includes('/studio')
                    ? 'studio-nav-link--active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <PenLine className="h-4 w-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">Ouvrir le Studio</span>
            </NavLink>
          ) : (
            <span
              className="studio-nav-link studio-nav-link--disabled"
              title="Ouvrez une version pour activer le Studio"
            >
              <PenLine className="h-4 w-4 shrink-0 opacity-40" aria-hidden />
              <span className="text-[var(--studio-sidebar-muted)]">Studio indisponible</span>
            </span>
          )}
        </nav>

        <div className="studio-sidebar__footer">
          <Link to="/" className="studio-sidebar__public-link">
            Accueil public
          </Link>
        </div>
      </aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <p className="ah-caption hidden sm:block">
            Auto Hall Landing Studio
          </p>
          <div className="studio-topbar__spacer" />
          <div className="studio-topbar__actions">
            <ThemeToggle />
            <ShadButton variant="secondary" size="sm" onClick={() => void handleLogout()}>
              Déconnexion
            </ShadButton>
          </div>
        </header>
        <div className={contentClass}>{children}</div>
      </div>
    </div>
  );
}
