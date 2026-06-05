# Auto Hall Landing Studio

Plateforme interne de création, preview, export et suivi de landing pages pour Auto Hall.

| Composant | Stack |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, Zustand, Tailwind CSS 4 |
| Backend | NestJS, Prisma, PostgreSQL |
| Export | ZIP statique (renderer backend) |

## Éditeur officiel

**Builder V3** — routes :

- Studio : `/page-versions/:pageVersionId/studio`
- Preview : `/page-versions/:pageVersionId/studio/preview`

Documentation technique frontend (architecture iframe, registry blocs, state flow) : [`frontend/README.md`](frontend/README.md).

Les routes legacy (`/blocks`, `/studio-v2`, `/preview`) redirigent vers ces URLs via `LandingStudioLegacyRedirect`.

## Structure du dépôt

| Répertoire | Rôle |
| --- | --- |
| `frontend/` | Application React — dashboard, campagnes, leads, Builder V3 |
| `backend/` | API NestJS — auth, campagnes, versions, preview/export, leads |
| `backend/prisma/` | Schéma, migrations, seed |
| `docs/` | Architecture et cadrage |
| `docker/` | PostgreSQL et pgAdmin locaux |

Le code archivé V1/V2 (`frontend/src/_archive`) a été retiré du dépôt. L'export ZIP passe par `frontend/src/lib/landing-export.api.ts` (appels backend depuis le dashboard).

## Installation locale

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d

cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run db:seed && npm run start:dev

cd frontend && npm install && npm run dev
```

Vérifications :

```bash
curl http://localhost:3000/health
# Frontend : http://localhost:5173
```

## Qualité (CI locale)

```bash
cd frontend && npm run build && npm run test
cd backend && npm run build && npm run test
```

## Sécurité dépôt

Ne pas versionner : `node_modules/`, `dist/`, `.env`, exports ZIP, caches, clés API. Voir [`.gitignore`](.gitignore).

Documentation architecture globale : [`docs/architecture/current-architecture.md`](docs/architecture/current-architecture.md).
