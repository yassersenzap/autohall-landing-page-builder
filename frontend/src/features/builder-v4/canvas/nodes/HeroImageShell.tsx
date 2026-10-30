import type { CSSProperties, DragEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type HeroImageShellProps = {
  nodeId: string;
  editorMode: boolean;
  dropActive: boolean;
  isEmpty?: boolean;
  overlayStyle?: CSSProperties;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
  children: ReactNode;
};

/** Structural shell: drop zone, overlay, selection attrs, guaranteed min-height. */
export function HeroImageShell({
  nodeId,
  editorMode: _editorMode,
  dropActive,
  isEmpty = false,
  overlayStyle,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: HeroImageShellProps) {
  return (
    <div
      className={cn(
        'v4-image-node',
        'v4-image-node--hero-media',
        isEmpty && 'v4-image-node--empty',
        dropActive && 'v4-image-node--drop-target',
      )}
      data-v4-node={nodeId}
      data-v4-image-inner="true"
      data-v4-hero-media="true"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {overlayStyle ? <div className="v4-image-node__overlay" style={overlayStyle} aria-hidden /> : null}
    </div>
  );
}
