# AutoHall LP Builder — Backend

API NestJS du builder de landing pages Auto Hall.

## Prérequis

- Node.js (LTS)
- PostgreSQL local via Docker (voir [`../docker/README.md`](../docker/README.md))
- Fichier `backend/.env` avec `DATABASE_URL`, `BACKEND_PORT`, `CORS_ALLOWED_ORIGINS` (ne pas versionner)

```bash
cp .env.example .env
```

## Installation

```bash
npm install
npx prisma generate
```

## Commandes

```bash
# développement
npm run start:dev

# build
npm run build

# Prisma
npx prisma validate
npx prisma generate
```

## Configuration

Les variables d’environnement sont chargées via `@nestjs/config` (`ConfigModule` global), dans cet ordre :

1. `.env` à la **racine du dépôt** (fichier principal)
2. `backend/.env` (surcharges locales optionnelles, non versionné)

| Variable               | Description                                      |
|------------------------|--------------------------------------------------|
| `BACKEND_PORT`         | Port HTTP du serveur NestJS (défaut : `3000`)    |
| `DATABASE_URL`         | Connexion PostgreSQL (Prisma)                    |
| `CORS_ALLOWED_ORIGINS` | Origines autorisées, séparées par des virgules   |
| `JWT_SECRET`           | Secret de signature des tokens JWT (requis)      |
| `JWT_EXPIRES_IN`       | Durée de vie du token (ex. `7d`)                 |

## Endpoints (infrastructure)

| Méthode | Route        | Description                                      |
|---------|--------------|--------------------------------------------------|
| GET     | `/`          | Healthcheck applicatif minimal (public)          |
| GET     | `/health`      | État du service (public)                         |
| GET     | `/health/db`   | Vérifie la connexion PostgreSQL via Prisma (public) |

## Authentification (fondation)

| Méthode | Route               | Accès    | Description                    |
|---------|---------------------|----------|--------------------------------|
| POST    | `/api/auth/login`   | Public   | Email + mot de passe → JWT     |
| POST    | `/api/auth/logout`  | Public   | Déconnexion (JWT stateless)    |
| GET     | `/api/auth/me`      | JWT      | Profil de l’utilisateur connecté |

Rôles Prisma : `ADMIN`, `SI_DIGITAL`, `MARKETER`, `VIEWER` (le rôle marketing métier correspond à `MARKETER`).

Utilisateur de développement (seed) : `admin@autohall.local` — mot de passe dans `prisma/seed.ts`.

## Campagnes (fondation)

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/campaigns` | Tous (authentifiés) | Liste paginée (`page`, `limit`, `status`, `brand`, `search`) |
| GET | `/api/campaigns/:id` | Tous | Détail d’une campagne |
| POST | `/api/campaigns` | ADMIN, SI_DIGITAL, MARKETER | Création |
| PATCH | `/api/campaigns/:id` | ADMIN, SI_DIGITAL, MARKETER | Mise à jour |
| DELETE | `/api/campaigns/:id` | ADMIN, SI_DIGITAL | Archivage logique (`ARCHIVED`) |

### Exemples

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@autohall.local\",\"password\":\"Autohall_Dev_2026!\"}"

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"

curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer <accessToken>"
```

## Landing pages (fondation)

Routes nestées sous une campagne existante (`campaignId` UUID).

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/campaigns/:campaignId/landing-pages` | Tous (authentifiés) | Liste paginée (`page`, `limit`, `status`, `search`) |
| GET | `/api/campaigns/:campaignId/landing-pages/:id` | Tous | Détail d’une landing page |
| POST | `/api/campaigns/:campaignId/landing-pages` | ADMIN, SI_DIGITAL, MARKETER | Création (`title`, `slug`, `publicBaseUrl?`, `status?`) |
| PATCH | `/api/campaigns/:campaignId/landing-pages/:id` | ADMIN, SI_DIGITAL, MARKETER | Mise à jour |
| DELETE | `/api/campaigns/:campaignId/landing-pages/:id` | ADMIN, SI_DIGITAL | Archivage logique (`ARCHIVED`) |

Le `slug` est unique globalement (minuscules, tirets). La suppression HTTP archive la page (`status: ARCHIVED`), sans suppression en base.

### Exemple

```bash
CAMPAIGN_ID=00000000-0000-4000-8000-000000000001

curl "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/landing-pages" \
  -H "Authorization: Bearer <accessToken>"

curl -X POST "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/landing-pages" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Landing test\",\"slug\":\"landing-test\"}"
```

## Versions de page (fondation)

Routes nestées sous une landing page existante (`landingPageId` UUID).

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/landing-pages/:landingPageId/versions` | Tous (authentifiés) | Liste paginée (`page`, `limit`, `status`, `search`) |
| GET | `/api/landing-pages/:landingPageId/versions/:id` | Tous | Détail d’une version |
| POST | `/api/landing-pages/:landingPageId/versions` | ADMIN, SI_DIGITAL, MARKETER | Création (`label?`, `status?`, `themeJson?`) — `versionNumber` auto-incrémenté |
| PATCH | `/api/landing-pages/:landingPageId/versions/:id` | ADMIN, SI_DIGITAL, MARKETER | Mise à jour |
| DELETE | `/api/landing-pages/:landingPageId/versions/:id` | ADMIN, SI_DIGITAL | Archivage logique (`ARCHIVED`) |

