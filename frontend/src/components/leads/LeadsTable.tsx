import { Link } from 'react-router-dom';

import { AutoHallEmptyState } from '@/components/admin/AutoHallEmptyState';
import { LeadAvatar } from './LeadAvatar';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import {
  formatLeadDate,
  type LeadEventListItem,
  type LeadsPagination,
} from '../../lib/leads';
import { Button } from '@/ui-lab/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-lab/ui/table';

type LeadsTableProps = {
  leads: LeadEventListItem[];
  pagination: LeadsPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(value: string, max = 42): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export default function LeadsTable({
  leads,
  pagination,
  loading,
  onPageChange,
}: LeadsTableProps) {
  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Chargement des leads…
      </p>
    );
  }

  if (leads.length === 0) {
    return (
      <AutoHallEmptyState
        title="Aucun lead trouvé"
        description="Aucun lead ne correspond à ces critères de filtrage. Ajustez les filtres ou rafraîchissez la liste."
        className="ah-target-empty-state"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2 px-1">
        <span className="text-sm text-muted-foreground">
          {pagination.total} lead{pagination.total > 1 ? 's' : ''} · page{' '}
          {pagination.page} / {pagination.totalPages}
        </span>
      </div>

      <div className="ah-target-table overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Campagne</TableHead>
                <TableHead>Landing</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Assigné</TableHead>
                <TableHead>Relance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[12rem] items-center gap-3">
                      <LeadAvatar name={lead.fullName} />
                      <div className="min-w-0">
                        <span className="block font-medium">{lead.fullName}</span>
                        <span className="block text-sm text-muted-foreground">{lead.phone}</span>
                        {lead.email ? (
                          <span className="block text-sm text-muted-foreground">{lead.email}</span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="block font-medium">{lead.campaignName}</span>
                    {(lead.brand ?? lead.model) ? (
                      <span className="block text-sm text-muted-foreground">
                        {[lead.brand, lead.model].filter(Boolean).join(' · ')}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <span className="block">{lead.landingPageTitle}</span>
                    <span className="block text-sm text-muted-foreground">
                      /{lead.landingPageSlug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={lead.priority} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assignedToName ?? '—'}
                  </TableCell>
                  <TableCell
                    className={
                      lead.isFollowUpOverdue ? 'font-medium text-amber-600 dark:text-amber-400' : undefined
                    }
                  >
                    {formatLeadDate(lead.nextFollowUpAt)}
                    {lead.isFollowUpOverdue ? (
                      <span className="ml-1.5 inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        En retard
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell
                    className="max-w-[10rem] truncate text-muted-foreground"
                    title={lead.sourceUrl}
                  >
                    {truncateText(lead.sourceUrl)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/leads/${lead.id}`}>Voir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Page précédente
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Page suivante
          </Button>
        </div>
      ) : null}
    </div>
  );
}
