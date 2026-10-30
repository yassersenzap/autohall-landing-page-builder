import type { CSSProperties, ElementType } from 'react';
import { cn } from '@/lib/utils';
import { isFieldEditable } from '../../lib/editable-text';
import { useBuilderV4Store } from '../../store/document.store';
import { useEditingStore } from '../../store/editing.store';
import type { EditableFieldKey, InlineEditOptions } from '../../types/editable.types';
import { LexicalInlineEditor } from './LexicalInlineEditor';

type InlineTextRendererProps = {
  nodeId: string;
  fieldKey: EditableFieldKey;
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  editorMode?: boolean;
  options?: InlineEditOptions;
  testId?: string;
};

export function InlineTextRenderer({
  nodeId,
  fieldKey,
  text,
  as: Tag = 'span',
  className,
  style,
  editorMode = false,
  options,
  testId,
}: InlineTextRendererProps) {
  const node = useBuilderV4Store((s) => s.document.nodes[nodeId]);
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const startEditing = useEditingStore((s) => s.startEditing);
  const commitEditing = useEditingStore((s) => s.commitEditing);
  const cancelEditing = useEditingStore((s) => s.cancelEditing);
  const session = useEditingStore((s) => s.session);
  const isEditing = session?.nodeId === nodeId && session?.fieldKey === fieldKey;

  const editable = editorMode && node && isFieldEditable(node, fieldKey);
  const displayText = text || options?.placeholder || 'Texte…';

  function handleDoubleClick(event: React.MouseEvent) {
    if (!editable) return;
    event.stopPropagation();
    event.preventDefault();
    selectNode(nodeId);
    startEditing(nodeId, fieldKey);
  }

  if (isEditing && session) {
    return (
      <LexicalInlineEditor
        initialText={session.originalText}
        className={className}
        style={style}
        options={options}
        testId={testId ? `${testId}-editor` : undefined}
        onCommit={(value) => commitEditing(value)}
        onCancel={() => cancelEditing()}
      />
    );
  }

  return (
    <Tag
      className={cn(
        'v4-inline-text',
        editable && 'v4-inline-text--editable',
        className,
      )}
      style={style}
      data-v4-editable={editable ? 'true' : 'false'}
      data-v4-field={fieldKey}
      data-testid={testId ?? `inline-text-${nodeId}-${fieldKey}`}
      onDoubleClick={handleDoubleClick}
    >
      {displayText}
    </Tag>
  );
}
