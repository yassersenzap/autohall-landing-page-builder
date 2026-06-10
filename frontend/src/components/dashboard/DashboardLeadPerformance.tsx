import { Link } from 'react-router-dom';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';

import { DASHBOARD01_CONTENT_PAD, DASHBOARD01_SECTION_GRID } from '@/components/admin/dashboard01-layout';
import { AutoHallMetricCard } from '@/components/admin/AutoHallMetricCard';
import { DataTable } from '@/components/ui/data-table';
import { STATUS_LABELS, type LeadDashboardKpis } from '@/lib/lead-dashboard';
import { formatLeadDate, PRIORITY_LABELS } from '@/lib/leads';
import { Badge } from '@/ui-lab/ui/badge';
import { Button } from '@/ui-lab/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui-lab/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-lab/ui/table';

type DashboardLeadPerformanceProps = {
  kpis: LeadDashboardKpis;
};

type StatusRow = { label: string; count: number; statusKey: string };

const statusColumns: ColumnDef<StatusRow>[] = [
  {
    accessorKey: 'label',
    header: 'Statut',
    cell: ({ row }) => <Badge variant="outline">{row.original.label}</Badge>,
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

export function DashboardLeadPerformance({ kpis }: DashboardLeadPerformanceProps) {
  const statusRows: StatusRow[] = kpis.byStatus.map((row) => ({
    statusKey: row.status,
    label: STATUS_LABELS[row.status] ?? row.status,
    count: row.count,
  }));

  const topCampaigns = kpis.byCampaign.slice(0, 5);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="lead-performance-heading">
      <div className={DASHBOARD01_CONTENT_PAD}>
        <h3 id="lead-performance-heading" className="text-base font-medium">
          Performance leads
        </h3>
        <p className="text-sm text-muted-foreground">
          Indicateurs consolidés — volume, contact et répartition par statut.
        </p>
      </div>

      <div className={DASHBOARD01_SECTION_GRID}>
        <AutoHallMetricCard label="Reçus aujourd'hui" value={kpis.receivedToday} />
        <AutoHallMetricCard label="Cette semaine" value={kpis.receivedThisWeek} />
        <AutoHallMetricCard
          label="Taux de contact"
          value={`${kpis.contactedRatePercent} %`}
        />
        <AutoHallMetricCard label="Total leads" value={kpis.totalLeads} />
      </div>

      <div className={`grid gap-4 lg:grid-cols-2 ${DASHBOARD01_CONTENT_PAD}`}>
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
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
            <CardTitle>Top campagnes</CardTitle>
            <CardDescription>
              Les 5 campagnes les plus génératrices de leads.
            </CardDescription>
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
                        <span className="truncate pr-2 font-medium">{row.campaignName}</span>
                        <span className="tabular-nums text-muted-foreground">{row.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/60 transition-all"
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

      <div className={`grid gap-4 lg:grid-cols-2 ${DASHBOARD01_CONTENT_PAD}`}>
        <Card>
          <CardHeader>
            <CardTitle>Par priorité</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {kpis.byPriority.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              kpis.byPriority.map((row) => (
                <Badge key={row.priority} variant="secondary">
                  {PRIORITY_LABELS[row.priority] ?? row.priority}
                  <span className="ml-1 tabular-nums">{row.count}</span>
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synthèse rapide</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">{kpis.receivedToday}</strong> reçus
              aujourd&apos;hui
            </p>
            <p>
              <strong className="text-foreground">{kpis.contactedRatePercent}%</strong>{' '}
              contactés
            </p>
          </CardContent>
        </Card>
      </div>

      <div className={DASHBOARD01_CONTENT_PAD}>
        <Card>
          <CardHeader>
            <CardTitle>Relances en retard</CardTitle>
            <CardDescription>
              Leads dont la date de relance est dépassée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.overdueLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune relance en retard.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Campagne</TableHead>
                      <TableHead>Relance</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpis.overdueLeads.slice(0, 5).map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.fullName}</TableCell>
                        <TableCell>{lead.campaignName}</TableCell>
                        <TableCell className="tabular-nums text-amber-500">
                          {formatLeadDate(lead.nextFollowUpAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/leads/${lead.id}`}>Voir</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {kpis.overdueFollowUps > kpis.overdueLeads.length ? (
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/leads?overdueOnly=true">
                        <IconAlertTriangle className="size-4" />
                        Voir tous ({kpis.overdueFollowUps})
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
