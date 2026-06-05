# Auto Hall Landing Studio — Frontend

Application React privée (Vite 8, TypeScript, React 19) pour la gestion des campagnes et l'édition de landing pages via **Builder V3**.

Routes studio :

| Route | Composant |
| --- | --- |
| `/page-versions/:pageVersionId/studio` | `BuilderV3Page` |
| `/page-versions/:pageVersionId/studio/preview` | `BuilderV3PreviewPage` |

---

## 1. Aperçu architectural

### Isolation CSS via iframe + React Portal

Le canvas d'édition ne rend pas les blocs dans le DOM principal de l'application. Le flux est :

1. `IframeCanvas` monte un `<iframe sandbox="allow-same-origin allow-scripts">` (`about:blank`).
2. Au chargement, `injectIframeStyles()` injecte Tailwind, les polices Google et les variables CSS de thème dans le `<head>` de l'iframe.
3. `createPortal(<CanvasDocument />, iframe.contentDocument.body)` projette l'arbre React du document éditable dans l'iframe.

**Motivation :** les landing pages utilisent des styles globaux (`lp-document`, variables `--primary`, `--font-heading`). L'iframe fournit un contexte CSS isolé du shell studio (barres latérales, topbar en `neutral-950`). Sans iframe, les resets Tailwind du studio et ceux du canvas entrent en conflit.

**Contrainte sandbox :** `allow-same-origin` est requis pour accéder à `contentDocument` et y porter le portail. `allow-scripts` permet l'exécution React dans l'iframe.

### Zustand — document éditable

Store unique : `useBuilderDocumentStore` (`features/builder-engine/store/builder-document.store.ts`).

| Slice | Contenu |
| --- | --- |
| `blocks` | Liste ordonnée de `BuilderDocumentBlock` (`id`, `type`, `label`, `sortOrder`, `propsJson`) |
| `pageTheme` | Couleurs, polices, espacements globaux |
| `pageSettings` | SEO : `metaTitle`, `metaDescription`, `ogImageUrl`, `faviconUrl` |
| `selectedBlockId` | Bloc actif dans l'inspecteur |
| `deviceMode` | `desktop` \| `mobile` (largeur iframe) |

**Persistance :** middleware Zustand `persist` avec clé `autohall-builder-storage:{pageVersionId}` en `localStorage`. Hydratation explicite via `hydrateBuilderDocumentStore(pageVersionId)` avant affichage du canvas (évite un flash de document vide au F5).

**Validation palette :** `addBlock(type)` n'accepte que les types retournés par `getActivePaletteBlocks()` (registry + backend support).

---

## 2. Topologie des dossiers

```
frontend/src/
├── pages/
│   ├── BuilderV3Page.tsx          # Route studio — hydratation + layout
│   └── BuilderV3PreviewPage.tsx     # Preview lecture seule (même store persisté)
│
├── features/
│   ├── builder-v3/                 # UI studio V3 (shell, canvas, panneaux)
│   │   ├── layout/
│   │   │   ├── StudioLayout.tsx    # DndContext, triptyque sidebar/canvas/inspecteur
│   │   │   └── StudioTopBar.tsx    # Viewport, save, preview, paramètres page
│   │   ├── panels/
│   │   │   ├── LeftSidebar.tsx     # Palette drag-and-drop (3 catégories)
│   │   │   ├── RightInspector.tsx  # Onglets Bloc / Thème global
│   │   │   ├── BlockInspectorPanel.tsx
│   │   │   └── PageSettingsSheet.tsx
│   │   ├── canvas/
│   │   │   ├── IframeCanvas.tsx    # Iframe + overlay DnD palette
│   │   │   ├── CanvasDocument.tsx  # SortableContext, sélection blocs
│   │   │   ├── PreviewDocument.tsx # Rendu sans chrome éditeur
│   │   │   ├── SortableCanvasBlock.tsx
│   │   │   ├── inject-iframe-styles.ts
│   │   │   └── blocks/
│   │   │       ├── IframeBlockRenderer.tsx   # Switch type → Preview
│   │   │       └── *BlockPreview.tsx         # Composants de rendu
│   │   ├── components/             # Champs inspecteur réutilisables
│   │   ├── constants/              # Polices, ratios, presets thème
│   │   └── lib/                    # save, SEO, video URL parser
│   │
│   ├── builder-engine/             # Moteur partagé (store, registry, defaults)
│   │   ├── store/builder-document.store.ts
│   │   ├── registry/
│   │   │   ├── block-registry.ts
│   │   │   └── backend-block-types.ts
│   │   ├── constants/
│   │   │   ├── campaign-block-defaults.ts
│   │   │   ├── utility-block-defaults.ts
│   │   │   └── conversion-block-defaults.ts
│   │   ├── lib/                    # block-props, sanitize, persist API
│   │   └── components/media/       # AssetImage, HeroBlockImage (export landing)
│   │
│   └── lib/landing-export.api.ts   # Téléchargement ZIP landing (API backend)
│
└── components/ui/primitives/       # shadcn/ui (Accordion, Card, Tabs, …)
```

