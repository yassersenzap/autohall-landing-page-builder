import { useState, type FormEvent } from 'react';
import { STATUS_LABELS } from '../../lib/lead-dashboard';
import { LEAD_STATUSES } from '../../lib/leads';
import { CRM_FIELD_CLASS, CRM_SUBMIT_BTN_CLASS } from '@/lib/lead-badge-styles';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

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
    <form className="ui-form-stack lead-status-form" onSubmit={handleSubmit}>
      <Select
        label="Statut"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={submitting}
        className={CRM_FIELD_CLASS}
      >
        {LEAD_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value] ?? value}
          </option>
        ))}
      </Select>
      <label className="ui-field">
        <span className="ui-field__label">Commentaire interne</span>
        <textarea
          className={`ui-textarea ${CRM_FIELD_CLASS}`}
          rows={4}
          placeholder="Notes visibles uniquement en interne"
          value={internalComment}
          onChange={(e) => setInternalComment(e.target.value)}
          disabled={submitting}
        />
      </label>
      <Button type="submit" disabled={submitting} className={CRM_SUBMIT_BTN_CLASS}>
        {submitting ? 'Enregistrement…' : 'Enregistrer le statut'}
      </Button>
    </form>
  );
}
