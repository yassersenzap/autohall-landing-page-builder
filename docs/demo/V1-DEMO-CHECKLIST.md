# Checklist démo V1 — Auto Hall LP Builder

Parcours officiel : **builder blocs** (éditeur sections + modèles V1).

## Prérequis

```bash
# Terminal 1 — backend
cd backend
npx prisma migrate deploy
npm run db:seed
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

## Données seed utiles

- Campagne : **Campagne démo — Offre printemps**
- Landing : **Landing démo — Offre printemps** (`demo-offre-printemps`)
- Version : **v1 — Version initiale** (hero seedé, modifiable dans le builder)

## Scénario démo (15 étapes)

1. **Lancer** backend + frontend (voir Prérequis).
2. **Login** — http://localhost:5173/login (`admin@autohall.local`).
3. **Dashboard** — http://localhost:5173/dashboard
4. **Campagnes** — ouvrir **Campagne démo — Offre printemps**
5. **Landing seed** — ouvrir **Landing démo — Offre printemps**
6. **Versions** — ouvrir **v1 — Version initiale**
7. **Builder** — accès direct `/page-versions/:id/blocks` (pas d’écran intermédiaire)
8. **Modèle** — panneau gauche → **Modèles** → **Essai véhicule** → **Appliquer le modèle** → confirmer
9. **Hero** — inspecteur : titre, sous-titre, CTA, thème clair/sombre, position image
10. **Image** — onglet **Médias** → upload → sélectionner dans le Hero
11. **Sauvegarder** — **Enregistrer**
12. **Preview** — **Aperçu** (desktop + mobile)
13. **Publier** — **Publier** (checklist préparation OK)
14. **Export ZIP** — **Export ZIP** → extraire → ouvrir `index.html`
15. **Lead** — soumettre le formulaire → vérifier dans **Leads**

## Vérifications ZIP

- `index.html`, `assets/style.css`, `js/landing-config.js`, `js/lead-form.js`
- Images uploadées dans `assets/images/` (chemins relatifs)
- Pas de `localhost`, pas de `/api/assets`, pas de base64, pas de token
- Formulaire POST vers `/api/public/leads` (backend requis pour la soumission)

## Dépannage rapide

| Problème | Action |
|----------|--------|
| Preview vide | Sauvegarder ; vérifier blocs présents |
| Export refusé | Publier la version |
| Lead non reçu | `PUBLIC_API_BASE_URL` + backend actif |
| Canvas trop petit | Bouton **Ajuster** ou **100 %** ; masquer panneaux (Focus) |
| Image absente ZIP | Upload média (pas URL externe seule) |

## DB locale — colonnes GrapesJS obsolètes (optionnel)

```sql
ALTER TABLE page_versions
  DROP COLUMN IF EXISTS design_engine,
  DROP COLUMN IF EXISTS design_project_json,
  DROP COLUMN IF EXISTS design_html_snapshot,
  DROP COLUMN IF EXISTS design_css_snapshot;
DROP TYPE IF EXISTS "DesignEngine";
```

Puis : `cd backend && npx prisma generate`
