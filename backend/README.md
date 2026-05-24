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
