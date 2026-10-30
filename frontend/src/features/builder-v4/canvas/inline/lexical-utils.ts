import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import type { LexicalEditor } from 'lexical';

export function createInitialEditorState(text: string) {
  return () => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode(text));
    root.append(paragraph);
  };
}

export function readPlainTextFromEditor(editor: LexicalEditor): string {
  let output = '';
  editor.getEditorState().read(() => {
    output = $getRoot().getTextContent();
  });
  return output;
}
