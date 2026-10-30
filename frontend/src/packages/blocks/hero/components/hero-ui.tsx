import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/utils';

export function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <span className="lp-v4-badge">
      <Sparkles className="lp-v4-badge__icon" aria-hidden />
      {children}
    </span>
  );
}

export function HeroPrimaryButton({
  children,
  href,
  type = 'button',
  disabled,
  className,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <a href={href} className={cn('lp-v4-btn lp-v4-btn--primary', className)}>
        {children}
      </a>
    );
  }
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn('lp-v4-btn lp-v4-btn--primary h-auto min-h-11 px-6 py-2.5', className)}
    >
      {children}
    </Button>
  );
}
