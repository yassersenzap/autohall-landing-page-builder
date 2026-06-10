import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTargetTheme } from '@/ui-lab/autohall-dashboard-target/context/TargetThemeContext';
import { Button } from '@/ui-lab/ui/button';
import { Separator } from '@/ui-lab/ui/separator';
import { SidebarTrigger } from '@/ui-lab/ui/sidebar';

export function AutoHallTargetHeader() {
  const { mode, toggleMode } = useTargetTheme();
  const isLight = mode === 'light';

  return (
    <header className="ah-target-header flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Tableau de bord</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={toggleMode}>
            {isLight ? (
              <Moon className="size-4" aria-hidden />
            ) : (
              <Sun className="size-4" aria-hidden />
            )}
            {isLight ? 'Sombre' : 'Clair'}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Déconnexion</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
