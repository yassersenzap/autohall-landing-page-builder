# Vision d’architecture long terme du projet AutoHall LP Builder

**Version :** 1.0  
**Statut :** Document de référence — vision architecturale  
**Projet :** AutoHall LP Builder  

---

## 1. Objectif du document

Ce document formalise la vision d’architecture long terme du projet AutoHall LP Builder.  
Son objectif est de garantir que la plateforme soit conçue comme un système évolutif, maintenable et durable, capable d’accompagner progressivement les besoins métier d’Auto Hall sans provoquer de dette technique excessive ni rendre les futures évolutions difficiles.

Le principe central est le suivant : chaque ajout fonctionnel doit respecter une architecture claire, modulaire et stable. Le projet ne doit pas être construit uniquement pour fonctionner à court terme ; il doit pouvoir évoluer dans le temps sans que la modification d’un module entraîne des régressions importantes dans les autres parties du système.

---

## 2. Vision générale du projet

AutoHall LP Builder est une plateforme interne destinée à permettre aux équipes autorisées de créer, prévisualiser, gérer, exporter et suivre des landing pages liées aux campagnes marketing Auto Hall.

La plateforme repose sur une séparation claire entre :

- l’environnement privé du builder, utilisé par les équipes internes ;
- l’environnement public des landing pages générées, déployées sur une infrastructure web compatible avec cPanel ;
- le backend applicatif, responsable des règles métier, de la sécurité, de la persistance et de l’exposition des API ;
- la base de données, qui centralise les informations structurées liées aux utilisateurs, campagnes, pages, formulaires, exports et leads.

Cette séparation doit rester stable tout au long du projet afin de préserver la lisibilité de l’architecture et de faciliter les futures extensions.

---

## 3. Principe architectural fondamental

Le projet doit être conçu selon une logique de long terme.  
L’objectif n’est pas seulement de livrer une première version fonctionnelle, mais de construire une base saine permettant d’ajouter progressivement de nouveaux modules sans fragiliser l’existant.

L’architecture doit respecter les principes suivants :

- modularité : chaque domaine fonctionnel doit être isolé dans un module clair ;
- maintenabilité : le code doit rester compréhensible, organisé et facile à modifier ;
- évolutivité : l’ajout de nouvelles fonctionnalités ne doit pas nécessiter une refonte complète ;
- faible couplage : les modules doivent dépendre de contrats clairs plutôt que de détails internes ;
- cohérence métier : les concepts du code doivent rester alignés avec les concepts réels du projet ;
- testabilité : les règles importantes doivent pouvoir être vérifiées sans dépendre uniquement de tests manuels ;
- traçabilité : les décisions techniques importantes doivent être documentées.

---

## 4. Organisation recommandée de l’architecture backend

Le backend doit suivre une organisation par domaines métier plutôt qu’une accumulation de fichiers techniques sans structure claire.

Exemples de domaines à isoler progressivement :

- auth : authentification, sessions, rôles et accès ;
- users : gestion des utilisateurs internes ;
- campaigns : campagnes marketing ;
- landing-pages : pages créées dans le builder ;
- blocks : composants réutilisables de page ;
- forms : configuration des formulaires ;
- leads : collecte, validation et suivi des leads ;
- exports : génération et suivi des exports statiques ;
- audit : journalisation des actions importantes ;
- integrations : intégration future avec les systèmes Auto Hall existants.

Chaque domaine doit regrouper ses contrôleurs, services, DTO, validations et règles métier.  
Cette approche permet de limiter les dépendances inutiles et d’éviter que toute la logique métier se concentre dans quelques fichiers difficiles à maintenir.

---

## 5. Organisation recommandée de l’architecture frontend

Le frontend doit être structuré autour de pages, composants réutilisables et services d’accès aux API.

La structure cible doit distinguer clairement :

- les pages principales de l’application ;
- les composants UI réutilisables ;
- les composants métier liés au builder ;
- les services de communication avec le backend ;
- les hooks ou fonctions utilitaires ;
- la gestion de l’état applicatif ;
- les types et interfaces partagés côté frontend.

Le frontend ne doit pas contenir directement les règles métier critiques.  
Les décisions importantes liées à la sécurité, à la validation des données, aux exports et aux droits d’accès doivent rester côté backend.

---

## 6. Modèle de données et évolutivité

Le modèle de données doit être conçu avec prudence, car il constitue la base de l’évolution du projet.

Les entités principales doivent être nommées de manière explicite et alignées avec le métier :

