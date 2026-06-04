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
    <section className="editor-panel-surface">
      <header className="editor-panel-surface__header">
        <h2 className="editor-panel-surface__title">Sections</h2>
      </header>
      <div className="editor-panel-surface__body">
        <p className="editor-library-panel__intro">
          Ajoutez des blocs métier à votre page. Cliquez sur une carte pour l’insérer.
        </p>
        <div className="editor-library">
          {grouped.map(([category, items]) => (
            <div key={category} className="editor-library__group">
              <p className="editor-library__category">{BLOCK_CATEGORY_LABELS[category]}</p>
              <div className="editor-library__cards">
                {items.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    className="editor-library__card"
                    disabled={!canWrite}
                    onClick={() => onAddBlock(item.type)}
                  >
                    <span className="editor-library__card-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="editor-library__card-body">
                      <span className="editor-library__title">{item.label}</span>
                      <span className="editor-library__desc">{item.description}</span>
                    </span>
                    <span className="editor-library__card-action" aria-hidden="true">
                      +
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
