import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import type {
  EditorBlockDefinition,
  EditorBlockType,
} from '../types/editor.types';

type BlockLibraryProps = {
  blocks: EditorBlockDefinition[];
  canWrite: boolean;
  onAddBlock: (type: EditorBlockType) => void;
};

export function BlockLibrary({ blocks, canWrite, onAddBlock }: BlockLibraryProps) {
  return (
    <Card title="Bibliothèque de blocs" className="editor-panel">
      <div className="editor-library">
        {blocks.map((item) => (
          <div key={item.type} className="editor-library__item">
            <div className="editor-library__icon">{item.icon}</div>
            <div className="editor-library__body">
              <p className="editor-library__title">{item.label}</p>
              <p className="editor-library__desc">{item.description}</p>
              <p className="editor-library__class">{item.landingClassName}</p>
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
    </Card>
  );
}
