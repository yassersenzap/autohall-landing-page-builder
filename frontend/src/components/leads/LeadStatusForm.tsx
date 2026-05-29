import { useState, type FormEvent } from 'react';
import { LEAD_STATUSES } from '../../lib/leads';

type LeadStatusFormProps = {
  currentStatus: string;
  currentInternalComment: string | null;
  submitting: boolean;
  onSubmit: (status: string, internalComment: string) => Promise<void>;
};

export default function LeadStatusForm({
  currentStatus,
  currentInternalComment,
  submitting,
  onSubmit,
}: LeadStatusFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [internalComment, setInternalComment] = useState(
    currentInternalComment ?? '',
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(status, internalComment);
  }

  return (
    <form className="auth-form lead-status-form" onSubmit={handleSubmit}>
      <h2>Gestion du statut</h2>
      <label className="auth-form__field">
        <span>Statut</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={submitting}
        >
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="auth-form__field">
        <span>Commentaire interne</span>
        <textarea
          rows={4}
          placeholder="Notes visibles uniquement en interne"
          value={internalComment}
          onChange={(e) => setInternalComment(e.target.value)}
          disabled={submitting}
        />
      </label>
      <button type="submit" className="auth-form__submit" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
