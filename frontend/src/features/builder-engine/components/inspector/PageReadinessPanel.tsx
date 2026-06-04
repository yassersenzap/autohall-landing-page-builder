import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCriticalPageReadinessIssues,
  getPageReadinessIssues,
} from '../../lib/page-readiness';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

export function PageReadinessPanel() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);

  const issues = getPageReadinessIssues(blocks, pageTheme);
  const critical = getCriticalPageReadinessIssues(issues);
  const warnings = issues.filter((i) => i.severity === 'warning');
  const ready = issues.length === 0;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        {ready ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden />
        )}
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Préparation publication
        </p>
      </div>

      {ready ? (
        <p className="text-xs text-muted-foreground">
          Les éléments essentiels semblent renseignés. Vérifiez le contenu avant publication.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {critical.map((issue) => (
            <li
              key={issue.code}
              className={cn('text-xs leading-snug', 'text-amber-800 dark:text-amber-200')}
            >
              {issue.message}
            </li>
          ))}
          {warnings.map((issue) => (
            <li key={issue.code} className="text-xs leading-snug text-muted-foreground">
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      {!ready && critical.length > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          La publication peut être bloquée tant que les points critiques ne sont pas corrigés.
        </p>
      ) : null}
    </div>
  );
}
