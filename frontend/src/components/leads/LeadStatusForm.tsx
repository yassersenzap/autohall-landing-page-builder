import { useState, type FormEvent } from 'react';
import { STATUS_LABELS } from '../../lib/lead-dashboard';
import { LEAD_STATUSES } from '../../lib/leads';
import { Button } from '@/components/ui/shadcn/button';
import { Label } from '@/components/ui/shadcn/label';

const selectClassName =
  'ah-admin-native-select flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

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
    <form className="grid max-w-md gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="lead-status">Statut</Label>
        <select
          id="lead-status"
          className={selectClassName}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={submitting}
        >
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value] ?? value}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lead-internal-comment">Commentaire interne</Label>
        <textarea
          id="lead-internal-comment"
          className="ah-admin-textarea"
          rows={4}
          placeholder="Notes visibles uniquement en interne"
          value={internalComment}
          onChange={(e) => setInternalComment(e.target.value)}
          disabled={submitting}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Enregistrer le statut'}
      </Button>
    </form>
  );
}
