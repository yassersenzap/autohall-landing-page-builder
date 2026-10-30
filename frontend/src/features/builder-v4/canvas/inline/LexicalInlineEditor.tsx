import { useCallback, useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { cn } from '@/lib/utils';
import { createInitialEditorState, readPlainTextFromEditor } from './lexical-utils';
import { InlineFloatingToolbar } from './InlineFloatingToolbar';
import type { InlineEditOptions } from '../../types/editable.types';

type LexicalInlineEditorProps = {
  initialText: string;
  className?: string;
  style?: React.CSSProperties;
  options?: InlineEditOptions;
  onCommit: (text: string) => void;
  onCancel: () => void;
  testId?: string;
};

export function LexicalInlineEditor({
  initialText,
  className,
  style,
  options,
  onCommit,
  onCancel,
  testId,
}: LexicalInlineEditorProps) {
  const draftRef = useRef(initialText);

  const handleCommit = useCallback(() => {
    onCommit(draftRef.current.trim() || initialText);
  }, [initialText, onCommit]);

  const initialConfig = {
    namespace: 'V4InlineEditor',
    editable: true,
    onError(error: Error) {
      console.error('[V4 Lexical]', error);
    },
    editorState: createInitialEditorState(initialText),
  };

  useEffect(() => {
    draftRef.current = initialText;
  }, [initialText]);

  return (
    <div
      className="v4-inline-editor"
      data-testid="inline-lexical-editor"
      data-v4-inline-editor-for={testId}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <InlineFloatingToolbar
          multiline={options?.multiline}
          onCommit={handleCommit}
          onCancel={onCancel}
        />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn('v4-inline-editor__input', className)}
              style={style}
              aria-label="Édition inline"
            />
          }
          placeholder={
            options?.placeholder ? (
              <span className="v4-inline-editor__placeholder">{options.placeholder}</span>
            ) : null
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin
          onChange={(_editorState, editor) => {
            draftRef.current = readPlainTextFromEditor(editor);
          }}
        />
      </LexicalComposer>
    </div>
  );
}
