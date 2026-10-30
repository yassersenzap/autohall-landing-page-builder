# 🚀 Auto Hall Landing Studio — Plateforme No-Code & Headless Landing Pages

> **Solution SI d'entreprise dédiée à la création, la personnalisation, l'exportation autonome (cPanel / ZIP) et la collecte centralisée des leads marketing pour Auto Hall.**

## 🛠️ Stack Technique

- **Frontend :** React 19, Vite, TypeScript, Zustand, Tailwind CSS, Lucide Icons.
- **Backend :** NestJS, TypeScript, Prisma ORM, REST API avec validation Class-Validator.
- **Base de données :** PostgreSQL 16.
- **Conteneurisation :** Docker, Docker Compose, Nginx (staging/prod).
- **Export :** moteur de rendu HTML/JS autonome embarqué dans des archives `.zip` statiques.

## 💻 Prérequis Système

- **Node.js** >= v18.x (Node.js 20 LTS est recommandé et utilisé par les Dockerfiles).
- **npm** >= v9.x, ou yarn/pnpm si l'équipe l'utilise déjà.
- **Docker Engine** et **Docker Compose v2** (recommandés pour l'installation complète).
- **PostgreSQL** >= 14 si l'application est exécutée hors Docker.
- Un navigateur moderne (Chrome, Edge ou Firefox) pour le Studio.

## 🧭 Architecture et structure du dépôt

| Répertoire | Responsabilité |
| --- | --- |
| `frontend/` | Application React/Vite : dashboard, campagnes, Studio, preview et gestion des leads. |
| `backend/` | API NestJS : authentification, campagnes, pages, preview/export, assets et leads. |
| `backend/prisma/` | Schéma Prisma, migrations et seed initial. |
| `docker-compose.yml` | Orchestration PostgreSQL, API, frontend Nginx et pgAdmin optionnel. |
| `docker/` | Documentation et éléments de support Docker. |

Le navigateur accède au frontend via Nginx. Le frontend appelle l'API avec `VITE_API_BASE_URL`, valeur compilée dans le bundle au moment du build. Il n'y a pas de proxy `/api` Nginx : l'URL de l'API doit donc être joignable depuis le navigateur.

Endpoints de contrôle principaux :

| Endpoint | Usage |
| --- | --- |
| `GET /health` | Santé de l'API. |
| `GET /health/db` | Santé de l'API et de la connexion PostgreSQL. |
| `POST /api/auth/login` | Authentification du dashboard. |
| `POST /api/public/leads` | Réception publique des leads provenant des pages et exports. |
| `GET /api/page-versions/:pageVersionId/export` | Génération/récupération d'un export de page. |

## 🚀 Guide de Déploiement Rapide (via Docker Compose)

```bash
# 1. Cloner le dépôt
git clone https://github.com/yassersenzap/autohall-landing-page-builder.git
cd autohall-landing-page-builder

# 2. Créer la configuration locale (ne jamais committer .env)
cp .env.example .env

# 3. Modifier .env :
#    POSTGRES_PASSWORD, JWT_SECRET, SEED_ADMIN_PASSWORD,
#    CORS_ALLOWED_ORIGINS, PUBLIC_API_BASE_URL et VITE_API_BASE_URL

# 4. Vérifier la configuration résolue
docker compose config

# 5. Construire et démarrer PostgreSQL, le backend et le frontend
docker compose up -d --build

# 6. Créer/mettre à jour le compte administrateur initial
docker compose exec backend npm run db:seed

# 7. Contrôler les services
docker compose ps
curl http://localhost:3001/health
```

Avec les valeurs par défaut de `.env.example`, l'interface est disponible à `http://localhost:8081` et l'API à `http://localhost:3001`. Pour une installation SI exposée sur les ports standards, définir par exemple `FRONTEND_PORT=80` et `BACKEND_PORT=3000`, puis adapter toutes les URLs publiques.

> Sous PowerShell, utiliser `Copy-Item .env.example .env` à la place de `cp`.

## 🔐 Configuration des variables d'environnement

Les fichiers suivants ont des rôles distincts :

| Fichier | Utilisation | Versionné |
| --- | --- | --- |
| `.env` | Docker Compose et déploiement intégré | Non |
| `backend/.env` | API/Prisma en développement hors Docker | Non |
| `frontend/.env` | Vite en développement hors Docker | Non |
| `.env.example` et `*/.env.example` | Modèles sans secrets | Oui |

Variables importantes pour `.env` racine :

| Variable | Description |
| --- | --- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Identifiants PostgreSQL du service Compose. |
| `DATABASE_URL` | En Docker, le backend utilise automatiquement le service `postgres` comme hôte. Ne pas utiliser `localhost` dans le conteneur. |
| `JWT_SECRET` | Secret long et aléatoire, différent par environnement. |
| `JWT_EXPIRES_IN` | Durée de validité des JWT, par défaut `7d`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Compte créé par le seed initial. |
| `CORS_ALLOWED_ORIGINS` | Origine(s) du navigateur autorisée(s), séparées par des virgules. |
| `PUBLIC_API_BASE_URL` | URL publique de l'API pour assets et exports. |
| `VITE_API_BASE_URL` | URL de l'API compilée dans le frontend et les exports. |
| `FRONTEND_PORT` / `BACKEND_PORT` / `POSTGRES_PORT` | Ports exposés sur l'hôte. |

Règles de sécurité :

- Remplacer toutes les valeurs `CHANGE_ME_*` avant un déploiement partagé.
- Ne jamais copier un secret dans `README.md`, une archive exportée ou un commit.
- Toute modification de `VITE_API_BASE_URL` nécessite une reconstruction du frontend :
  `docker compose build frontend`.
- Pour un export statique hébergé sur cPanel, configurer `VITE_API_BASE_URL` avec une URL HTTPS publique de l'API avant de générer le ZIP. Un export ouvert en `file://` ne peut pas utiliser une URL relative.

## 🧪 Installation locale hors Docker applicatif

Cette procédure utilise PostgreSQL dans Docker et exécute le frontend/backend sur l'hôte.

```bash
# Depuis la racine
docker compose up -d postgres

# Backend
cp backend/.env.example backend/.env
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

Dans un second terminal :

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Le frontend Vite est disponible à `http://localhost:5173` et l'API à `http://localhost:3000`. Pour le développement, `backend/.env` doit utiliser une base `localhost` et `frontend/.env` doit contenir `VITE_API_BASE_URL=http://localhost:3000`.

Commandes utiles :

```bash
cd backend
npm run build
npm test
npm run test:e2e
npm run db:migrate       # migration de développement uniquement

cd ../frontend
npm run build
npm test
npm run lint
```

## 🗃️ Base de données, migrations et seed

- Les migrations versionnées se trouvent dans `backend/prisma/migrations/`.
- En Docker, `backend/docker-entrypoint.sh` exécute `npx prisma migrate deploy` avant le démarrage de NestJS.
- Le seed n'est pas exécuté automatiquement au démarrage ; lancer explicitement `docker compose exec backend npm run db:seed`.
- Ne pas utiliser `prisma migrate dev` en production.
- Le volume Docker `postgres_data` contient les données PostgreSQL ; le volume `backend_storage` contient les assets et exports générés par l'API.

Vérification :

```bash
docker compose exec backend npx prisma migrate status
curl http://localhost:3001/health/db
```

## 📦 Exports ZIP et hébergement cPanel

Depuis le dashboard, l'export génère une archive statique contenant généralement :

```text
index.html
css/style.css
js/app.js
assets/
config/page.json
```

Procédure :

1. Configurer `VITE_API_BASE_URL` sur l'URL publique de l'API.
2. Reconstruire le frontend si la configuration a changé.
3. Générer l'export depuis le Studio.
4. Décompresser le ZIP dans le document root cPanel.
5. Vérifier que le domaine de la landing page peut appeler l'API (CORS, HTTPS et DNS).
6. Envoyer un lead de test et confirmer sa présence dans le dashboard.

Les secrets JWT, mots de passe PostgreSQL et variables internes ne doivent jamais être inclus dans un export.

## 🚢 Déploiement et exploitation en production

### Déploiement initial

```bash
cp .env.example .env
# Éditer .env avec des valeurs propres à l'environnement
docker compose config
docker compose up -d --build
docker compose exec backend npm run db:seed
docker compose ps
docker compose logs -f backend
```

Pour un serveur HTTPS, placer un reverse proxy ou un load balancer TLS devant le frontend/API, utiliser des URLs `https://`, limiter `CORS_ALLOWED_ORIGINS` aux domaines connus et ne pas exposer PostgreSQL sur Internet.

### Mise à jour

```bash
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs --tail=200 backend
```

Les migrations Prisma sont appliquées au démarrage du conteneur backend. Si seule `VITE_API_BASE_URL` change, reconstruire au minimum `frontend`, car cette valeur est injectée au build.

### Arrêt et suppression

```bash
docker compose stop
docker compose down

# ATTENTION : supprime aussi le volume PostgreSQL et donc les données
docker compose down -v
```

### Sauvegarde PostgreSQL

À exécuter depuis l'hôte Docker :

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-autohall_user}" \
  -d "${POSTGRES_DB:-autohall_lp_builder}" \
  > "backups/autohall-$(date +%Y%m%d-%H%M%S).sql"
