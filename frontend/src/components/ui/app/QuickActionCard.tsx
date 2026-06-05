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
          'ah-icon-well mb-3 h-11 w-11',
          variant === 'primary' ? 'ah-icon-well--primary' : 'ah-icon-well--muted',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="ah-card-title">{title}</h3>
      <p className="ah-muted mt-1.5">
        {disabled && disabledHint ? disabledHint : description}
      </p>
      {children}
    </>
  );

  const cardClass = cn(
    'ah-card-pro h-full',
    variant === 'primary' && !disabled && 'ah-card-pro--primary',
    disabled && 'opacity-55 pointer-events-none',
    className,
  );

  const wrapClass =
    'block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]';

  if (disabled || (!href && !onClick)) {
    return (
      <div className={cardClass}>
        <CardContent className="p-5">{inner}</CardContent>
      </div>
    );
  }

  if (href) {
    return (
      <Link to={href} className={wrapClass}>
        <div className={cn(cardClass, 'cursor-pointer')}>
          <CardContent className="p-5">{inner}</CardContent>
        </div>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(wrapClass, 'w-full text-left')}>
      <div className={cn(cardClass, 'cursor-pointer')}>
        <CardContent className="p-5">{inner}</CardContent>
      </div>
    </button>
  );
}
