# 01 — Périmètre MVP v1  
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de cadrage technique avant développement  
**Objectif :** Verrouiller le périmètre de la première version afin d’éviter le hors-scope et de guider le développement du builder.

---

# 1. Objectif du MVP

Le MVP v1 a pour objectif de valider le workflow principal de la plateforme de génération de landing pages Auto Hall, depuis la création d’une campagne jusqu’à la collecte et la consultation d’un lead.

Le but n’est pas de construire immédiatement un éditeur complexe comparable à Webflow, Framer ou Unbounce. Le but est de prouver que l’architecture fonctionne de bout en bout dans le contexte Auto Hall.

Le workflow prioritaire à valider est le suivant :

```text
Création d’une campagne
        ↓
Création d’une landing page
        ↓
Construction de la page avec des blocs simples
        ↓
Configuration d’un formulaire
        ↓
Prévisualisation
        ↓
Export ZIP compatible cPanel
        ↓
Déploiement de la landing page sur un sous-domaine
        ↓
Soumission d’un formulaire par un visiteur
        ↓
Envoi du lead vers une API publique sécurisée
        ↓
Stockage dans lead_events
        ↓
Synchronisation vers testdrive / contacts simulés
        ↓
Consultation du lead dans un dashboard simulé

Ce scénario constitue le cœur du MVP. Toute fonctionnalité qui ne contribue pas directement à ce workflow est considérée comme secondaire.

2. Principe directeur du MVP

Le MVP doit être :

simple ;
stable ;
sécurisé ;
compatible avec cPanel ;
testable de bout en bout ;
extensible vers une intégration réelle Auto Hall.

La priorité n’est pas l’apparence avancée du builder, mais la fiabilité du circuit complet :

Builder privé → Export ZIP → cPanel → API Leads → lead_events → Simulation Auto Hall → Dashboard

Le builder doit rester privé.
Les landing pages doivent rester publiques et statiques.
Les leads doivent passer par une API backend contrôlée.
Aucune landing page ne doit accéder directement à une base de données.

3. Périmètre fonctionnel inclus dans le MVP
3.1 Authentification interne

Le MVP doit inclure un système d’authentification pour protéger l’accès au builder.

Fonctionnalités incluses :

connexion utilisateur ;
déconnexion ;
récupération du profil connecté ;
protection des routes privées ;
gestion simple des rôles.

Rôles prévus dans le MVP :

Rôle	Description
ADMIN	Accès complet à la plateforme
SI_DIGITAL	Accès technique, validation et export
MARKETER	Création et modification des campagnes et landing pages
VIEWER	Consultation uniquement

Le rôle VIEWER peut être optionnel dans le MVP si le temps est limité.

3.2 Gestion des campagnes

Le MVP doit permettre de créer et gérer des campagnes marketing.

Fonctionnalités incluses :

créer une campagne ;
afficher la liste des campagnes ;
consulter le détail d’une campagne ;
modifier une campagne ;
archiver une campagne.

Champs principaux :

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

Statuts de campagne :

DRAFT
ACTIVE
ARCHIVED
3.3 Gestion des landing pages

Le MVP doit permettre de créer une landing page rattachée à une campagne.

Fonctionnalités incluses :

créer une landing page ;
afficher la liste des landing pages ;
consulter le détail d’une landing page ;
modifier une landing page ;
sauvegarder la structure de la page ;
archiver une landing page.

Champs principaux :

id
campaign_id
title
slug
layout_json
status
created_at
updated_at
last_exported_at

Statuts de landing page :

DRAFT
READY
EXPORTED
ARCHIVED
3.4 Builder visuel simple

Le MVP doit inclure un builder visuel simple basé sur des blocs prédéfinis.

L’interface doit être organisée en trois zones :

Panneau gauche  : bibliothèque de blocs
Zone centrale   : aperçu / canvas de la landing page
Panneau droit   : propriétés du bloc sélectionné

Blocs inclus dans le MVP :

Bloc	Description
Hero	Section principale avec titre, sous-titre, image ou bouton
Text	Bloc de texte simple
Image	Image marketing
Button	Bouton d’appel à l’action
Features	Liste d’avantages ou arguments commerciaux
Form	Formulaire de collecte de lead
Footer	Informations de fin de page

Fonctionnalités du builder incluses :

ajouter un bloc ;
modifier un bloc ;
supprimer un bloc ;
réordonner les blocs ;
modifier les propriétés principales ;
sauvegarder la structure JSON de la page.

Le drag-and-drop avancé n’est pas obligatoire dans le MVP.
Un système simple de déplacement par boutons “monter / descendre” est acceptable pour la première version.

3.5 Configuration des formulaires

Le MVP doit permettre d’ajouter et configurer un formulaire dans une landing page.

Champs standards inclus :

full_name
phone
email
city
brand
model
request_type
message

Types de demande inclus :

CONTACT
TEST_DRIVE
OFFER_REQUEST
SERVICE_REQUEST

Règles minimales :

le champ full_name est obligatoire ;
le champ phone est obligatoire ;
le champ request_type est obligatoire ;
l’email est optionnel mais doit être valide s’il est renseigné ;
le téléphone doit être validé côté backend ;
le formulaire doit envoyer les données vers l’API publique /public/leads.
3.6 Prévisualisation

Le MVP doit permettre de prévisualiser la landing page avant export.

Fonctionnalités incluses :

prévisualisation desktop ;
prévisualisation mobile simple ;
vérification visuelle des blocs ;
vérification de la présence du formulaire ;
vérification de la structure générale avant export.

La prévisualisation n’est pas considérée comme un remplacement du test réel après déploiement sur cPanel.

3.7 Export ZIP compatible cPanel

Le MVP doit générer un fichier ZIP statique prêt à être déployé sur cPanel.

Le ZIP doit contenir :

index.html
metadata.json
css/style.css
js/config.js
js/lead-form.js
assets/images/
assets/videos/
assets/fonts/

Le ZIP ne doit jamais contenir :

.env
mot de passe
token privé
connexion SQL
code backend NestJS
node_modules
fichiers de configuration internes
secrets techniques

Critères d’export :

le fichier index.html doit être directement ouvrable ;
les assets doivent être inclus dans le ZIP ;
le CSS doit être chargé localement ;
le JavaScript du formulaire doit être chargé localement ;
l’URL de l’API publique doit être configurable ;
la page doit fonctionner après extraction sur un sous-domaine cPanel.
3.8 API publique de collecte des leads

Le MVP doit inclure une API publique dédiée à la réception des leads.

Route obligatoire :

POST /public/leads

Cette API doit :

recevoir les données du formulaire ;
valider les données côté serveur ;
identifier la campagne et la landing page source ;
enregistrer la soumission dans lead_events ;
déclencher la synchronisation vers les tables simulées ;
retourner une réponse claire à la landing page.

L’API publique ne doit jamais exposer :

les campagnes internes ;
les utilisateurs ;
les exports ;
la base builder ;
les données administratives ;
les tables simulées en lecture publique.
3.9 Table lead_events

La table lead_events est obligatoire dans le MVP.

Elle représente le point d’entrée central de toutes les soumissions de formulaires.

Champs minimum :

id
campaign_id
landing_page_id
source_url
lead_type
payload_json
status
sync_target
sync_attempts
error_message
created_at
updated_at
synced_at

Statuts autorisés :

RECEIVED
VALIDATED
SYNCED
FAILED
PENDING_RETRY
DUPLICATE

Règle critique :

Un lead reçu ne doit jamais être perdu, même si la synchronisation échoue.

En cas d’échec de synchronisation, le lead reste disponible dans lead_events avec un statut d’erreur.

3.10 Simulation des tables Auto Hall

Le MVP ne doit pas écrire directement dans les vraies bases Auto Hall.

Il doit utiliser des tables simulées représentant les destinations métier :

simulated_testdrive
simulated_contacts

Objectif de la simulation :

valider le workflow complet ;
tester le mapping des données ;
vérifier la consultation des leads ;
éviter tout risque sur les bases réelles Auto Hall ;
préparer l’intégration réelle future.

Le remplacement par les vraies tables Auto Hall devra se faire plus tard au niveau de l’adaptateur d’intégration.

3.11 Dashboard simulé des leads

Le MVP doit inclure un dashboard simple permettant de consulter les leads collectés.

Fonctionnalités incluses :

liste des leads ;
filtre par campagne ;
filtre par landing page ;
filtre par statut ;
affichage du détail d’un lead ;
affichage de la destination simulée ;
affichage des erreurs de synchronisation.

Ce dashboard sert uniquement à démontrer et valider le fonctionnement du workflow avant intégration réelle avec le dashboard existant des marketeurs.

4. Hors périmètre du MVP

Les fonctionnalités suivantes sont exclues de la première version.

4.1 Éditeur visuel avancé

Exclus du MVP :

éditeur type Webflow complet ;
drag-and-drop avancé avec positionnement libre ;
personnalisation CSS libre ;
animations complexes ;
composants imbriqués avancés ;
édition responsive très fine.

Justification :

Le risque est de perdre du temps sur l’interface au lieu de valider le circuit métier complet.

4.2 Déploiement automatique cPanel

Exclus du MVP :

connexion automatique à cPanel ;
création automatique de sous-domaines ;
upload automatique via FTP/SFTP ;
rollback automatique depuis le builder.

Justification :

Le MVP doit d’abord générer un ZIP fiable. Le déploiement automatique peut être ajouté dans une version ultérieure.

4.3 Intégration directe avec les vraies bases Auto Hall

Exclus du MVP :

écriture directe dans les vraies tables testdrive et contacts ;
connexion directe aux bases réelles Auto Hall ;
modification du dashboard existant des marketeurs ;
manipulation des bases de production.

Justification :

L’intégration réelle nécessite une validation SI/Digital, des accès contrôlés et une connaissance exacte des schémas de données.

4.4 Analytics avancées

Exclus du MVP :

taux de conversion ;
tracking comportemental ;
heatmaps ;
sources UTM détaillées ;
statistiques avancées par campagne ;
A/B testing.

Justification :

Ces fonctionnalités sont utiles mais secondaires. Le MVP doit d’abord prouver la création, l’export et la collecte des leads.

4.5 CRM complet

Exclus du MVP :

gestion commerciale complète des leads ;
assignation à des commerciaux ;
pipeline de vente ;
relances automatiques ;
notifications avancées.

Justification :

Le projet est un builder de landing pages, pas un CRM.

5. Contraintes non négociables du MVP

Les contraintes suivantes doivent être respectées dès la première version.

5.1 Sécurité
Le builder doit être privé.
Les landing pages ne doivent contenir aucun secret.
Aucune landing page ne doit accéder directement à une base de données.
Toutes les soumissions doivent passer par une API backend.
Les données doivent être validées côté serveur.
Les mots de passe doivent être hashés.
Les routes privées doivent être protégées.
5.2 Compatibilité cPanel
Le ZIP doit être statique.
La page doit fonctionner après extraction sur cPanel.
Les fichiers doivent être standards : HTML, CSS, JS, assets.
Aucune dépendance Node.js ne doit être nécessaire côté cPanel.
5.3 Traçabilité des leads
Chaque soumission doit être enregistrée dans lead_events.
Chaque tentative de synchronisation doit être traçable.
Un échec de synchronisation ne doit pas supprimer le lead.
Le statut du lead doit être consultable.
5.4 Architecture
Le frontend builder est séparé du backend.
Le backend expose une API privée et une API publique distinctes.
La logique de synchronisation doit être isolée dans un service/adaptateur.
Le stockage des pages doit reposer sur un modèle JSON structuré.
6. Critères d’acceptation du MVP

Le MVP est considéré comme validé si les critères suivants sont respectés.

6.1 Critères fonctionnels
Un utilisateur peut se connecter au builder.
Un utilisateur autorisé peut créer une campagne.
Un utilisateur autorisé peut créer une landing page.
Un utilisateur peut ajouter des blocs simples.
Un utilisateur peut configurer un formulaire.
Un utilisateur peut prévisualiser la landing page.
Un utilisateur peut générer un ZIP.
Une landing page exportée peut être ouverte hors du builder.
Une landing page exportée peut envoyer un lead.
Un lead est enregistré dans lead_events.
Un lead est synchronisé vers une table simulée.
Un lead est visible dans le dashboard simulé.
6.2 Critères techniques
Le projet démarre avec Docker.
Le backend NestJS est structuré par modules.
La base PostgreSQL contient les tables nécessaires.
Les routes API principales sont fonctionnelles.
Le ZIP ne contient aucun secret.
La landing page exportée ne dépend pas du builder pour s’afficher.
L’API publique valide les données reçues.
Les erreurs sont journalisées.
6.3 Critères de sécurité
Les routes privées sont protégées.
Les rôles sont appliqués.
Les mots de passe sont hashés.
Les données reçues par /public/leads sont validées.
Le rate limiting est actif sur l’API publique.
Aucun secret n’est commité dans Git.
Aucun secret n’est présent dans l’export ZIP.
7. Priorités de développement

Le développement doit respecter l’ordre suivant :

1. Initialisation du repository
2. Docker Compose
3. Backend NestJS
4. Base PostgreSQL
5. Authentification
6. Gestion des campagnes
7. Gestion des landing pages
8. Modèle JSON des blocs
9. Builder visuel simple
10. Prévisualisation
11. Export ZIP
12. API publique des leads
13. Table lead_events
14. Synchronisation simulée
15. Dashboard simulé
16. Tests de bout en bout

Erreur à éviter :

Commencer par un drag-and-drop avancé avant d’avoir validé le workflow complet.
8. Livrables du MVP

Le MVP doit produire les livrables suivants :

Application frontend React du builder
Backend NestJS
Base PostgreSQL
Configuration Docker
Système d’authentification
Gestion des campagnes
Gestion des landing pages
Builder visuel simple
Générateur ZIP
API publique de collecte des leads
Table lead_events
Tables simulées testdrive / contacts
Dashboard simulé des leads
Documentation d’installation
Documentation API minimale
Plan de tests MVP
9. Définition de terminé

Une fonctionnalité du MVP est considérée comme terminée uniquement si :

Le backend est implémenté.
Le frontend est connecté.
Les validations sont présentes.
Les erreurs sont gérées.
Les logs nécessaires existent.
La fonctionnalité est testée manuellement.
Le code est commité proprement.
La fonctionnalité respecte les règles de sécurité.

Une fonctionnalité visible mais non connectée au backend ne doit pas être considérée comme terminée.

10. Conclusion

Le MVP v1 doit rester concentré sur la validation du workflow principal de la plateforme. La priorité est de prouver que le builder peut créer une landing page, l’exporter en ZIP compatible cPanel, collecter un lead via une API publique sécurisée, stocker ce lead dans lead_events, le synchroniser vers des tables simulées et le rendre consultable dans un dashboard.

Le MVP ne doit pas chercher à couvrir toutes les fonctionnalités d’une plateforme marketing avancée. Il doit être stable, démontrable, sécurisé et extensible.

Le principe directeur est le suivant :

Un MVP limité mais complet vaut mieux qu’un builder visuellement ambitieux mais techniquement fragile.