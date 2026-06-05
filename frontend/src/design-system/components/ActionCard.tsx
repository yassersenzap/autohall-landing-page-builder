import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary';
  size?: 'default' | 'large';
  disabled?: boolean;
  disabledHint?: string;
  className?: string;
  spanClass?: string;
};

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  variant = 'default',
  size = 'default',
  disabled,
  disabledHint,
  className,
  spanClass,
}: ActionCardProps) {
  const surface = cn(
    'ds-surface ds-surface--interactive',
    variant === 'primary' && 'ds-surface--accent-top',
    disabled && 'pointer-events-none opacity-55',
    className,
  );

  const inner = (
    <>
      <div className="ds-action-card__icon">
        <Icon size={size === 'large' ? 22 : 20} strokeWidth={1.85} aria-hidden />
      </div>
      <h3 className="ds-card-title">{title}</h3>
      <p className="ds-muted mt-1.5 flex-1">{description}</p>
      {disabled && disabledHint ? <p className="ds-caption mt-2">{disabledHint}</p> : null}
    </>
  );

  const cardClass = cn(
    'ds-action-card',
    variant === 'primary' && 'ds-action-card--primary',
    size === 'large' && 'ds-action-card--large',
    spanClass,
  );

  if (href && !disabled) {
    return (
      <Link to={href} className={cn(surface, cardClass)}>
        {inner}
      </Link>
    );
  }

  if (onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={cn(surface, cardClass, 'text-left')}>
        {inner}
      </button>
    );
  }

  return <div className={cn(surface, cardClass)}>{inner}</div>;
}

type ActionCardGridProps = {
  children: ReactNode;
  className?: string;
};

export function ActionCardGrid({ children, className }: ActionCardGridProps) {
  return <div className={cn('ds-bento', className)}>{children}</div>;
}
