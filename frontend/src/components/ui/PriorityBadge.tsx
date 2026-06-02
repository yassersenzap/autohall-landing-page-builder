import { PRIORITY_LABELS } from '../../lib/leads';
import { Badge } from './Badge';

const PRIORITY_VARIANT: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  low: 'default',
  normal: 'primary',
  high: 'warning',
  urgent: 'danger',
};

type PriorityBadgeProps = {
  priority: string;
  label?: string;
};

export function PriorityBadge({ priority, label }: PriorityBadgeProps) {
  const key = priority.toLowerCase();
  const variant = PRIORITY_VARIANT[key] ?? 'default';

  return (
    <Badge variant={variant}>
      {label ?? PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
