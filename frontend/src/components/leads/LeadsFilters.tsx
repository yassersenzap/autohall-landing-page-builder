import { LEAD_STATUSES } from '../../lib/leads';
import type { CampaignListItem } from '../../lib/campaigns';
import type { LandingPageListItem } from '../../lib/landing-pages';

export type LeadsFilterValues = {
  search: string;
  status: string;
  campaignId: string;
  landingPageId: string;
};

type LeadsFiltersProps = {
  values: LeadsFilterValues;
  campaigns: CampaignListItem[];
  landingPages: LandingPageListItem[];
  onChange: (values: LeadsFilterValues) => void;
  onRefresh: () => void;
  onApply: () => void;
  loading?: boolean;
};

export default function LeadsFilters({
  values,
  campaigns,
  landingPages,
  onChange,
  onRefresh,
  onApply,
  loading = false,
}: LeadsFiltersProps) {
  function updateField<K extends keyof LeadsFilterValues>(
    field: K,
    value: LeadsFilterValues[K],
  ) {
    const next = { ...values, [field]: value };
    if (field === 'campaignId') {
      next.landingPageId = '';
    }
    onChange(next);
  }

  return (
    <section className="dashboard__card leads-filters">
      <h2>Filtres</h2>
      <div className="leads-filters__grid">
        <label className="auth-form__field">
          <span>Recherche</span>
          <input
            type="search"
            placeholder="Nom, email ou téléphone"
            value={values.search}
            onChange={(e) => updateField('search', e.target.value)}
          />
        </label>
        <label className="auth-form__field">
          <span>Statut</span>
          <select
            value={values.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="">Tous</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="auth-form__field">
          <span>Campagne</span>
          <select
            value={values.campaignId}
            onChange={(e) => updateField('campaignId', e.target.value)}
          >
            <option value="">Toutes</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </label>
        <label className="auth-form__field">
          <span>Landing page</span>
          <select
            value={values.landingPageId}
            onChange={(e) => updateField('landingPageId', e.target.value)}
            disabled={!values.campaignId}
          >
            <option value="">Toutes</option>
            {landingPages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="leads-filters__actions">
        <button
          type="button"
          className="auth-form__submit"
          onClick={onApply}
          disabled={loading}
        >
          Appliquer
        </button>
        <button
          type="button"
          className="dashboard__logout leads-filters__refresh"
          onClick={onRefresh}
          disabled={loading}
        >
          Rafraîchir
        </button>
      </div>
    </section>
  );
}
