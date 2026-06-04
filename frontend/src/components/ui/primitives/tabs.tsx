import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
};

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel = 'Tabs',
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex gap-0.5 rounded-lg border border-border bg-muted/40 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

type TabsPanelProps = {
  children: ReactNode;
  className?: string;
};

export function TabsPanel({ children, className }: TabsPanelProps) {
  return <div className={cn('flex min-h-0 flex-1 flex-col', className)}>{children}</div>;
}
