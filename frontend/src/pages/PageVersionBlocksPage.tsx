import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  BLOCK_TYPES,
  canManagePageBlocks,
  createPageBlock,
  DEFAULT_BLOCK_PROPS,
  listPageBlocks,
  type BlockType,
  type PageBlockItem,
} from '../lib/page-blocks';

type LocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  versionStatus?: string;
  landingPageId?: string;
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

export default function PageVersionBlocksPage() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const [blocks, setBlocks] = useState<PageBlockItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [blockType, setBlockType] = useState<BlockType>('hero');
  const [propsText, setPropsText] = useState(() =>
    JSON.stringify(DEFAULT_BLOCK_PROPS.hero, null, 2),
  );

  const loadData = useCallback(async () => {
    if (!pageVersionId) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [profile, blocksResponse] = await Promise.all([
        meRequest(),
        listPageBlocks(pageVersionId),
      ]);
      setRole(profile.data.role);
      setBlocks(blocksResponse.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les blocs.',
      );
    } finally {
      setLoading(false);
    }
  }, [pageVersionId, navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleBlockTypeChange(nextType: BlockType) {
    setBlockType(nextType);
    setPropsText(JSON.stringify(DEFAULT_BLOCK_PROPS[nextType], null, 2));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pageVersionId) {
      return;
    }

    let propsJson: Record<string, unknown>;
    try {
      propsJson = JSON.parse(propsText) as Record<string, unknown>;
      if (typeof propsJson !== 'object' || propsJson === null || Array.isArray(propsJson)) {
        throw new Error('invalid');
      }
    } catch {
      setError('Le contenu JSON du bloc est invalide.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createPageBlock(pageVersionId, { blockType, propsJson });
      setPropsText(JSON.stringify(DEFAULT_BLOCK_PROPS[blockType], null, 2));
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de créer le bloc.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canWrite = role ? canManagePageBlocks(role) : false;

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

  const versionTitle =
    state.versionNumber != null
      ? `v${state.versionNumber}${state.versionLabel ? ` — ${state.versionLabel}` : ''}`
      : `Version ${pageVersionId}`;

  return (
    <main className="dashboard campaigns-page">
      <header className="dashboard__header">
        <div>
          <h1>Blocs de page</h1>
          <p className="dashboard__subtitle">
            {versionTitle}
            {state.versionStatus ? ` (${state.versionStatus})` : ''}
            {state.landingPageTitle ? ` — ${state.landingPageTitle}` : ''}
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

      <section className="dashboard__card">
        <h2>Version</h2>
        <ul className="dashboard__meta">
          <li>
            <strong>ID :</strong> {pageVersionId}
          </li>
          {state.versionNumber != null ? (
            <li>
              <strong>Numéro :</strong> {state.versionNumber}
            </li>
          ) : null}
          {state.versionLabel ? (
            <li>
              <strong>Libellé :</strong> {state.versionLabel}
            </li>
          ) : null}
        </ul>
      </section>

      {loading ? <p>Chargement des blocs…</p> : null}
      {error ? <p className="dashboard__error">{error}</p> : null}

      {canWrite ? (
        <section className="dashboard__card campaigns-form">
          <h2>Nouveau bloc</h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <label className="auth-form__field">
              <span>Type de bloc</span>
              <select
                value={blockType}
                onChange={(e) => handleBlockTypeChange(e.target.value as BlockType)}
              >
                {BLOCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="auth-form__field">
              <span>Contenu (JSON)</span>
              <textarea
                className="blocks-form__textarea"
                value={propsText}
                onChange={(e) => setPropsText(e.target.value)}
                rows={8}
                spellCheck={false}
              />
            </label>
            <button
              type="submit"
              className="auth-form__submit"
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Ajouter le bloc'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="dashboard__card">
        <h2>Blocs ({blocks.length})</h2>
        {blocks.length === 0 && !loading ? (
          <p>Aucun bloc pour cette version.</p>
        ) : (
          <ul className="campaigns-list">
            {blocks.map((block) => (
              <li key={block.id} className="campaigns-list__item">
                <div className="campaigns-list__title">
                  #{block.sortOrder} — {block.blockType.toUpperCase()}
                  <span className="campaigns-list__meta"> ({block.blockKey})</span>
                </div>
                <pre className="blocks-list__props">
                  {JSON.stringify(block.propsJson, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
