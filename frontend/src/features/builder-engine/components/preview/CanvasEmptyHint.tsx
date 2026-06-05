import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CanvasEmptyHintProps = {
  children: ReactNode;
  className?: string;
  /** Taille visuelle du placeholder canvas */
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Indication canvas builder uniquement — jamais écrit dans propsJson.
 */
export function CanvasEmptyHint({
  children,
  className,
  size = 'md',
}: CanvasEmptyHintProps) {
  return (
    <p
      className={cn(
        'font-normal italic text-muted-foreground/75',
        sizeClasses[size],
        className,
      )}
      data-builder-empty-hint
    >
      {children}
    </p>
  );
}
