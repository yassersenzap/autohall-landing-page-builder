import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CardContent } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type QuickActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledHint?: string;
  variant?: 'default' | 'primary';
  className?: string;
  children?: ReactNode;
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  disabled,
  disabledHint,
  variant = 'default',
  className,
  children,
}: QuickActionCardProps) {
  const inner = (
    <>
      <div
        className={cn(
          'ah-icon-well ah-icon-well--card mb-3',
          variant === 'primary' ? 'ah-icon-well--primary' : 'ah-icon-well--muted',
        )}
      >
        <Icon aria-hidden />
      </div>
      <h3 className="ah-card-title">{title}</h3>
      <p className="ah-muted mt-1.5">
        {disabled && disabledHint ? disabledHint : description}
      </p>
      {children}
    </>
  );

  const isInteractive = !disabled && (href || onClick);
  const cardClass = cn(
    'quick-action-card h-full rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-[var(--shadow-card)]',
    isInteractive &&
      'transition-[border-color,box-shadow,transform] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px',
    variant === 'primary' &&
      !disabled &&
      'border-[color-mix(in_srgb,var(--color-primary)_28%,var(--color-border))] bg-[linear-gradient(165deg,var(--color-primary-soft)_0%,var(--color-surface)_42%)]',
    disabled && 'pointer-events-none opacity-55',
    className,
  );

  const wrapClass =
    'block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]';

  if (disabled || (!href && !onClick)) {
    return (
      <div className={cardClass}>
        <CardContent className="quick-action-card__content p-5">{inner}</CardContent>
      </div>
    );
  }

  if (href) {
    return (
      <Link to={href} className={wrapClass}>
        <div className={cn(cardClass, 'cursor-pointer')}>
          <CardContent className="quick-action-card__content p-5">{inner}</CardContent>
        </div>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(wrapClass, 'w-full text-left')}>
      <div className={cn(cardClass, 'cursor-pointer')}>
        <CardContent className="quick-action-card__content p-5">{inner}</CardContent>
      </div>
    </button>
  );
}
