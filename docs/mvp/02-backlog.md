# 02 — Backlog MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Backlog de développement avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document transforme le périmètre MVP en backlog de développement exploitable.

Il sert à organiser le projet en modules, tâches, priorités, dépendances et critères d’acceptation. Il doit être utilisé comme référence avant et pendant le développement afin d’éviter le développement improvisé.

Le backlog couvre uniquement le MVP v1 :

```text
Builder privé
→ Création campagne
→ Création landing page
→ Builder simple par blocs
→ Export ZIP compatible cPanel
→ Déploiement manuel sur sous-domaine
→ Soumission formulaire
→ API publique des leads
→ lead_events
→ Simulation testdrive / contacts
→ Dashboard simulé
```

Tout ce qui ne contribue pas directement à ce workflow doit être reporté après le MVP.

---

# 2. Règles de priorisation

| Priorité | Signification |
|---|---|
| P0 | Obligatoire pour que le MVP fonctionne |
| P1 | Important, mais peut être simplifié |
| P2 | Amélioration utile après stabilisation |
| P3 | Hors MVP / version future |

Règle stricte :

```text
Aucune tâche P2 ou P3 ne doit être développée avant la stabilisation des tâches P0.
```

---

# 3. Statuts de suivi

| Statut | Signification |
|---|---|
| TODO | À faire |
| IN_PROGRESS | En cours |
| DONE | Terminé |
| BLOCKED | Bloqué |
| REJECTED | Retiré du périmètre |

---

# 4. Définition de terminé

Une tâche est considérée comme terminée uniquement si :

```text
Le backend est implémenté si nécessaire.
Le frontend est connecté si nécessaire.
La validation des données est présente.
Les erreurs sont gérées proprement.
Les logs utiles sont présents.
La sécurité minimale est respectée.
Le test manuel est réalisé.
Le code est commité proprement.
```

Une interface visible mais non connectée au backend n’est pas considérée comme terminée.

---

# 5. Backlog global du MVP

