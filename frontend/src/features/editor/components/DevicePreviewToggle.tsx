import { Tabs } from '../../../components/ui/Tabs';
import type { EditorDeviceMode } from '../types/editor.types';

type DevicePreviewToggleProps = {
  mode: EditorDeviceMode;
  onChange: (mode: EditorDeviceMode) => void;
};

export function DevicePreviewToggle({ mode, onChange }: DevicePreviewToggleProps) {
  return (
    <Tabs
      ariaLabel="Aperçu canvas"
      items={[
        { id: 'desktop', label: 'Desktop' },
        { id: 'mobile', label: 'Mobile' },
      ]}
      activeId={mode}
      onChange={(next) => onChange(next as EditorDeviceMode)}
    />
  );
}
