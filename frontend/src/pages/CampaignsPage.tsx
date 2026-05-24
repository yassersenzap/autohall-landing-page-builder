import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  canManageCampaigns,
  createCampaign,
  listCampaigns,
  type CampaignListItem,
} from '../lib/campaigns';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Auto Hall');
  const [model, setModel] = useState('');
  const [campaignType, setCampaignType] = useState('PROMOTION');

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const [profile, campaignsResponse] = await Promise.all([
        meRequest(),
        listCampaigns(),
      ]);
      setRole(profile.data.role);
      setCampaigns(campaignsResponse.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les campagnes.',
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createCampaign({
        name,
        brand,
        campaignType,
        model: model.trim() || undefined,
      });
      setName('');
      setModel('');
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de créer la campagne.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canWrite = role ? canManageCampaigns(role) : false;

  return (
    <main className="dashboard campaigns-page">
      <header className="dashboard__header">
        <div>
          <h1>Campagnes</h1>
          <p className="dashboard__subtitle">
            Liste des campagnes marketing Auto Hall.
          </p>
        </div>
        <Link to="/dashboard" className="dashboard__link">
          Tableau de bord
        </Link>
      </header>

      {loading ? <p>Chargement des campagnes…</p> : null}
      {error ? <p className="dashboard__error">{error}</p> : null}

      {canWrite ? (
        <section className="dashboard__card campaigns-form">
          <h2>Nouvelle campagne</h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <label className="auth-form__field">
              <span>Nom</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={180}
              />
            </label>
            <label className="auth-form__field">
              <span>Marque</span>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                maxLength={100}
              />
            </label>
            <label className="auth-form__field">
              <span>Modèle (optionnel)</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                maxLength={100}
              />
            </label>
            <label className="auth-form__field">
              <span>Type de campagne</span>
              <input
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                required
                maxLength={80}
              />
            </label>
            <button
              type="submit"
              className="auth-form__submit"
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Créer la campagne'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="dashboard__card">
        <h2>Campagnes ({campaigns.length})</h2>
        {campaigns.length === 0 && !loading ? (
          <p>Aucune campagne pour le moment.</p>
        ) : (
          <ul className="campaigns-list">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="campaigns-list__item">
                <div className="campaigns-list__title">{campaign.name}</div>
                <div className="campaigns-list__meta">
                  <span>{campaign.brand}</span>
                  {campaign.model ? <span> — {campaign.model}</span> : null}
                  <span className={`campaigns-list__status status-${campaign.status.toLowerCase()}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="campaigns-list__meta">
                  Type : {campaign.campaignType}
                </div>
                <div className="campaigns-list__actions">
                  <Link
                    to={`/campaigns/${campaign.id}/landing-pages`}
                    state={{ campaignName: campaign.name }}
                  >
                    Landing pages
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
