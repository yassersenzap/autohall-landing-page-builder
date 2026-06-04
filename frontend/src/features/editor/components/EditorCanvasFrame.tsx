import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { EditorDeviceMode } from '../types/editor.types';

type EditorCanvasFrameProps = {
  deviceMode: EditorDeviceMode;
  blockCount: number;
  children: ReactNode;
};

export function EditorCanvasFrame({ deviceMode, blockCount, children }: EditorCanvasFrameProps) {
  const widthLabel = deviceMode === 'mobile' ? '390' : '1200';

  return (
    <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-border/60 bg-builder/80 px-3 py-1.5 text-[0.65rem] font-medium text-muted-foreground backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </span>
          <span className="text-foreground/80">Page · {widthLabel}px</span>
        </div>
        <span>
          {blockCount} section{blockCount === 1 ? '' : 's'}
        </span>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-border/80 bg-canvas-paper shadow-2xl shadow-black/20',
          'min-h-[min(78vh,52rem)]',
          deviceMode === 'mobile' && 'mx-auto max-w-[24.375rem]',
        )}
      >
        {children}
      </div>
    </div>
  );
}
