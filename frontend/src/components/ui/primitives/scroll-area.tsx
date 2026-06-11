import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <div
      data-studio-panel-scroll=""
      className={cn(
        'h-full min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]',
        '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
