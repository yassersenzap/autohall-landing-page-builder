import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
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
    <Card title="Navigateur" className="editor-panel">
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
                <div>
                  <p className="editor-navigator__title">
                    {index + 1}. {block.blockType}
                  </p>
                  <p className="editor-navigator__meta">{block.blockKey}</p>
                </div>
                <StatusBadge status={selected ? 'active' : 'draft'} label={`#${block.sortOrder}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
