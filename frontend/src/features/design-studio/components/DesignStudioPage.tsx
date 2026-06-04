import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Smartphone } from 'lucide-react';
import { StudioToast } from '@/components/ui/StudioToast';
import { useStudioToast } from '@/components/ui/use-studio-toast';
import { Button } from '@/components/ui/Button';
import { downloadPageVersionExport } from '@/lib/page-export';
import { publishPageVersion } from '@/lib/page-versions';
import { ApiError } from '@/lib/api';
import { useDesignStudioProject } from '../hooks/useDesignStudioProject';
import { DesignStudioShell } from './DesignStudioShell';
import { GrapesEditor, type GrapesEditorHandle } from './GrapesEditor';

type DesignStudioPageProps = {
  pageVersionId: string;
  campaignName?: string;
  landingTitle?: string;
  versionLabel?: string;
  versionStatus?: string;
  previewTo: string;
  backTo: { to: string; label: string; state?: unknown };
  canWrite: boolean;
  onSwitchToBlocks?: () => void;
};

export function DesignStudioPage({
  pageVersionId,
  campaignName,
  landingTitle,
  versionLabel,
  versionStatus,
  previewTo,
  backTo,
  canWrite,
  onSwitchToBlocks,
}: DesignStudioPageProps) {
  const navigate = useNavigate();
  const editorHandleRef = useRef<GrapesEditorHandle | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { toast, showSuccess, showError, dismiss } = useStudioToast();
  const { project, loading, error, dirty, saving, markDirty, persist, reload } =
    useDesignStudioProject(pageVersionId);

  const handleSave = useCallback(async () => {
    const handle = editorHandleRef.current;
    if (!handle || !canWrite) return;
    try {
      const snap = handle.getSnapshot();
      await persist(snap);
      showSuccess('Design enregistré.');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Échec de la sauvegarde.');
    }
  }, [canWrite, persist, showError, showSuccess]);

  const setGrapesDevice = useCallback((mode: 'desktop' | 'mobile') => {
    setDevice(mode);
    const ed = editorHandleRef.current?.getEditor();
    ed?.setDevice(mode === 'mobile' ? 'mobile' : 'desktop');
  }, []);

  const handlePublish = useCallback(async () => {
    if (dirty) {
      showError('Enregistrez vos modifications avant de publier.');
      return;
    }
    setPublishing(true);
    try {
      await publishPageVersion(pageVersionId);
      showSuccess('Version publiée.');
      void reload();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Échec de la publication.');
    } finally {
      setPublishing(false);
    }
  }, [dirty, pageVersionId, reload, showError, showSuccess]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await downloadPageVersionExport(pageVersionId);
      showSuccess('Export ZIP téléchargé.');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Échec de l’export.');
    } finally {
      setExporting(false);
    }
  }, [pageVersionId, showError, showSuccess]);

  if (loading) {
    return (
      <p className="flex h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Chargement du Visual Design Studio…
      </p>
    );
  }

  if (error) {
    return (
      <p className="flex h-[100dvh] items-center justify-center text-sm text-red-600">
        {error}
      </p>
    );
  }

  return (
    <DesignStudioShell
      topbar={
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(backTo.to, { state: backTo.state })}>
            ← {backTo.label}
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {landingTitle ?? 'Landing'} — Visual Design Studio
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {[campaignName, versionLabel, versionStatus].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            <button
              type="button"
              className={`rounded p-1.5 ${device === 'desktop' ? 'bg-muted' : ''}`}
              onClick={() => setGrapesDevice('desktop')}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`rounded p-1.5 ${device === 'mobile' ? 'bg-muted' : ''}`}
              onClick={() => setGrapesDevice('mobile')}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          {dirty ? (
            <span className="text-xs text-amber-600">Modifications non enregistrées</span>
          ) : (
            <span className="text-xs text-muted-foreground">Enregistré</span>
          )}
          {canWrite ? (
            <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          ) : null}
          <Link
            to={previewTo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm"
          >
            Aperçu
          </Link>
          {canWrite ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => void handlePublish()} disabled={publishing}>
                {publishing ? 'Publication…' : 'Publier'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => void handleExport()} disabled={exporting}>
                {exporting ? 'Export…' : 'Export ZIP'}
              </Button>
            </>
          ) : null}
          {onSwitchToBlocks ? (
            <Button variant="ghost" size="sm" onClick={onSwitchToBlocks}>
              Mode blocs
            </Button>
          ) : null}
        </header>
      }
    >
      <GrapesEditor
        pageVersionId={pageVersionId}
        project={project}
        onReady={(h) => {
          editorHandleRef.current = h;
        }}
        onChange={markDirty}
      />
      <StudioToast toast={toast} onDismiss={dismiss} />
    </DesignStudioShell>
  );
}
