import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LEAD_BADGE_BASE } from '@/lib/lead-badge-styles';

type BadgeTone =
  | 'blue'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'slate'
  | 'default';

const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

/** Badge sémantique premium (opacité + bordure fine) pour le CRM. */
export function Badge({ children, tone = 'default', className }: BadgeProps) {
  return (
    <span className={cn(LEAD_BADGE_BASE, TONE_CLASSES[tone], className)}>
      {children}
    </span>
  );
}
