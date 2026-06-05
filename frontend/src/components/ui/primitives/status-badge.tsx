import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/lead-dashboard';

const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Active',
  ARCHIVED: 'Archivée',
};

type StatusKind = 'campaign' | 'lead' | 'landing' | 'version';

const STATUS_STYLES: Record<string, string> = {
  // Campagnes
  DRAFT: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ACTIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ARCHIVED: 'border-border bg-muted/80 text-muted-foreground',
  // Versions / landing
  PUBLISHED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  READY: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  EXPORTED: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
  // Leads
  RECEIVED: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  NEW: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  CONTACTED: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  QUALIFIED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  REJECTED: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
  ARCHIVED: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
};

function resolveLabel(status: string, kind: StatusKind): string {
  const upper = status.toUpperCase();
  if (kind === 'campaign') return CAMPAIGN_STATUS_LABELS[upper] ?? status;
  return STATUS_LABELS[upper] ?? status;
}

type StatusBadgeProps = {
  status: string;
  kind?: StatusKind;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, kind = 'campaign', label, className }: StatusBadgeProps) {
  const key = status.toUpperCase();
  const style = STATUS_STYLES[key] ?? 'border-border bg-muted/60 text-muted-foreground';
  const display = label ?? resolveLabel(status, kind);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide',
        style,
        className,
      )}
    >
      {display}
    </span>
  );
}
