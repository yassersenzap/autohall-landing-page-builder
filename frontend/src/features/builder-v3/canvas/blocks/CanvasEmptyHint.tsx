import type { ReactNode } from 'react';

type CanvasEmptyHintProps = {
  children: ReactNode;
  className?: string;
};

export function CanvasEmptyHint({ children, className }: CanvasEmptyHintProps) {
  return (
    <span className={className} style={{ fontStyle: 'italic', opacity: 0.65 }}>
      {children}
    </span>
  );
}
