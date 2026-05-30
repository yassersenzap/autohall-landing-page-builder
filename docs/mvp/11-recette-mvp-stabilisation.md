# 11 — Recette MVP (stabilisation)

**Version :** alignée sur le code au 2026-05  
**Statut :** document opérationnel pour démo et validation manuelle  
**Hors périmètre de cette recette :** drag-and-drop, canvas visuel, médias avancés, intégration Auto Hall réelle (`simulated_*`)

---

## 1. Audit rapide (lecture seule)

### Ce qui est en place et cohérent

| Domaine | État |
|---------|------|
| Auth JWT + RBAC global | OK — guards `JwtAuthGuard` + `RolesGuard` |
| Campagnes / landings / versions / blocs | OK — CRUD + routes nestées |
| Preview / Publish / Export ZIP | OK — export réservé aux versions `PUBLISHED` |
| Leads publics | OK — `POST /api/public/leads` (`@Public()`) |
| Leads internes | OK — liste, détail, statut, suivi, historique, KPI dashboard |
| Frontend | OK — parcours UI jusqu’à `/dashboard`, `/leads`, `/leads/:id` |
| Migrations Prisma | 4 migrations après init (workflow statuts, historique, suivi) |

### Écarts connus (limites MVP)

| Sujet | Détail |
|-------|--------|
| **Seed de démo** | Version 1 en `DRAFT`, bloc `hero` uniquement — **pas** de `lead_form` ni de version publiée par défaut. Publier + ajouter `lead_form` manuellement pour tester l’export formulaire. |
| **Tables schéma non branchées** | `export_jobs`, `audit_logs`, `landing_page_assets`, `simulated_testdrive`, `simulated_contacts` — présentes en base, sans API métier. |
| **Formulaires relationnels** | `forms` / `form_fields` seedés mais **sans UI/API** dédiée ; le formulaire exporté vient du bloc `lead_form` (`propsJson`). |
| **Éditeur de blocs** | Saisie **JSON** manuelle, pas d’éditeur visuel. |
| **JWT** | Stateless — logout ne révoque pas le token côté serveur. |
| **CORS** | En développement, origines non listées peuvent être acceptées si `NODE_ENV !== production`. |
| **KPI dashboard** | « Aujourd’hui » / « semaine » = fuseau **serveur** ; semaine = lundi → aujourd’hui (locale serveur). |
| **Taux contactés** | % des leads en statut `CONTACTED`, `QUALIFIED` ou `ARCHIVED`. |
| **Rôle VIEWER** | Lit campagnes / pages / blocs ; **pas** d’accès API `lead-events` ni section KPI leads. |
| **Doc historique** | `docs/mvp/10-strategie-tests-recette-mvp.md` décrit encore la sync `simulated_*` — **non implémentée**. |

### Workflow bout-en-bout (vérifié dans le code)

```text
Campagne → Landing → Version → Blocs → Preview → Publish → Export ZIP
  → (déploiement statique / npx serve) → POST /api/public/leads
  → lead_events → Liste / Détail → Statut + Suivi → Historique → Dashboard KPI
```

Chaque maillon possède une route API et/ou une page frontend correspondante (sauf déploiement cPanel, hors dépôt).

---

## 2. Démarrage local

### Prérequis

- Node.js LTS, npm
- Docker (PostgreSQL)
- Fichier `.env` à la racine (copie de `.env.example`)

### 1) PostgreSQL

```bash
# Depuis la racine du dépôt
cp .env.example .env
# Éditer POSTGRES_PASSWORD, DATABASE_URL, JWT_SECRET

docker compose up -d
```

### 2) Base de données

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### 3) Backend

```bash
cd backend
npm run start:dev
```

Vérifications :

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
```

### 4) Frontend

```bash
cd frontend
npm install
# frontend/.env ou .env racine : VITE_API_BASE_URL=http://localhost:3000
npm run dev
```

Ouvrir : **http://localhost:5173**

### Builds de validation (CI locale)

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

---

## 3. Variables d’environnement importantes

| Variable | Où | Rôle |
|----------|-----|------|
| `DATABASE_URL` | racine / backend | PostgreSQL pour Prisma |
| `JWT_SECRET` | racine / backend | Signature JWT (**obligatoire**) |
| `JWT_EXPIRES_IN` | racine / backend | Ex. `7d` |
| `BACKEND_PORT` | racine / backend | Défaut `3000` |
| `CORS_ALLOWED_ORIGINS` | racine / backend | Ex. `http://localhost:5173` |
| `VITE_API_BASE_URL` | frontend | Ex. `http://localhost:3000` |
| `PUBLIC_API_BASE_URL` | backend | URL injectée dans le ZIP pour `POST /api/public/leads` (sinon `http://localhost:3000/api/public/leads`) |
| `POSTGRES_*` | racine | Docker Compose |

---

## 4. Comptes et données de test (seed)

| Élément | Valeur |
|---------|--------|
| **Email admin** | `admin@autohall.local` |
| **Mot de passe** | `Autohall_Dev_2026!` (défini dans `backend/prisma/seed.ts` — **dev uniquement**) |
| **Rôle** | `ADMIN` |
| **Campagne démo** | `Campagne démo — Offre printemps` (UUID fixe seed : `00000000-0000-4000-8000-000000000001`) |
| **Landing slug** | `demo-offre-printemps` |
| **Lead démo** | `lead.demo@example.com` — statut `RECEIVED` |

---

## 5. Routes API réelles (référence rapide)

### Public (sans JWT)

