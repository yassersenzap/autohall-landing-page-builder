import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs } from '../components/ui/Tabs';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  fetchPagePreview,
  landingThemeStyleToReact,
  type PagePreviewData,
} from '../lib/page-preview';
import '@landing-styles';

type LocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  landingPageId?: string;
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

type ViewportMode = 'desktop' | 'mobile';

function HtmlFragment({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function PagePreviewPage() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const [preview, setPreview] = useState<PagePreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  const loadPreview = useCallback(async () => {
    if (!pageVersionId) return;

    setError(null);
    setLoading(true);

    try {
      await meRequest();
      const response = await fetchPagePreview(pageVersionId);
      setPreview(response.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setPreview(null);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger l’aperçu.',
      );
    } finally {
      setLoading(false);
    }
  }, [pageVersionId, navigate]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const versionsBackLink =
    state.landingPageId != null
      ? {
          to: `/landing-pages/${state.landingPageId}/versions`,
          state: {
            landingPageTitle: state.landingPageTitle,
            campaignId: state.campaignId,
            campaignName: state.campaignName,
          },
          label: 'Versions',
        }
      : { to: '/campaigns', state: undefined, label: 'Campagnes' };

  if (!pageVersionId) {
    return (
      <p className="ui-alert ui-alert--error">
        Identifiant de version invalide.{' '}
        <Link to="/campaigns" className="ui-link">
          Retour
        </Link>
      </p>
    );
  }

  const versionLabel =
    preview != null
      ? `v${preview.pageVersion.versionNumber}${
          preview.pageVersion.label ? ` — ${preview.pageVersion.label}` : ''
        }`
      : state.versionNumber != null
        ? `v${state.versionNumber}${
            state.versionLabel ? ` — ${state.versionLabel}` : ''
          }`
        : null;

  const landingTitle =
    preview?.landingPage.title ?? state.landingPageTitle ?? 'Landing page';

  return (
    <div className="preview-studio">
      <div className="preview-toolbar">
        <div className="preview-toolbar__meta">
          <div>
            <p className="preview-toolbar__title">{landingTitle}</p>
            {versionLabel ? (
              <p className="ui-page-header__subtitle" style={{ margin: 0 }}>
                {versionLabel}
              </p>
            ) : null}
          </div>
          {preview ? (
            <div className="preview-toolbar__chips">
              <StatusBadge status={preview.pageVersion.status} />
              <Badge variant="default">/{preview.landingPage.slug}</Badge>
              {preview.render.themeMode === 'dark' ? (
                <Badge variant="primary">Landing sombre</Badge>
              ) : (
                <Badge variant="default">Landing claire</Badge>
              )}
            </div>
          ) : null}
        </div>
        <div className="preview-toolbar__actions">
          <Tabs
            ariaLabel="Mode d’affichage"
            items={[
              { id: 'desktop', label: 'Desktop' },
              { id: 'mobile', label: 'Mobile' },
            ]}
            activeId={viewport}
            onChange={(id) => setViewport(id as ViewportMode)}
          />
          <Link to={versionsBackLink.to} state={versionsBackLink.state}>
            <Button variant="secondary" size="sm">
              ← {versionsBackLink.label}
            </Button>
          </Link>
          {preview ? (
            <Button variant="ghost" size="sm" onClick={() => void loadPreview()}>
              Actualiser
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? <p className="ui-page-header__subtitle">Chargement de l’aperçu…</p> : null}
      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}

      {preview && !loading ? (
        <div className="preview-viewport-wrap">
          <div
            className={[
              'preview-viewport',
              viewport === 'mobile' ? 'preview-viewport--mobile' : 'preview-viewport--desktop',
            ].join(' ')}
          >
            <div className={viewport === 'mobile' ? 'preview-device-frame' : ''}>
              <div className={viewport === 'mobile' ? 'preview-device-frame__screen' : ''}>
                {preview.render.blocksHtml.length === 0 ? (
                  <p className="ui-empty__desc" style={{ padding: '2rem' }}>
                    Aucun bloc à afficher.
                  </p>
                ) : (
                  <article
                    className="lp-document preview-canvas__landing"
                    data-theme={preview.render.themeMode}
                    style={landingThemeStyleToReact(preview.render.themeStyle)}
                  >
                    <HtmlFragment html={preview.render.headerHtml} />
                    <main className="lp-page">
                      {preview.render.blocksHtml.map((block) => (
                        <HtmlFragment key={block.id} html={block.html} />
                      ))}
                    </main>
                    <HtmlFragment html={preview.render.footerHtml} />
                  </article>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