- User ;
- Role ;
- Campaign ;
- LandingPage ;
- PageVersion ;
- Block ;
- Form ;
- Lead ;
- Export ;
- AuditLog.

Le modèle doit permettre l’évolution progressive du builder, notamment :

- la gestion de plusieurs versions d’une même landing page ;
- l’historique des modifications ;
- le suivi des exports ;
- la traçabilité des actions utilisateur ;
- la séparation entre brouillon, page validée et page exportée ;
- l’intégration future avec des systèmes existants.

Il faut éviter les structures trop rapides qui mélangent plusieurs responsabilités dans une seule table ou qui rendent difficile l’ajout de nouvelles fonctionnalités.

---

## 7. Sécurité, accès et gouvernance

La plateforme étant destinée à un usage interne, la sécurité doit être intégrée dès la conception.

Les points suivants doivent être pris en compte :

- authentification obligatoire pour accéder au builder ;
- gestion claire des rôles et permissions ;
- séparation entre utilisateurs simples, responsables marketing et administrateurs ;
- validation stricte des données reçues par l’API ;
- protection des endpoints publics de collecte des leads ;
- absence de secrets dans le dépôt Git ;
- journalisation des actions sensibles ;
- documentation des règles d’accès.

La sécurité ne doit pas être ajoutée uniquement à la fin du projet. Elle doit accompagner chaque module dès sa création.

---

## 8. Gestion des exports et séparation public/privé

Le builder doit rester une application privée.  
Les landing pages générées doivent être considérées comme des livrables publics exportés, indépendants de l’interface interne du builder.

L’export doit respecter les objectifs suivants :

- produire un livrable compatible avec un hébergement cPanel ;
- séparer les fichiers statiques publics du code interne du builder ;
- éviter d’exposer des informations sensibles ;
- permettre au formulaire public de communiquer avec une API dédiée ;
- conserver la traçabilité des exports réalisés ;
- permettre de retrouver quelle version de page a été exportée.

Cette séparation est essentielle pour éviter de mélanger l’environnement de conception interne et l’environnement public visible par les visiteurs.

---

## 9. Qualité logicielle et dette technique

Le projet doit limiter la dette technique dès les premières étapes.

Avant d’ajouter une fonctionnalité, il faut vérifier :

- si elle respecte la structure existante ;
- si elle appartient au bon module ;
- si elle introduit un couplage inutile ;
- si elle peut être testée ;
- si elle nécessite une mise à jour de la documentation ;
- si elle modifie le modèle de données ;
- si elle nécessite une migration Prisma ;
- si elle impacte les API déjà prévues.

Une fonctionnalité qui fonctionne mais qui dégrade fortement l’architecture ne doit pas être considérée comme une solution satisfaisante.

---

## 10. Documentation technique attendue

Chaque décision structurante doit être documentée dans le dossier `docs/`.

Les documents techniques doivent rester simples, clairs et utiles. Ils doivent permettre à un développeur ou à un encadrant de comprendre :

- le rôle de chaque module ;
- les choix techniques retenus ;
- la structure du backend ;
- la structure du frontend ;
- le modèle de données ;
- les contrats API ;
- la stratégie d’export ;
- les règles de sécurité ;
- les limites connues et les évolutions prévues.

La documentation doit évoluer en même temps que le code. Elle ne doit pas devenir un document séparé de la réalité du projet.

---

## 11. Règle de validation avant développement

Avant de développer un nouveau module important, il faut passer par une courte phase de validation :

1. définir le besoin métier ;
2. identifier les entités concernées ;
3. vérifier l’impact sur l’architecture ;
4. choisir le bon emplacement dans le backend et le frontend ;
5. définir les endpoints API nécessaires ;
6. prévoir les validations et règles de sécurité ;
7. déterminer les tests à effectuer ;
8. documenter les décisions importantes.

Cette méthode permet d’éviter les ajouts désorganisés et de garder une architecture cohérente sur le long terme.

---

## 12. Conclusion

La réussite du projet AutoHall LP Builder dépend autant de la qualité de son architecture que de ses fonctionnalités visibles.

Une plateforme de génération de landing pages doit pouvoir évoluer avec le temps : nouveaux types de blocs, nouveaux modèles de pages, nouveaux formulaires, nouveaux rôles, intégrations futures, suivi avancé des leads et amélioration du processus d’export.

Pour cette raison, chaque décision technique doit préserver trois objectifs prioritaires :

- une architecture scalable ;
- un code maintenable ;
- une évolution long terme sans fragilisation de l’existant.

Ce document doit servir de référence pour guider les prochaines étapes de conception et de développement du projet.
