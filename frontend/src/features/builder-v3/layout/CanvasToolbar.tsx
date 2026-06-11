import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { BuilderDeviceMode } from '@/features/builder-engine/lib/block-design-props';
import { STUDIO_VIEWPORT_LABELS } from '../constants/studio-viewport';
import { cn } from '@/lib/utils';

type CanvasToolbarProps = {
  deviceMode: BuilderDeviceMode;
  onDeviceModeChange: (mode: BuilderDeviceMode) => void;
};

const VIEWPORT_MODES: BuilderDeviceMode[] = ['desktop', 'tablet', 'mobile'];

const VIEWPORT_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

export function CanvasToolbar({ deviceMode, onDeviceModeChange }: CanvasToolbarProps) {
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
          data-testid="studio-viewport-switcher"
        >
          {VIEWPORT_MODES.map((mode) => {
            const Icon = VIEWPORT_ICONS[mode];
            const active = deviceMode === mode;
            return (
              <button
                key={mode}
                type="button"
                data-testid={`studio-viewport-${mode}`}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors',
                  active
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300',
                )}
                onClick={() => onDeviceModeChange(mode)}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {STUDIO_VIEWPORT_LABELS[mode]}
              </button>
            );
          })}
        </div>
        <span className="text-[0.6875rem] text-neutral-600">
          Aperçu Studio — n’affecte pas l’export
        </span>
      </div>
    </div>
  );
}
