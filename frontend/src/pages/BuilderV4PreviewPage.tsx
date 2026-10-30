import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Tablet, Smartphone, X } from 'lucide-react';
import { HeroBlockRenderer } from '@/features/builder-v4/canvas/HeroBlockRenderer';
import { readPreviewSession } from '@/features/builder-v4/lib/preview-session';
import { useBuilderV4Store } from '@/features/builder-v4/store/document.store';
import { fetchPagePreview } from '@/lib/page-preview';
import { getAccessToken } from '@/lib/auth-storage';
import type { DeviceMode } from '@/features/builder-v4/types/nodes.types';
import '@/features/builder-v4/styles/builder-v4.css';
import '@/features/builder-v4/styles/campaign-autohall.css';
import '@/features/builder-v4/styles/hero-form-renderer.css';
import '@/features/builder-v4/styles/tactical-flash-campaign.css';
import '@/features/builder-v4/styles/multi-step-test-drive.css';
import '@/features/builder-v4/styles/canvas-pro.css';
import '@/features/builder-v4/styles/builder-ux.css';
import '@/features/builder-v4/styles/lp-blocks.css';
import '@/styles/preview.css';

export default function BuilderV4PreviewPage() {
  const { previewId, pageVersionId } = useParams<{ previewId?: string; pageVersionId?: string }>();
  const [viewportMode, setViewportMode] = useState<DeviceMode>('desktop');
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>('');

  const session = useMemo(
    () => (previewId ? readPreviewSession(previewId) : null),
    [previewId],
  );

  useEffect(() => {
    const versionId = pageVersionId;
    if (!versionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPreview(versionId: string) {
      try {
        setLoading(true);
        const previewData = await fetchPagePreview(versionId);
        if (cancelled) return;

        const lpId = previewData.data.landingPage.id;
        setCampaignTitle(previewData.data.campaign.name || previewData.data.landingPage.title);

        const token = getAccessToken();
        const API_BASE_URL =
          (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL)?.replace(/\/$/, '') ??
          'http://localhost:3001';
        const res = await fetch(`${API_BASE_URL}/api/landing-pages/${lpId}/versions/${versionId}/preview-html`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (!res.ok) throw new Error(`Failed to fetch preview HTML: ${res.statusText}`);
        const text = await res.text();
        if (cancelled) return;
        setHtml(text);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreview(versionId);
    return () => { cancelled = true; };
  }, [pageVersionId]);

  useEffect(() => {
    if (session) {
      useBuilderV4Store.setState({
        document: session.document,
        deviceMode: viewportMode,
        previewSessionId: null,
      });
    }
  }, [session, viewportMode]);

  const isSandbox = !pageVersionId;
  const pageTitle = campaignTitle || (session ? session.document.meta.title : '');

  if (loading && pageVersionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-sm text-zinc-500">Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!pageVersionId && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-zinc-600">
        Session expirée. Fermez et rouvrez l'aperçu depuis le builder.
      </div>
    );
  }

  const VIEWPORT_CONFIG = {
    desktop: { width: '100%', maxWidth: '1440px' },
    tablet:  { width: '768px', maxWidth: '768px' },
    mobile:  { width: '390px', maxWidth: '390px' },
  } as const;

  const vp = VIEWPORT_CONFIG[viewportMode];

  return (
    <div className="preview-shell">
      {/* Minimal production topbar */}
      <header className="preview-topbar">
        <div className="preview-topbar__left">
          {pageVersionId ? (
            <Link
              to={`/page-versions/${pageVersionId}/studio`}
              className="preview-back"
            >
              <ArrowLeft size={14} />
              Builder
            </Link>
          ) : (
            <button
              type="button"
              className="preview-back"
              onClick={() => window.close()}
            >
              <X size={14} />
            </button>
          )}
          {pageTitle ? (
            <span className="preview-topbar__title">{pageTitle}</span>
          ) : null}
        </div>

        {/* Viewport switcher */}
        <div className="preview-viewport-switch">
          {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => {
            const Icon = mode === 'desktop' ? Monitor : mode === 'tablet' ? Tablet : Smartphone;
            return (
              <button
                key={mode}
                type="button"
                className={`preview-vp-btn ${viewportMode === mode ? 'preview-vp-btn--active' : ''}`}
                onClick={() => setViewportMode(mode)}
              >
                <Icon size={14} />
                <span>{mode === 'desktop' ? 'Desktop' : mode === 'tablet' ? 'Tablet' : 'Mobile'}</span>
              </button>
            );
          })}
        </div>

        <div className="preview-topbar__right">
          {isSandbox ? (
            <span className="preview-badge">Aperçu</span>
          ) : (
            <span className="preview-badge preview-badge--live">Live</span>
          )}
        </div>
      </header>

      {/* Stage */}
      <div className="preview-stage">
        <div
          className="preview-frame"
          style={{ width: vp.width, maxWidth: vp.maxWidth }}
        >
          {isSandbox ? (
            <div className="preview-canvas">
              <HeroBlockRenderer editorMode={false} />
            </div>
          ) : (
            <iframe
              title="Page preview"
              srcDoc={html}
              className="preview-iframe"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          )}
        </div>
      </div>
    </div>
  );
}
