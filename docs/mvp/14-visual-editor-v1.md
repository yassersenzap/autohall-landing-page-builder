# Visual Editor V1

> Statut : document historique. Le Builder V1 n'est plus l'editeur officiel.
> La reference de code complete est conservee sur la branche
> `archive/builder-v1-block-editor`. Le Studio officiel actuel est
> `/page-versions/:id/studio`.

## Objectif

Introduire un éditeur visuel de blocs orienté studio SaaS (inspiration Framer/Figma) sans casser le moteur de rendu backend existant (`landing-render`).

## Architecture

```
frontend/src/features/editor/
  api/editorApi.ts
  types/editor.types.ts
  hooks/
    usePageEditor.ts
    useBlockSelection.ts
    useBlockMutations.ts
  components/
    EditorShell.tsx
    EditorToolbar.tsx
    BlockLibrary.tsx
    BlockNavigator.tsx
    EditorCanvas.tsx
    PropertiesPanel.tsx
    BlockInspector.tsx
    DevicePreviewToggle.tsx
    EmptyEditorState.tsx
  editor.css
```

### Principes

- **Pages légères** : dans la V1 archivee, `PageVersionBlocksPage` orchestrait la logique placee dans les hooks `features/editor`.
- **API isolée** : tous les appels blocs passent par `editorApi.ts`.
- **UI réutilisable** : `components/ui/*` conservé pour le design system studio.
- **Source unique rendu landing** : aucun rendu de landing dupliqué côté React.

## Fonctionnalités livrées

- Layout éditeur en 3 colonnes (library / canvas / properties).
- Barre d’actions : publish, preview, export, refresh, device toggle.
- Bloc library avec blocs minimum :
  - `lp-hero` (`hero`)
  - `lp-text` (`text`)
  - `lp-media` (`image`)
  - `lp-cta-band` (`button`)
  - `lp-lead-form` (`lead_form`)
- Canvas sélectionnable avec :
  - drag-and-drop (`@dnd-kit/*`) sur l’ordre
  - fallback actions monter/descendre
  - suppression bloc
- Properties panel :
  - champs guidés par type
  - mode JSON avancé

## Limites connues V1

- L’éditeur affiche un résumé JSON dans le canvas (pas de rendu WYSIWYG du bloc).
- La persistance d’ordre repose sur `sortOrder` bloc par bloc (mise à jour unitaire).
- Les validations de props restent basiques côté frontend.
- Tests e2e UI complets nécessitent une DB/auth fonctionnelle.

## Tests manuels recommandés

1. Ouvrir `/page-versions/:id/blocks` sur la branche d'archive V1.
2. Ajouter un bloc depuis la bibliothèque.
3. Sélectionner un bloc et modifier ses propriétés.
4. Réordonner (drag-and-drop + flèches).
5. Supprimer un bloc.
6. Ouvrir preview.
7. Publier puis exporter ZIP.
8. Servir le ZIP (`npx serve . -l 8080`) et soumettre le formulaire.
9. Vérifier la création du lead dans `/leads`.

## Dépendances ajoutées

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

Justification : drag-and-drop léger, ciblé, maintenable, sans framework UI complet.
