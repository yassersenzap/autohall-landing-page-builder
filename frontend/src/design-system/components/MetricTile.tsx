import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MetricTileProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function MetricTile({ label, value, className }: MetricTileProps) {
  return (
    <div className={cn('ds-metric-tile', className)}>
      <p className="ds-metric-tile__label">{label}</p>
      <p className="ds-metric-tile__value">{value}</p>
    </div>
  );
}

type MetricStripProps = {
  children: ReactNode;
  className?: string;
};

export function MetricStrip({ children, className }: MetricStripProps) {
  return <div className={cn('ds-metric-strip', className)}>{children}</div>;
}
