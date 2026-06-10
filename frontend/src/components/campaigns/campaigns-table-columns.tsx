import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, ExternalLink, PenLine, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/primitives/status-badge';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import type { StudioSession } from '@/lib/studio-session';
import { studioNavState } from '@/lib/studio-session';
import type { CampaignListItem } from '@/lib/campaigns';
import { downloadLandingExport } from '@/lib/landing-export.api';
import { Button } from '@/components/ui/shadcn/button';

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
          <p className="font-medium">{row.original.name}</p>
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
          <div className="flex min-w-[12rem] flex-wrap items-center justify-end gap-1.5">
            {hasStudio ? (
              <>
                <Button variant="outline" size="sm" className="ah-cta-studio h-8" asChild>
                  <Link
                    to={getStudioRoute(studioSession!.pageVersionId)}
                    state={navState}
                    title="Ouvrir le Studio"
                  >
                    <PenLine className="size-3.5" />
                    Studio
                  </Link>
                </Button>
                <Button variant="outline" size="icon-sm" className="h-8 w-8" asChild>
                  <Link
                    to={getPreviewRoute(studioSession!.pageVersionId)}
                    state={navState}
                    title="Aperçu"
                    aria-label="Aperçu"
                  >
                    <Eye className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="h-8 w-8"
                  title="Export ZIP"
                  aria-label="Export ZIP"
                  onClick={() => void downloadLandingExport(studioSession!.pageVersionId)}
                >
                  <Download className="size-3.5" />
                </Button>
              </>
            ) : null}
            <Button variant="outline" size="icon-sm" className="h-8 w-8" asChild>
              <Link
                to={`/leads?campaignId=${campaign.id}`}
                title="Leads"
                aria-label="Leads"
              >
                <Users className="size-3.5" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link to={`/campaigns/${campaign.id}/landing-pages`} state={linkState}>
                <ExternalLink className="size-3.5" />
                Landings
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
}

/** @deprecated use createCampaignsTableColumns(session) */
export const campaignsTableColumns = createCampaignsTableColumns(null);