### Exemple

```bash
# Récupérer l'id de la landing démo (slug demo-offre-printemps) via la liste campagne, puis :
LANDING_PAGE_ID=<uuid>

curl "http://localhost:3000/api/landing-pages/${LANDING_PAGE_ID}/versions" \
  -H "Authorization: Bearer <accessToken>"

curl -X POST "http://localhost:3000/api/landing-pages/${LANDING_PAGE_ID}/versions" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"label\":\"Version 2\"}"
```

## Blocs de page (fondation)

Routes nestées sous une version de page existante (`pageVersionId` UUID).

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/page-versions/:pageVersionId/blocks` | Tous (authentifiés) | Liste ordonnée par `sortOrder` |
| GET | `/api/page-versions/:pageVersionId/blocks/:id` | Tous | Détail d’un bloc |
| POST | `/api/page-versions/:pageVersionId/blocks` | ADMIN, SI_DIGITAL, MARKETER | Création (`blockType`, `propsJson`, `sortOrder?`, `blockKey?`) |
| PATCH | `/api/page-versions/:pageVersionId/blocks/:id` | ADMIN, SI_DIGITAL, MARKETER | Mise à jour |
| DELETE | `/api/page-versions/:pageVersionId/blocks/:id` | ADMIN, SI_DIGITAL, MARKETER | Suppression physique (pas de statut en schéma) |

Types autorisés : `hero`, `text`, `image`, `button`, `lead_form` (minuscules). Le `sortOrder` est auto-incrémenté si omis.

Le bloc `lead_form` utilise un `propsJson` avec `title`, `subtitle`, `submitText` et un tableau `fields` (`name`, `label`, `type`, `required`). Il est rendu dans l’aperçu privé et dans l’export ZIP (formulaire HTML statique, soumission locale en placeholder — pas d’API leads pour l’instant).

### Exemple

```bash
PAGE_VERSION_ID=<uuid>

curl "http://localhost:3000/api/page-versions/${PAGE_VERSION_ID}/blocks" \
  -H "Authorization: Bearer <accessToken>"

curl -X POST "http://localhost:3000/api/page-versions/${PAGE_VERSION_ID}/blocks" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"blockType\":\"text\",\"propsJson\":{\"content\":\"Bonjour Auto Hall\"}}"

curl -X POST "http://localhost:3000/api/page-versions/${PAGE_VERSION_ID}/blocks" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"blockType\":\"lead_form\",\"propsJson\":{\"title\":\"Demander un essai\",\"subtitle\":\"Remplissez le formulaire.\",\"submitText\":\"Envoyer ma demande\",\"fields\":[{\"name\":\"fullName\",\"label\":\"Nom complet\",\"type\":\"text\",\"required\":true},{\"name\":\"phone\",\"label\":\"Téléphone\",\"type\":\"tel\",\"required\":true}]}}"
```

### Test manuel `lead_form`

1. Connexion admin → Campagnes → Landing pages → Versions → **Blocs**.
2. Créer un bloc **lead_form** (template JSON prérempli).
3. **Preview** : formulaire visible avec champs.
4. Publier la version → **Exporter ZIP** → ouvrir `index.html`.
5. Soumettre le formulaire : alerte placeholder (pas d’appel API).

## Publication d’une version

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| POST | `/api/page-versions/:pageVersionId/publish` | ADMIN, SI_DIGITAL, MARKETER | Publie la version ciblée |

Règles métier :

- Une seule version **PUBLISHED** par landing page (garantie applicative).
- Lors de la publication, toutes les autres versions **non archivées** de la même landing passent en **DRAFT**.
- Une version **ARCHIVED** ne peut pas être publiée (erreur 400).

```bash
curl -X POST "http://localhost:3000/api/page-versions/${PAGE_VERSION_ID}/publish" \
  -H "Authorization: Bearer <accessToken>"
```

## Export ZIP statique (fondation)

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/page-versions/:pageVersionId/export` | ADMIN, SI_DIGITAL, MARKETER | Télécharge un ZIP statique cPanel-ready |

Règles :

- Seules les versions **PUBLISHED** peuvent être exportées (sinon 400 `PAGE_VERSION_NOT_PUBLISHED`).
- Le ZIP contient : `index.html`, `assets/style.css`, `js/main.js`.
- Nom de fichier : `landing-{slug}-v{versionNumber}.zip` (ex. `landing-demo-offre-printemps-v1.zip`).

### Exemple curl

```bash
curl -o export.zip "http://localhost:3000/api/page-versions/${PAGE_VERSION_ID}/export" \
  -H "Authorization: Bearer <accessToken>"
```

### Exemple PowerShell

```powershell
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@autohall.local","password":"Autohall_Dev_2026!"}'
$token = $login.data.accessToken
$pageVersionId = "<uuid-version-publiee>"

Invoke-WebRequest -Uri "http://localhost:3000/api/page-versions/$pageVersionId/export" `
  -Headers @{ Authorization = "Bearer $token" } `
  -OutFile "landing-export.zip"
```

