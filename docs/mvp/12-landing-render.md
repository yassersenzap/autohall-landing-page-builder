# Rendu des landing pages (preview + export)

## Vue d’ensemble

Le rendu visuel des landing pages est centralisé dans le backend, module **`backend/src/landing-render/`**.  
La preview interne (React) et l’export ZIP statique consomment **le même HTML de blocs** et **la même feuille de styles** (`styles/landing-page.css`).

```
PageVersion (themeJson + blocs)
        │
        ▼
 landing-render/
   ├── landing-theme.ts      → variables CSS (--lp-primary, mode light/dark)
   ├── block-renderer.ts     → HTML par type de bloc (classes lp-*)
   ├── landing-document.builder.ts
   │     ├── buildLandingDocumentHtml()  → index.html (export)
   │     └── buildLandingPreviewFragment() → fragments API preview
   └── styles/landing-page.css → design system (tokens, responsive)
        │
        ├─► Export ZIP : assets/style.css + index.html
        └─► GET /api/page-versions/:id/preview → champ `render` + CSS importé côté frontend
```

## Fichiers clés

| Rôle | Fichier |
|------|---------|
| Design system CSS | `backend/src/landing-render/styles/landing-page.css` |
| Rendu blocs | `backend/src/landing-render/block-renderer.ts` |
| Thème (`themeJson`) | `backend/src/landing-render/landing-theme.ts` |
| Document HTML export | `backend/src/landing-render/landing-document.builder.ts` |
| Orchestration export | `backend/src/page-export/static-export.builder.ts` |
| API preview V1 | `backend/src/page-preview/page-preview.service.ts` (legacy compat) |
| UI preview actuelle | `/page-versions/:id/studio/preview` |

## Types de blocs supportés

- `hero` — titre, sous-titre, CTA
- `text` — paragraphes (sauts de ligne `\n\n`)
- `image` — média avec légende optionnelle
- `button` — bandeau CTA
- `lead_form` — formulaire public (`form.lp-lead-form`, champs depuis `propsJson.fields`)

Classes communes : `lp-section`, `lp-block`, `lp-btn`, etc.

## Thème (`themeJson`)

Structure attendue (compatible seed existant) :

```json
{
  "page": {
    "theme": {
      "primaryColor": "#0c4a6e",
      "fontFamily": "'Segoe UI', system-ui, sans-serif",
      "mode": "light"
    }
  }
}
```

- **Clair** : défaut si `mode` / `appearance` absent ou ≠ `dark`
- **Sombre** : `mode: "dark"` ou `appearance: "dark"` sur `page.theme`

Les variables sont injectées en inline sur `.lp-document` ; le CSS complet est dans `landing-page.css` (`[data-theme='dark']`).

Pas de UI de personnalisation avancée dans le MVP : la base est prête pour étendre les tokens plus tard.

## Cohérence preview / export

| Aspect | Preview | Export |
|--------|---------|--------|
| HTML blocs | `render.*Html` (API) | `buildLandingDocumentHtml` |
| CSS | `@landing-styles` → même fichier source | `assets/style.css` (copie du fichier) |
| Thème | `render.themeMode` + `themeStyle` | `themeJson` sur la version |
| Formulaire | Visuel uniquement (pas de `main.js`) | `js/main.js` → `POST` endpoint public |

L’aperçu dans l’app admin ne soumet pas les leads (pas de `LANDING_CONFIG` / `main.js`). Tester la collecte sur le ZIP exporté.

## Build production backend

`nest-cli.json` copie `landing-render/styles/**/*` vers `dist/landing-render/styles/`.  
`getLandingPageStylesheet()` (`landing-styles.ts`) teste plusieurs chemins : source `src/` (dev), dossier du module compilé, puis `dist/src/…` et `dist/landing-render/…` (prod). En cas d’échec, l’erreur liste tous les chemins essayés.

## Limites actuelles

- Pas de builder visuel type Framer (positionnement libre, animations).
- Images : URL externes uniquement ; pas d’upload média intégré.
- Un seul jeu de templates CSS ; pas de catalogue multi-templates.
- Thème limité à couleur primaire, police et mode clair/sombre.
- Blocs inconnus : encart « type non supporté » minimal.
- Preview sans envoi de formulaire (volontaire pour le MVP admin).

## Ajouter un nouveau style / template

1. **Étendre le CSS** dans `landing-page.css` (nouveaux tokens ou modificateur, ex. `.lp-document[data-template='promo']`).
2. **Lire le flag** dans `resolveLandingTheme()` ou un futur `resolveLandingTemplate(themeJson)`.
3. **Adapter le HTML** dans `block-renderer.ts` si la structure du bloc change.
4. **Exposer le choix** via `themeJson` (sans migration Prisma tant que c’est du JSON libre).
5. Vérifier **preview** (`GET …/preview`) et **export ZIP** sur une version publiée.

Pour un second template complet, dupliquer une variante CSS (ex. `landing-page-promo.css`) et sélectionner le fichier dans `getLandingPageStylesheet()` selon `themeJson`.

## Dépannage ports (Windows)

Voir la section **Dépannage local (Windows)** dans [`backend/README.md`](../../backend/README.md) : `EADDRINUSE` sur 3000, libération des ports 3000 / 5173 / 8080.

## Tests manuels recommandés

```bash
# Backend
cd backend && npm run build && npm run start:dev

# Frontend
cd frontend && npm run build && npm run dev
```

1. Ouvrir l’aperçu d’une version avec blocs variés → rendu `lp-*` premium.
2. Publier la version → export ZIP → extraire.
3. `npx serve .` dans le dossier extrait → vérifier le rendu ≈ preview.
4. Soumettre le formulaire → lead visible dans `/leads`.
5. CRM / KPI inchangés (aucune route lead modifiée).
