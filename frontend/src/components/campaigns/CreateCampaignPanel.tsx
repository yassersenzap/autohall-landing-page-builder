import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { createCampaign } from '@/lib/campaigns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ShadButton,
  ShadInput,
} from '@/components/ui/primitives';

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
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle campagne</CardTitle>
        <CardDescription>
          Créez une campagne pour regrouper vos landing pages et versions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <ShadInput label="Nom" value={name} onChange={(e) => setName(e.target.value)} required maxLength={180} />
          <ShadInput label="Marque" value={brand} onChange={(e) => setBrand(e.target.value)} required maxLength={100} />
          <ShadInput
            label="Modèle (optionnel)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            maxLength={100}
          />
          <ShadInput
            label="Type"
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            required
            maxLength={80}
          />
          {error ? (
            <p className="sm:col-span-2 text-sm text-destructive">{error}</p>
          ) : null}
          <div className="sm:col-span-2">
            <ShadButton type="submit" disabled={submitting}>
              <Plus className="h-4 w-4" />
              {submitting ? 'Création…' : 'Créer la campagne'}
            </ShadButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
