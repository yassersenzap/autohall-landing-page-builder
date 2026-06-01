import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
  padding?: 'none' | 'md' | 'lg';
};

export function Card({
  title,
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const classes = ['ui-card', padding !== 'md' ? `ui-card--${padding}` : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} {...props}>
      {title ? <h2 className="ui-card__title">{title}</h2> : null}
      <div className="ui-card__body">{children}</div>
    </section>
  );
}
