import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  fetchPagePreview,
  propString,
  propsAsRecord,
  type PagePreviewData,
  type PreviewBlock,
} from '../lib/page-preview';

type LocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  landingPageId?: string;
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

function PreviewBlockView({ block }: { block: PreviewBlock }) {
  const props = propsAsRecord(block.propsJson);
  const type = block.blockType.toLowerCase();

  if (type === 'hero') {
    const title = propString(props, 'title');
    const subtitle = propString(props, 'subtitle');
    const buttonText = propString(props, 'buttonText');

    return (
      <section className="preview-block preview-block--hero">
        {title ? <h2 className="preview-block__title">{title}</h2> : null}
        {subtitle ? <p className="preview-block__subtitle">{subtitle}</p> : null}
        {buttonText ? (
          <span className="preview-block__button">{buttonText}</span>
        ) : null}
      </section>
    );
  }

  if (type === 'text') {
    const content = propString(props, 'content', 'text', 'body');

    return (
      <section className="preview-block preview-block--text">
        <p>{content ?? '—'}</p>
      </section>
    );
  }

  if (type === 'image') {
    const imageUrl = propString(props, 'imageUrl', 'src', 'url');
    const alt = propString(props, 'alt') ?? 'Image';

    return (
      <section className="preview-block preview-block--image">
        {imageUrl ? (
          <img src={imageUrl} alt={alt} className="preview-block__image" />
        ) : (
          <div className="preview-block__placeholder">Image non définie</div>
        )}
      </section>
    );
  }

  if (type === 'button') {
    const label = propString(props, 'label', 'text', 'buttonText');
    const target = propString(props, 'target', 'href', 'buttonTarget');

    return (
      <section className="preview-block preview-block--button">
        <span className="preview-block__button">{label ?? 'Bouton'}</span>
        {target ? (
          <span className="preview-block__meta">→ {target}</span>
        ) : null}
      </section>
    );
  }

  return (
    <section className="preview-block preview-block--unknown">
      <p>Type de bloc inconnu : {block.blockType}</p>
      <pre className="blocks-list__props">{JSON.stringify(props, null, 2)}</pre>
    </section>
  );
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
            </p>
          </section>

          <div className="preview-canvas">
            {preview.blocks.length === 0 ? (
              <p className="preview-canvas__empty">Aucun bloc à afficher.</p>
            ) : (
              preview.blocks.map((block) => (
                <PreviewBlockView key={block.id} block={block} />
              ))
            )}
          </div>
        </>
      ) : null}
    </main>
  );
}
