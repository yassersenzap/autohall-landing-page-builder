// Compatibility layer: legacy page imports may still reference this module.
export {
  EDITOR_BLOCK_TYPES as BLOCK_TYPES,
  DEFAULT_EDITOR_BLOCK_PROPS as DEFAULT_BLOCK_PROPS,
  type EditorBlockType as BlockType,
  type EditorPageBlock as PageBlockItem,
} from '../features/editor/types/editor.types';

export {
  fetchEditorBlocks as listPageBlocks,
  createEditorBlock as createPageBlock,
  updateEditorBlock as updatePageBlock,
  deleteEditorBlock as deletePageBlock,
} from '../features/editor/api/editorApi';

export function canManagePageBlocks(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}
