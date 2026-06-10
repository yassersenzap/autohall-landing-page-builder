import {
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  PRIORITY_LABELS,
} from '../../lib/leads';
import { STATUS_LABELS } from '../../lib/lead-dashboard';
import type { CampaignListItem } from '../../lib/campaigns';
import type { LandingPageListItem } from '../../lib/landing-pages';
import type { AssignableUser } from '../../lib/leads';
import { Button } from '@/ui-lab/ui/button';
import { Input } from '@/ui-lab/ui/input';
import { Label } from '@/ui-lab/ui/label';
import { cn } from '@/lib/utils';

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

const selectClassName =
  'ah-admin-native-select flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

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
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="grid gap-2 sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <Label htmlFor="leads-search">Recherche</Label>
          <Input
            id="leads-search"
            type="search"
            placeholder="Nom, email ou téléphone"
            value={values.search}
            onChange={(e) => updateField('search', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="leads-status">Statut</Label>
          <select
            id="leads-status"
            className={selectClassName}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] ?? status}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="leads-campaign">Campagne</Label>
          <select
            id="leads-campaign"
            className={selectClassName}
            value={values.campaignId}
            onChange={(e) => updateField('campaignId', e.target.value)}
          >
            <option value="">Toutes les campagnes</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="leads-landing">Landing page</Label>
          <select
            id="leads-landing"
            className={cn(selectClassName, !values.campaignId && 'opacity-60')}
            value={values.landingPageId}
            onChange={(e) => updateField('landingPageId', e.target.value)}
            disabled={!values.campaignId}
          >
            <option value="">
              {values.campaignId
                ? 'Toutes les landing pages'
                : 'Sélectionnez d’abord une campagne'}
            </option>
            {landingPages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="leads-priority">Priorité</Label>
          <select
            id="leads-priority"
            className={selectClassName}
            value={values.priority}
            onChange={(e) => updateField('priority', e.target.value)}
          >
            <option value="">Toutes les priorités</option>
            {LEAD_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="leads-assigned">Assigné à</Label>
          <select
            id="leads-assigned"
            className={selectClassName}
            value={values.assignedToUserId}
            onChange={(e) => updateField('assignedToUserId', e.target.value)}
          >
            <option value="">Tous les assignés</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="ah-admin-checkbox size-4 rounded border-input accent-primary"
              checked={values.overdueOnly}
              onChange={(e) => updateField('overdueOnly', e.target.checked)}
            />
            <span>Relances en retard uniquement</span>
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onApply} disabled={loading}>
          Appliquer les filtres
        </Button>
        <Button type="button" variant="outline" onClick={onRefresh} disabled={loading}>
          Rafraîchir
        </Button>
      </div>
    </div>
  );
}