| ID | Module | Fonctionnalité | Priorité | Dépendance | Statut |
|---|---|---|---|---|---|
| BCK-001 | Setup | Créer la structure du repository | P0 | - | TODO |
| BCK-002 | Setup | Initialiser Git et `.gitignore` | P0 | BCK-001 | TODO |
| BCK-003 | Setup | Créer `.env.example` | P0 | BCK-001 | TODO |
| BCK-004 | Docker | Configurer Docker Compose | P0 | BCK-001 | TODO |
| BCK-005 | Backend | Initialiser NestJS | P0 | BCK-001 | TODO |
| BCK-006 | Frontend | Initialiser React | P0 | BCK-001 | TODO |
| BCK-007 | Database | Configurer PostgreSQL | P0 | BCK-004 | TODO |
| BCK-008 | Database | Créer migrations initiales | P0 | BCK-007 | TODO |
| BCK-009 | Auth | Créer module Auth | P0 | BCK-005, BCK-008 | TODO |
| BCK-010 | Auth | Implémenter login/logout | P0 | BCK-009 | TODO |
| BCK-011 | Auth | Protéger les routes privées | P0 | BCK-010 | TODO |
| BCK-012 | Users | Créer module Users | P0 | BCK-008 | TODO |
| BCK-013 | Users | Gérer les rôles | P0 | BCK-012 | TODO |
| BCK-014 | Campaigns | Créer module Campaigns | P0 | BCK-011 | TODO |
| BCK-015 | Campaigns | CRUD campagnes | P0 | BCK-014 | TODO |
| BCK-016 | Landing Pages | Créer module Landing Pages | P0 | BCK-015 | TODO |
| BCK-017 | Landing Pages | CRUD landing pages | P0 | BCK-016 | TODO |
| BCK-018 | Landing Pages | Sauvegarder `layout_json` | P0 | BCK-017 | TODO |
| BCK-019 | Builder | Créer interface builder 3 zones | P0 | BCK-006, BCK-018 | TODO |
| BCK-020 | Builder | Ajouter un bloc | P0 | BCK-019 | TODO |
| BCK-021 | Builder | Modifier un bloc | P0 | BCK-020 | TODO |
| BCK-022 | Builder | Supprimer un bloc | P0 | BCK-020 | TODO |
| BCK-023 | Builder | Réordonner les blocs | P0 | BCK-020 | TODO |
| BCK-024 | Builder | Bloc Hero | P0 | BCK-019 | TODO |
| BCK-025 | Builder | Bloc Text | P0 | BCK-019 | TODO |
| BCK-026 | Builder | Bloc Image | P0 | BCK-019 | TODO |
| BCK-027 | Builder | Bloc Button | P0 | BCK-019 | TODO |
| BCK-028 | Builder | Bloc Form | P0 | BCK-019 | TODO |
| BCK-029 | Builder | Bloc Features | P1 | BCK-019 | TODO |
| BCK-030 | Builder | Bloc Footer | P1 | BCK-019 | TODO |
| BCK-031 | Preview | Prévisualisation desktop | P0 | BCK-020 | TODO |
| BCK-032 | Preview | Prévisualisation mobile simple | P1 | BCK-031 | TODO |
| BCK-033 | Assets | Upload image | P0 | BCK-017 | TODO |
| BCK-034 | Assets | Associer assets à landing page | P0 | BCK-033 | TODO |
| BCK-035 | Export | Créer module Export | P0 | BCK-018 | TODO |
| BCK-036 | Export | Générer `index.html` | P0 | BCK-035 | TODO |
| BCK-037 | Export | Générer `css/style.css` | P0 | BCK-035 | TODO |
| BCK-038 | Export | Générer `js/config.js` | P0 | BCK-035 | TODO |
| BCK-039 | Export | Générer `js/lead-form.js` | P0 | BCK-035 | TODO |
| BCK-040 | Export | Inclure les assets dans le ZIP | P0 | BCK-034, BCK-035 | TODO |
| BCK-041 | Export | Télécharger ZIP | P0 | BCK-035 | TODO |
| BCK-042 | Export | Vérifier absence de secrets | P0 | BCK-041 | TODO |
| BCK-043 | Leads | Créer module Public Leads | P0 | BCK-008 | TODO |
| BCK-044 | Leads | Créer endpoint `POST /public/leads` | P0 | BCK-043 | TODO |
| BCK-045 | Leads | Valider données formulaire | P0 | BCK-044 | TODO |
| BCK-046 | Leads | Enregistrer dans `lead_events` | P0 | BCK-045 | TODO |
| BCK-047 | Leads | Gérer statuts des leads | P0 | BCK-046 | TODO |
| BCK-048 | Sync | Créer service de synchronisation | P0 | BCK-046 | TODO |
| BCK-049 | Sync | Synchroniser vers `simulated_testdrive` | P0 | BCK-048 | TODO |
| BCK-050 | Sync | Synchroniser vers `simulated_contacts` | P0 | BCK-048 | TODO |
| BCK-051 | Sync | Gérer erreurs de synchronisation | P0 | BCK-048 | TODO |
| BCK-052 | Dashboard Leads | Créer dashboard leads | P0 | BCK-046 | TODO |
| BCK-053 | Dashboard Leads | Liste des leads | P0 | BCK-052 | TODO |
| BCK-054 | Dashboard Leads | Détail d’un lead | P0 | BCK-053 | TODO |
| BCK-055 | Dashboard Leads | Filtres campagne/statut | P1 | BCK-053 | TODO |
| BCK-056 | Security | Configurer CORS | P0 | BCK-005 | TODO |
| BCK-057 | Security | Rate limiting sur `/public/leads` | P0 | BCK-044 | TODO |
| BCK-058 | Security | Validation DTO globale | P0 | BCK-005 | TODO |
| BCK-059 | Logs | Logs erreurs backend | P0 | BCK-005 | TODO |
| BCK-060 | Audit | Audit logs actions sensibles | P1 | BCK-011 | TODO |
| BCK-061 | Tests | Tester workflow complet manuellement | P0 | Tous P0 | TODO |
| BCK-062 | Docs | README installation | P0 | BCK-004 | TODO |
| BCK-063 | Docs | Documentation API minimale | P1 | BCK-044 | TODO |

---

# 6. Sprint 0 — Socle technique

## Objectif

