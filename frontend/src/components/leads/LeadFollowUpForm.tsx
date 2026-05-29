import { useState, type FormEvent } from 'react';
import {
  LEAD_PRIORITIES,
  PRIORITY_LABELS,
  toDateTimeLocalValue,
  type AssignableUser,
  type LeadEventDetail,
} from '../../lib/leads';

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
    <form className="auth-form lead-status-form" onSubmit={handleSubmit}>
      <label className="auth-form__field">
        <span>Priorité</span>
        <select
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
      </label>
      <label className="auth-form__field">
        <span>Assigné à</span>
        <select
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
      </label>
      <label className="auth-form__field">
        <span>Prochaine relance</span>
        <input
          type="datetime-local"
          value={nextFollowUpAt}
          onChange={(e) => setNextFollowUpAt(e.target.value)}
          disabled={submitting}
        />
      </label>
      {lead.lastContactAt ? (
        <p className="lead-detail__text">
          Dernier contact : {new Date(lead.lastContactAt).toLocaleString('fr-FR')}
        </p>
      ) : null}
      <button type="submit" className="auth-form__submit" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Enregistrer le suivi'}
      </button>
    </form>
  );
}
