# Document de Contexte  
# Plateforme de Génération de Landing Pages — Auto Hall

## 1. Identité du projet

**Nom du projet :** Auto Hall Landing Page Builder

**Organisme concerné :** Auto Hall

**Domaine :** Marketing digital, génération de leads, automatisation de création de landing pages

**Utilisateurs principaux :**

- Équipe Marketing Auto Hall
- Administrateurs Auto Hall
- Équipe SI / Digital Auto Hall
- Responsables commerciaux exploitant les leads collectés

**Objectif général :**  
Le projet vise à concevoir et développer une plateforme interne permettant aux équipes marketing d’Auto Hall de créer, personnaliser, exporter et déployer des landing pages performantes sans intervention manuelle systématique de l’équipe SI/Digital, tout en garantissant l’intégration automatique des leads collectés avec les tables existantes du système Auto Hall, notamment `testdrive` et `contacts`.

---

## 2. Contexte métier

Auto Hall utilise actuellement des landing pages et des formulaires marketing pour collecter des informations clients, notamment dans le cadre de demandes de contact, d’essais véhicules ou de campagnes commerciales.

Cependant, la création et la gestion de ces landing pages restent dépendantes de l’intervention de l’équipe SI/Digital. Cette dépendance ralentit les campagnes marketing, limite l’autonomie des équipes métier et crée une charge opérationnelle répétitive.

En parallèle, les leads collectés doivent impérativement être centralisés dans les systèmes existants d’Auto Hall afin d’être exploitables par les marketeurs et les équipes commerciales à travers les outils internes déjà en place.

Le besoin principal est donc de mettre en place une plateforme permettant :

- la création autonome de landing pages ;
- l’export de pages statiques compatibles avec l’hébergement cPanel existant ;
- la collecte sécurisée des leads ;
- l’intégration automatique avec les tables officielles Auto Hall ;
- la consultation des leads par les équipes concernées sans dépendance manuelle à la SI.

---

## 3. Problématique

La problématique principale peut être formulée ainsi :

> Comment concevoir une plateforme interne, sécurisée et maintenable permettant aux équipes marketing d’Auto Hall de générer des landing pages performantes, déployables sur cPanel, tout en assurant une intégration fiable avec les données officielles Auto Hall ?

Cette problématique implique plusieurs contraintes fortes :

- le builder doit rester privé et accessible uniquement aux employés autorisés ;
- les landing pages générées doivent être publiques et hébergées sur cPanel ;
- les leads collectés doivent être envoyés automatiquement vers les tables `testdrive` et `contacts` ;
- l’architecture doit être maintenable, sécurisée et industrialisable ;
- les landing pages doivent être performantes, légères et optimisées SEO ;
- l’environnement technique doit éviter les conflits de versions et faciliter le déploiement.

---

## 4. Objectifs du projet

### 4.1 Objectif principal

Développer une plateforme web interne permettant de générer des landing pages marketing Auto Hall à partir d’un builder visuel, puis de les exporter sous forme de bundle ZIP statique prêt à être déployé sur cPanel.

### 4.2 Objectifs spécifiques

Le projet doit permettre de :

- créer des landing pages via une interface visuelle intuitive ;
- utiliser des composants prédéfinis : hero section, formulaire, galerie, véhicules, appels à l’action, blocs texte, offres, etc. ;
- récupérer les marques, modèles, prix ou données nécessaires via une API backend ;
- générer un export ZIP propre contenant du HTML, CSS, JavaScript et des assets optimisés ;
- déployer les landing pages exportées sur cPanel ;
- envoyer les leads collectés vers l’API Auto Hall ;
- insérer les leads dans les tables existantes `testdrive` et `contacts` ;
- conserver une traçabilité des leads reçus et synchronisés ;
- permettre aux marketeurs de consulter les leads sans solliciter manuellement l’équipe SI/Digital ;
- garantir la sécurité, la performance et la maintenabilité du système.

---

## 5. Périmètre du projet

### 5.1 Inclus dans le périmètre

Le projet couvre :

- le développement du builder privé ;
- le développement du backend API ;
- la gestion des utilisateurs et des rôles ;
- la création et modification de landing pages ;
- la gestion des templates ;
- la génération d’un export ZIP statique ;
- l’optimisation des images et du CSS ;
- l’intégration avec les données véhicules ;
- la collecte des leads ;
- l’intégration avec les tables `testdrive` et `contacts` ;
- la consultation des leads collectés ;
- la journalisation et l’audit des actions importantes.

