import { Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getAdminRouteTitle } from '@/components/admin/admin-route-titles';
import { logoutClient, logoutRequest } from '@/lib/api';
import { useTargetTheme } from '@/ui-lab/autohall-dashboard-target/context/TargetThemeContext';
import { Button } from '@/ui-lab/ui/button';
import { Separator } from '@/ui-lab/ui/separator';
import { SidebarTrigger } from '@/ui-lab/ui/sidebar';

export function AutoHallAdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleMode } = useTargetTheme();
  const title = getAdminRouteTitle(location.pathname);
  const isLight = mode === 'light';

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
    <header className="ah-target-header flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={toggleMode}>
            {isLight ? (
              <Moon className="size-4" aria-hidden />
            ) : (
              <Sun className="size-4" aria-hidden />
            )}
            {isLight ? 'Sombre' : 'Clair'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
