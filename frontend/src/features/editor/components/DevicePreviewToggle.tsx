import type { EditorDeviceMode } from '../types/editor.types';

type DevicePreviewToggleProps = {
  mode: EditorDeviceMode;
  onChange: (mode: EditorDeviceMode) => void;
};

export function DevicePreviewToggle({ mode, onChange }: DevicePreviewToggleProps) {
  return (
    <div className="editor-segmented" role="group" aria-label="Largeur du canvas">
      <button
        type="button"
        className={['editor-segmented__btn', mode === 'desktop' ? 'is-active' : ''].filter(Boolean).join(' ')}
        aria-pressed={mode === 'desktop'}
        onClick={() => onChange('desktop')}
      >
        Desktop
      </button>
      <button
        type="button"
        className={['editor-segmented__btn', mode === 'mobile' ? 'is-active' : ''].filter(Boolean).join(' ')}
        aria-pressed={mode === 'mobile'}
        onClick={() => onChange('mobile')}
      >
        Mobile
      </button>
    </div>
  );
}
