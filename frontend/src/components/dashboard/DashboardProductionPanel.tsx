import { IconDownload, IconEye, IconPencil } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { ADMIN_CONTENT_PAD } from '@/components/admin/admin-layout';
import { STUDIO_EMPTY_MESSAGE } from '@/lib/studio-entry';
import type { StudioSession } from '@/lib/studio-session';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import { studioNavState } from '@/lib/studio-session';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';

type DashboardProductionPanelProps = {
  session: StudioSession | null;
  loading?: boolean;
  exporting: boolean;
  onExport: () => void;
};

function sessionSummary(session: StudioSession): string {
  const parts = [
    session.campaignName,
    session.landingPageTitle,
    session.label,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : session.label;
}

export function DashboardProductionPanel({
  session,
  loading = false,
  exporting,
  onExport,
}: DashboardProductionPanelProps) {
  return (
    <div className={ADMIN_CONTENT_PAD}>
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Session Studio</CardTitle>
          <CardDescription>
            {loading
              ? 'Recherche d’une version disponible…'
              : session
                ? sessionSummary(session)
                : STUDIO_EMPTY_MESSAGE}
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
                    Ouvrir le Studio
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
            {loading
              ? 'Connexion au backend pour détecter les versions existantes.'
              : session
                ? 'Reprenez l’édition de la landing ou exportez le package ZIP de la version courante.'
                : STUDIO_EMPTY_MESSAGE}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
