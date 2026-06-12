import { useCallback, useRef } from 'react';
import { clampFocalPercent } from '@/features/builder/blocks/hero-vehicle-offer/hero-image-controls';
import { cn } from '@/lib/utils';

type FocalPointPickerProps = {
  imageUrl: string;
  imageAlt?: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  objectFit?: 'cover' | 'contain';
  className?: string;
};

function coordsFromPointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { x: number; y: number } {
  const relX = ((clientX - rect.left) / rect.width) * 100;
  const relY = ((clientY - rect.top) / rect.height) * 100;
  return {
    x: clampFocalPercent(relX, 50),
    y: clampFocalPercent(relY, 50),
  };
}

export function FocalPointPicker({
  imageUrl,
  imageAlt = '',
  x,
  y,
  onChange,
  objectFit = 'cover',
  className,
}: FocalPointPickerProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const applyPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const next = coordsFromPointer(clientX, clientY, rect);
      onChange(next.x, next.y);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (objectFit === 'contain') return;
      draggingRef.current = true;
      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      applyPointer(event.clientX, event.clientY);
    },
    [applyPointer, objectFit],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || objectFit === 'contain') return;
      applyPointer(event.clientX, event.clientY);
    },
    [applyPointer, objectFit],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (
      typeof event.currentTarget.releasePointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const markerX = clampFocalPercent(x, 50);
  const markerY = clampFocalPercent(y, 50);

  return (
    <div
      ref={surfaceRef}
      className={cn(
        'relative cursor-crosshair select-none touch-none',
        objectFit === 'contain' && 'cursor-default',
        className,
      )}
      data-testid="focal-point-picker"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="presentation"
      aria-hidden={objectFit === 'contain'}
    >
      <img
        src={imageUrl}
        alt={imageAlt}
        className={cn(
          'h-40 w-full bg-neutral-950 pointer-events-none',
          objectFit === 'contain' ? 'object-contain p-3' : 'object-cover',
        )}
        style={
          objectFit === 'cover'
            ? {
                objectPosition: `${markerX}% ${markerY}%`,
              }
            : undefined
        }
        draggable={false}
      />
      {objectFit === 'cover' ? (
        <span
          className="pointer-events-none absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-md ring-2 ring-blue-500/40"
          style={{ left: `${markerX}%`, top: `${markerY}%` }}
          data-testid="focal-point-marker"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