### 5.2 Hors périmètre initial

Le projet ne couvre pas, dans sa première version :

- le remplacement complet du site officiel Auto Hall ;
- le remplacement du CRM existant ;
- la création d’un CMS généraliste ;
- la gestion complète des campagnes publicitaires ;
- l’automatisation totale du déploiement sur cPanel sans validation humaine ;
- la refonte des tables historiques Auto Hall.

---

## 6. Architecture générale cible

L’architecture retenue est une architecture découplée, composée de deux environnements distincts :

1. **Environnement privé Auto Hall** : héberge le builder, le backend métier et la base de données interne.
2. **Environnement public cPanel** : héberge uniquement les landing pages exportées sous forme de fichiers statiques.

```text
Employé / Admin Auto Hall
        │
        │ Accès privé : LAN / VPN / réseau interne
        ↓
┌─────────────────────────────────────────────┐
│ Serveur local Auto Hall                     │
│                                             │
│  ┌────────────────────┐                     │
│  │ Frontend Builder   │  React              │
│  └─────────┬──────────┘                     │
│            ↓                                │
│  ┌────────────────────┐                     │
│  │ Backend API        │  NestJS             │
│  └─────────┬──────────┘                     │
│            ↓                                │
│  ┌────────────────────┐                     │
│  │ PostgreSQL         │  Base du builder    │
│  └────────────────────┘                     │
│                                             │
│  Conteneurs Docker                          │
└─────────────────────────────────────────────┘
        │
        │ Export ZIP
        ↓
┌─────────────────────────────────────────────┐
│ cPanel Auto Hall                            │
│ Landing pages statiques                     │
│ HTML / CSS / JS / Images                    │
└─────────────────────────────────────────────┘
        │
        │ Appels HTTPS sécurisés
        ↓
┌─────────────────────────────────────────────┐
│ API publique contrôlée                      │
│ Collecte leads / prix / stock               │
└─────────────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────┐
│ Système Auto Hall existant                  │
│ Tables : testdrive / contacts               │
└─────────────────────────────────────────────┘
```

---

## 7. Architecture technique détaillée

### 7.1 Backend — NestJS

Le backend constitue le cœur métier de la plateforme.

Il est développé avec **NestJS** et **TypeScript** afin de garantir une architecture modulaire, maintenable et structurée.

#### Responsabilités du backend

Le backend assure :

- l’authentification des utilisateurs ;
- la gestion des rôles et permissions ;
- la gestion des landing pages ;
- la gestion des templates ;
- la récupération des données véhicules ;
- la génération des exports ZIP ;
- l’optimisation des assets ;
- l’exposition d’API internes pour le builder ;
- l’exposition d’API publiques contrôlées pour les landing pages ;
- la réception des leads ;
- la synchronisation avec les tables Auto Hall ;
- la journalisation des erreurs et des actions sensibles.

#### Structure logique recommandée

```text
src/
├── auth/
├── users/
├── roles/
├── landing-pages/
├── templates/
├── assets/
├── export/
├── vehicles/
├── public-api/
├── leads/
├── integrations/
│   └── autohall/
├── audit/
└── common/
    ├── guards/
    ├── dto/
    ├── filters/
    ├── interceptors/
    └── validators/
```

#### Décision architecturale

NestJS est retenu car il permet :

- une séparation claire des modules ;
- une utilisation rigoureuse des DTO ;
- une bonne gestion des guards, interceptors et middlewares ;
- une architecture adaptée aux applications backend d’entreprise ;
- une bonne intégration avec Docker et les environnements contrôlés.

---

### 7.2 Frontend Builder — React

Le frontend du builder est développé avec **React**.

Il s’agit d’une application privée destinée aux employés autorisés d’Auto Hall.

#### Responsabilités du frontend

Le builder doit permettre :

- la création visuelle de landing pages ;
- l’ajout, la suppression et la modification de blocs ;
- la prévisualisation desktop, tablette et mobile ;
- la configuration des formulaires ;
- la sélection des marques et modèles ;
- la personnalisation des couleurs, textes et images ;
- l’enregistrement des brouillons ;
- la gestion des versions ;
- l’export final de la landing page.

#### Règle d’architecture

React est utilisé pour le builder, mais les landing pages exportées ne doivent pas dépendre d’une application React lourde.

Les pages exportées doivent rester :

