import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, ExternalLink, PenLine, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants, ShadButton } from '@/components/ui/primitives';
import { StatusBadge } from '@/components/ui/primitives/status-badge';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import type { StudioSession } from '@/lib/studio-session';
import { studioNavState } from '@/lib/studio-session';
import { cn } from '@/lib/utils';
import type { CampaignListItem } from '@/lib/campaigns';
import { downloadStudioV2Export } from '@/features/visual-studio-v2/api/studio-v2-preview.api';

function optionalCount(source: CampaignListItem, key: 'landingPagesCount' | 'versionsCount'): number | null {
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function createCampaignsTableColumns(
  studioSession: StudioSession | null,
): ColumnDef<CampaignListItem>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Campagne',
      cell: ({ row }) => (
        <div className="min-w-[10rem]">
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.campaignType}</p>
        </div>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Marque',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.brand}
          {row.original.model ? (
            <span className="text-muted-foreground"> · {row.original.model}</span>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} kind="campaign" />,
      filterFn: (row, id, value) => {
        const v = String(value).toLowerCase();
        return row.getValue<string>(id).toLowerCase().includes(v);
      },
    },
    {
      id: 'landingPagesCount',
      header: 'Landings',
      accessorFn: (row) => optionalCount(row, 'landingPagesCount') ?? -1,
      cell: ({ row }) => {
        const n = optionalCount(row.original, 'landingPagesCount');
        return (
          <span className="tabular-nums text-sm text-muted-foreground">{n ?? '—'}</span>
        );
      },
    },
    {
      id: 'versionsCount',
      header: 'Versions',
      accessorFn: (row) => optionalCount(row, 'versionsCount') ?? -1,
      cell: ({ row }) => {
        const n = optionalCount(row.original, 'versionsCount');
        return (
          <span className="tabular-nums text-sm text-muted-foreground">{n ?? '—'}</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Créée le',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const campaign = row.original;
        const linkState = { campaignName: campaign.name };
        const hasStudio =
          studioSession?.campaignId === campaign.id && studioSession.pageVersionId;
        const navState = hasStudio ? studioNavState(studioSession!) : undefined;

        return (
          <div className="flex flex-nowrap items-center justify-end gap-1.5">
            {hasStudio ? (
              <>
                <Link
                  to={getStudioRoute(studioSession!.pageVersionId)}
                  state={navState}
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'h-8')}
                  title="Ouvrir le Studio"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Studio
                </Link>
                <Link
                  to={getPreviewRoute(studioSession!.pageVersionId)}
                  state={navState}
                  className={cn(buttonVariants({ variant: 'secondary', size: 'icon' }), 'h-8')}
                  title="Aperçu"
                  aria-label="Aperçu"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Link>
                <ShadButton
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8"
                  title="Export ZIP"
                  aria-label="Export ZIP"
                  onClick={() => void downloadStudioV2Export(studioSession!.pageVersionId)}
                >
                  <Download className="h-3.5 w-3.5" />
                </ShadButton>
              </>
            ) : null}
            <Link
              to={`/leads?campaignId=${campaign.id}`}
              className={cn(buttonVariants({ variant: 'secondary', size: 'icon' }), 'h-8')}
              title="Leads"
              aria-label="Leads"
            >
              <Users className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={`/campaigns/${campaign.id}/landing-pages`}
              state={linkState}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Landings
            </Link>
          </div>
        );
      },
    },
  ];
}

/** @deprecated use createCampaignsTableColumns(session) */
export const campaignsTableColumns = createCampaignsTableColumns(null);
