import { useEffect } from 'react';
import '@landing-styles';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { BuilderTriptychLayout } from '@/features/builder-engine/components/BuilderTriptychLayout';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ShadButton, buttonVariants } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

/**
 * Lab Étape 1 — moteur constructeur (coquille + Zustand + DnD).
 * Blocs factices uniquement ; pas de persistance API.
 */
export default function BuilderEngineLabPage() {
  const resetDocument = useBuilderDocumentStore((s) => s.resetDocument);

  useEffect(() => {
    document.documentElement.classList.add('lpb-studio-active');
    return () => {
      document.documentElement.classList.remove('lpb-studio-active');
      resetDocument();
    };
  }, [resetDocument]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-3">
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Studio
        </Link>
        <p className="text-xs font-medium text-muted-foreground">
          Builder Engine · Lab (Étape 1)
        </p>
        <ShadButton variant="outline" size="sm" onClick={() => resetDocument()}>
          <RotateCcw className="h-3.5 w-3.5" />
          Réinitialiser
        </ShadButton>
      </header>
      <div className="min-h-0 flex-1">
        <BuilderTriptychLayout />
      </div>
    </div>
  );
}
