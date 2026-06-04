import type { ReactNode } from 'react';

type EditorShellProps = {
  toolbar: ReactNode;
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function EditorShell({ toolbar, left, center, right }: EditorShellProps) {
  return (
    <div className="editor-shell editor-shell--builder">
      {toolbar}
      <div className="editor-shell__grid">
        <aside className="editor-shell__left editor-shell__panel" aria-label="Bibliothèque et structure">
          {left}
        </aside>
        <section className="editor-shell__center editor-shell__panel" aria-label="Canvas de la landing">
          {center}
        </section>
        <aside className="editor-shell__right editor-shell__panel" aria-label="Inspecteur de section">
          {right}
        </aside>
      </div>
    </div>
  );
}
