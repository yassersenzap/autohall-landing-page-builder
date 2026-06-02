import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  BLOCK_CATEGORY_LABELS,
  type EditorBlockCategory,
  type EditorBlockDefinition,
  type EditorBlockType,
} from '../../landing/landing-block-catalog';

type BlockLibraryProps = {
  blocks: EditorBlockDefinition[];
  canWrite: boolean;
  onAddBlock: (type: EditorBlockType) => void;
};

const CATEGORY_ORDER: EditorBlockCategory[] = [
  'hero',
  'conversion',
  'offer',
  'trust',
  'content',
  'footer',
];

function groupByCategory(blocks: EditorBlockDefinition[]) {
  const groups = new Map<EditorBlockCategory, EditorBlockDefinition[]>();
  for (const block of blocks) {
    const list = groups.get(block.category) ?? [];
    list.push(block);
    groups.set(block.category, list);
  }
  return CATEGORY_ORDER.filter((category) => groups.has(category)).map((category) => [
    category,
    groups.get(category)!,
  ] as const);
}

export function BlockLibrary({ blocks, canWrite, onAddBlock }: BlockLibraryProps) {
  const grouped = groupByCategory(blocks);

  return (
    <Card title="Bibliothèque de sections" className="editor-panel">
      <p className="editor-library__intro">
        Ajoutez des sections métier : hero, offre, confiance, conversion et contenu.
      </p>
      <div className="editor-library">
        {grouped.map(([category, items]) => (
          <div key={category} className="editor-library__group">
            <p className="editor-library__category">{BLOCK_CATEGORY_LABELS[category]}</p>
            {items.map((item) => (
              <div key={item.type} className="editor-library__item">
                <div className="editor-library__icon">{item.icon}</div>
                <div className="editor-library__body">
                  <p className="editor-library__title">{item.label}</p>
                  <p className="editor-library__desc">{item.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!canWrite}
                  onClick={() => onAddBlock(item.type)}
                >
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
