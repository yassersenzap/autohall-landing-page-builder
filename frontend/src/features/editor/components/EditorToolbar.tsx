import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DevicePreviewToggle } from './DevicePreviewToggle';
import type { EditorDeviceMode } from '../types/editor.types';

type EditorToolbarProps = {
  title: string;
  subtitle: string;
  status: string | undefined;
  canWrite: boolean;
  publishing: boolean;
  exporting: boolean;
  previewTo: string;
  previewState: unknown;
  onPublish: () => void;
  onExport: () => void;
  onRefresh: () => void;
  backTo: string;
  backLabel: string;
  backState?: unknown;
  deviceMode: EditorDeviceMode;
  onChangeDeviceMode: (mode: EditorDeviceMode) => void;
};

export function EditorToolbar({
  title,
  subtitle,
  status,
  canWrite,
  publishing,
  exporting,
  previewTo,
  previewState,
  onPublish,
  onExport,
  onRefresh,
  backTo,
  backLabel,
  backState,
  deviceMode,
  onChangeDeviceMode,
}: EditorToolbarProps) {
  return (
    <header className="editor-toolbar editor-toolbar--builder">
      <div className="editor-toolbar__main">
        <div className="editor-toolbar__titles">
          <Link to={backTo} state={backState} className="editor-toolbar__back">
            <span aria-hidden="true">←</span> {backLabel}
          </Link>
          <h1 className="editor-toolbar__title">{title}</h1>
          {subtitle ? <p className="editor-toolbar__subtitle">{subtitle}</p> : null}
        </div>
        <div className="editor-toolbar__actions">
          {status ? (
            <div className="editor-toolbar__group">
              <StatusBadge status={status} />
            </div>
          ) : null}
          <div className="editor-toolbar__group">
            <DevicePreviewToggle mode={deviceMode} onChange={onChangeDeviceMode} />
          </div>
          <div className="editor-toolbar__group">
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Recharger
            </Button>
            <Link to={previewTo} state={previewState} className="ui-btn ui-btn--secondary ui-btn--sm">
              Aperçu
            </Link>
          </div>
          {canWrite ? (
            <div className="editor-toolbar__group">
              {status !== 'PUBLISHED' ? (
                <Button size="sm" disabled={publishing} onClick={onPublish}>
                  {publishing ? 'Publication…' : 'Publier'}
                </Button>
              ) : null}
              {status === 'PUBLISHED' ? (
                <Button size="sm" variant="primary" disabled={exporting} onClick={onExport}>
                  {exporting ? 'Export…' : 'Exporter ZIP'}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
