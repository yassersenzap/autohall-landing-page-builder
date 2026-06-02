import { STATUS_LABELS } from '../../lib/lead-dashboard';
import { Badge } from './Badge';

const STATUS_VARIANT: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  active: 'success',
  published: 'success',
  draft: 'default',
  archived: 'danger',
  ready: 'primary',
  exported: 'warning',
  contacted: 'primary',
  qualified: 'success',
  rejected: 'danger',
};

type StatusBadgeProps = {
  status: string;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/_/g, '-');
  const variant = STATUS_VARIANT[key] ?? 'default';
  const display =
    label ?? STATUS_LABELS[status] ?? STATUS_LABELS[status.toUpperCase()] ?? status;

  return <Badge variant={variant}>{display}</Badge>;
}
