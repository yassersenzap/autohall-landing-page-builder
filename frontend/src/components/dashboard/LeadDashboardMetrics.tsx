import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Contact,
  Inbox,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MetricCard,
  buttonVariants,
} from '@/components/ui/primitives';
import { StatusBadge } from '@/components/ui/primitives/status-badge';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, type LeadDashboardKpis } from '@/lib/lead-dashboard';
import { formatLeadDate, PRIORITY_LABELS } from '@/lib/leads';
import type { ColumnDef } from '@tanstack/react-table';

type LeadDashboardMetricsProps = {
  kpis: LeadDashboardKpis;
};

type StatusRow = { label: string; count: number; statusKey: string };

const statusColumns: ColumnDef<StatusRow>[] = [
  {
    accessorKey: 'label',
    header: 'Statut',
    cell: ({ row }) => (
      <StatusBadge status={row.original.statusKey} kind="lead" label={row.original.label} />
    ),
  },
  {
    accessorKey: 'count',
    header: 'Volume',
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{row.original.count}</span>
    ),
  },
  {
    id: 'share',
    header: '%',
    cell: ({ row, table }) => {
      const total = table.getCoreRowModel().rows.reduce((s, r) => s + r.original.count, 0);
      const pct = total > 0 ? Math.round((row.original.count / total) * 100) : 0;
      return <span className="text-muted-foreground tabular-nums">{pct} %</span>;
    },
  },
];

type OverdueRow = LeadDashboardKpis['overdueLeads'][number];

const overdueColumns: ColumnDef<OverdueRow>[] = [
  { accessorKey: 'fullName', header: 'Lead' },
  { accessorKey: 'campaignName', header: 'Campagne' },
  { accessorKey: 'landingPageTitle', header: 'Landing' },
  {
    accessorKey: 'nextFollowUpAt',
    header: 'Relance',
    cell: ({ row }) => (
      <span className="text-amber-600 dark:text-amber-400 tabular-nums">
        {formatLeadDate(row.original.nextFollowUpAt)}
      </span>
    ),
  },
  {
    id: 'action',
    header: '',
    cell: ({ row }) => (
      <Link
        to={`/leads/${row.original.id}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
      >
        Voir
      </Link>
    ),
  },
];

export function LeadDashboardMetrics({ kpis }: LeadDashboardMetricsProps) {
  const statusRows: StatusRow[] = kpis.byStatus.map((row) => ({
    statusKey: row.status,
    label: STATUS_LABELS[row.status] ?? row.status,
    count: row.count,
  }));

  const topCampaigns = kpis.byCampaign.slice(0, 5);

  return (
    <section className="space-y-6" aria-labelledby="lead-metrics-heading">
      <div>
        <h2 id="lead-metrics-heading" className="text-lg font-semibold tracking-tight">
          Performance leads
        </h2>
        <p className="text-sm text-muted-foreground">
          Indicateurs consolidés — volume, contact et répartition par statut.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <MetricCard
          label="Total leads"
          value={kpis.totalLeads}
          hint="Tous statuts confondus"
          trend="neutral"
        />
        <MetricCard
          label="Taux de contact"
          value={`${kpis.contactedRatePercent} %`}
          hint="Contactés + qualifiés + archivés"
          trend="positive"
        />
        <MetricCard
          label="Reçus aujourd'hui"
          value={kpis.receivedToday}
          trend="neutral"
        />
        <MetricCard
          label="Cette semaine"
          value={kpis.receivedThisWeek}
          trend="neutral"
        />
        <MetricCard
          label="Relances en retard"
          value={kpis.overdueFollowUps}
          trend={kpis.overdueFollowUps > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Répartition par statut
            </CardTitle>
            <CardDescription>Volume par étape du pipeline lead.</CardDescription>
          </CardHeader>
          <CardContent>
            {statusRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            ) : (
              <DataTable
                columns={statusColumns}
                data={statusRows}
                pageSize={8}
                emptyMessage="Aucun lead."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Top campagnes
            </CardTitle>
            <CardDescription>Les 5 campagnes les plus génératrices de leads.</CardDescription>
          </CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune campagne.</p>
            ) : (
              <ul className="space-y-3">
                {topCampaigns.map((row) => {
                  const max = topCampaigns[0]?.count ?? 1;
                  const width = Math.max(8, Math.round((row.count / max) * 100));
                  return (
                    <li key={row.campaignId}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium truncate pr-2">{row.campaignName}</span>
                        <span className="tabular-nums text-muted-foreground">{row.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/80 transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Par priorité</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {kpis.byPriority.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              kpis.byPriority.map((row) => (
                <span
                  key={row.priority}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs"
                >
                  {PRIORITY_LABELS[row.priority] ?? row.priority}
                  <strong className="tabular-nums">{row.count}</strong>
                </span>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Synthèse rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Inbox className="h-3.5 w-3.5" />
              <span>
                <strong className="text-foreground">{kpis.receivedToday}</strong> aujourd&apos;hui
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Contact className="h-3.5 w-3.5" />
              <span>
                <strong className="text-foreground">{kpis.contactedRatePercent}%</strong> contactés
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Relances en retard
          </CardTitle>
          <CardDescription>Leads dont la date de relance est dépassée.</CardDescription>
        </CardHeader>
        <CardContent>
          {kpis.overdueLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune relance en retard.</p>
          ) : (
            <>
              <DataTable
                columns={overdueColumns}
                data={kpis.overdueLeads}
                pageSize={5}
                emptyMessage="Aucun lead en retard."
              />
              {kpis.overdueFollowUps > kpis.overdueLeads.length ? (
                <div className="mt-4">
                  <Link
                    to="/leads?overdueOnly=true"
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                  >
                    Voir tous ({kpis.overdueFollowUps})
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
