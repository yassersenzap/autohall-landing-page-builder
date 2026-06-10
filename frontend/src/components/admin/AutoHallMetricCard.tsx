import type { ReactNode } from 'react';

import { ADMIN_SECTION_GRID } from '@/components/admin/admin-layout';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { cn } from '@/lib/utils';

type AutoHallMetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  subhint?: string;
  className?: string;
};

export function AutoHallMetricCard({
  label,
  value,
  hint,
  subhint,
  className,
}: AutoHallMetricCardProps) {
  return (
    <Card className={cn('@container/card', className)}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
      </CardHeader>
      {hint || subhint ? (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {hint ? (
            <div className="line-clamp-1 flex gap-2 font-medium">{hint}</div>
          ) : null}
          {subhint ? (
            <div className="text-muted-foreground">{subhint}</div>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}

export function AutoHallMetricGrid({ children }: { children: ReactNode }) {
  return <div className={ADMIN_SECTION_GRID}>{children}</div>;
}
