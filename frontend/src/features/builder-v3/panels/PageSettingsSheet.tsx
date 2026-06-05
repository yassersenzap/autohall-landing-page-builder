import { useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Label,
  ShadButton,
  ShadInput,
  ShadTextarea,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import {
  useBuilderDocumentStore,
  type PageSettingsDraft,
} from '@/features/builder-engine/store/builder-document.store';
import { MediaUploader } from '../components/MediaUploader';
import { FieldHint } from '../components/BlockInspectorPanel.shared';

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;

function CharCounter({
  value,
  max,
  recommended,
}: {
  value: string;
  max: number;
  recommended?: boolean;
}) {
  const length = value.length;
  const over = length > max;
  return (
    <p
      className={cn(
        'text-right text-xs tabular-nums',
        over ? 'text-amber-400' : recommended ? 'text-neutral-500' : 'text-neutral-600',
      )}
    >
      {length}/{max} caractères
    </p>
  );
}

type PageSettingsFieldsProps = {
  settings: PageSettingsDraft;
  onChange: (patch: Partial<PageSettingsDraft>) => void;
};

export function PageSettingsFields({ settings, onChange }: PageSettingsFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="page-meta-title" className="text-neutral-400">
          Meta titre
        </Label>
        <ShadInput
          id="page-meta-title"
          value={settings.metaTitle}
          maxLength={META_TITLE_MAX + 20}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          placeholder="Nouvelle Ford Mustang | Auto Hall"
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
        <CharCounter value={settings.metaTitle} max={META_TITLE_MAX} recommended />
        <FieldHint>
          Titre affiché dans Google et l&apos;onglet navigateur — idéalement 50–60 caractères.
        </FieldHint>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-meta-description" className="text-neutral-400">
          Meta description
        </Label>
        <ShadTextarea
          id="page-meta-description"
          rows={4}
          value={settings.metaDescription}
          maxLength={META_DESCRIPTION_MAX}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          placeholder="Offre exclusive, essai gratuit et financement sur mesure chez Auto Hall."
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
        <CharCounter value={settings.metaDescription} max={META_DESCRIPTION_MAX} recommended />
        <FieldHint>
          Résumé pour les moteurs de recherche et le partage social — max 160 caractères.
        </FieldHint>
      </div>

      <MediaUploader
        label="Image de partage (Open Graph)"
        value={settings.ogImageUrl}
        onChange={(url) => onChange({ ogImageUrl: url })}
      />
      <FieldHint>
        Visuel affiché sur WhatsApp, LinkedIn et Facebook — format paysage 1200×630 px recommandé.
      </FieldHint>

      <MediaUploader
        label="Favicon (optionnel)"
        value={settings.faviconUrl}
        onChange={(url) => onChange({ faviconUrl: url })}
      />
      <FieldHint>Icône de l&apos;onglet navigateur — carré 32×32 ou 64×64 px.</FieldHint>
    </div>
  );
}

type PageSettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PageSettingsSheet({ open, onOpenChange }: PageSettingsSheetProps) {
  const pageSettings = useBuilderDocumentStore((s) => s.pageSettings);
  const setPageSettings = useBuilderDocumentStore((s) => s.setPageSettings);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Fermer les paramètres"
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-settings-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Configuration globale
            </p>
            <h2 id="page-settings-title" className="mt-1 text-base font-semibold text-neutral-100">
              Paramètres de la page
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              SEO &amp; partage social — visible dans l&apos;aperçu et l&apos;export.
            </p>
          </div>
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 w-8 shrink-0 border-neutral-700 bg-neutral-900 p-0 text-neutral-300"
            onClick={() => onOpenChange(false)}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </ShadButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <PageSettingsFields
            settings={pageSettings}
            onChange={(patch) => setPageSettings(patch)}
          />
        </div>

        <footer className="border-t border-neutral-800 px-5 py-3">
          <ShadButton
            type="button"
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            onClick={() => onOpenChange(false)}
          >
            Terminé
          </ShadButton>
        </footer>
      </aside>
    </div>
  );
}

export { META_DESCRIPTION_MAX, META_TITLE_MAX };
