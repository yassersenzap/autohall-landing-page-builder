import { IconDownload, IconEye, IconPencil } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { DASHBOARD01_CONTENT_PAD } from '@/components/admin/dashboard01-layout';
import type { StudioSession } from '@/lib/studio-session';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import { studioNavState } from '@/lib/studio-session';
import { Button } from '@/ui-lab/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui-lab/ui/card';

type DashboardProductionPanelProps = {
  session: StudioSession | null;
  exporting: boolean;
  onExport: () => void;
};

export function DashboardProductionPanel({
  session,
  exporting,
  onExport,
}: DashboardProductionPanelProps) {
  return (
    <div className={DASHBOARD01_CONTENT_PAD}>
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Production en cours</CardTitle>
          <CardDescription>
            {session
              ? `Version active : ${session.label}`
              : 'Aucune session Studio active.'}
          </CardDescription>
          {session ? (
            <CardAction>
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  size="sm"
                  className="ah-cta-primary border-0 hover:opacity-95"
                >
                  <Link
                    to={getStudioRoute(session.pageVersionId)}
                    state={studioNavState(session)}
                  >
                    <IconPencil className="size-4" />
                    Studio
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={getPreviewRoute(session.pageVersionId)}>
                    <IconEye className="size-4" />
                    Aperçu
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exporting}
                  onClick={onExport}
                >
                  <IconDownload className="size-4" />
                  {exporting ? 'Export…' : 'Export ZIP'}
                </Button>
              </div>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {session
              ? 'Reprenez l’édition de la landing ou exportez le package ZIP de la version courante.'
              : 'Créez une campagne, une landing page et une version pour activer le Studio.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
