import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold leading-none tracking-tight', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: 'neutral' | 'positive' | 'negative' | 'warning';
  className?: string;
};

const trendRing: Record<NonNullable<MetricCardProps['trend']>, string> = {
  neutral: 'border-border',
  positive: 'border-emerald-500/30',
  negative: 'border-destructive/30',
  warning: 'border-amber-500/40',
};

export function MetricCard({ label, value, hint, trend = 'neutral', className }: MetricCardProps) {
  return (
    <Card className={cn('border', trendRing[trend], className)}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-[0.65rem] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
