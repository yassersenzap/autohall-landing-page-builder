import { useEffect, useState } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useBuilderV4Store } from '../store/document.store';
import { buildPreviewUrl } from './V4TopbarActions';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<DeviceMode, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

const DEVICE_LABELS: Record<DeviceMode, string> = {
  desktop: 'Bureau',
  tablet: 'Tablette',
  mobile: 'Mobile',
};

type V4PreviewOverlayProps = {
  previewId: string;
};

export function V4PreviewOverlay({ previewId }: V4PreviewOverlayProps) {
  const closePreview = useBuilderV4Store((s) => s.closePreview);
  const storeDeviceMode = useBuilderV4Store((s) => s.deviceMode);
  const [localDevice, setLocalDevice] = useState<DeviceMode>(
    (storeDeviceMode as DeviceMode) ?? 'desktop'
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePreview();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closePreview]);

  const frameWidth = DEVICE_SIZES[localDevice];

  return (
    <div className="v4-preview-overlay" data-testid="preview-overlay">
      <header className="v4-preview-overlay__bar">
        <span className="v4-preview-overlay__title">Aperçu</span>

        {/* Device switcher */}
        <div style={{ display: 'flex', gap: 2, padding: '2px', borderRadius: 8, background: 'rgba(255,255,255,0.06)' }}>
          {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((device) => {
            const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
            const isActive = localDevice === device;
            return (
              <button
                key={device}
                type="button"
                onClick={() => setLocalDevice(device)}
                title={`${DEVICE_LABELS[device]} — ${DEVICE_SIZES[device]}px`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 6, border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? '#f4f4f5' : '#71717a',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Icon size={13} aria-hidden />
                <span>{DEVICE_LABELS[device]}</span>
                <span style={{ fontSize: 9, color: isActive ? '#a1a1aa' : '#3f3f46' }}>{DEVICE_SIZES[device]}px</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="v4-topbar-btn"
          onClick={closePreview}
          data-testid="preview-close"
        >
          <X size={16} aria-hidden />
          Fermer
        </button>
      </header>
      <div className="v4-preview-overlay__stage">
        <iframe
          key={localDevice}
          title="Page preview"
          className="v4-preview-overlay__iframe"
          style={{ width: frameWidth, maxWidth: '100%', transition: 'width 0.25s ease' }}
          src={buildPreviewUrl(previewId)}
          data-testid="preview-iframe"
        />
      </div>
    </div>
  );
}
