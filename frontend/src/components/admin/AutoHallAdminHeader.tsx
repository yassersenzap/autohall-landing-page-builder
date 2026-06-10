import { useLocation, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/components/studio/ThemeToggle';
import { logoutClient, logoutRequest } from '@/lib/api';
import { getAdminRouteTitle } from '@/components/admin/admin-route-titles';
import { Button } from '@/ui-lab/ui/button';
import { Separator } from '@/ui-lab/ui/separator';
import { SidebarTrigger } from '@/ui-lab/ui/sidebar';

export function AutoHallAdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getAdminRouteTitle(location.pathname);

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
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
