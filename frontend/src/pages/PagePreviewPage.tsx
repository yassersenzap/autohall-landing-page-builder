import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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

  const loadPreview = useCallback(async () => {
    if (!pageVersionId) {
      return;
    }

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
          label: 'Retour aux versions',
        }
      : { to: '/campaigns', state: undefined, label: 'Retour aux campagnes' };

  if (!pageVersionId) {
    return (
      <main className="dashboard">
        <p className="dashboard__error">Identifiant de version invalide.</p>
        <Link to="/campaigns">Retour aux campagnes</Link>
      </main>
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

  return (
    <main className="dashboard preview-page">
      <header className="dashboard__header">
        <div>
          <h1>Aperçu</h1>
          <p className="dashboard__subtitle">
            {preview?.landingPage.title ?? state.landingPageTitle ?? 'Landing page'}
            {versionLabel ? ` · ${versionLabel}` : ''}
          </p>
        </div>
        <Link
          to={versionsBackLink.to}
          state={versionsBackLink.state}
          className="dashboard__link"
        >
          {versionsBackLink.label}
        </Link>
      </header>

      {loading ? <p>Chargement de l’aperçu…</p> : null}
      {error ? <p className="dashboard__error">{error}</p> : null}

      {preview && !loading ? (
        <>
          <section className="dashboard__card preview-meta">
            <p className="preview-meta__line">
              <strong>Campagne :</strong> {preview.campaign.name} ({preview.campaign.brand})
            </p>
            <p className="preview-meta__line">
              <strong>Landing :</strong> /{preview.landingPage.slug} — {preview.landingPage.status}
            </p>
            <p className="preview-meta__line">
              <strong>Version :</strong> {preview.pageVersion.status}
              {preview.render.themeMode === 'dark' ? ' · thème sombre' : ''}
            </p>
          </section>

          <div className="preview-canvas">
            {preview.render.blocksHtml.length === 0 ? (
              <p className="preview-canvas__empty">Aucun bloc à afficher.</p>
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
        </>
      ) : null}
    </main>
  );
}
