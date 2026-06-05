import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ShadButton } from '@/components/ui/primitives';
import { landingStudioPath } from '@/lib/landing-studio-routes';
import { fetchStudioV2PreviewHtml } from '@/features/visual-studio-v2/api/studio-v2-preview.api';

type StudioLocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  landingPageId?: string;
  landingPageTitle?: string | null;
  campaignId?: string;
  campaignName?: string | null;
};

export default function VisualStudioV2PreviewPage() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const location = useLocation();
  const navState = (location.state as StudioLocationState | null) ?? {};
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  const backNavigation = useMemo(() => {
    if (navState.landingPageId) {
      return {
        backTo: `/landing-pages/${navState.landingPageId}/versions`,
        backLabel: 'Versions',
        backState: {
          landingPageTitle: navState.landingPageTitle,
          campaignId: navState.campaignId,
          campaignName: navState.campaignName,
        },
      };
    }
    return { backTo: '/campaigns', backLabel: 'Campagnes', backState: undefined };
  }, [navState]);

  const load = useCallback(async () => {
    if (!pageVersionId) return;
    setError(null);
    try {
      const content = await fetchStudioV2PreviewHtml(pageVersionId);
      setHtml(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger l’aperçu.');
    }
  }, [pageVersionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!pageVersionId) {
    return <p className="p-6 text-sm">Identifiant manquant.</p>;
  }

  return (
    <div className="visual-studio-v2-preview-page">
      <header className="visual-studio-v2-preview-page__bar">
        <div className="flex items-center gap-3">
          <Link
            to={landingStudioPath(pageVersionId)}
            state={navState}
            className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour au studio
          </Link>
          <Link
            to={backNavigation.backTo}
            state={backNavigation.backState}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            {backNavigation.backLabel}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ShadButton
            type="button"
            size="sm"
            variant={viewport === 'desktop' ? 'default' : 'secondary'}
            onClick={() => setViewport('desktop')}
          >
            <Monitor className="mr-1 h-3.5 w-3.5" aria-hidden />
            Desktop
          </ShadButton>
          <ShadButton
            type="button"
            size="sm"
            variant={viewport === 'mobile' ? 'default' : 'secondary'}
            onClick={() => setViewport('mobile')}
          >
            <Smartphone className="mr-1 h-3.5 w-3.5" aria-hidden />
            Mobile
          </ShadButton>
        </div>
      </header>

      {error ? <p className="p-6 text-sm text-red-400">{error}</p> : null}

      {html ? (
        <div
          className={`visual-studio-v2-preview-page__frame visual-studio-v2-preview-page__frame--${viewport}`}
        >
          <iframe title="Aperçu landing" srcDoc={html} className="h-full w-full border-0 bg-white" />
        </div>
      ) : !error ? (
        <p className="p-6 text-sm text-slate-400">Chargement de l’aperçu…</p>
      ) : null}
    </div>
  );
}
