import {
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  PRIORITY_LABELS,
} from '../../lib/leads';
import { STATUS_LABELS } from '../../lib/lead-dashboard';
import type { CampaignListItem } from '../../lib/campaigns';
import type { LandingPageListItem } from '../../lib/landing-pages';
import type { AssignableUser } from '../../lib/leads';
import { CRM_FILTER_APPLY_BTN_CLASS } from '@/lib/lead-badge-styles';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export type LeadsFilterValues = {
  search: string;
  status: string;
  campaignId: string;
  landingPageId: string;
  priority: string;
  assignedToUserId: string;
  overdueOnly: boolean;
};

type LeadsFiltersProps = {
  values: LeadsFilterValues;
  campaigns: CampaignListItem[];
  landingPages: LandingPageListItem[];
  assignableUsers: AssignableUser[];
  onChange: (values: LeadsFilterValues) => void;
  onRefresh: () => void;
  onApply: () => void;
  loading?: boolean;
};

export default function LeadsFilters({
  values,
  campaigns,
  landingPages,
  assignableUsers,
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
    <div className="ui-filter-panel leads-filters">
      <div className="ui-filter-panel__grid">
        <div className="ui-field--span-2">
          <Input
            label="Recherche"
            type="search"
            placeholder="Nom, email ou téléphone"
            value={values.search}
            onChange={(e) => updateField('search', e.target.value)}
          />
        </div>
        <Select
          label="Statut"
          value={values.status}
          onChange={(e) => updateField('status', e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status] ?? status}
            </option>
          ))}
        </Select>
        <Select
          label="Campagne"
          value={values.campaignId}
          onChange={(e) => updateField('campaignId', e.target.value)}
        >
          <option value="">Toutes les campagnes</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </Select>
        <Select
          label="Landing page"
          value={values.landingPageId}
          onChange={(e) => updateField('landingPageId', e.target.value)}
          disabled={!values.campaignId}
          hint={!values.campaignId ? 'Sélectionnez d’abord une campagne' : undefined}
        >
          <option value="">Toutes les landing pages</option>
          {landingPages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title}
            </option>
          ))}
        </Select>
        <Select
          label="Priorité"
          value={values.priority}
          onChange={(e) => updateField('priority', e.target.value)}
        >
          <option value="">Toutes les priorités</option>
          {LEAD_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </Select>
        <Select
          label="Assigné à"
          value={values.assignedToUserId}
          onChange={(e) => updateField('assignedToUserId', e.target.value)}
        >
          <option value="">Tous les assignés</option>
          {assignableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </Select>
        <label className="ui-checkbox-field">
          <input
            type="checkbox"
            className="ui-checkbox-field__input"
            checked={values.overdueOnly}
            onChange={(e) => updateField('overdueOnly', e.target.checked)}
          />
          <span className="ui-checkbox-field__label">Relances en retard uniquement</span>
        </label>
      </div>
      <div className="ui-filter-panel__footer">
        <Button
          type="button"
          onClick={onApply}
          disabled={loading}
          className={CRM_FILTER_APPLY_BTN_CLASS}
        >
          Appliquer les filtres
        </Button>
        <Button type="button" variant="secondary" onClick={onRefresh} disabled={loading}>
          Rafraîchir
        </Button>
      </div>
    </div>
  );
}