- statiques ;
- légères ;
- rapides ;
- compatibles cPanel ;
- optimisées SEO ;
- indépendantes du builder.

---

### 7.3 Base de données du builder — PostgreSQL

La plateforme utilise une base PostgreSQL pour stocker les données internes du builder.

#### Données stockées

La base PostgreSQL contient notamment :

- utilisateurs ;
- rôles ;
- landing pages ;
- templates ;
- blocs de pages ;
- versions ;
- assets ;
- exports ;
- journaux d’audit ;
- historiques de publication ;
- configurations de formulaire.

#### Justification

PostgreSQL est adapté car il permet de gérer à la fois :

- des données relationnelles structurées ;
- des configurations dynamiques de pages ;
- des champs JSON pour représenter les blocs et composants ;
- des logs et données d’audit ;
- des relations complexes entre utilisateurs, pages, campagnes et exports.

---

### 7.4 Base Auto Hall existante

Les tables `testdrive` et `contacts` appartiennent au système existant d’Auto Hall.

Elles doivent être considérées comme des tables métier officielles, utilisées par les outils internes actuels.

#### Règle importante

La base du builder ne remplace pas la base Auto Hall existante.

Le builder possède sa propre base PostgreSQL pour gérer ses données internes, tandis que les leads collectés doivent être transmis vers les tables officielles Auto Hall.

```text
PostgreSQL Builder
→ pages, templates, utilisateurs, exports

Base Auto Hall existante
→ leads officiels : testdrive, contacts
```

---

## 8. Déploiement et infrastructure

### 8.1 Hébergement du builder

Le builder est hébergé sur un serveur local Auto Hall.

L’ensemble des composants applicatifs est déployé à l’aide de conteneurs Docker afin d’éviter les conflits de versions et de garantir la reproductibilité de l’environnement.

#### Services Docker recommandés

```text
docker-compose.yml

services:
  frontend-builder
  backend-api
  postgres
  redis
  reverse-proxy
  worker
```

#### Avantages

Cette approche permet :

- d’isoler les dépendances ;
- de maîtriser les versions ;
- de faciliter le déploiement ;
- de simplifier la maintenance ;
- de séparer les services ;
- de préparer une future migration cloud ou VPS si nécessaire.

---

### 8.2 Hébergement des landing pages

Les landing pages générées sont exportées sous forme de bundle ZIP statique, puis déployées sur cPanel, conformément au mode d’hébergement actuel du site officiel Auto Hall.

#### Structure du ZIP généré

```text
landing-page.zip
├── index.html
├── config.json
├── assets/
│   ├── css/
│   │   └── styles.min.css
│   ├── js/
│   │   └── app.js
│   └── img/
│       └── images optimisées
```

#### Rôle de cPanel

cPanel sert uniquement à héberger les fichiers statiques des landing pages.

Il ne doit pas héberger le builder complet.

Cette séparation est essentielle pour des raisons de sécurité, de performance et de maintenabilité.

---

## 9. Flux de données

### 9.1 Création d’une landing page

```text
Utilisateur marketing
        ↓
Builder React
        ↓
API NestJS privée
        ↓
PostgreSQL Builder
```

L’utilisateur crée une landing page à partir de composants visuels. Les données sont sauvegardées dans PostgreSQL.

---

### 9.2 Export de la landing page

```text
Landing page sauvegardée
        ↓
Service d’export NestJS
        ↓
Génération HTML/CSS/JS
        ↓
Optimisation images et CSS
        ↓
ZIP final
```

Le service d’export génère une version statique optimisée et compatible cPanel.

---

### 9.3 Déploiement public

```text
ZIP généré
        ↓
Déploiement sur cPanel
        ↓
Landing page publique
        ↓
Visiteur final
```

Une fois déployée, la landing page devient accessible publiquement.

---

### 9.4 Collecte des leads

```text
Visiteur remplit le formulaire
        ↓
app.js envoie les données vers l’API publique
        ↓
Validation backend
        ↓
Stockage temporaire / audit
        ↓
Synchronisation vers testdrive ou contacts
```

Les leads doivent être validés, journalisés puis insérés dans les tables Auto Hall concernées.

---

## 10. Gestion des leads

La gestion des leads est un point critique du projet.

Les formulaires exportés peuvent être de plusieurs types :

- demande d’essai véhicule ;
- demande de contact ;
- demande d’offre ;
- inscription à une campagne ;
- demande d’information.

Selon le type de formulaire, les données sont orientées vers la table appropriée :

