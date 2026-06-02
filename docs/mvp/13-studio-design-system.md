# Studio design system (app interne)

## Séparation des thèmes

| Couche | Attribut DOM | Fichiers |
|--------|--------------|----------|
| **Builder interne** | `html[data-studio-theme="light\|dark"]` | `frontend/src/styles/studio-*.css` |
| **Landing exportée / preview** | `.lp-document[data-theme="…"]` | `backend/src/landing-render/styles/landing-page.css` |

Le switch clair/sombre du studio **ne modifie pas** le rendu landing : celui-ci suit `themeJson` de la version (API `render.themeMode`).

## Structure frontend

```
frontend/src/
  styles/
    studio-tokens.css      # Variables --studio-*
    studio-components.css  # .ui-btn, .ui-card, …
    studio-layout.css      # .studio-shell, preview frame
    studio-pages.css         # listes campagnes, leads, pont legacy
  context/
    StudioThemeContext.tsx
  components/
    studio/StudioShell.tsx, ThemeToggle.tsx
    ui/                    # Button, Card, PageHeader, …
```

## Préférence thème

- Clé localStorage : `autohall-studio-theme`
- Initialisation : `initStudioTheme()` dans `main.tsx` (évite le flash)
- Toggle : barre supérieure du `StudioShell` + pages publiques/login

## Preview

- HTML blocs : toujours généré côté backend (`landing-render`)
- CSS landing : import `@landing-styles` (alias Vite → fichier backend)
- UI studio : toolbar, onglets Desktop/Mobile, cadre device

## Extension

Pour un nouveau composant UI interne : ajouter dans `components/ui/` + styles dans `studio-components.css` en utilisant uniquement les tokens `--studio-*`.

## Référence complémentaire

La structure et les flux de l’éditeur visuel V1 (library/canvas/properties, hooks, API dédiée) sont détaillés dans `docs/mvp/14-visual-editor-v1.md`.
