# Auto Hall Landing Studio

Plateforme interne de creation, preview, export et suivi de landing pages pour Auto Hall.

Le projet est organise autour d'un Studio prive utilise par les equipes internes. Les landing pages produites sont exportees en ZIP statique et peuvent ensuite etre deployees hors du builder, par exemple sur cPanel. Les formulaires exportes envoient les leads vers l'API publique du backend.

## Etat actuel

- Landing Studio officiel : `/page-versions/:pageVersionId/studio`
- Preview Studio officielle : `/page-versions/:pageVersionId/studio/preview`
- Backend : NestJS, Prisma, PostgreSQL
- Frontend : React, Vite, TypeScript
- Export : ZIP statique genere cote backend
- Leads : collecte publique, consultation interne, statuts, relances et KPI
- Builder V1 : archive historique conservee sur la branche `archive/builder-v1-block-editor`

La branche `archive/builder-v1-block-editor` sert uniquement de reference PFE pour l'ancien builder blocs. Elle ne doit pas etre mergee dans `main`.

## Architecture

| Zone | Role |
| --- | --- |
| `frontend/` | Application React privee : dashboard, campagnes, leads, Landing Studio, preview Studio. |
| `backend/` | API NestJS : auth, campagnes, landings, versions, documents Studio, preview/export, assets, leads. |
| `backend/prisma/` | Schema Prisma, migrations et seed local. |
| `docs/` | Notes de cadrage, architecture et documents PFE utiles. |
| `docker/` | Support local PostgreSQL et pgAdmin. |

Le Studio prive et les landing pages exportees sont separes :

- le Studio manipule un document de page versionne dans l'application privee ;
- la preview/export Studio utilisent un renderer backend dedie ;
- le ZIP exporte ne contient pas l'application React ;
- les leads publics passent par l'API backend, pas par une connexion directe a PostgreSQL.

Voir aussi : [`docs/architecture/current-architecture.md`](docs/architecture/current-architecture.md).

## Routes principales

### Frontend prive

- `/login`
- `/dashboard`
- `/campaigns`
- `/campaigns/:campaignId/landing-pages`
- `/landing-pages/:landingPageId/versions`
- `/page-versions/:pageVersionId/studio`
- `/page-versions/:pageVersionId/studio/preview`
- `/leads`
- `/leads/:id`

### Routes legacy conservees

Ces routes existent pour rediriger proprement les anciens liens vers le Studio officiel :

- `/page-versions/:pageVersionId/blocks` -> `/page-versions/:pageVersionId/studio`
- `/page-versions/:pageVersionId/studio-v2` -> `/page-versions/:pageVersionId/studio`
- `/page-versions/:pageVersionId/preview` -> `/page-versions/:pageVersionId/studio/preview`
- `/page-versions/:pageVersionId/studio-v2-preview` -> `/page-versions/:pageVersionId/studio/preview`

## Installation locale

### 1. Variables d'environnement

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Adapter au minimum `DATABASE_URL`, les secrets JWT et les URLs publiques selon l'environnement local.

### 2. Base PostgreSQL

```bash
docker compose up -d
```

pgAdmin peut etre lance avec le profil dedie si necessaire :

```bash
docker compose --profile pgadmin up -d
```

### 3. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

Verification :

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Par defaut, Vite expose l'application sur `http://localhost:5173` et le frontend appelle `http://localhost:3000` si `VITE_API_BASE_URL` n'est pas surcharge.

## Qualite

Frontend :

```bash
cd frontend
npm run build
npm run test -- --run
```

Backend :

```bash
cd backend
npx prisma generate
npm run build
npm run test
```

Ces commandes doivent rester vertes avant de proposer une integration dans `main`.

## Notes de maintenance

- Ne pas remettre le Builder V1 comme editeur officiel.
- Ne pas merger `archive/builder-v1-block-editor` dans `main`.
- Garder les routes legacy tant que des liens historiques peuvent exister.
- Ne pas versionner `dist/`, `output/`, `.env`, exports ZIP, logs, caches, stockage local ou fichiers generes.
- Ne pas mettre de secret dans un export ZIP.