Préparer une base propre, reproductible et sécurisée avant d’implémenter les fonctionnalités métier.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-001 | Créer la structure du repository | P0 |
| BCK-002 | Initialiser Git et `.gitignore` | P0 |
| BCK-003 | Créer `.env.example` | P0 |
| BCK-004 | Configurer Docker Compose | P0 |
| BCK-005 | Initialiser NestJS | P0 |
| BCK-006 | Initialiser React | P0 |
| BCK-007 | Configurer PostgreSQL | P0 |

## Structure cible du repository

```text
autohall-landing-builder/
├── backend/
├── frontend/
├── docker/
├── docs/
├── database/
├── exports-samples/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Critères d’acceptation

```text
Le repository est structuré.
Le backend est séparé du frontend.
Docker démarre les services principaux.
PostgreSQL est accessible.
Le fichier .env n’est pas commité.
Le fichier .env.example existe.
Le README initial explique comment lancer le projet.
```

---

# 7. Sprint 1 — Authentification, utilisateurs et rôles

## Objectif

Sécuriser l’accès au builder interne.

Le builder ne doit jamais être public. Seuls les utilisateurs autorisés doivent pouvoir y accéder.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-009 | Créer module Auth | P0 |
| BCK-010 | Implémenter login/logout | P0 |
| BCK-011 | Protéger routes privées | P0 |
| BCK-012 | Créer module Users | P0 |
| BCK-013 | Gérer rôles utilisateurs | P0 |

## Rôles MVP

| Rôle | Droits principaux |
|---|---|
| ADMIN | Accès complet |
| SI_DIGITAL | Gestion technique, exports, validation |
| MARKETER | Création campagnes et landing pages |
| VIEWER | Consultation uniquement |

## Critères d’acceptation

```text
Un utilisateur valide peut se connecter.
Un utilisateur invalide est refusé.
Les mots de passe sont hashés.
Les routes privées sont protégées.
Le backend applique les permissions.
Le frontend masque les actions non autorisées.
```

## Règles de sécurité

```text
Ne jamais stocker un mot de passe en clair.
Ne jamais retourner le hash du mot de passe dans une réponse API.
Ne jamais faire confiance uniquement au frontend pour les permissions.
```

---

# 8. Sprint 2 — Campagnes et landing pages

## Objectif

Créer le socle métier de la plateforme.

Une landing page doit toujours être rattachée à une campagne. Le builder ne doit pas manipuler des pages sans contexte métier.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-014 | Créer module Campaigns | P0 |
| BCK-015 | CRUD campagnes | P0 |
| BCK-016 | Créer module Landing Pages | P0 |
| BCK-017 | CRUD landing pages | P0 |
| BCK-018 | Sauvegarder `layout_json` | P0 |

## Campagne — champs minimum

```text
id
name
brand
model
campaign_type
description
start_date
end_date
status
created_at
updated_at
```

## Statuts campagne

```text
DRAFT
ACTIVE
ARCHIVED
```

## Landing page — champs minimum

```text
id
campaign_id
title
slug
layout_json
status
created_at
updated_at
last_exported_at
```

## Statuts landing page

```text
DRAFT
READY
EXPORTED
ARCHIVED
```

## Critères d’acceptation

```text
Une campagne peut être créée.
Une campagne peut être modifiée.
Une campagne peut être archivée.
Une landing page peut être créée.
Une landing page est toujours liée à une campagne.
Le slug de la landing page est unique.
Le layout_json est sauvegardé.
Le layout_json peut être rechargé correctement.
```

---

# 9. Sprint 3 — Builder visuel simple

## Objectif

Créer un builder fonctionnel basé sur des blocs contrôlés.

Le MVP ne doit pas chercher à reproduire Webflow ou Framer. Le but est d’avoir un éditeur simple, stable et exportable.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-019 | Interface builder 3 zones | P0 |
| BCK-020 | Ajouter un bloc | P0 |
| BCK-021 | Modifier un bloc | P0 |
| BCK-022 | Supprimer un bloc | P0 |
| BCK-023 | Réordonner les blocs | P0 |
| BCK-024 | Bloc Hero | P0 |
| BCK-025 | Bloc Text | P0 |
| BCK-026 | Bloc Image | P0 |
| BCK-027 | Bloc Button | P0 |
| BCK-028 | Bloc Form | P0 |
| BCK-029 | Bloc Features | P1 |
| BCK-030 | Bloc Footer | P1 |

## Organisation de l’interface

```text
Panneau gauche  : bibliothèque des blocs
Zone centrale   : canvas / preview de la page
Panneau droit   : propriétés du bloc sélectionné
```

## Blocs MVP obligatoires

| Bloc | Priorité | Rôle |
|---|---|---|
| Hero | P0 | Section principale |
| Text | P0 | Contenu textuel |
| Image | P0 | Image marketing |
| Button | P0 | Appel à l’action |
| Form | P0 | Collecte de lead |
| Features | P1 | Arguments commerciaux |
| Footer | P1 | Bas de page |

## Critères d’acceptation

```text
Un utilisateur peut ajouter un bloc.
Un utilisateur peut modifier un bloc.
Un utilisateur peut supprimer un bloc.
Un utilisateur peut réordonner les blocs.
Les modifications sont visibles dans l’aperçu.
Les blocs sont sauvegardés dans layout_json.
Le layout_json respecte le modèle défini.
```

## Décision technique

Le drag-and-drop avancé n’est pas obligatoire dans le MVP.

Solution acceptable :

```text
Boutons Monter / Descendre pour réordonner les blocs.
```

C’est moins spectaculaire, mais plus robuste pour une première version.

---

# 10. Sprint 4 — Prévisualisation et assets

## Objectif

Permettre à l’utilisateur de vérifier le rendu de la landing page avant export.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-031 | Prévisualisation desktop | P0 |
| BCK-032 | Prévisualisation mobile simple | P1 |
| BCK-033 | Upload image | P0 |
| BCK-034 | Associer assets à landing page | P0 |

## Critères d’acceptation

```text
La page est prévisualisable en desktop.
La page est prévisualisable en mobile simple.
Les images peuvent être ajoutées.
Les assets sont liés à une landing page.
Les assets nécessaires sont récupérables lors de l’export.
```

## Contraintes assets

```text
Limiter la taille des fichiers.
Contrôler les extensions autorisées.
Renommer les fichiers pour éviter les conflits.
Ne jamais accepter de fichiers exécutables.
Prévoir un attribut alt pour les images.
```

Extensions autorisées recommandées :

```text
jpg
jpeg
png
webp
svg contrôlé
mp4 optionnel
```

---

# 11. Sprint 5 — Export ZIP compatible cPanel

## Objectif

Générer une landing page statique exploitable sur cPanel.

Le ZIP doit être indépendant du builder pour l’affichage public. Le visiteur ne doit jamais dépendre du frontend React du builder.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-035 | Créer module Export | P0 |
| BCK-036 | Générer `index.html` | P0 |
| BCK-037 | Générer `css/style.css` | P0 |
| BCK-038 | Générer `js/config.js` | P0 |
| BCK-039 | Générer `js/lead-form.js` | P0 |
| BCK-040 | Inclure assets dans ZIP | P0 |
| BCK-041 | Télécharger ZIP | P0 |
| BCK-042 | Vérifier absence de secrets | P0 |

## Structure ZIP cible

```text
landing-page.zip
├── index.html
├── metadata.json
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   └── lead-form.js
└── assets/
    ├── images/
    ├── videos/
    └── fonts/
