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
| **Conteneurs** | Emballage des services avec **Docker** (compose et orchestration à définir en phase d’implémentation). |

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
- **Base de données :** PostgreSQL (ORM type Prisma prévu côté doc ; à aligner avec l’implémentation).
- **Ops :** Docker (images / orchestration détaillées plus tard).
- **Livrable pages :** export **ZIP statique**, compatible déploiement **cPanel**.

---

## Structure technique initiale

| Dossier | Rôle |
|---------|------|
| **`docs/context/`** | Document de contexte projet (vision, contraintes, vocabulaire Auto Hall). |
| **`docs/mvp/`** | Documents de cadrage MVP (périmètre, données, API, export, sécurité, plan). |
| **`backend/`** | API NestJS (scaffolding initial, logique métier à venir). |
| **`frontend/`** | Interface React / Vite / TypeScript (page d’accueil minimale pour l’instant). |
| **`docker/`** | Future configuration Docker (PostgreSQL, services, orchestration). |

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

## Règle de démarrage du développement

**Ne pas commencer le code applicatif** (backend, frontend, schéma DB exécutable, etc.) sans avoir pris en compte et respecté les documents sous **`docs/mvp/`** (périmètre, données, API, export, sécurité, plan). En cas de divergence, mettre à jour la documentation en premier ou documenter une décision explicite.

---

## État actuel du projet

- Le **backend NestJS** démarre en local (scaffolding, sans logique métier).
- Le **frontend React / Vite** démarre en local (page minimale de présentation).
- **Docker**, **PostgreSQL** et **Prisma** ne sont pas encore configurés.
- Aucune **logique métier** n’est encore développée.

La racine reste préparée pour Git (documentation, conventions, variables d’environnement d’exemple dans `.env.example`).
