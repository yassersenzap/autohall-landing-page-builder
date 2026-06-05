import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Puck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import './styles/visual-studio-v2.css';
import type { Data } from '@puckeditor/core';
import { useStudioV2Actions } from './context/StudioV2Context';
import { studioV2PuckConfig } from './puck-config/index';
import { studioV2DocumentsEqual } from './lib/document-equals';
import type { StudioV2Viewport, StudioV2Zoom } from './components/StudioV2Toolbar';
import type { StudioV2SaveStatus } from './types';

export type VisualStudioV2EditorHandle = {
  getData: () => Data;
};

type VisualStudioV2EditorProps = {
  initialData: Data;
  savedBaseline: Data;
  canWrite: boolean;
  saveStatus: StudioV2SaveStatus;
  viewport?: StudioV2Viewport;
  zoom?: StudioV2Zoom;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (data: Data) => Promise<void>;
};

export const VisualStudioV2Editor = forwardRef<
  VisualStudioV2EditorHandle,
  VisualStudioV2EditorProps
>(function VisualStudioV2Editor(
  {
    initialData,
    savedBaseline,
    canWrite,
    saveStatus,
    viewport = 'desktop',
    zoom = 'fit',
    onDirtyChange,
    onSave,
  },
  ref,
) {
  const [data, setData] = useState<Data>(initialData);
  const dataRef = useRef<Data>(initialData);

  useImperativeHandle(ref, () => ({
    getData: () => dataRef.current,
  }));

  const handleChange = useCallback(
    (next: Data) => {
      dataRef.current = next;
      setData(next);
      onDirtyChange(!studioV2DocumentsEqual(next, savedBaseline));
    },
    [onDirtyChange, savedBaseline],
  );

  const handlePublish = useCallback(
    async (next: Data) => {
      await onSave(next);
      dataRef.current = next;
      setData(next);
      onDirtyChange(false);
    },
    [onDirtyChange, onSave],
  );

  const actions = useStudioV2Actions();
  const isPageEmpty = (data.content?.length ?? 0) === 0;

  return (
    <div
      className="visual-studio-v2-editor"
      data-save-status={saveStatus}
      data-viewport={viewport}
      data-zoom={zoom}
    >
      {isPageEmpty && canWrite ? (
        <div className="vs2-canvas-empty" role="status">
          <p className="vs2-canvas-empty__title">Commencez votre landing page</p>
          <p className="vs2-canvas-empty__hint">
            Choisissez un starter ou ajoutez une section depuis le panneau gauche.
          </p>
          <div className="vs2-canvas-empty__actions">
            <button
              type="button"
              className="vs2-canvas-empty__btn"
              onClick={() => actions?.onFocusStarterTab?.()}
            >
              Choisir un starter
            </button>
            <button
              type="button"
              className="vs2-canvas-empty__btn vs2-canvas-empty__btn--secondary"
              onClick={() => actions?.onFocusSectionTab?.()}
            >
              Ajouter une section
            </button>
          </div>
        </div>
      ) : null}
      <Puck
        config={studioV2PuckConfig}
        data={data}
        onChange={canWrite ? handleChange : undefined}
        onPublish={canWrite ? handlePublish : undefined}
        permissions={{
          edit: canWrite,
          drag: canWrite,
          delete: canWrite,
          duplicate: canWrite,
          insert: canWrite,
        }}
        overrides={{
          header: () => <></>,
          outline: () => <></>,
        }}
        iframe={{ enabled: false }}
        height="100%"
      />
    </div>
  );
});
