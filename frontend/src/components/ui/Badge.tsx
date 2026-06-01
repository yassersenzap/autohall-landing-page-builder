import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const classes = ['ui-badge', `ui-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
