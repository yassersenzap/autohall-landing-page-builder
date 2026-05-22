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

## Endpoints (infrastructure)

| Méthode | Route        | Description                                      |
|---------|--------------|--------------------------------------------------|
| GET     | `/`          | Healthcheck applicatif minimal                   |
| GET     | `/health`      | État du service (status, nom, timestamp)         |
| GET     | `/health/db`   | Vérifie la connexion PostgreSQL via Prisma       |

### Exemples

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
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
