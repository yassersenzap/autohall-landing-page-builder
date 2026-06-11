import {
  ArrowDown,
  ArrowUp,
  Copy,
  Monitor,
  Smartphone,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import {
  selectActiveBlock,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDeviceMode } from '@/features/builder-engine/lib/block-design-props';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type CanvasToolbarProps = {
  deviceMode: BuilderDeviceMode;
  onDeviceModeChange: (mode: BuilderDeviceMode) => void;
};

export function CanvasToolbar({ deviceMode, onDeviceModeChange }: CanvasToolbarProps) {
  const block = useBuilderDocumentStore(selectActiveBlock);
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const duplicateBlock = useBuilderDocumentStore((s) => s.duplicateBlock);
  const deleteBlock = useBuilderDocumentStore((s) => s.deleteBlock);
  const moveBlockUp = useBuilderDocumentStore((s) => s.moveBlockUp);
  const moveBlockDown = useBuilderDocumentStore((s) => s.moveBlockDown);

  const blockIndex = block ? blocks.findIndex((b) => b.id === block.id) : -1;
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex >= 0 && blockIndex < blocks.length - 1;

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950/95 px-4 py-2"
      data-testid="studio-canvas-toolbar"
    >
      <div className="flex items-center gap-2">
        <div
          className="flex rounded-lg border border-neutral-800 bg-neutral-900/80 p-0.5"
          role="group"
          aria-label="Viewport canvas"
        >
          <button
            type="button"
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors',
              deviceMode === 'desktop'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300',
            )}
            onClick={() => onDeviceModeChange('desktop')}
            aria-pressed={deviceMode === 'desktop'}
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden />
            Desktop
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors',
              deviceMode === 'mobile'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300',
            )}
            onClick={() => onDeviceModeChange('mobile')}
            aria-pressed={deviceMode === 'mobile'}
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            Mobile
          </button>
        </div>

        <span
          className="inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-[0.6875rem] text-neutral-500"
          title="Zoom — bientôt disponible"
        >
          <ZoomIn className="h-3 w-3" aria-hidden />
          100%
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {block ? (
          <>
            <span className="hidden truncate text-xs text-neutral-500 sm:inline">
              {block.label}
            </span>
            <ShadButton
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 border-neutral-700 bg-neutral-900 px-2 text-neutral-200"
              disabled={!canMoveUp}
              onClick={() => moveBlockUp(block.id)}
              aria-label="Monter le bloc"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </ShadButton>
            <ShadButton
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 border-neutral-700 bg-neutral-900 px-2 text-neutral-200"
              disabled={!canMoveDown}
              onClick={() => moveBlockDown(block.id)}
              aria-label="Descendre le bloc"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </ShadButton>
            <ShadButton
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 border-neutral-700 bg-neutral-900 px-2 text-neutral-200"
              onClick={() => duplicateBlock(block.id)}
              aria-label="Dupliquer le bloc"
            >
              <Copy className="h-3.5 w-3.5" />
            </ShadButton>
            <ShadButton
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 border-red-900/50 bg-red-950/30 px-2 text-red-300"
              onClick={() => deleteBlock(block.id)}
              aria-label="Supprimer le bloc"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </ShadButton>
          </>
        ) : (
          <span className="text-xs text-neutral-600">Sélectionnez un bloc sur le canvas</span>
        )}
      </div>
    </div>
  );
}
