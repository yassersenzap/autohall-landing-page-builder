import { useState, type FormEvent } from 'react';
import {
  LEAD_PRIORITIES,
  PRIORITY_LABELS,
  toDateTimeLocalValue,
  type AssignableUser,
  type LeadEventDetail,
} from '../../lib/leads';
import { CRM_FIELD_CLASS, CRM_SUBMIT_BTN_CLASS } from '@/lib/lead-badge-styles';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

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
    <form className="ui-form-stack" onSubmit={handleSubmit}>
      <Select
        label="Priorité"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        disabled={submitting}
        className={CRM_FIELD_CLASS}
      >
        {LEAD_PRIORITIES.map((value) => (
          <option key={value} value={value}>
            {PRIORITY_LABELS[value]}
          </option>
        ))}
      </Select>
      <Select
        label="Assigné à"
        value={assignedToUserId}
        onChange={(e) => setAssignedToUserId(e.target.value)}
        disabled={submitting}
        className={CRM_FIELD_CLASS}
      >
        <option value="">Non assigné</option>
        {assignableUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName}
          </option>
        ))}
      </Select>
      <Input
        label="Prochaine relance"
        type="datetime-local"
        value={nextFollowUpAt}
        onChange={(e) => setNextFollowUpAt(e.target.value)}
        disabled={submitting}
        className={CRM_FIELD_CLASS}
      />
      {lead.lastContactAt ? (
        <p className="lead-detail__text">
          Dernier contact :{' '}
          {new Date(lead.lastContactAt).toLocaleString('fr-FR')}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting} className={CRM_SUBMIT_BTN_CLASS}>
        {submitting ? 'Enregistrement…' : 'Enregistrer le suivi'}
      </Button>
    </form>
  );
}
