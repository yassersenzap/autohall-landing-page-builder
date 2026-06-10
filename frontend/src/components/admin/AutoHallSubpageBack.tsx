import { ArrowLeft } from 'lucide-react';
import { Link, type LinkProps } from 'react-router-dom';

import { ADMIN_CONTENT_PAD } from '@/components/admin/admin-layout';
import { cn } from '@/lib/utils';

type AutoHallSubpageBackProps = {
  to: LinkProps['to'];
  label: string;
  state?: LinkProps['state'];
  className?: string;
};

export function AutoHallSubpageBack({
  to,
  label,
  state,
  className,
}: AutoHallSubpageBackProps) {
  return (
    <div className={cn(ADMIN_CONTENT_PAD, className)}>
      <Link
        to={to}
        state={state}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        {label}
      </Link>
    </div>
  );
}
