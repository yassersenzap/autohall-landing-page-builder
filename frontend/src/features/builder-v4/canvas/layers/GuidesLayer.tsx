import { useBuilderV4Store } from '../../store/document.store';
import type { CanvasGuide } from '../../lib/canvas-geometry';

export function GuidesLayer() {
  const guides = useBuilderV4Store((s) => s.canvasGuides);

  if (guides.length === 0) return null;

  return (
    <div className="v4-guides-layer" aria-hidden data-testid="canvas-guides">
      {guides.map((guide: CanvasGuide) => (
        <span
          key={guide.id}
          className={`v4-guide-line v4-guide-line--${guide.orientation}`}
          style={
            guide.orientation === 'vertical'
              ? { left: guide.position }
              : { top: guide.position }
          }
        />
      ))}
    </div>
  );
}