```

## Interdictions absolues dans le ZIP

```text
.env
mot de passe
token privé
connexion SQL
code backend NestJS
node_modules
fichiers de configuration internes
secrets techniques
```

## Critères d’acceptation

```text
Le ZIP est généré depuis une landing page sauvegardée.
Le ZIP contient index.html.
Le ZIP contient CSS, JS et assets.
Le HTML respecte l’ordre des blocs.
Les chemins sont relatifs.
La page s’ouvre hors builder.
La page est compatible avec un hébergement statique cPanel.
Le ZIP ne contient aucun secret.
```

---

# 12. Sprint 6 — API publique de collecte des leads

## Objectif

Permettre aux landing pages publiques d’envoyer les formulaires vers une API contrôlée.

Les landing pages ne doivent jamais écrire directement dans une base de données.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-043 | Créer module Public Leads | P0 |
| BCK-044 | Endpoint `POST /public/leads` | P0 |
| BCK-045 | Valider données formulaire | P0 |
| BCK-046 | Enregistrer dans `lead_events` | P0 |
| BCK-047 | Gérer statuts des leads | P0 |

## Route publique

```text
POST /public/leads
```

## Données minimales attendues

```text
campaign_id
landing_page_id
full_name
phone
email
city
brand
model
request_type
message
source_url
```

## Champs obligatoires

```text
campaign_id
landing_page_id
full_name
phone
request_type
source_url
```

## Statuts lead

```text
RECEIVED
VALIDATED
SYNCED
FAILED
PENDING_RETRY
DUPLICATE
```

## Critères d’acceptation

```text
La route reçoit une soumission depuis une landing page exportée.
Les données sont validées côté backend.
Les données invalides sont refusées.
Un lead valide est enregistré dans lead_events.
Le payload original est conservé.
Le lead possède un statut clair.
La route ne retourne aucune information interne.
```

---

# 13. Sprint 7 — Synchronisation simulée Auto Hall

## Objectif

Simuler le comportement cible avant toute intégration réelle avec les bases Auto Hall.

C’est une bonne pratique. Écrire directement dans les vraies tables `testdrive` et `contacts` sans validation SI serait une erreur grave.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-048 | Créer service de synchronisation | P0 |
| BCK-049 | Synchroniser vers `simulated_testdrive` | P0 |
| BCK-050 | Synchroniser vers `simulated_contacts` | P0 |
| BCK-051 | Gérer erreurs de synchronisation | P0 |

## Principe d’architecture

```text
/public/leads
    ↓
