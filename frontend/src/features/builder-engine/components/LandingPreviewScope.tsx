import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import '../styles/landing-preview-scope.css';

type LandingPreviewScopeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Miroir de la preview publique : article.lp-document > main.lp-page > blocs.
 * Aucune contrainte de largeur imposée — les grilles `.lp-*` utilisent landing-page.css.
 */
export function LandingPreviewScope({ children, className }: LandingPreviewScopeProps) {
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);

  return (
    <div
      className={cn('builder-landing-preview block w-full', className)}
      data-landing-preview="true"
      data-canvas-device={deviceMode}
    >
      <article className="lp-document block w-full min-w-full" data-theme="light">
        <main className="lp-page block w-full min-w-full">{children}</main>
      </article>
    </div>
  );
}