Le code V1/V2 archivé (`src/_archive`) a été supprimé. L'éditeur actif est exclusivement `builder-v3`.

---

## 3. Système de blocs — ajouter un nouveau bloc

### Étape 1 — Defaults

Créer ou étendre un builder dans `features/builder-engine/constants/` :

```typescript
// exemple : mon-block-defaults.ts
export function buildMonBlockDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return { titre: '', contenu: '', ...overrides };
}
```

Enregistrer dans `CAMPAIGN_BLOCK_NEUTRAL_DEFAULTS` (`campaign-block-defaults.ts`). `getDefaultBlockProps(type)` clone ces defaults à l'insertion.

### Étape 2 — Registry

Ajouter une entrée dans `BUILDER_BLOCK_REGISTRY` (`block-registry.ts`) :

- `type` : identifiant snake_case (ex. `mon_block`)
- `availability: 'stable'`
- `category`, `label`, `description`

Ajouter le type dans `BACKEND_SUPPORTED_BLOCK_TYPES` (`backend-block-types.ts`) pour qu'il passe le filtre `getActivePaletteBlocks()`.

### Étape 3 — Preview canvas

1. Créer `features/builder-v3/canvas/blocks/MonBlockPreview.tsx` — composant React Tailwind, props via `asPropString(propsJson.champ)`.
2. Brancher un `case 'mon_block':` dans `IframeBlockRenderer.tsx`.

Contraintes de rendu : utiliser `var(--font-heading)`, `var(--font-body)`, `var(--primary)` pour respecter le thème injecté dans l'iframe.

### Étape 4 — Palette

Ajouter une entrée dans `LeftSidebar.tsx` (tableau `GABARIT_BLOCKS`, `ESSENTIAL_BLOCKS` ou `CONVERSION_BLOCKS`).

### Étape 5 — Inspecteur

Étendre `BlockInspectorPanel.tsx` : flags `isMonBlock`, champs Contenu/Design/Avancé via `updateBlockProps(block.id, patch)`.

### Étape 6 — Tests

Mettre à jour `DELIVERABLE_TYPES` dans `block-registry.test.ts` si le bloc est `stable`.

---

## 4. State management flow

```
┌─────────────────┐     addBlock(type)      ┌──────────────────────────┐
│  LeftSidebar    │ ────────────────────────►│ useBuilderDocumentStore  │
│  (DnD palette)  │     paletteDragId        │  blocks[]                │
└────────┬────────┘                          └───────────┬──────────────┘
         │                                                 │
         │ drop on canvas                                  │ subscribe
         ▼                                                 ▼
┌─────────────────┐     selectBlock(id)       ┌──────────────────────────┐
│ CanvasDocument  │ ◄────────────────────────►│ selectedBlockId          │
│ (iframe portal) │     click / SortableContext └───────────┬──────────────┘
└────────┬────────┘                                       │
         │ render propsJson                                │ selectActiveBlock
         ▼                                                 ▼
┌─────────────────┐     updateBlockProps      ┌──────────────────────────┐
│IframeBlockRenderer│ ◄───────────────────────│ BlockInspectorPanel      │
│ *BlockPreview   │                           │ PageSettingsSheet        │
└─────────────────┘                           └──────────────────────────┘
```

**DnD interne (réordonnancement) :** `@dnd-kit/sortable` dans `CanvasDocument` — `reorderBlocks(activeId, overId)`.

**DnD palette → canvas :** `StudioLayout` intercepte le drop sur l'overlay iframe (`z-50`) et appelle `addBlock(blockType)`.

**Sauvegarde :** `saveBuilderDocumentDesign()` → `forcePersistBuilderDocument()` + `writeLocalDraft()` + mock API.

**Preview :** même store hydraté depuis `localStorage` ; `PreviewDocument` lit `blocks` sans handlers de sélection.

---

## 5. Scripts

```bash
# Installation
npm install

# Développement (port 5173 par défaut)
npm run dev

# Build production (tsc + vite)
npm run build

# Tests unitaires (Vitest)
npm run test

# Preview du bundle buildé
npm run preview

# Lint
npm run lint
```

Variables d'environnement : voir `frontend/.env.example` (`VITE_API_BASE_URL`).

---

## Dépendances clés

| Package | Usage |
| --- | --- |
| `zustand` + `persist` | Store document + localStorage scoping |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Drag palette et réordonnancement canvas |
| `@radix-ui/react-accordion` | FAQ preview, accordéons sidebar |
| `react-router-dom` v7 | Routes studio protégées |
| `tailwindcss` v4 | Styles studio + injection iframe |

---

## Fichiers générés / exclus du dépôt

Le builder écrit dans `localStorage` (clés `autohall-builder-storage:*`, `autohall-builder-draft:*`). Les uploads média utilisent `URL.createObjectURL` (blob local, non persisté serveur en mode dev). Voir `.gitignore` racine pour `dist/`, `.env*`, caches et assets temporaires.