LeadEventsService
    ↓
lead_events
    ↓
LeadSyncService
    ↓
AutoHallLeadAdapter
    ↓
simulated_testdrive / simulated_contacts
```

## Règle critique

```text
Un lead reçu ne doit jamais être perdu, même si la synchronisation échoue.
```

## Critères d’acceptation

```text
Un lead de type TEST_DRIVE va vers simulated_testdrive.
Un lead de type CONTACT va vers simulated_contacts.
Le mapping est isolé dans un adaptateur.
Le statut passe à SYNCED en cas de succès.
Le statut passe à FAILED ou PENDING_RETRY en cas d’échec.
L’erreur est stockée.
Le payload original reste disponible dans lead_events.
```

---

# 14. Sprint 8 — Dashboard simulé des leads

## Objectif

Permettre de consulter les leads collectés pendant la phase de simulation.

Ce dashboard ne remplace pas forcément le dashboard réel Auto Hall. Il sert à démontrer le workflow complet avant intégration réelle.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-052 | Créer dashboard leads | P0 |
| BCK-053 | Afficher liste des leads | P0 |
| BCK-054 | Afficher détail d’un lead | P0 |
| BCK-055 | Filtres campagne/statut | P1 |

## Colonnes recommandées

```text
Nom complet
Téléphone
Email
Campagne
Landing page
Type de demande
Statut
Destination
Date de création
```

## Critères d’acceptation

```text
Les leads sont affichés dans le dashboard.
Les leads sont triés par date décroissante.
Le détail d’un lead est consultable.
Le payload complet est visible.
Les erreurs de synchronisation sont visibles.
La destination simulée est visible.
```

---

# 15. Sprint 9 — Sécurité, logs et audit

## Objectif

Durcir le socle avant démonstration ou livraison.

La sécurité ne doit pas être ajoutée à la fin comme décoration. Elle doit être présente dès le MVP.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-056 | Configurer CORS | P0 |
| BCK-057 | Rate limiting sur `/public/leads` | P0 |
| BCK-058 | Validation DTO globale | P0 |
| BCK-059 | Logs erreurs backend | P0 |
| BCK-060 | Audit logs actions sensibles | P1 |

## Checklist sécurité minimale

```text
Aucun secret dans Git.
.env ignoré.
.env.example présent.
Mots de passe hashés.
Routes privées protégées.
Permissions appliquées côté backend.
DTO de validation.
CORS contrôlé.
Rate limiting sur API publique.
Aucun secret dans les ZIP exportés.
Aucune connexion SQL dans une landing page.
Logs sans mots de passe ni secrets.
```

## Critères d’acceptation

```text
/public/leads est protégée contre les abus simples.
Les routes privées refusent les accès non autorisés.
Les erreurs sont journalisées.
Les logs ne contiennent pas de secrets.
Le ZIP exporté est vérifié.
```

---

# 16. Sprint 10 — Tests et documentation

## Objectif

Prouver que le MVP fonctionne de bout en bout.

## Tâches incluses

| ID | Tâche | Priorité |
|---|---|---|
| BCK-061 | Tester workflow complet manuellement | P0 |
| BCK-062 | README installation | P0 |
| BCK-063 | Documentation API minimale | P1 |

## Scénario de test principal

```text
1. Lancer le projet avec Docker.
2. Se connecter au builder.
3. Créer une campagne.
4. Créer une landing page.
5. Ajouter des blocs.
6. Ajouter un formulaire.
7. Sauvegarder la page.
8. Prévisualiser la page.
9. Générer un ZIP.
10. Extraire le ZIP.
11. Ouvrir index.html.
12. Remplir le formulaire.
13. Envoyer le lead.
14. Vérifier lead_events.
15. Vérifier simulated_testdrive ou simulated_contacts.
16. Vérifier dashboard leads.
```

## Critères d’acceptation

```text
Le scénario complet fonctionne.
Aucune manipulation cachée n’est nécessaire.
Les erreurs sont compréhensibles.
Les données sont traçables.
Le test peut être répété.
Le README permet à un autre développeur de lancer le projet.
```

---

# 17. Hors backlog MVP

Les éléments suivants ne doivent pas être développés dans le MVP :

```text
A/B testing
Heatmaps
Analytics avancées
CRM complet
Déploiement automatique vers cPanel
Création automatique de sous-domaines
Éditeur visuel type Webflow complet
Animations complexes
Personnalisation CSS libre
Intégration directe aux vraies bases Auto Hall
Modification du dashboard réel Auto Hall
Notifications email/SMS avancées
```

Ces fonctionnalités peuvent être étudiées après validation du MVP.

---

# 18. Risques principaux

| Risque | Impact | Réponse |
|---|---|---|
| Commencer par le drag-and-drop avancé | Retard important | Utiliser d’abord monter/descendre |
| Mauvais modèle JSON | Export fragile | Figer `05-blocks-model.md` avant code builder |
| HTML généré sans structure | Maintenance difficile | Générer depuis des templates contrôlés |
| Secrets dans le ZIP | Risque critique | Vérification automatique avant export |
| Landing page connectée directement à SQL | Faille majeure | Passage obligatoire par API |
| Pas de `lead_events` | Perte de traçabilité | Centraliser toutes les soumissions |
| Pas de simulation | Intégration réelle risquée | Simuler `testdrive` et `contacts` |
| Mélange API privée/publique | Surface d’attaque plus grande | Séparer routes privées et `/public/leads` |
| Docker préparé trop tard | Problèmes d’environnement | Docker dès le Sprint 0 |

---

# 19. Ordre strict de développement

L’ordre recommandé est le suivant :

```text
1. Setup repository
2. Docker
3. Backend NestJS
4. PostgreSQL
5. Frontend React
6. Authentification
7. Campagnes
8. Landing pages
9. Modèle JSON
10. Builder simple
11. Preview
12. Assets
13. Export ZIP
14. API publique leads
15. lead_events
16. Synchronisation simulée
17. Dashboard leads
18. Sécurité
19. Tests
20. Documentation
```

Erreur à éviter absolument :

```text
Commencer par refaire l’interface du builder avant d’avoir stabilisé backend, base, modèle JSON et export ZIP.
```

---

# 20. Conclusion

Ce backlog est le plan d’exécution du MVP v1.

La priorité est de livrer une chaîne complète, stable et démontrable :

```text
Builder privé
→ Landing page exportée
→ Déploiement cPanel
→ Formulaire public
→ API publique
→ lead_events
→ Simulation testdrive / contacts
→ Dashboard simulé
```

Le MVP doit être limité mais complet. Un builder visuellement ambitieux mais incapable d’exporter, collecter et tracer un lead est techniquement inutile.

La règle de décision est simple :

```text
Si une tâche ne sert pas le workflow principal, elle sort du MVP.
```
