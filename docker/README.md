# Docker — AutoHall LP Builder

Configuration Docker locale pour **PostgreSQL** (et **pgAdmin** en option).  
Les services applicatifs (backend NestJS, frontend React) ne sont pas conteneurisés à ce stade.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Docker Compose v2)
- Fichier `.env` à la racine du dépôt (copier depuis `.env.example`)

```bash
cp .env.example .env
```

Adapter au minimum `POSTGRES_PASSWORD`, `PGADMIN_DEFAULT_PASSWORD` et `DATABASE_URL` dans `.env`.

## Démarrage

Depuis la **racine du dépôt** :

```bash
# PostgreSQL uniquement
docker compose up -d

# PostgreSQL + pgAdmin (profil optionnel)
docker compose --profile pgadmin up -d
```

## Arrêt

```bash
# Arrêter les conteneurs (conserver les données)
docker compose --profile pgadmin down

# Arrêter et supprimer le volume PostgreSQL (perte des données locales)
docker compose --profile pgadmin down -v
```

## Vérification

```bash
# État des services
docker compose ps

# Logs PostgreSQL
docker compose logs -f postgres

# Logs pgAdmin (si démarré)
docker compose logs -f pgadmin

# Test de connexion depuis l'hôte
docker exec -it autohall_lp_postgres psql -U autohall_user -d autohall_lp_builder -c "SELECT 1;"
```

## Accès

| Service    | URL / hôte              | Identifiants                          |
|------------|-------------------------|---------------------------------------|
| PostgreSQL | `localhost:5432`        | `POSTGRES_USER` / `POSTGRES_PASSWORD` |
| pgAdmin    | http://localhost:5050   | `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` |

### Connexion pgAdmin → PostgreSQL

Dans pgAdmin, ajouter un serveur avec :

| Champ        | Valeur                                              |
|--------------|-----------------------------------------------------|
| Host         | `postgres` (nom du service Docker Compose)          |
| Port         | `5432`                                              |
| Database     | valeur de `POSTGRES_DB` (ex. `autohall_lp_builder`) |
| Username     | valeur de `POSTGRES_USER` (ex. `autohall_user`)     |
| Password     | valeur de `POSTGRES_PASSWORD`                       |

> Utiliser `postgres` comme hôte depuis pgAdmin (réseau Docker interne).  
> Depuis le backend sur la machine hôte, utiliser `localhost` et `DATABASE_URL`.

## Volume

Les données PostgreSQL sont persistées dans le volume nommé `autohall_lp_postgres_data`.

## Hors scope (étape actuelle)

- Dockerfile backend / frontend
- Prisma, migrations, schéma de base
- Services NestJS ou React dans Compose
