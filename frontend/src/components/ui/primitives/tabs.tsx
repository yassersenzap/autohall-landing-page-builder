import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

type TabsLayout = 'equal' | 'scroll';

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  /** `scroll` keeps every tab reachable on narrow inspector widths. */
  layout?: TabsLayout;
};

function TabButton<T extends string>({
  item,
  active,
  onChange,
  className,
}: {
  item: TabItem<T>;
  active: boolean;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-tab-id={item.id}
      className={cn(
        'rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap',
        active
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={() => onChange(item.id)}
    >
      {item.label}
    </button>
  );
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel = 'Tabs',
  layout = 'equal',
}: TabsProps<T>) {
  const tablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (layout !== 'scroll') return;
    const activeTab = tablistRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (typeof activeTab?.scrollIntoView === 'function') {
      activeTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [layout, value]);

  if (layout === 'scroll') {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-muted/40',
          className,
        )}
        data-testid="studio-scrollable-tabs"
      >
        <div
          className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          data-testid="studio-tabs-scroll-viewport"
        >
          <div
            ref={tablistRef}
            role="tablist"
            aria-label={ariaLabel}
            className="inline-flex min-w-full gap-0.5 p-1"
          >
            {items.map((item) => (
              <TabButton
                key={item.id}
                item={item}
                active={item.id === value}
                onChange={onChange}
                className="shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex gap-0.5 rounded-lg border border-border bg-muted/40 p-1',
        className,
      )}
    >
      {items.map((item) => (
        <TabButton
          key={item.id}
          item={item}
          active={item.id === value}
          onChange={onChange}
          className="min-w-0 flex-1"
        />
      ))}
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
