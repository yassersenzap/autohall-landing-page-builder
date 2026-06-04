import { ShadInput, Label } from '@/components/ui/primitives';
import {
  useBuilderDocumentStore,
  type PageThemeDraft,
} from '../../store/builder-document.store';
import { PageReadinessPanel } from './PageReadinessPanel';
import { InspectorSelect } from './InspectorPrimitives';

export function PageSettingsPanel() {
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);
  const setPageTheme = useBuilderDocumentStore((s) => s.setPageTheme);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Réglages globaux de la landing. Enregistrés avec la page lors de la sauvegarde.
      </p>

      <PageReadinessPanel />

      <div className="space-y-3 rounded-lg border border-border bg-card p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Design
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Couleur primaire</Label>
          <div className="flex gap-2">
            <input
              type="color"
              className="h-9 w-12 cursor-pointer rounded border border-border"
              value={pageTheme.primaryColor}
              onChange={(e) => setPageTheme({ primaryColor: e.target.value })}
            />
            <ShadInput
              value={pageTheme.primaryColor}
              onChange={(e) => setPageTheme({ primaryColor: e.target.value })}
            />
          </div>
        </div>
        <InspectorSelect
          label="Mode clair / sombre"
          value={pageTheme.mode}
          options={[
            { value: 'dark', label: 'Sombre' },
            { value: 'light', label: 'Clair' },
          ]}
          onChange={(value) => setPageTheme({ mode: value as 'light' | 'dark' })}
        />
        <InspectorSelect
          label="Échelle des titres"
          value={pageTheme.headingScale}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal', label: 'Normal' },
            { value: 'large', label: 'Large' },
          ]}
          onChange={(value) =>
            setPageTheme({ headingScale: value as PageThemeDraft['headingScale'] })
          }
        />
        <InspectorSelect
          label="Espacement des sections"
          value={pageTheme.sectionSpacing}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal', label: 'Normal' },
            { value: 'spacious', label: 'Aéré' },
          ]}
          onChange={(value) =>
            setPageTheme({ sectionSpacing: value as PageThemeDraft['sectionSpacing'] })
          }
        />
        <InspectorSelect
          label="Style des boutons"
          value={pageTheme.buttonStyle}
          options={[
            { value: 'pill', label: 'Pilule' },
            { value: 'rounded', label: 'Arrondi' },
            { value: 'square', label: 'Carré' },
          ]}
          onChange={(value) =>
            setPageTheme({ buttonStyle: value as PageThemeDraft['buttonStyle'] })
          }
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Police</Label>
          <ShadInput
            value={pageTheme.fontFamily}
            onChange={(e) => setPageTheme({ fontFamily: e.target.value })}
            placeholder="Inter"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          SEO
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Titre SEO</Label>
          <ShadInput
            value={pageTheme.seoTitle}
            onChange={(e) => setPageTheme({ seoTitle: e.target.value })}
            placeholder="Ex : Offre Ford Ranger Auto Hall"
          />
          <p className="text-xs text-muted-foreground">
            Titre affiché dans l’onglet du navigateur et pour les moteurs de recherche.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description SEO</Label>
          <ShadInput
            value={pageTheme.seoDescription}
            onChange={(e) => setPageTheme({ seoDescription: e.target.value })}
            placeholder="Résumé court de l’offre pour les moteurs de recherche"
          />
        </div>
      </div>
    </div>
  );
}
