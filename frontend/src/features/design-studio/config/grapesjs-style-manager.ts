import type { Editor } from 'grapesjs';

/** Secteurs Style Manager — propriétés visuelles contrôlées (pas de CSS libre). */
export function configureStyleManager(editor: Editor) {
  const sm = editor.StyleManager;

  sm.getSectors().reset([
    {
      name: 'dimensions',
      open: true,
      buildProps: ['width', 'height', 'max-width', 'min-height', 'padding', 'margin'],
    },
    {
      name: 'typography',
      open: false,
      buildProps: [
        'font-family',
        'font-size',
        'font-weight',
        'letter-spacing',
        'color',
        'line-height',
        'text-align',
      ],
    },
    {
      name: 'decorations',
      open: false,
      buildProps: [
        'background-color',
        'border-radius',
        'border',
        'box-shadow',
        'opacity',
      ],
    },
    {
      name: 'image',
      open: false,
      buildProps: ['object-fit', 'object-position'],
    },
  ]);
}