| Méthode | Route |
|---------|-------|
| GET | `/health`, `/health/db` |
| POST | `/api/auth/login`, `/api/auth/logout` |
| POST | `/api/public/leads` |

### JWT — lecture large (ADMIN, SI_DIGITAL, MARKETER, **VIEWER**)

Campagnes, landings, versions, blocs, preview : GET (+ écriture selon route, voir `backend/README.md`).

### JWT — leads & KPI (**ADMIN, SI_DIGITAL, MARKETER** uniquement)

| Méthode | Route |
|---------|-------|
| GET | `/api/lead-events` |
| GET | `/api/lead-events/dashboard` |
| GET | `/api/lead-events/assignable-users` |
| GET | `/api/lead-events/:id` |
| GET | `/api/lead-events/:id/history` |
| PATCH | `/api/lead-events/:id/status` |
| PATCH | `/api/lead-events/:id/follow-up` |

### JWT — publish / export (**ADMIN, SI_DIGITAL, MARKETER**)

| Méthode | Route |
|---------|-------|
| POST | `/api/page-versions/:pageVersionId/publish` |
| GET | `/api/page-versions/:pageVersionId/export` |

### Statuts lead (enum réel)

`RECEIVED` · `CONTACTED` · `QUALIFIED` · `REJECTED` · `ARCHIVED`

### Priorités lead

`LOW` · `NORMAL` · `HIGH` · `URGENT`

### Types de blocs autorisés

`hero` · `text` · `image` · `button` · `lead_form`

---

## 6. Scénarios de validation manuelle

### S1 — Authentification

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Ouvrir `/login`, identifiants seed | Redirection possible vers zone protégée |
| 2 | `GET /api/auth/me` avec token | `success: true`, rôle `ADMIN` |
| 3 | Mauvais mot de passe | Erreur 401 |

### S2 — Campagne → Landing → Version

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | `/campaigns` — liste | Campagne démo visible |
| 2 | Créer campagne test | 201, apparition en liste |
| 3 | Ouvrir landing pages de la campagne | Liste + création slug unique |
| 4 | Ouvrir versions de la landing | Version 1 `DRAFT` (seed) |

### S3 — Blocs + Preview

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | `/page-versions/:id/blocks` — ajouter bloc `text` | Bloc listé, `sortOrder` cohérent |
| 2 | Ajouter bloc `lead_form` (template JSON UI) | Bloc créé |
| 3 | `/page-versions/:id/preview` | Hero + texte + formulaire visibles |

### S4 — Publication + Export

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Publier la version (UI ou `POST .../publish`) | Statut `PUBLISHED`, autres versions `DRAFT` |
| 2 | Exporter ZIP sur version **non** publiée | 400 `PAGE_VERSION_NOT_PUBLISHED` |
| 3 | `GET .../export` sur version publiée | Téléchargement `.zip` |
| 4 | Dézipper : `index.html`, `assets/style.css`, `js/landing-config.js`, `js/main.js` | Fichiers présents |

### S5 — Soumission lead (statique)

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Dans le dossier exporté : `npx serve . -p 8080` | Page servie en HTTP (pas `file://`) |
| 2 | Backend sur `:3000`, soumettre formulaire | Message succès côté page |
| 3 | `POST /api/public/leads` direct (curl, slug `demo-offre-printemps`) | 201, `status: RECEIVED` |
| 4 | Vérifier `GET /api/lead-events` | Nouveau lead en liste |

### S6 — Détail lead + suivi

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | `/leads` — lien « Voir » | Détail complet |
| 2 | `PATCH .../status` → `CONTACTED` + commentaire | Statut à jour, entrée historique `STATUS_CHANGE` |
| 3 | `PATCH .../follow-up` — priorité `HIGH`, assignation, relance demain | Champs à jour, historique `FOLLOW_UP_UPDATE` si changement |
| 4 | Relance passée + statut actif | Badge « En retard » liste + KPI dashboard |

### S7 — Dashboard KPI

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | `/dashboard` en ADMIN | Cartes KPI + tableaux répartition |
| 2 | `GET /api/lead-events/dashboard` | JSON cohérent avec l’UI |
| 3 | Filtre `/leads?overdueOnly=true` | Uniquement leads en retard |

### S8 — Contrôle d’accès

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Utilisateur **VIEWER** (si créé en base) sur `/leads` | Message accès refusé / pas de lien dashboard leads |
| 2 | `GET /api/lead-events` sans token | 401 |

---

## 7. Pages frontend (parcours démo)

| Route | Rôle |
|-------|------|
| `/` | Accueil public |
| `/login` | Connexion |
| `/dashboard` | Session + **KPI leads** (rôles autorisés) |
| `/campaigns` | Campagnes |
| `/campaigns/:campaignId/landing-pages` | Landings |
| `/landing-pages/:landingPageId/versions` | Versions + Publier + Export |
| `/page-versions/:pageVersionId/blocks` | Blocs (JSON) |
| `/page-versions/:pageVersionId/preview` | Aperçu |
| `/leads` | Liste leads + filtres |
| `/leads/:id` | Détail + suivi + historique |

---

## 8. Références

- Détail API : [`backend/README.md`](../../backend/README.md)
- Docker : [`docker/README.md`](../../docker/README.md)
- Checklist avant démo : [`CHECKLIST-DEMO.md`](./CHECKLIST-DEMO.md)
- Stratégie tests long terme (partiellement obsolète sur sync) : [`10-strategie-tests-recette-mvp.md`](./10-strategie-tests-recette-mvp.md)
