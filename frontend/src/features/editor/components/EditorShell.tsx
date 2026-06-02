import type { ReactNode } from 'react';

type EditorShellProps = {
  toolbar: ReactNode;
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function EditorShell({ toolbar, left, center, right }: EditorShellProps) {
  return (
    <div className="editor-shell">
      {toolbar}
      <div className="editor-shell__grid">
        <aside className="editor-shell__left">{left}</aside>
        <section className="editor-shell__center">{center}</section>
        <aside className="editor-shell__right">{right}</aside>
      </div>
    </div>
  );
}
