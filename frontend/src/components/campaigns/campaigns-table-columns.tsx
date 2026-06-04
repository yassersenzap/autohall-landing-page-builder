import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/primitives';
import { StatusBadge } from '@/components/ui/primitives/status-badge';
import { cn } from '@/lib/utils';
import type { CampaignListItem } from '@/lib/campaigns';

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

export const campaignsTableColumns: ColumnDef<CampaignListItem>[] = [
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
      return (
        <div className="flex justify-end gap-1">
          <Link
            to={`/campaigns/${campaign.id}/landing-pages`}
            state={linkState}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ouvrir
          </Link>
          <Link
            to={`/campaigns/${campaign.id}/landing-pages`}
            state={linkState}
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-8')}
          >
            <Plus className="h-3.5 w-3.5" />
            Landing
          </Link>
        </div>
      );
    },
  },
];
