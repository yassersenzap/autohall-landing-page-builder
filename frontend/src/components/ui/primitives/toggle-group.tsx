import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ToggleGroupItem<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
};

type ToggleGroupProps<T extends string> = {
  value: T;
  items: ToggleGroupItem<T>[];
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
};

export function ToggleGroup<T extends string>({
  value,
  items,
  onChange,
  className,
  ariaLabel = 'Toggle group',
}: ToggleGroupProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onChange(item.value)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