```

Conserver les sauvegardes dans un stockage sécurisé, chiffré et soumis à la politique de rétention Auto Hall. Tester périodiquement une restauration sur un environnement isolé.

## 🔍 Dépannage

| Symptôme | Cause probable | Action |
| --- | --- | --- |
| `POSTGRES_PASSWORD is required` | `.env` absent ou mot de passe vide | Créer `.env` depuis `.env.example`, définir un mot de passe puis relancer Compose. |
| `DATABASE_URL` absent | Variable non injectée dans le backend | Vérifier `docker compose config` et les logs du backend. |
| Prisma ne joint pas PostgreSQL | `localhost` utilisé dans un conteneur | Utiliser l'hôte `postgres` dans la configuration Docker. |
| `GET /health` échoue | Backend non démarré ou migration en échec | Consulter `docker compose logs backend` puis `docker compose ps`. |
| Login ou leads bloqués par le navigateur | URL frontend/API ou CORS incorrecte | Vérifier `CORS_ALLOWED_ORIGINS`, `PUBLIC_API_BASE_URL`, `VITE_API_BASE_URL`, puis reconstruire le frontend. |
| Un changement d'URL frontend n'est pas pris en compte | Valeur Vite compilée dans l'image | Exécuter `docker compose build --no-cache frontend` puis `docker compose up -d frontend`. |
| `exec ./docker-entrypoint.sh: no such file` | Fins de ligne ou permissions du script | Reconstruire l'image backend ; le Dockerfile normalise les fins de ligne et les permissions. |
| Le frontend affiche une page blanche après refresh | Route SPA non réécrite | Vérifier que le trafic passe bien par le `frontend/nginx.conf` fourni. |

Logs :

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## 🛡️ Sécurité et checklist de livraison

Avant remise au Pôle SI Digital :

- [ ] `.env` et tous les fichiers contenant des secrets ne sont pas suivis par Git.
- [ ] `JWT_SECRET`, mots de passe PostgreSQL, seed et pgAdmin sont uniques et forts.
- [ ] `CORS_ALLOWED_ORIGINS` ne contient que les origines nécessaires.
- [ ] PostgreSQL n'est pas exposé publiquement ou est filtré par le réseau SI.
- [ ] TLS/HTTPS est activé pour le dashboard, l'API et les landing pages publiques.
- [ ] Une sauvegarde PostgreSQL récente a été réalisée et sa restauration a été testée.
- [ ] `docker compose config` est valide.
- [ ] `GET /health` et `GET /health/db` répondent correctement.
- [ ] Le build frontend/backend et les tests passent.
- [ ] Un login et une soumission de lead de bout en bout ont été vérifiés.
- [ ] Un export ZIP a été ouvert depuis son hébergement final et testé.

## 🧰 Services optionnels et références

pgAdmin est disponible uniquement avec le profil Compose dédié :

```bash
docker compose --profile pgadmin up -d
```

Il sera accessible sur `http://localhost:5050` avec les identifiants configurés par `PGADMIN_DEFAULT_EMAIL` et `PGADMIN_DEFAULT_PASSWORD`.

Documentation complémentaire :

- [Documentation backend](backend/README.md)
- [Documentation frontend](frontend/README.md)
- [Support Docker](docker/README.md)
- [Variables d'environnement Docker](.env.example)
- [Règles d'exclusion Git](.gitignore)
