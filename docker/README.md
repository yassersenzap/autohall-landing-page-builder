# Docker — AutoHall LP Builder

## Stack complète (recommandée)

Depuis la **racine du dépôt** :

```bash
cp .env.example .env
# Éditer le .env RACINE uniquement (voir ../.env.example)
docker compose up -d
docker compose exec backend npm run db:seed
```

Le seed lit `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` depuis le `.env` racine (jamais de mot de passe dans le code source).

Instructions détaillées : [`../README.md`](../README.md#déploiement-docker-si--test-interne).

| Service | Conteneur | Port hôte (exemple local) | Rôle |
| --- | --- | --- | --- |
| postgres | `autohall_lp_postgres` | 5432 | Base PostgreSQL |
| backend | `autohall_lp_backend` | 3001 (ou 3000 en SI) | API NestJS + migrations Prisma |
| frontend | `autohall_lp_frontend` | 8081 → Nginx :80 | SPA React (builder) |

**Important :** le `.env` racine sert **uniquement** à Docker Compose. Le développement local Vite/NestJS utilise `frontend/.env` et `backend/.env`.

## PostgreSQL seul (dev backend/frontend sur l'hôte)

```bash
docker compose up -d postgres
# DATABASE_URL avec host localhost dans backend/.env (pas le .env racine)
```

pgAdmin (profil optionnel) : `docker compose --profile pgadmin up -d`

## Volumes

- `postgres_data` — données PostgreSQL
- `backend_storage` — assets et exports ZIP

## Commandes utiles

```bash
docker compose config
docker compose ps
docker compose logs -f backend
docker compose down
docker compose down -v   # destructif : supprime les données Postgres
```
