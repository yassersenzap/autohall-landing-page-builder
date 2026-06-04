import { Settings2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/primitives';
import { getBlockLabel } from '../../landing/landing-block-catalog';
import type { EditorPageBlock } from '../types/editor.types';
import { BlockInspector } from './BlockInspector';
import { EditorPanel } from './EditorStudioLayout';

type PropertiesPanelProps = {
  selectedBlock: EditorPageBlock | null;
  canWrite: boolean;
  onChangeProps: (blockId: string, nextProps: Record<string, unknown>) => void;
};

export function PropertiesPanel({
  selectedBlock,
  canWrite,
  onChangeProps,
}: PropertiesPanelProps) {
  return (
    <EditorPanel side="right" className="w-full lg:w-auto">
      <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-builder/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Propriétés
          </h2>
        </div>
        {selectedBlock ? (
          <>
            <p className="mt-2 text-sm font-semibold tracking-tight">
              {getBlockLabel(selectedBlock.blockType)}
            </p>
            <p className="text-xs text-muted-foreground">Section {selectedBlock.sortOrder}</p>
          </>
        ) : null}
      </header>
      <ScrollArea className="px-4 py-4">
        {selectedBlock ? (
          <BlockInspector
            block={selectedBlock}
            disabled={!canWrite}
            onChangeProps={(next) => onChangeProps(selectedBlock.id, next)}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
            <p className="text-sm font-medium">Aucune section sélectionnée</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Cliquez sur une section du canvas ou de l’onglet Calques pour modifier son contenu.
            </p>
          </div>
        )}
      </ScrollArea>
    </EditorPanel>
  );
}
