import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CanvasEmptyHintProps = {
  children?: ReactNode;
  className?: string;
};

/** Edit-mode placeholder — visual only, no marketing copy in export. */
export function CanvasEmptyHint({ children, className }: CanvasEmptyHintProps) {
  const label = typeof children === 'string' ? children : 'Champ à compléter';
  return (
    <span
      className={cn('lp-canvas-empty-hint', className)}
      aria-label={label}
      role="presentation"
    />
  );
}
