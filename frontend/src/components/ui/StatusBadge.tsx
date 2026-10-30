import { STATUS_LABELS } from '../../lib/lead-dashboard';
import {
  LEAD_BADGE_BASE,
  LEAD_STATUS_BADGE_STYLES,
} from '@/lib/lead-badge-styles';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toUpperCase().replace(/-/g, '_');
  const style =
    LEAD_STATUS_BADGE_STYLES[key] ??
    'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const display =
    label ?? STATUS_LABELS[key] ?? STATUS_LABELS[status] ?? status;

  return (
    <span className={cn(LEAD_BADGE_BASE, style, className)}>{display}</span>
  );
}
