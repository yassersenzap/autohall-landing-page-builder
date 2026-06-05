import { useBuilderDocumentStore } from '../store/builder-document.store';

/** Props JSON live du bloc sélectionné. */
export function useBlockPropsJson(blockId: string): Record<string, unknown> {
  return useBuilderDocumentStore((s) => {
    const block = s.blocks.find((b) => b.id === blockId);
    return block?.propsJson ?? {};
  });
}
