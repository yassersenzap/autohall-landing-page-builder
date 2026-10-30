/** Typography tokens — extensible for PlateJS theme mapping later */
export type TypographyToken = 'badge' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';

/** Identifies which text field on a node is being edited */
export type EditableFieldKey =
  | 'text'
  | 'button.label'
  | 'form.stepTitle'
  | 'form.stepDescription'
  | 'form.submitLabel'
  | 'form.currentStepLabel';

export type EditingSession = {
  nodeId: string;
  fieldKey: EditableFieldKey;
  originalText: string;
};

/** PlateJS bridge — future rich blocks (lists, links, tables) */
export type PlateDocumentSlot = {
  version: 1;
  lexicalState?: string;
  plateValue?: unknown;
};

export type InlineEditOptions = {
  multiline?: boolean;
  placeholder?: string;
};