```text
Formulaire Test Drive
        ↓
table testdrive

Formulaire Contact
        ↓
table contacts
```

### 10.1 Table tampon recommandée

Avant insertion dans les tables officielles, il est recommandé de stocker chaque lead dans une table intermédiaire d’audit.

```text
lead_events
├── id
├── landing_page_id
├── campaign_id
├── lead_type
├── payload
├── source_url
├── utm_source
├── utm_medium
├── utm_campaign
├── ip_hash
├── user_agent
├── consent
├── status
├── error_message
├── created_at
└── synced_at
```

#### Justification

Cette approche permet :

- d’éviter la perte de leads ;
- de tracer chaque soumission ;
- de gérer les erreurs SQL ;
- de rejouer une synchronisation échouée ;
- de détecter les doublons ;
- de fournir une preuve en cas de litige ;
- de produire des statistiques fiables.

---

## 11. Sécurité

La sécurité est une contrainte centrale du projet.

### 11.1 Sécurité du builder

Le builder étant une application privée, son accès doit être limité aux utilisateurs autorisés.

Mesures obligatoires :

- authentification obligatoire ;
- gestion des rôles ;
- accès limité au réseau interne ou VPN ;
- mots de passe hashés ;
- sessions sécurisées ;
- journalisation des connexions ;
- audit des actions sensibles ;
- séparation entre administrateur, marketeur et lecteur.

#### Rôles proposés

```text
Super Admin
→ gestion complète de la plateforme

Admin SI / Digital
→ configuration technique, intégrations, supervision

Marketing Manager
→ création, modification, export des landing pages

Marketing Viewer
→ consultation uniquement

Commercial
→ consultation et traitement des leads
```

---

### 11.2 Sécurité des landing pages

Les landing pages étant publiques, elles doivent être conçues comme des surfaces exposées.

Mesures obligatoires :

- aucun secret dans le ZIP ;
- aucune connexion directe à la base de données ;
- aucun token privé côté navigateur ;
- validation côté client et côté serveur ;
- limitation des tailles de payload ;
- protection anti-spam ;
- honeypot invisible ;
- rate limiting côté API ;
- CORS strict ;
- HTTPS obligatoire ;
- Content Security Policy ;
- logs des erreurs.

---

### 11.3 Sécurité de l’API publique

L’API publique utilisée par les landing pages doit être séparée de l’API privée du builder.

```text
/api/admin/*
→ privé, authentifié, réservé aux employés

/api/public/*
→ public, limité, contrôlé, protégé
```

Cette séparation évite d’exposer inutilement les fonctionnalités internes du builder.

---

## 12. Performance

Les landing pages doivent être optimisées pour garantir une expérience utilisateur rapide et un bon référencement.

Objectif cible :

```text
Score Lighthouse > 90
```

Optimisations nécessaires :

- HTML sémantique ;
- CSS minifié ;
- suppression du CSS inutilisé ;
- JavaScript minimal ;
- images compressées ;
- absence de CDN lourds ;
- lazy loading des images ;
- balises SEO ;
- meta title et meta description ;
- Open Graph tags ;
- structure responsive ;
- fallback en cas d’indisponibilité de l’API.

---

## 13. Fiabilité et résilience

Le système doit rester fonctionnel même en cas de défaillance partielle.

### Cas à gérer

| Cas | Comportement attendu |
|---|---|
| API prix indisponible | Afficher un prix par défaut ou “Prix sur demande” |
| API stock indisponible | Masquer l’information ou afficher un message neutre |
| Base Auto Hall indisponible | Sauvegarder le lead en attente |
| Échec de synchronisation | Marquer le lead en erreur et permettre un retry |
| Image manquante | Afficher une image fallback |
| Formulaire invalide | Retourner une erreur claire |

---

## 14. Exigences fonctionnelles

La plateforme doit permettre :

1. Authentification des utilisateurs.
2. Gestion des rôles et permissions.
3. Création de landing pages.
4. Modification de landing pages.
5. Prévisualisation responsive.
6. Gestion des templates.
7. Gestion des images.
8. Sélection des marques et modèles.
9. Configuration des formulaires.
10. Export ZIP statique.
11. Déploiement manuel sur cPanel.
12. Collecte des leads.
13. Insertion dans `testdrive` et `contacts`.
14. Consultation des leads.
15. Filtrage par campagne, date, type et statut.
16. Export CSV ou Excel des leads.
17. Journalisation des actions.
18. Gestion des erreurs de synchronisation.

