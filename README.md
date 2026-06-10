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

## Déploiement Docker (SI / test interne)

Stack conteneurisée : **PostgreSQL** + **backend NestJS** (port 3000) + **frontend Nginx** (port 80 dans le conteneur, mappé sur `FRONTEND_PORT` à l'hôte, défaut **8080**).

Le frontend appelle l'API via `VITE_API_BASE_URL` (compilée au **build** de l'image). Il n'y a pas de proxy `/api` dans Nginx : le navigateur joint le backend sur le port **3000** exposé.

### Prérequis

- Docker Engine + Docker Compose v2
- Fichier `.env` à la racine (jamais versionné)

### Déploiement initial

```bash
git pull
cp .env.example .env
# Éditer .env : POSTGRES_PASSWORD, JWT_SECRET, DATABASE_URL (host postgres), CORS, URLs publiques

docker compose config
docker compose build
docker compose up -d
docker compose logs -f backend
```

Ouvrir le frontend : `http://<hôte>:<FRONTEND_PORT>/` (ex. `http://10.100.8.10:8080/` ou port 80 si `FRONTEND_PORT=80`).

Exemple `.env` pour serveur SI `10.100.8.10` (adapter les secrets) :

```env
FRONTEND_PORT=8080
POSTGRES_PASSWORD=<secret>
JWT_SECRET=<secret>
DATABASE_URL=postgresql://autohall_user:<secret>@postgres:5432/autohall_lp_builder?schema=public
CORS_ALLOWED_ORIGINS=http://10.100.8.10,http://10.100.8.10:8080
PUBLIC_API_BASE_URL=http://10.100.8.10:3000
VITE_API_BASE_URL=http://10.100.8.10:3000
```

Vérification rapide :

```bash
docker compose ps
docker compose exec backend node -e "console.log({ hasDatabaseUrl: Boolean(process.env.DATABASE_URL), hasJwtSecret: Boolean(process.env.JWT_SECRET), cors: process.env.CORS_ALLOWED_ORIGINS, publicApi: process.env.PUBLIC_API_BASE_URL })"
curl http://localhost:3000/health
```

### Mise à jour d'un déploiement existant

```bash
cp .env .env.backup.$(date +%Y%m%d)
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose logs -f backend
```

Si `VITE_API_BASE_URL` change, reconstruire le frontend : `docker compose build frontend`.

### Dépannage

| Symptôme | Cause probable | Action |
| --- | --- | --- |
| `datasource.url property is required` (Prisma migrate) | `DATABASE_URL` absent dans le conteneur backend | Vérifier `.env`, `docker compose config`, logs entrypoint ; `DATABASE_URL` doit utiliser l'hôte **`postgres`** |
| `dotenv injected env (0)` | Normal en Docker sans fichier `.env` dans l'image | Les variables viennent de Compose ; s'assurer que `POSTGRES_PASSWORD` et `JWT_SECRET` sont définis dans `.env` racine |
| Login frontend échoue (CORS / réseau) | `VITE_API_BASE_URL` ou `CORS_ALLOWED_ORIGINS` incorrects | Rebuild frontend après changement de `VITE_API_BASE_URL` ; CORS doit inclure l'URL exacte du navigateur |
| Backend ne joint pas Postgres | `DATABASE_URL` avec `localhost` au lieu de `postgres` | Corriger `.env` puis `docker compose up -d --force-recreate backend` |
| `exec ./docker-entrypoint.sh: no such file` | Fins de ligne Windows (CRLF) sur le script | Rebuild backend ; le Dockerfile normalise les CRLF (`sed`) |
| Backend crash `landing-page.css introuvable` | Assets CSS absents de l'image | Rebuild backend (image inclut `nest-cli.json` + styles export) |

pgAdmin optionnel : `docker compose --profile pgadmin up -d` (voir [`docker/README.md`](docker/README.md)).

## Sécurité dépôt

Ne pas versionner : `node_modules/`, `dist/`, `.env`, exports ZIP, caches, clés API. Voir [`.gitignore`](.gitignore).

Documentation architecture globale : [`docs/architecture/current-architecture.md`](docs/architecture/current-architecture.md).
