/** Classes Tailwind partagées pour les badges CRM leads (dark mode premium). */

export const LEAD_BADGE_BASE =
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide';

export const LEAD_STATUS_BADGE_STYLES: Record<string, string> = {
  RECEIVED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  QUALIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  ARCHIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const LEAD_PRIORITY_BADGE_STYLES: Record<string, string> = {
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  URGENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  NORMAL: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const CRM_FIELD_CLASS =
  'bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500';

export const CRM_SUBMIT_BTN_CLASS =
  '!bg-blue-600 !border-blue-700 hover:!bg-blue-500 !text-white shadow-sm shadow-blue-950/30';

export const CRM_FILTER_APPLY_BTN_CLASS =
  '!bg-blue-600 !border-blue-700 hover:!bg-blue-500 !text-white shadow-sm shadow-blue-950/30';
