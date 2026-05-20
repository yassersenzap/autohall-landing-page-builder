# AutoHall LP Builder — Backend

API NestJS du builder de landing pages Auto Hall.

## Prérequis

- Node.js (LTS)
- PostgreSQL local via Docker (voir [`../docker/README.md`](../docker/README.md))
- Fichier `backend/.env` avec au minimum `DATABASE_URL` (ne pas versionner)

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

## Endpoints (infrastructure)

| Méthode | Route              | Description                          |
|---------|--------------------|--------------------------------------|
| GET     | `/`                | Healthcheck applicatif minimal       |
| GET     | `/health/database` | Vérifie la connexion PostgreSQL      |

## Prisma

- Schéma : `prisma/schema.prisma`
- Config : `prisma.config.ts` (URL via `DATABASE_URL`)
- Client généré : `generated/prisma/` (ignoré par Git — regénérer après clone)

Aucun modèle métier ni migration n’est encore défini à ce stade.
