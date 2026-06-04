# Checklist démo V1 — Auto Hall LP Builder

Parcours officiel : **builder blocs** (éditeur sections + modèles V1).

## Prérequis

```bash
# Terminal 1 — backend
cd backend
npx prisma migrate deploy
npm run start:dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Variables utiles :

- `frontend/.env` : `VITE_API_BASE_URL=http://localhost:3000`
- `backend/.env` : `PUBLIC_API_BASE_URL=http://localhost:3000` (endpoint leads export)

## Compte admin (seed)

- Email : `admin@autohall.local`
- Mot de passe : `Autohall_Dev_2026!`

## Scénario démo (≈ 15 min)

1. **Login** — http://localhost:5173/login
2. **Dashboard** — vérifier vue d’ensemble
3. **Campagnes** — ouvrir ou créer une campagne
4. **Landing page** — créer une landing (titre + slug)
5. **Versions** — créer une nouvelle version (brouillon)
6. **Builder** — ouvrir `/page-versions/:id/blocks` (accès direct, sans écran intermédiaire)
7. **Modèle** — panneau gauche → onglet **Modèles** → « Essai véhicule » → **Appliquer le modèle** → confirmer
8. **Contenu** — modifier titre, sous-titre, CTA du Hero dans l’inspecteur (panneau droit)
9. **Image** — onglet **Médias** → upload → sélectionner dans le bloc Hero
10. **Sauvegarder** — bouton **Enregistrer** (topbar)
11. **Preview** — **Aperçu** → desktop + mobile
12. **Publier** — **Publier** (readiness OK : titre + formulaire + contenu minimum)
13. **Export ZIP** — **Export ZIP** → télécharger
14. **ZIP local** — extraire → ouvrir `index.html` → vérifier CSS, images (`assets/images/`), formulaire visible
15. **Lead** — soumettre le formulaire (backend doit tourner) → vérifier dans **Leads**
16. **Sécurité ZIP** — pas de `localhost` dans les `src` images, pas de token, pas de base64

## Dépannage rapide

| Problème | Action |
|----------|--------|
| Preview vide | Sauvegarder d’abord ; vérifier blocs présents |
| Export refusé | Publier la version |
| Lead non reçu | Vérifier `PUBLIC_API_BASE_URL` ; CORS backend |
| Image absente ZIP | Utiliser upload média (pas URL externe) |

## DB locale — colonnes GrapesJS obsolètes

Si la migration `design_studio_fields` avait été appliquée localement, les colonnes peuvent rester en base sans impacter le code V1. Nettoyage optionnel :

```sql
ALTER TABLE page_versions
  DROP COLUMN IF EXISTS design_engine,
  DROP COLUMN IF EXISTS design_project_json,
  DROP COLUMN IF EXISTS design_html_snapshot,
  DROP COLUMN IF EXISTS design_css_snapshot;
DROP TYPE IF EXISTS "DesignEngine";
```

Puis : `cd backend && npx prisma generate`
