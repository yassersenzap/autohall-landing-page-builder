import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';
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
    <div className="editor-toolbar">
      <PageHeader
        title={title}
        subtitle={subtitle}
        backTo={backTo}
        backLabel={backLabel}
        backState={backState}
        actions={
          <>
            {status ? <StatusBadge status={status} /> : null}
            <DevicePreviewToggle mode={deviceMode} onChange={onChangeDeviceMode} />
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Recharger
            </Button>
            <Link to={previewTo} state={previewState}>
              <span className="ui-btn ui-btn--secondary ui-btn--sm">Preview</span>
            </Link>
            {canWrite ? (
              <Button size="sm" disabled={publishing} onClick={onPublish}>
                {publishing ? 'Publication…' : 'Publier'}
              </Button>
            ) : null}
            {status === 'PUBLISHED' ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={exporting}
                onClick={onExport}
              >
                {exporting ? 'Export…' : 'Exporter ZIP'}
              </Button>
            ) : null}
          </>
        }
      />
    </div>
  );
}
