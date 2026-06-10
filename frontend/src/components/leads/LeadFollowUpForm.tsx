import { useState, type FormEvent } from 'react';
import {
  LEAD_PRIORITIES,
  PRIORITY_LABELS,
  toDateTimeLocalValue,
  type AssignableUser,
  type LeadEventDetail,
} from '../../lib/leads';
import { Button } from '@/ui-lab/ui/button';
import { Input } from '@/ui-lab/ui/input';
import { Label } from '@/ui-lab/ui/label';

const selectClassName =
  'ah-admin-native-select flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

type LeadFollowUpFormProps = {
  lead: LeadEventDetail;
  assignableUsers: AssignableUser[];
  submitting: boolean;
  onSubmit: (payload: {
    assignedToUserId: string | null;
    priority: string;
    nextFollowUpAt: string | null;
  }) => Promise<void>;
};

export default function LeadFollowUpForm({
  lead,
  assignableUsers,
  submitting,
  onSubmit,
}: LeadFollowUpFormProps) {
  const [priority, setPriority] = useState(lead.priority);
  const [assignedToUserId, setAssignedToUserId] = useState(
    lead.assignedToUserId ?? '',
  );
  const [nextFollowUpAt, setNextFollowUpAt] = useState(
    toDateTimeLocalValue(lead.nextFollowUpAt),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      assignedToUserId: assignedToUserId || null,
      priority,
      nextFollowUpAt: nextFollowUpAt
        ? new Date(nextFollowUpAt).toISOString()
        : null,
    });
  }

  return (
    <form className="grid max-w-md gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="lead-priority">Priorité</Label>
        <select
          id="lead-priority"
          className={selectClassName}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={submitting}
        >
          {LEAD_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lead-assigned">Assigné à</Label>
        <select
          id="lead-assigned"
          className={selectClassName}
          value={assignedToUserId}
          onChange={(e) => setAssignedToUserId(e.target.value)}
          disabled={submitting}
        >
          <option value="">Non assigné</option>
          {assignableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lead-follow-up">Prochaine relance</Label>
        <Input
          id="lead-follow-up"
          type="datetime-local"
          value={nextFollowUpAt}
          onChange={(e) => setNextFollowUpAt(e.target.value)}
          disabled={submitting}
        />
      </div>
      {lead.lastContactAt ? (
        <p className="text-sm text-muted-foreground">
          Dernier contact :{' '}
          {new Date(lead.lastContactAt).toLocaleString('fr-FR')}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Enregistrer le suivi'}
      </Button>
    </form>
  );
}
