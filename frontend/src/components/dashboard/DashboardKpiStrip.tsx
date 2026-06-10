import { AutoHallMetricCard, AutoHallMetricGrid } from '@/components/admin';
import type { LeadDashboardKpis } from '@/lib/lead-dashboard';

type DashboardKpiStripProps = {
  sessionActive: boolean;
  sessionLabel?: string;
  kpis: LeadDashboardKpis | null;
  showLeads: boolean;
};

export function DashboardKpiStrip({
  sessionActive,
  sessionLabel,
  kpis,
  showLeads,
}: DashboardKpiStripProps) {
  return (
    <AutoHallMetricGrid>
      <AutoHallMetricCard
        label="Session Studio"
        value={sessionActive ? 'Active' : '—'}
        hint={sessionActive ? 'Session active' : 'Aucune session'}
        subhint={
          sessionActive && sessionLabel
            ? sessionLabel
            : 'Ouvrez une version pour démarrer le Studio.'
        }
      />
      {showLeads && kpis ? (
        <>
          <AutoHallMetricCard
            label="Leads totaux"
            value={kpis.totalLeads}
            hint="Volume global"
            subhint="Tous statuts confondus"
          />
          <AutoHallMetricCard
            label="Taux de contact"
            value={`${kpis.contactedRatePercent} %`}
            hint="Pipeline contacté"
            subhint="Contactés, qualifiés et archivés"
          />
          <AutoHallMetricCard
            label="Relances en retard"
            value={kpis.overdueFollowUps}
            hint="Suivi commercial"
            subhint="Relances dépassées"
          />
        </>
      ) : (
        <>
          <AutoHallMetricCard
            label="Leads totaux"
            value="—"
            subhint="Accès leads requis"
          />
          <AutoHallMetricCard
            label="Taux de contact"
            value="—"
            subhint="Accès leads requis"
          />
          <AutoHallMetricCard
            label="Relances en retard"
            value="—"
            subhint="Accès leads requis"
          />
        </>
      )}
    </AutoHallMetricGrid>
  );
}
