import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
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

  function getOptionalCount(
    source: CampaignListItem,
    key: 'landingPagesCount' | 'versionsCount',
  ): number | null {
    const value = (source as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : null;
  }

  return (
    <div className="studio-stack">
      <PageHeader
        title="Campagnes"
        subtitle="Gérez les campagnes marketing et leurs landing pages associées."
        backTo="/dashboard"
        backLabel="Tableau de bord"
      />

      {loading ? <p className="ui-page-header__subtitle">Chargement…</p> : null}
      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}

      <Card title="Workflow recommandé">
        <ol className="studio-workflow">
          <li className="studio-workflow__item studio-workflow__item--active">1. Créer ou choisir une campagne</li>
          <li className="studio-workflow__item">2. Ajouter une landing page</li>
          <li className="studio-workflow__item">3. Créer une version et éditer le contenu</li>
          <li className="studio-workflow__item">4. Prévisualiser, publier et exporter ZIP</li>
        </ol>
      </Card>

      {canWrite ? (
        <Card title="Nouvelle campagne">
          <form className="campaign-form-grid" onSubmit={handleCreate}>
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={180}
            />
            <Input
              label="Marque"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              maxLength={100}
            />
            <Input
              label="Modèle (optionnel)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              maxLength={100}
            />
            <Input
              label="Type de campagne"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              required
              maxLength={80}
            />
            <div className="campaign-form-grid__actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer la campagne'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card title={`Campagnes (${campaigns.length})`}>
        {campaigns.length === 0 && !loading ? (
          <EmptyState
            title="Aucune campagne disponible"
            description="Une campagne regroupe vos landing pages et leurs versions. Créez votre première campagne pour démarrer le flow studio."
          />
        ) : (
          <ul className="campaigns-list">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="campaigns-list__item">
                <div className="campaigns-list__title">
                  {campaign.name}
                  <StatusBadge status={campaign.status} />
                </div>
                <div className="campaigns-list__meta">
                  {campaign.brand}
                  {campaign.model ? ` — ${campaign.model}` : ''} · Type :{' '}
                  {campaign.campaignType}
                </div>
                <div className="campaigns-list__meta">
                  Landing pages : {getOptionalCount(campaign, 'landingPagesCount') ?? '—'} · Versions :{' '}
                  {getOptionalCount(campaign, 'versionsCount') ?? '—'}
                </div>
                <div className="campaigns-list__actions">
                  <Link
                    to={`/campaigns/${campaign.id}/landing-pages`}
                    state={{ campaignName: campaign.name }}
                    className="ui-btn ui-btn--primary ui-btn--sm"
                  >
                    Ouvrir
                  </Link>
                  <Link
                    to={`/campaigns/${campaign.id}/landing-pages`}
                    state={{ campaignName: campaign.name }}
                    className="ui-btn ui-btn--secondary ui-btn--sm"
                  >
                    Nouvelle landing page
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
