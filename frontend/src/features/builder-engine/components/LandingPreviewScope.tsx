import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import '../styles/landing-preview-scope.css';

type LandingPreviewScopeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Contexte visuel landing (clair) isolé du thème Studio / Tailwind admin.
 */
export function LandingPreviewScope({ children, className }: LandingPreviewScopeProps) {
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);

  return (
    <div
      className={cn('builder-landing-preview', className)}
      data-landing-preview="true"
      data-canvas-device={deviceMode}
    >
      <div className="lp-document w-full min-w-0 text-left" data-theme="light">
        {children}
      </div>
    </div>
  );
}
