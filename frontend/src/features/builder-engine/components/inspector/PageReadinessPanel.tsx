import { AlertCircle, CheckCircle2, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCriticalPageReadinessIssues,
  getPageReadinessIssues,
  getPageReadinessStatus,
} from '../../lib/page-readiness';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

const STATUS_LABEL = {
  ready: 'Prêt à publier',
  incomplete: 'À compléter',
  blocked: 'Bloquant',
} as const;

export function PageReadinessPanel() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);

  const issues = getPageReadinessIssues(blocks, pageTheme);
  const status = getPageReadinessStatus(issues);
  const critical = getCriticalPageReadinessIssues(issues);
  const warnings = issues.filter((i) => i.severity === 'warning');

  const StatusIcon =
    status === 'ready' ? CheckCircle2 : status === 'blocked' ? AlertCircle : CircleAlert;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={cn(
              'h-4 w-4',
              status === 'ready' && 'text-emerald-600',
              status === 'incomplete' && 'text-amber-600',
              status === 'blocked' && 'text-red-600',
            )}
            aria-hidden
          />
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Préparation publication
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            status === 'ready' && 'bg-emerald-500/15 text-emerald-700',
            status === 'incomplete' && 'bg-amber-500/15 text-amber-800',
            status === 'blocked' && 'bg-red-500/15 text-red-700',
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {status === 'ready' ? (
        <p className="text-xs text-muted-foreground">
          Les éléments essentiels semblent renseignés. Relisez le contenu avant publication.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {critical.map((issue) => (
            <li key={issue.code} className="text-xs leading-snug text-red-800 dark:text-red-200">
              {issue.blockId ? (
                <button
                  type="button"
                  className="text-left underline decoration-dotted underline-offset-2 hover:no-underline"
                  onClick={() => selectBlock(issue.blockId!)}
                >
                  {issue.message}
                </button>
              ) : (
                issue.message
              )}
            </li>
          ))}
          {warnings.map((issue) => (
            <li key={issue.code} className="text-xs leading-snug text-muted-foreground">
              {issue.blockId ? (
                <button
                  type="button"
                  className="text-left underline decoration-dotted underline-offset-2 hover:no-underline"
                  onClick={() => selectBlock(issue.blockId!)}
                >
                  {issue.message}
                </button>
              ) : (
                issue.message
              )}
            </li>
          ))}
        </ul>
      )}

      {status === 'blocked' ? (
        <p className="text-[11px] text-muted-foreground">
          La publication est bloquée tant que les points critiques ne sont pas corrigés.
        </p>
      ) : null}
    </div>
  );
}
