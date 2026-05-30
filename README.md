# AutoHall LP Builder

Plateforme interne de génération de landing pages pour **Auto Hall**. Le builder reste privé et est destiné à être hébergé sur l’infrastructure locale du groupe ; les pages produites sont exportées en **site statique** puis déployées sur **cPanel** (sous-domaines, hébergement mutualisé classique).

---

## Objectif du projet

Fournir un outil maîtrisé pour :

- concevoir des landing pages à partir de blocs simples ;
- prévisualiser le rendu ;
- exporter un **ZIP statique** compatible avec un déploiement cPanel ;
- collecter les **leads** via une API sécurisée, avec persistance et traçabilité côté serveur.

---

## Architecture cible (vision)

| Couche | Rôle |
|--------|------|
| **Frontend** | Interface du builder (React), édition, prévisualisation, déclenchement d’export. |
| **Backend** | API et logique métier (NestJS), authentification, persistance, génération d’export. |
| **Base de données** | Données de campagnes, pages, blocs, événements leads (PostgreSQL). |
| **Stockage fichiers** | Emplacements configurables pour exports ZIP et médias (chemins serveur). |
| **Conteneurs** | **Docker Compose** pour PostgreSQL local (pgAdmin optionnel) ; conteneurisation backend/frontend prévue plus tard. |

Les landing **publiques** ne sont pas servies par le builder : elles sont des fichiers statiques déployés depuis le ZIP sur cPanel.

---

## Rôle du dossier `docs/`

| Dossier | Contenu |
|---------|---------|
| **`docs/context/`** | Contexte métier et produit Auto Hall (vision, contraintes, vocabulaire). |
| **`docs/mvp/`** | Spécifications du MVP : périmètre, backlog, modèle de données, contrats API, blocs, export ZIP, workflow leads, sécurité, plan d’implémentation, stratégie de tests. |

Ces documents sont la **référence** avant et pendant le développement.

---

## Stack cible

- **Frontend :** React (build type Vite attendu pour le builder).
- **Backend :** NestJS.
- **Base de données :** PostgreSQL avec **Prisma 7** (client intégré au backend ; modèles métier et migrations à venir).
- **Ops :** Docker Compose pour PostgreSQL en local ; backend et frontend lancés sur la machine hôte pour l’instant.
- **Livrable pages :** export **ZIP statique**, compatible déploiement **cPanel**.

---

## Structure technique initiale

| Dossier | Rôle |
|---------|------|
| **`docs/context/`** | Document de contexte projet (vision, contraintes, vocabulaire Auto Hall). |
| **`docs/mvp/`** | Documents de cadrage MVP (périmètre, données, API, export, sécurité, plan). |
| **`backend/`** | API NestJS, Prisma 7, health checks (`/health`, `/health/db`) ; logique métier à venir. |
| **`frontend/`** | Interface React / Vite / TypeScript (page d’accueil minimale pour l’instant). |
| **`docker/`** | Documentation et ressources Docker (PostgreSQL local, pgAdmin optionnel). |

---

## Workflow MVP (résumé)

1. Création d’une campagne et d’une landing associée.
2. Composition de la page avec des blocs (modèle décrit dans la doc MVP).
3. Configuration du formulaire et prévisualisation.
4. Export ZIP prêt pour cPanel.
5. Déploiement sur sous-domaine (hors scope du dépôt : procédure Auto Hall / hébergeur).
6. Soumission visiteur → API publique sécurisée → stockage des événements leads (détails dans `docs/mvp/`).

Pour le détail fonctionnel et technique, se référer aux fichiers numérotés dans `docs/mvp/`.

---

## Démarrage PostgreSQL local

1. Copier les variables d’environnement : `cp .env.example .env` (ne pas versionner `.env`).
2. Ajuster les mots de passe dans `.env` (`POSTGRES_PASSWORD`, `PGADMIN_DEFAULT_PASSWORD`, `DATABASE_URL`).
3. Démarrer PostgreSQL : `docker compose up -d`
4. *(Optionnel)* Démarrer pgAdmin : `docker compose --profile pgadmin up -d` → http://localhost:5050

Commandes détaillées, connexion pgAdmin et dépannage : voir [`docker/README.md`](docker/README.md).

---

## Démarrage backend (local)

Depuis `backend/` (PostgreSQL doit être démarré via Docker et `DATABASE_URL` configuré dans le `.env` à la racine ou dans `backend/.env`) :

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

Vérification rapide :

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
```

Détails (variables, Prisma CLI, build) : voir [`backend/README.md`](backend/README.md).

---

## Démarrage frontend (local)

```bash
cd frontend
npm install
npm run dev
```

Interface builder : **http://localhost:5173** (API : `VITE_API_BASE_URL`, défaut `http://localhost:3000`).

---

## Recette et validation MVP

- **Recette opérationnelle (scénarios, routes, limites)** : [`docs/mvp/11-recette-mvp-stabilisation.md`](docs/mvp/11-recette-mvp-stabilisation.md)
- **Checklist avant démo** : [`docs/mvp/CHECKLIST-DEMO.md`](docs/mvp/CHECKLIST-DEMO.md)

---

## Règle de démarrage du développement

**Ne pas commencer le code applicatif** (backend, frontend, schéma DB exécutable, etc.) sans avoir pris en compte et respecté les documents sous **`docs/mvp/`** (périmètre, données, API, export, sécurité, plan). En cas de divergence, mettre à jour la documentation en premier ou documenter une décision explicite.

---

## État actuel du projet (MVP stabilisé)

### Fonctionnel

- **Docker** : PostgreSQL 16 (+ pgAdmin optionnel).
- **Backend NestJS + Prisma 7** : auth JWT/RBAC, campagnes, landings, versions, blocs, preview, publish, export ZIP, leads publics et internes (liste, détail, statut, suivi, historique, KPI dashboard).
- **Frontend React / Vite** : parcours builder + espace leads + tableau de bord KPI.
- **Seed** : admin, campagne/landing démo, lead exemple (`backend/prisma/seed.ts`).

### Limites connues (hors prochaine phase)

- Éditeur de blocs en **JSON** (pas de canvas / drag-and-drop).
- Tables `simulated_*`, `export_jobs`, `audit_logs`, assets — schéma présent, **non branchées**.
- Seed : version démo en `DRAFT` sans bloc `lead_form` — publier et ajouter le formulaire pour la démo export.

Voir la recette : [`docs/mvp/11-recette-mvp-stabilisation.md`](docs/mvp/11-recette-mvp-stabilisation.md).
