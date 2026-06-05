import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('ah-card-pro text-card-foreground', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('ah-card-title', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('ah-muted', className)} {...props} />;
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

const trendAccent: Record<NonNullable<MetricCardProps['trend']>, string> = {
  neutral: '',
  positive: 'border-l-2 border-l-emerald-500/60',
  negative: 'border-l-2 border-l-destructive/60',
  warning: 'border-l-2 border-l-amber-500/60',
};

export function MetricCard({ label, value, hint, trend = 'neutral', className }: MetricCardProps) {
  return (
    <Card className={cn('overflow-hidden', trendAccent[trend], className)}>
      <CardContent className="p-4">
        <p className="ah-label">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        {hint ? <p className="ah-caption mt-1.5">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
