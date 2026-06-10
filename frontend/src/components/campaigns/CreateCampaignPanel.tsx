import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';

import { AutoHallPanel } from '@/components/admin/AutoHallPanel';
import { DASHBOARD01_CONTENT_PAD } from '@/components/admin/dashboard01-layout';
import { ApiError } from '@/lib/api';
import { createCampaign } from '@/lib/campaigns';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';

type CreateCampaignPanelProps = {
  onCreated: () => void;
};

export function CreateCampaignPanel({ onCreated }: CreateCampaignPanelProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Auto Hall');
  const [model, setModel] = useState('');
  const [campaignType, setCampaignType] = useState('PROMOTION');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Impossible de créer la campagne.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={DASHBOARD01_CONTENT_PAD}>
      <AutoHallPanel
        title="Nouvelle campagne"
        description="Créez une campagne pour regrouper vos landing pages et versions."
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="campaign-name">Nom</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={180}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-brand">Marque</Label>
            <Input
              id="campaign-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-model">Modèle (optionnel)</Label>
            <Input
              id="campaign-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-type">Type</Label>
            <Input
              id="campaign-type"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              required
              maxLength={80}
            />
          </div>
          {error ? (
            <p className="sm:col-span-2 text-sm text-destructive">{error}</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              <Plus className="size-4" aria-hidden />
              {submitting ? 'Création…' : 'Créer la campagne'}
            </Button>
          </div>
        </form>
      </AutoHallPanel>
    </section>
  );
}
