import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type V4SectionProps = {
  blockType: string;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
};

export function V4Section({ blockType, className, children, style }: V4SectionProps) {
  return (
    <section
      className={cn('lp-v4-section', `lp-v4-section--${blockType}`, className)}
      data-v4-block={blockType}
      style={style}
    >
      <div className="lp-v4-section__inner">{children}</div>
    </section>
  );
}
