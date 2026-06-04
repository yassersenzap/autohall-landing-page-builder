import { useCallback, useEffect, useRef } from 'react';
import grapesjs, { type Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import {
  assetPublicFileUrl,
  listPageVersionAssets,
  uploadPageVersionAsset,
} from '@/lib/page-assets-api';
import { registerAutoHallBlocks } from '../config/grapesjs-blocks';
import { configureDeviceManager } from '../config/grapesjs-device-manager';
import { configureStyleManager } from '../config/grapesjs-style-manager';
import type { DesignProjectPayload } from '../types/design-studio.types';

export type GrapesEditorHandle = {
  getEditor: () => Editor | null;
  getSnapshot: () => {
    projectJson: Record<string, unknown>;
    htmlSnapshot: string;
    cssSnapshot: string;
  };
};

type GrapesEditorProps = {
  pageVersionId: string;
  project: DesignProjectPayload | null;
  onReady?: (handle: GrapesEditorHandle) => void;
  onChange?: () => void;
};

export function GrapesEditor({
  pageVersionId,
  project,
  onReady,
  onChange,
}: GrapesEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = useCallback(
    async (file: File) => {
      const editor = editorRef.current;
      if (!editor) return;
      const asset = await uploadPageVersionAsset(pageVersionId, file);
      editor.AssetManager.add({
        type: 'image',
        src: assetPublicFileUrl(asset.id),
        name: asset.originalName,
      });
    },
    [pageVersionId],
  );

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%',
      width: 'auto',
      fromElement: false,
      storageManager: { type: 'none' as const },
      noticeOnUnload: false,
      canvas: {
        styles: [],
      },
      assetManager: {
        autoAdd: true,
        upload: false,
      },
      blockManager: {
        appendTo: '#ah-studio-blocks',
      },
      layerManager: {
        appendTo: '#ah-studio-layers',
      },
      styleManager: {
        appendTo: '#ah-studio-styles',
      },
      deviceManager: {
        devices: [],
      },
      selectorManager: { componentFirst: true },
    });

    registerAutoHallBlocks(editor);
    configureStyleManager(editor);
    configureDeviceManager(editor);

    void listPageVersionAssets(pageVersionId).then((assets) => {
      editor.AssetManager.add(
        assets.map((a) => ({
          type: 'image',
          name: a.originalName,
          src: assetPublicFileUrl(a.id),
        })),
      );
    });

    editor.on('update', () => onChange?.());

    editorRef.current = editor;

    const handle: GrapesEditorHandle = {
      getEditor: () => editorRef.current,
      getSnapshot: () => ({
        projectJson: editor.getProjectData() as Record<string, unknown>,
        htmlSnapshot: editor.getHtml(),
        cssSnapshot: editor.getCss() ?? '',
      }),
    };
    onReady?.(handle);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [pageVersionId, onChange, onReady]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !project?.projectJson) return;
    try {
      editor.loadProjectData(project.projectJson);
    } catch {
      /* projet vide ou format incompatible */
    }
  }, [project?.projectJson, project?.updatedAt]);

  return (
    <div className="flex h-full min-h-0 flex-1">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Blocs
          </p>
          <button
            type="button"
            className="text-[10px] font-semibold text-primary underline"
            onClick={() => fileInputRef.current?.click()}
          >
            + Média
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUploadFile(file);
              e.target.value = '';
            }}
          />
        </div>
        <div id="ah-studio-blocks" className="min-h-0 flex-1 overflow-auto" />
        <p className="border-t border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Calques
        </p>
        <div id="ah-studio-layers" className="max-h-40 overflow-auto" />
      </aside>
      <div className="relative min-h-0 min-w-0 flex-1 bg-zinc-200/80">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
        <p className="border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Styles
        </p>
        <div id="ah-studio-styles" className="min-h-0 flex-1 overflow-auto" />
      </aside>
    </div>
  );
}
