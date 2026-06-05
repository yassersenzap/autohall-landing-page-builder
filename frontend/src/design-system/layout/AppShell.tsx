import type { ReactNode } from 'react';
import { LayoutDashboard, LayoutGrid, PenLine, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStudioSession } from '@/hooks/useStudioSession';
import { readStudioSession, studioNavState as buildNavState } from '@/lib/studio-session';
import { getStudioRoute } from '@/lib/landing-studio-routes';
import { logoutClient, logoutRequest } from '@/lib/api';
import { ShadButton } from '@/components/ui/primitives';
import { ThemeToggle } from '@/components/studio/ThemeToggle';
import { SidebarNavItem } from './SidebarNavItem';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/campaigns', label: 'Campagnes', icon: LayoutGrid, end: false },
  { to: '/leads', label: 'Leads', icon: Users, end: false },
] as const;

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useStudioSession();
  const studioSession = session ?? readStudioSession();

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
    <div className="ds-app">
      <aside className="ds-sidebar" aria-label="Navigation principale">
        <div className="ds-sidebar__brand">
          <span className="ds-sidebar__mark" aria-hidden>
            AH
          </span>
          <div className="ds-sidebar__brand-text">
            <p className="ds-sidebar__brand-name">Auto Hall</p>
            <p className="ds-sidebar__brand-sub">Landing Studio</p>
          </div>
        </div>

        <nav className="ds-sidebar__nav" aria-label="Menu">
          <p className="ds-sidebar__label">Navigation</p>
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              end={item.end}
            />
          ))}

          <p className="ds-sidebar__label mt-4">Production</p>
          {studioSession ? (
            <SidebarNavItem
              to={getStudioRoute(studioSession.pageVersionId)}
              label="Ouvrir le Studio"
              icon={PenLine}
              variant="studio"
              state={buildNavState(studioSession)}
              forceActive={
                location.pathname.includes('/studio') &&
                !location.pathname.includes('/studio/preview')
              }
            />
          ) : (
            <span
              className="ds-nav-item pointer-events-none opacity-50"
              title="Ouvrez une version pour activer le Studio"
            >
              <span className="ds-nav-item__icon-box opacity-40">
                <PenLine className="ds-nav-item__icon" aria-hidden />
              </span>
              <span>Studio indisponible</span>
            </span>
          )}
        </nav>

        <div className="ds-sidebar__footer">
          <Link to="/" className="ds-muted text-sm hover:text-[var(--color-text)]">
            Accueil public
          </Link>
        </div>
      </aside>

      <div className="ds-main">
        <header className="ds-topbar">
          <p className="ds-topbar__brand hidden sm:block">Auto Hall Landing Studio</p>
          <div className="ds-topbar__spacer" />
          <div className="ds-topbar__actions">
            <ThemeToggle />
            <ShadButton variant="secondary" size="sm" onClick={() => void handleLogout()}>
              Déconnexion
            </ShadButton>
          </div>
        </header>
        <div className="ds-content">{children}</div>
      </div>
    </div>
  );
}
