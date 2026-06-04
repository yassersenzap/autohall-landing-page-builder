import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { LayoutTemplate, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { LandingPreviewScope } from './LandingPreviewScope';
import { SortableBlockItem } from './SortableBlockItem';

const DESKTOP_FRAME_MAX = '72rem';
const MOBILE_FRAME_WIDTH = '390px';

export function CanvasArea() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);

  const isMobile = deviceMode === 'mobile';

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-neutral-300/50 dark:bg-neutral-950">
      <div className="z-10 shrink-0 border-b border-border/40 bg-background/80 px-4 py-2 backdrop-blur-sm">
        <p className="text-center text-[0.65rem] font-medium tracking-wide text-muted-foreground">
          Canvas · {blocks.length} section{blocks.length === 1 ? '' : 's'} ·{' '}
          {isMobile ? '390px' : '1152px'}
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain',
          'transition-colors duration-300',
          isMobile ? 'bg-[#0a0a0b]' : 'bg-[#e8e8ea] dark:bg-neutral-900',
          isOver && 'ring-2 ring-inset ring-primary/20',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) selectBlock(null);
        }}
      >
        <div
          className={cn(
            'mx-auto flex w-full flex-col items-center',
            'px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24',
          )}
        >
          <div
            className={cn(
              'w-full shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)]',
              'ring-1 ring-black/5 transition-all duration-300 ease-in-out',
              isMobile && 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65)] ring-white/10',
            )}
            style={
              isMobile
                ? { width: MOBILE_FRAME_WIDTH, maxWidth: MOBILE_FRAME_WIDTH }
                : { maxWidth: DESKTOP_FRAME_MAX }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'flex items-center gap-2 border-b border-black/5 px-4 py-2.5',
                isMobile ? 'bg-neutral-950/90' : 'bg-neutral-50/90',
              )}
            >
              {isMobile ? (
                <Smartphone className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
              )}
              <span
                className={cn(
                  'text-[0.65rem] font-medium tracking-wide',
                  isMobile ? 'text-neutral-400' : 'text-neutral-500',
                )}
              >
                {isMobile ? 'iPhone · 390px' : 'Document · 1152px'}
              </span>
            </div>

            {blocks.length === 0 ? (
              <div className="flex min-h-[28rem] flex-col items-center justify-center bg-neutral-50 px-8 text-center">
                <LayoutTemplate className="mb-4 h-12 w-12 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-800">Canvas vide</p>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-neutral-500">
                  Glissez un composant depuis le panneau gauche ou cliquez sur + pour
                  commencer votre landing.
                </p>
              </div>
            ) : (
              <LandingPreviewScope className="rounded-none bg-white">
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="m-0 flex list-none flex-col p-0">
                    {blocks.map((block) => (
                      <SortableBlockItem key={block.id} block={block} />
                    ))}
                  </ul>
                </SortableContext>
              </LandingPreviewScope>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
