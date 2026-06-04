import { getBlockLabel } from '../../landing/landing-block-catalog';
import type { EditorPageBlock } from '../types/editor.types';

type BlockNavigatorProps = {
  blocks: EditorPageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
};

export function BlockNavigator({
  blocks,
  selectedBlockId,
  onSelectBlock,
}: BlockNavigatorProps) {
  return (
    <section className="editor-panel-surface">
      <header className="editor-panel-surface__header">
        <h2 className="editor-panel-surface__title">Structure</h2>
      </header>
      <div className="editor-panel-surface__body editor-panel-surface__body--compact">
        <ul className="editor-navigator">
          {blocks.map((block, index) => {
            const selected = block.id === selectedBlockId;
            return (
              <li key={block.id}>
                <button
                  type="button"
                  className={[
                    'editor-navigator__item',
                    selected ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectBlock(block.id)}
                >
                  <span>
                    <span className="editor-navigator__title">
                      {getBlockLabel(block.blockType)}
                    </span>
                  </span>
                  <span className="editor-navigator__index">{index + 1}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
