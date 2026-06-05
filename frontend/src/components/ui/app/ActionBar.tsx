import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ActionBarProps = {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'between';
};

export function ActionBar({ children, className, align = 'start' }: ActionBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        align === 'end' && 'justify-end',
        align === 'between' && 'justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
}
