import { useState } from 'react';
import { Save, Eye, Download, History, ChevronDown, RotateCcw, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { useBuilderV4Store } from '../store/document.store';
import { writePreviewSession, createPreviewSessionId, previewPath } from '../lib/preview-session';
import { exportPageAsZip, type ZipExportContext } from '../lib/export-zip';
import { isDocumentEmpty } from '../lib/document-lifecycle';
import { cn } from '@/lib/utils';

export function V4TopbarActions() {
  const hasUnsavedChanges = useBuilderV4Store((s) => s.hasUnsavedChanges);
  const isSaving          = useBuilderV4Store((s) => s.isSaving);
  const saveDocument      = useBuilderV4Store((s) => s.saveDocument);
  const document          = useBuilderV4Store((s) => s.document);
  const historyPast       = useBuilderV4Store((s) => s.historyPast);
  const undoDocument      = useBuilderV4Store((s) => s.undoDocument);
  const redoDocument      = useBuilderV4Store((s) => s.redoDocument);
  const canUndoDocument   = useBuilderV4Store((s) => s.canUndoDocument);
  const canRedoDocument   = useBuilderV4Store((s) => s.canRedoDocument);
  const deviceMode        = useBuilderV4Store((s) => s.deviceMode);
  const campaignId        = useBuilderV4Store((s) => s.campaignId);
  const landingPageId     = useBuilderV4Store((s) => s.landingPageId);
  const pageVersionId     = useBuilderV4Store((s) => s.pageVersionId);

  const [historyOpen, setHistoryOpen] = useState(false);

  function handlePreview() {
    const previewId = createPreviewSessionId();
    writePreviewSession(previewId, { document, deviceMode, savedAt: Date.now() });
    const url = `${window.location.origin}${previewPath(previewId)}`;
    window.open(url, '_blank');
  }

  function handleExport() {
    const ctx: ZipExportContext = {
      apiBaseUrl:    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000',
      campaignId:    campaignId ?? undefined,
      landingPageId: landingPageId ?? undefined,
      pageVersionId: pageVersionId ?? undefined,
    };
    toast.loading('Génération du ZIP…', { id: 'export' });
    exportPageAsZip(document, ctx)
      .then(() => toast.success('Exportation réussie', {
        id: 'export',
        description: 'Votre archive de campagne est prête à être déployée.',
      }))
      .catch((err) => {
        console.error('ZIP export error:', err);
        toast.error('Erreur export ZIP', { id: 'export' });
      });
  }

  const isDirty = hasUnsavedChanges || isSaving;
  const hasBlocks = !isDocumentEmpty(document);

  if (!hasBlocks) {
    return null;
  }

  return (
    <div className="v4-topbar-actions" data-testid="topbar-actions">

      {/* ── Undo / Redo ghost buttons — hidden on empty canvas ── */}
      <div
        className={cn(
          'flex items-center gap-0.5 mr-1 transition-all duration-300 ease-in-out',
          hasBlocks ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <button
          type="button"
          className="v4-topbar-ghost"
          disabled={!canUndoDocument()}
          onClick={() => undoDocument()}
          title="Annuler (Ctrl+Z)"
          data-testid="topbar-undo"
        >
          <RotateCcw size={13} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="v4-topbar-ghost"
          disabled={!canRedoDocument()}
          onClick={() => redoDocument()}
          title="Rétablir (Ctrl+Shift+Z)"
          data-testid="topbar-redo"
        >
          <RotateCw size={13} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Separator — hidden on empty canvas ── */}
      <div
        className={cn(
          'v4-topbar-sep transition-all duration-300 ease-in-out',
          hasBlocks ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden
      />

      {/* ── Aperçu / Exporter / Sauvegarder — transition all when blocks exist ── */}
      <div
        className={cn(
          'flex items-center gap-1.5 transition-all duration-300 ease-in-out',
          hasBlocks ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <button
          type="button"
          className="v4-topbar-action v4-topbar-action--ghost"
          onClick={handlePreview}
          title="Aperçu temps réel"
          data-testid="topbar-preview"
        >
          <Eye size={13} strokeWidth={1.8} aria-hidden />
          Aperçu
        </button>

        <button
          type="button"
          className="v4-topbar-action v4-topbar-action--ghost"
          onClick={handleExport}
          title="Télécharger la page en HTML"
          data-testid="topbar-export"
        >
          <Download size={13} strokeWidth={1.8} aria-hidden />
          Exporter
        </button>

        <button
          type="button"
          className={cn(
            'v4-topbar-action v4-topbar-action--save',
            isDirty && 'v4-topbar-action--save-dirty',
          )}
          onClick={() => void saveDocument()}
          disabled={isSaving || !hasUnsavedChanges}
          data-testid="topbar-save"
        >
          <Save size={13} strokeWidth={2} aria-hidden />
          {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </div>

      {/* ── History dropdown — hidden on empty canvas ── */}
      <div
        className={cn(
          'v4-topbar-menu transition-all duration-300 ease-in-out',
          hasBlocks ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <button
          type="button"
          className="v4-topbar-ghost v4-topbar-ghost--chevron"
          onClick={() => setHistoryOpen((open) => !open)}
          title="Historique (Ctrl+Z / Ctrl+Shift+Z)"
          data-testid="topbar-history"
        >
          <History size={13} strokeWidth={1.8} aria-hidden />
          <ChevronDown size={10} strokeWidth={2} aria-hidden />
        </button>
        {historyOpen && (
          <div className="v4-topbar-menu__panel v4-topbar-menu__panel--history" role="menu">
            <div className="v4-topbar-menu__history-actions">
              <button
                type="button"
                className="v4-topbar-menu__item"
                disabled={!canUndoDocument()}
                onClick={() => { undoDocument(); setHistoryOpen(false); }}
              >
                Annuler (Ctrl+Z)
              </button>
              <button
                type="button"
                className="v4-topbar-menu__item"
                disabled={!canRedoDocument()}
                onClick={() => { redoDocument(); setHistoryOpen(false); }}
              >
                Rétablir (Ctrl+Shift+Z)
              </button>
            </div>
            <ul className="v4-topbar-menu__history-list">
              {historyPast.length === 0 ? (
                <li className="v4-topbar-menu__history-empty">Aucune modification récente</li>
              ) : (
                [...historyPast].reverse().slice(0, 12).map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="v4-topbar-menu__history-item">
                    <span>{entry.label}</span>
                    <time>
                      {new Date(entry.at).toLocaleTimeString('fr-FR', {
                        hour:   '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function buildPreviewUrl(previewId: string): string {
  return `${window.location.origin}${previewPath(previewId)}`;
}
