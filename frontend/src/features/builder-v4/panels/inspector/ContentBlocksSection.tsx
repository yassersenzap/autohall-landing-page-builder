import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useBuilderV4Store } from '../../store/document.store';
import {
  hasHeroContentBlock,
  type HeroContentBlockKind,
} from '../../lib/studio-compat.js';
import { InspectorField, InspectorHint, InspectorSection } from './InspectorPrimitives';

const CONTENT_BLOCKS: { kind: HeroContentBlockKind; label: string; testId: string }[] = [
  { kind: 'badge', label: 'Badge', testId: 'content-add-badge' },
  { kind: 'title', label: 'Titre', testId: 'content-add-title' },
  { kind: 'subtitle', label: 'Sous-titre', testId: 'content-add-subtitle' },
  { kind: 'description', label: 'Description', testId: 'content-add-description' },
  { kind: 'cta', label: 'CTA', testId: 'content-add-cta' },
  { kind: 'list', label: 'Liste', testId: 'content-add-list' },
];

export function ContentBlocksSection() {
  const document = useBuilderV4Store((s) => s.document);
  const addHeroContentBlock = useBuilderV4Store((s) => s.addHeroContentBlock);

  function addBlock(kind: HeroContentBlockKind) {
    if (hasHeroContentBlock(document, kind)) {
      toast.message('Ce bloc existe déjà dans le contenu.');
      return;
    }
    addHeroContentBlock(kind);
  }

  return (
    <InspectorSection title="Blocs contenu" value="content-blocks">
      <InspectorHint>Ajoute des éléments dans le stack Content — visibles dans Layers et sur le canvas.</InspectorHint>
      <InspectorField label="Ajouter">
        <div className="v4-content-blocks__grid">
          {CONTENT_BLOCKS.map(({ kind, label, testId }) => (
            <button
              key={kind}
              type="button"
              className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
              onClick={() => addBlock(kind)}
              disabled={hasHeroContentBlock(document, kind)}
              data-testid={testId}
            >
              <Plus size={12} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </InspectorField>
    </InspectorSection>
  );
}
