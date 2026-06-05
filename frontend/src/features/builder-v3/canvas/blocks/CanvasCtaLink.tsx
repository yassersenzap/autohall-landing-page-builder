import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { isExternalHref } from '../../lib/submit-lead-form';

type CanvasCtaLinkProps = {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  /** true = aperçu / landing publiée ; false = éditeur (inerte). */
  interactive: boolean;
};

/**
 * Rendu CTA : `<a>` actif en aperçu, `<span>` neutre dans l'éditeur (pas de navigation).
 */
export function CanvasCtaLink({
  href,
  className,
  style,
  children,
  interactive,
}: CanvasCtaLinkProps) {
  const btnClass = cn('inline-flex items-center justify-center text-center no-underline', className);

  if (!interactive) {
    return (
      <span
        className={cn(btnClass, 'pointer-events-none cursor-default select-none')}
        style={style}
        aria-hidden
      >
        {children}
      </span>
    );
  }

  const external = isExternalHref(href);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (href.startsWith('#')) {
      event.preventDefault();
      const targetId = href.slice(1);
      if (!targetId) return;
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <a
      href={href}
      className={btnClass}
      style={style}
      onClick={handleClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
