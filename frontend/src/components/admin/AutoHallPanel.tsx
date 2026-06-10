import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui-lab/ui/card';
import { cn } from '@/lib/utils';

type AutoHallPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AutoHallPanel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: AutoHallPanelProps) {
  return (
    <Card className={cn('ah-target-panel-card @container/card', className)}>
      <CardHeader className={action ? 'grid-cols-[1fr_auto]' : undefined}>
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="justify-self-end">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
