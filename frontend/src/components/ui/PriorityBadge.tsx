import { PRIORITY_LABELS } from '../../lib/leads';
import {
  LEAD_BADGE_BASE,
  LEAD_PRIORITY_BADGE_STYLES,
} from '@/lib/lead-badge-styles';
import { cn } from '@/lib/utils';

type PriorityBadgeProps = {
  priority: string;
  label?: string;
  className?: string;
};

export function PriorityBadge({ priority, label, className }: PriorityBadgeProps) {
  const key = priority.toUpperCase();
  const style =
    LEAD_PRIORITY_BADGE_STYLES[key] ??
    'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span className={cn(LEAD_BADGE_BASE, style, className)}>
      {label ?? PRIORITY_LABELS[key] ?? priority}
    </span>
  );
}
