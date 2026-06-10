# Docker — AutoHall LP Builder

## Stack complète (recommandée)

Depuis la **racine du dépôt**, Compose démarre PostgreSQL, le backend NestJS et le frontend Nginx :

```bash
cp .env.example .env
# Configurer POSTGRES_PASSWORD, JWT_SECRET, URLs (voir .env.example)

docker compose up -d
```

Instructions détaillées (déploiement SI, mise à jour, dépannage) : [`../README.md`](../README.md#déploiement-docker-si--test-interne).

| Service | Conteneur | Port hôte (défaut) | Rôle |
| --- | --- | --- | --- |
| postgres | `autohall_lp_postgres` | 5432 | Base PostgreSQL |
| backend | `autohall_lp_backend` | 3000 | API NestJS + migrations Prisma au démarrage |
| frontend | `autohall_lp_frontend` | 8080 → Nginx :80 | SPA React (builder) |

## PostgreSQL + pgAdmin seuls (dev local)

Pour développer backend/frontend sur la machine hôte avec uniquement Postgres en Docker :

```bash
docker compose up -d postgres
# DATABASE_URL avec host localhost dans backend/.env ou .env racine
```

pgAdmin (profil optionnel) :

```bash
docker compose --profile pgadmin up -d
```

| Service | URL | Identifiants |
| --- | --- | --- |
| PostgreSQL (hôte) | `localhost:5432` | `POSTGRES_USER` / `POSTGRES_PASSWORD` |
| pgAdmin | http://localhost:5050 | `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` |

Connexion pgAdmin → Postgres : hôte **`postgres`**, port **5432**.

## Volumes

- `postgres_data` — données PostgreSQL
- `backend_storage` — assets et exports ZIP

## Commandes utiles

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down          # conserver les volumes
docker compose down -v       # supprimer les données Postgres (destructif)
```