---

## 15. Exigences non fonctionnelles

| Exigence | Description |
|---|---|
| Sécurité | Accès privé au builder, API publique protégée |
| Performance | Landing pages légères avec Lighthouse > 90 |
| Maintenabilité | Architecture modulaire NestJS |
| Portabilité | Déploiement Dockerisé |
| Compatibilité | Export compatible cPanel |
| Traçabilité | Audit des actions et des leads |
| Résilience | Gestion des erreurs API et SQL |
| Scalabilité | Possibilité d’évolution vers un cloud ou VPS |
| Ergonomie | Interface adaptée aux non-développeurs |
| Qualité | Code structuré, testé et documenté |

---

## 16. Contraintes techniques

Les principales contraintes sont :

- le builder doit rester privé ;
- le builder est hébergé sur un serveur local Auto Hall ;
- l’environnement du builder utilise Docker ;
- les landing pages sont déployées sur cPanel ;
- le site officiel Auto Hall utilise déjà cPanel ;
- les landing pages exportées doivent être statiques ;
- les leads doivent alimenter les tables existantes `testdrive` et `contacts`;
- les pages doivent rester performantes ;
- aucune donnée sensible ne doit être exposée dans les fichiers exportés ;
- l’API publique doit être sécurisée et limitée.

---

## 17. Choix technologiques

| Composant | Technologie | Justification |
|---|---|---|
| Backend | NestJS / TypeScript | Architecture modulaire, robuste et maintenable |
| Frontend Builder | React | Interface visuelle dynamique et interactive |
| Base Builder | PostgreSQL | Stockage fiable des pages, templates, versions et audits |
| Export | HTML / CSS / JS | Compatibilité maximale avec cPanel |
| Images | Sharp | Compression et optimisation des images |
| CSS | PurgeCSS / minification | Réduction du poids des fichiers |
| Déploiement Builder | Docker | Isolation des versions et reproductibilité |
| Déploiement LP | cPanel | Alignement avec l’hébergement actuel Auto Hall |
| API Leads | NestJS Public API | Collecte sécurisée et centralisée |
| Logs | Logger structuré | Audit et diagnostic production |

---

## 18. Risques identifiés

| Risque | Impact | Solution |
|---|---|---|
| Exposition du builder sur Internet | Critique | Accès LAN/VPN uniquement |
| Insertion directe des leads sans audit | Élevé | Table tampon `lead_events` |
| Perte de leads si SQL indisponible | Élevé | Retry + statut de synchronisation |
| ZIP contenant des secrets | Critique | Aucun secret côté client |
| Landing page trop lourde | Moyen | Export statique optimisé |
| Mauvaise configuration CORS | Élevé | Allowlist stricte des domaines |
| Dépendance excessive à SI | Moyen | Dashboard leads pour marketeurs |
| Données incohérentes dans `testdrive` / `contacts` | Élevé | Validation DTO + mapping strict |

---

## 19. Architecture cible validée

L’architecture finale validée est la suivante :

```text
React Builder privé
        ↓
NestJS Admin API privée
        ↓
PostgreSQL Builder DB
        ↓
Service d’export ZIP
        ↓
Landing page statique sur cPanel
        ↓
API publique sécurisée
        ↓
lead_events
        ↓
Synchronisation contrôlée
        ↓
Tables Auto Hall : testdrive / contacts
```

Cette architecture respecte les contraintes métier, techniques et opérationnelles du projet.

Elle permet de séparer clairement :

- la création des landing pages ;
- leur hébergement public ;
- la collecte des leads ;
- l’intégration SI ;
- la consultation métier ;
- la sécurité des accès.

---

## 20. Conclusion

Le projet Auto Hall Landing Page Builder a pour objectif d’industrialiser la création de landing pages marketing tout en respectant les contraintes existantes de l’écosystème Auto Hall.

L’architecture retenue repose sur un builder privé hébergé localement avec Docker, un backend NestJS modulaire, une interface React ergonomique, une base PostgreSQL pour les données internes et un export ZIP statique compatible avec cPanel.

Les landing pages générées sont publiques, légères et optimisées, tandis que la logique sensible reste centralisée côté backend. Les leads collectés sont validés, tracés puis synchronisés avec les tables officielles `testdrive` et `contacts`.

Cette solution permet de répondre au besoin d’autonomie des équipes marketing sans compromettre la sécurité, la performance ni l’intégration avec le système d’information Auto Hall.
