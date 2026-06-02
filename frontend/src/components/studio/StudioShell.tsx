import type { ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logoutClient, logoutRequest } from '../../lib/api';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau de bord', end: true },
  { to: '/campaigns', label: 'Campagnes', end: false },
  { to: '/leads', label: 'Leads', end: false },
] as const;

type StudioShellProps = {
  children: ReactNode;
};

export default function StudioShell({ children }: StudioShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isPreview = location.pathname.includes('/preview');
  const shellClass = ['studio-shell', isPreview ? 'studio-shell--focus' : '']
    .filter(Boolean)
    .join(' ');

  const contentClass = [
    'studio-content',
    isPreview ? 'studio-content--wide studio-content--flush' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
    <div className={shellClass}>
      <aside className="studio-sidebar" aria-label="Navigation principale">
        <div className="studio-sidebar__brand">
          <p className="studio-sidebar__logo">Auto Hall</p>
          <p className="studio-sidebar__title">LP Builder Studio</p>
        </div>
        <nav className="studio-sidebar__nav" aria-label="Menu studio">
          <p className="studio-sidebar__nav-label">Menu</p>
          {NAV_ITEMS.map((item) => (
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
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="studio-sidebar__footer">
          <Link to="/" className="studio-sidebar__public-link">
            Accueil public
          </Link>
        </div>
      </aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <div className="studio-topbar__spacer" />
          <div className="studio-topbar__actions">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={() => void handleLogout()}>
              Déconnexion
            </Button>
          </div>
        </header>
        <div className={contentClass}>{children}</div>
      </div>
    </div>
  );
}
