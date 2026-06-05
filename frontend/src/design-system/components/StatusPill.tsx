import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatusPillVariant = 'saved' | 'dirty' | 'loading';

type StatusPillProps = {
  variant: StatusPillVariant;
  children: ReactNode;
  className?: string;
};

export function StatusPill({ variant, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'ds-status-pill',
        variant === 'saved' && 'ds-status-pill--saved',
        (variant === 'dirty' || variant === 'loading') && 'ds-status-pill--dirty',
        className,
      )}
    >
      {children}
    </span>
  );
}