## Collecte publique des leads (staging)

Phase 1 — simulation : les soumissions sont stockées dans `lead_events` uniquement. Pas d’écriture vers les tables Auto Hall réelles (`simulated_testdrive` / `simulated_contacts` seront branchées plus tard).

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/api/public/leads` | Public (sans JWT) | Enregistre un lead depuis une landing exportée |
| GET | `/api/lead-events` | JWT — ADMIN, SI_DIGITAL, MARKETER | Liste paginée des leads (filtres + recherche) |
| GET | `/api/lead-events/dashboard` | JWT — ADMIN, SI_DIGITAL, MARKETER | KPIs opérationnels leads (volume, statuts, relances) |
| GET | `/api/lead-events/:id` | JWT — ADMIN, SI_DIGITAL, MARKETER | Détail complet d’un lead |
| PATCH | `/api/lead-events/:id/status` | JWT — ADMIN, SI_DIGITAL, MARKETER | Mise à jour du statut (+ commentaire interne optionnel) |
| GET | `/api/lead-events/:id/history` | JWT — ADMIN, SI_DIGITAL, MARKETER | Historique des changements de statut |
| PATCH | `/api/lead-events/:id/follow-up` | JWT — ADMIN, SI_DIGITAL, MARKETER | Priorité, assignation, prochaine relance |
| GET | `/api/lead-events/assignable-users` | JWT — ADMIN, SI_DIGITAL, MARKETER | Utilisateurs éligibles à l’assignation |

Query `GET /api/lead-events` : `page`, `limit`, `search` (nom, email, téléphone), `status`, `campaignId`, `landingPageId`, `priority`, `assignedToUserId`, `overdueOnly`. Tri par date décroissante.

Statuts métier : `RECEIVED`, `CONTACTED`, `QUALIFIED`, `REJECTED`, `ARCHIVED`.

```json
PATCH /api/lead-events/:id/status
{ "status": "CONTACTED", "internalComment": "Rappel planifié lundi" }
```

### Payload `POST /api/public/leads`

Champs obligatoires : `fullName`, `phone`, et (`landingPageId` **ou** `landingSlug`).

```json
{
  "campaignId": "uuid",
  "landingPageId": "uuid",
  "landingSlug": "demo-offre-printemps",
  "pageVersionId": "uuid",
  "fullName": "Client Exemple",
  "phone": "0600000000",
  "email": "client@example.com",
  "vehicleModel": "Ranger",
  "sourceUrl": "https://offre.example.ma",
  "rawPayload": { "fullName": "...", "phone": "..." },
  "metadata": { "utmSource": "facebook" }
}
```

Réponse **201** :

```json
{
  "success": true,
  "data": { "leadId": "uuid", "status": "RECEIVED" },
  "message": "Lead received successfully"
}
```

L’export ZIP embarque `js/landing-config.js` (`window.LANDING_CONFIG.leadEndpoint`) et envoie le formulaire `lead_form` vers cette API.

Variable optionnelle : `PUBLIC_API_BASE_URL` (ex. `http://localhost:3000`) pour l’URL injectée dans le ZIP — sinon `http://localhost:{BACKEND_PORT}/api/public/leads`.

### Test manuel

1. Publier une version avec un bloc `lead_form`.
2. Exporter le ZIP, servir le dossier : `npx serve .` (éviter `file://` pour CORS).
3. Soumettre le formulaire → message de succès.
4. Vérifier en base ou via `GET /api/lead-events` (token admin).

```powershell
curl -X POST "http://localhost:3000/api/public/leads" `
  -H "Content-Type: application/json" `
  -d "{\"landingSlug\":\"demo-offre-printemps\",\"fullName\":\"Test Client\",\"phone\":\"0601020304\",\"email\":\"test@example.com\",\"vehicleModel\":\"Ranger\",\"sourceUrl\":\"http://localhost:8080\"}"
```

## Aperçu privé (preview)

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | `/api/page-versions/:pageVersionId/preview` | Tous (authentifiés) | Version, landing page, campagne et blocs ordonnés |

```bash
curl "http://localhost:3000/api/page-versions/${PAGE_VERSION_ID}/preview" \
  -H "Authorization: Bearer <accessToken>"
```

## Prisma

- Schéma : `prisma/schema.prisma` (fondation MVP : utilisateurs, campagnes, pages, versions, blocs, formulaires, leads, exports, audit)
- Config : `prisma.config.ts` (URL via `DATABASE_URL`)
- Migrations : `prisma/migrations/`
- Seed local : `prisma/seed.ts` (commande configurée dans `prisma.config.ts` → `migrations.seed`)
- Données de démonstration : admin, campagne, landing, version, blocs, formulaire, lead — **dev uniquement**, idempotent (`upsert`)

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init_database_foundation
npm run db:seed
```

Le mot de passe de l’utilisateur admin créé par le seed est défini dans `prisma/seed.ts` (environnement local uniquement, jamais en production).
