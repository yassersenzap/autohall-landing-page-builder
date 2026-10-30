import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { Redo2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type InlineFloatingToolbarProps = {
  multiline?: boolean;
  onCommit: () => void;
  onCancel: () => void;
};

export function InlineFloatingToolbar({ multiline, onCommit, onCancel }: InlineFloatingToolbarProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
          return true;
        }
        if (event.key === 'Enter' && !multiline && !event.shiftKey) {
          event.preventDefault();
          onCommit();
          return true;
        }
        if (event.key === 'Enter' && multiline && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          onCommit();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, multiline, onCommit, onCancel]);

  return (
    <div className="v4-inline-toolbar" data-testid="inline-edit-toolbar">
      <button
        type="button"
        className="v4-inline-toolbar__btn"
        title="Annuler (Esc)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onCancel}
      >
        Esc
      </button>
      <button
        type="button"
        className="v4-inline-toolbar__btn"
        title="Undo (Ctrl+Z)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        data-testid="inline-edit-undo"
      >
        <Undo2 size={12} />
      </button>
      <button
        type="button"
        className="v4-inline-toolbar__btn"
        title="Redo (Ctrl+Y)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        data-testid="inline-edit-redo"
      >
        <Redo2 size={12} />
      </button>
      <button
        type="button"
        className={cn('v4-inline-toolbar__btn', 'v4-inline-toolbar__btn--primary')}
        title={multiline ? 'Valider (Ctrl+Enter)' : 'Valider (Enter)'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onCommit}
        data-testid="inline-edit-commit"
      >
        {multiline ? 'Ctrl+↵' : '↵'}
      </button>
    </div>
  );
}
