# 07 — Workflow de collecte et synchronisation des leads MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de conception avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit le workflow complet de collecte des leads générés par les landing pages exportées depuis le builder.

Il répond à une question centrale du projet :

```text
Quand une landing page déployée sur cPanel reçoit un formulaire,
où va la donnée, comment elle est sécurisée, comment elle est stockée,
et comment le marketeur peut la consulter ?
```

Le workflow doit respecter deux contraintes :

```text
1. Les landing pages sont publiques et déployées sur cPanel.
2. Les données collectées doivent pouvoir rejoindre les tables métier utilisées par Auto Hall : testdrive et contacts.
```

Règle critique :

```text
Une landing page publique ne doit jamais écrire directement dans une base de données.
```

---

# 2. Décision d’architecture retenue

La stratégie retenue est une intégration progressive en deux phases.

```text
Phase 1 — Simulation maîtrisée
Landing page générée
→ API publique /public/leads
→ table lead_events
→ tables simulées testdrive / contacts
→ dashboard simulé

Phase 2 — Intégration réelle
Landing page générée
→ API publique /public/leads
→ table lead_events
→ adaptateur Auto Hall validé
→ tables réelles testdrive / contacts
→ dashboard existant des marketeurs
```

Cette approche est la plus saine.

Elle permet de commencer le développement sans attendre les accès réels à la base Auto Hall, tout en gardant une architecture compatible avec le fonctionnement cible.

---

# 3. Pourquoi ne pas écrire directement dans testdrive / contacts ?

Écrire directement depuis la landing page vers `testdrive` ou `contacts` serait une mauvaise décision.

Risques :

```text
Exposition de secrets de base de données.
Couplage fort entre page publique et base métier.
Aucune traçabilité des erreurs.
Aucune reprise en cas d’échec.
Difficulté à gérer plusieurs types de formulaires.
Risque de casser des tables existantes.
Dépendance directe à la structure réelle Auto Hall.
Surface d’attaque plus grande.
```

Décision correcte :

```text
Toutes les soumissions passent d’abord par /public/leads.
Le backend valide, journalise, stocke, puis synchronise.
```

---

# 4. Vue générale du workflow cible

```text
Visiteur
   ↓
Landing page cPanel
   ↓ POST /public/leads
Backend NestJS
   ↓
Validation + sécurité
   ↓
lead_events
   ↓
Synchronisation
   ↓
testdrive / contacts
   ↓
Dashboard marketeur
```

Le rôle de chaque composant est clair :

| Composant | Responsabilité |
|---|---|
| Landing page | Afficher l’offre et envoyer le formulaire |
| API publique | Recevoir et contrôler les leads |
| lead_events | Stockage brut, traçabilité, reprise |
| Sync service | Mapper vers les tables métier |
| testdrive / contacts | Tables de destination métier |
| Dashboard | Consultation des leads par les marketeurs |

---

# 5. Rôle de `/public/leads`

`/public/leads` est l’unique point d’entrée public pour les formulaires.

```text
POST /public/leads
```

Cette route doit :

```text
Recevoir les leads depuis les pages cPanel.
Valider les champs.
Nettoyer les entrées.
Appliquer le rate limiting.
Vérifier la campagne et la landing page.
Stocker le lead dans lead_events.
Planifier ou exécuter la synchronisation.
Retourner une réponse simple à la landing page.
```

Elle ne doit pas :

```text
Exposer des erreurs SQL.
Retourner des informations internes.
Accepter des payloads illimités.
Faire confiance aux données du frontend.
Permettre un accès direct aux routes privées.
```

---

# 6. Payload standard envoyé par une landing page

Exemple de payload :

```json
{
  "campaignId": "uuid-campaign",
  "landingPageId": "uuid-landing-page",
  "fullName": "Client Exemple",
  "phone": "0600000000",
  "email": "client@example.com",
  "city": "Casablanca",
  "brand": "Ford",
  "model": "Ranger",
  "requestType": "TEST_DRIVE",
  "message": "Je souhaite être contacté.",
  "sourceUrl": "https://offre-ford.autohall.ma",
  "metadata": {
    "utmSource": "facebook",
    "utmMedium": "cpc",
    "utmCampaign": "promo-mai-2026"
  }
}
```

Champs obligatoires MVP :

```text
campaignId
landingPageId
fullName
phone
requestType
sourceUrl
```

Champs optionnels :

```text
email
city
brand
model
message
metadata
```

---

# 7. Types de demandes autorisés

Le champ `requestType` permet de router le lead vers la bonne destination.

Valeurs MVP autorisées :

```text
TEST_DRIVE
CONTACT
OFFER_REQUEST
SERVICE_REQUEST
CALLBACK
```

Mapping recommandé :

| requestType | Destination logique |
|---|---|
| TEST_DRIVE | testdrive |
| CONTACT | contacts |
| OFFER_REQUEST | contacts ou testdrive selon règle métier |
| SERVICE_REQUEST | contacts |
| CALLBACK | contacts |

Pour le MVP, la règle peut être simplifiée :

```text
TEST_DRIVE → simulated_testdrive
Tout le reste → simulated_contacts
```

En phase réelle, ce mapping devra être validé avec l’équipe SI/Digital.

---

# 8. Table centrale `lead_events`

La table `lead_events` est indispensable.

Elle sert de buffer, de journal et de mécanisme de reprise.

Elle stocke :

```text
La donnée reçue.
La source de la donnée.
Le statut du traitement.
L’erreur éventuelle.
La destination cible.
La date de réception.
La date de synchronisation.
```

Rôle :

```text
Ne jamais perdre un lead même si la synchronisation échoue.
```

Sans `lead_events`, une erreur d’insertion dans `testdrive` ou `contacts` peut provoquer une perte silencieuse de leads.

---

# 9. Structure recommandée de `lead_events`

```text
id
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
raw_payload
metadata
status
sync_destination
sync_error
synced_at
created_at
updated_at
```

Statuts recommandés :

```text
RECEIVED
VALIDATED
SYNCED
FAILED
PENDING_RETRY
IGNORED
```

---

# 10. Cycle de vie d’un lead

```text
1. RECEIVED
   Le lead est reçu par /public/leads.

2. VALIDATED
   Le payload est validé et nettoyé.

3. SYNCED
   Le lead est inséré avec succès dans la table destination.

4. FAILED
   La synchronisation a échoué.

5. PENDING_RETRY
   Une relance de synchronisation est programmée.

6. IGNORED
   Le lead est ignoré après décision contrôlée.
```

Workflow normal :

```text
RECEIVED → VALIDATED → SYNCED
```

Workflow avec erreur :

```text
RECEIVED → VALIDATED → FAILED → PENDING_RETRY → SYNCED
```

---

# 11. Tables simulées pour le MVP

Avant l’intégration réelle, le projet doit créer des tables simulées.

## 11.1 `simulated_testdrive`

Objectif :

```text
Représenter la table testdrive utilisée par Auto Hall.
```

Champs recommandés :

```text
id
lead_event_id
full_name
phone
email
city
brand
model
preferred_date
source_url
created_at
```

## 11.2 `simulated_contacts`

Objectif :

```text
Représenter la table contacts utilisée par Auto Hall.
```

Champs recommandés :

```text
id
lead_event_id
full_name
phone
email
city
message
source_url
created_at
```

Règle :

```text
Ces tables sont temporaires pour valider le workflow.
Elles ne remplacent pas les vraies tables Auto Hall.
```

---

# 12. Adaptateur de synchronisation

La synchronisation ne doit pas être codée directement dans le contrôleur `/public/leads`.

Architecture correcte :

```text
LeadController
→ LeadService
→ LeadValidationService
→ LeadSyncService
→ DestinationAdapter
```

Adapters MVP :

```text
SimulatedTestdriveAdapter
SimulatedContactsAdapter
```

Adapters phase réelle :

```text
AutoHallTestdriveAdapter
AutoHallContactsAdapter
```

Règle :

```text
Changer la destination réelle ne doit pas obliger à réécrire toute la collecte des leads.
```

---

# 13. Principe du pattern Adapter

Le pattern Adapter permet de découpler le projet du schéma réel Auto Hall.

Interface conceptuelle :

```text
LeadDestinationAdapter
  - supports(requestType)
  - sync(leadEvent)
```

Implémentations :

```text
SimulatedTestdriveAdapter
SimulatedContactsAdapter
AutoHallTestdriveAdapter
AutoHallContactsAdapter
```

Avantage :

```text
On développe et teste avec des tables simulées.
Ensuite, on remplace seulement l’adaptateur.
```

C’est une décision d’architecture propre, pas un bricolage.

---

# 14. Mapping vers `testdrive`

Pour un lead de type `TEST_DRIVE`, le mapping logique est :

| lead_events | testdrive simulé |
|---|---|
| id | lead_event_id |
| full_name | full_name |
| phone | phone |
| email | email |
| city | city |
| brand | brand |
| model | model |
| metadata.preferredDate | preferred_date |
| source_url | source_url |
| created_at | created_at |

Le mapping réel devra être ajusté selon les colonnes exactes de la table Auto Hall.

---

# 15. Mapping vers `contacts`

Pour un lead de type `CONTACT`, `CALLBACK`, `SERVICE_REQUEST` ou `OFFER_REQUEST`, le mapping logique est :

| lead_events | contacts simulé |
|---|---|
| id | lead_event_id |
| full_name | full_name |
| phone | phone |
| email | email |
| city | city |
| message | message |
| source_url | source_url |
| created_at | created_at |

Le mapping réel devra être validé avec SI/Digital avant toute écriture dans la vraie base.

---

# 16. Validation des données

Le backend doit valider toutes les données reçues.

Règles minimales :

```text
fullName obligatoire, max 180 caractères.
phone obligatoire, format contrôlé.
email optionnel mais format email si fourni.
city max 100 caractères.
brand max 100 caractères.
model max 100 caractères.
message max 1000 caractères.
requestType doit être une valeur autorisée.
sourceUrl doit être une URL valide.
campaignId et landingPageId doivent exister.
metadata doit être limité.
```

Règle non négociable :

```text
La validation frontend est utile mais insuffisante.
La validation backend est obligatoire.
```

---

# 17. Nettoyage des données

Tous les champs texte doivent être nettoyés.

Objectifs :

```text
Supprimer les scripts.
Réduire les caractères dangereux.
Éviter l’injection HTML.
Éviter la pollution de la base.
Normaliser les espaces.
```

Champs concernés :

```text
fullName
phone
email
city
brand
model
message
metadata
```

---

# 18. Sécurité de la route publique

La route `/public/leads` doit être publique, mais pas naïve.

Contrôles obligatoires :

```text
Rate limiting.
CORS contrôlé.
Validation stricte.
Payload size limit.
Logs techniques.
Pas d’erreur SQL retournée.
Pas de secret exposé.
```

Contrôles recommandés :

```text
Honeypot field anti-spam.
Vérification sourceUrl.
Blocage IP temporaire en cas d’abus.
CAPTCHA optionnel si spam réel.
```

---

# 19. CORS

En production, CORS ne doit pas être ouvert à tous les domaines.

Autorisé :

```text
Domaines des landing pages validées.
Sous-domaines Auto Hall autorisés.
```

Exemples :

```text
https://offresav.myautohall.ma
https://offre-ford.autohall.ma
https://campagne-chery.autohall.ma
```

Interdit en production :

```text
Access-Control-Allow-Origin: *
```

---

# 20. Rate limiting

Politique MVP recommandée :

```text
5 soumissions par minute par IP.
30 soumissions par heure par IP.
Limite additionnelle par landingPageId.
```

Objectif :

```text
Limiter le spam sans bloquer les vrais clients.
```

Une politique plus stricte peut être ajoutée si la campagne reçoit du trafic important ou du spam.

---

# 21. Gestion des doublons

Il faut éviter de créer trop de doublons.

Détection recommandée :

```text
Même téléphone.
Même landingPageId.
Même requestType.
Intervalle court.
```

Exemple :

```text
Si le même téléphone soumet le même formulaire dans les 5 minutes,
marquer comme doublon potentiel.
```

Décision MVP :

```text
Ne pas bloquer systématiquement.
Stocker dans lead_events.
Ajouter un flag duplicateCandidate si nécessaire.
```

Pourquoi :

```text
Un client peut réellement soumettre deux fois après une erreur visuelle.
Il ne faut pas perdre un lead commercial.
```

---

# 22. Réponse à la landing page

En cas de succès :

```json
{
  "success": true,
  "data": {
    "leadId": "uuid",
    "status": "RECEIVED"
  },
  "message": "Lead received successfully"
}
```

En cas d’erreur validation :

```json
{
  "success": false,
  "error": {
    "code": "LEAD_INVALID_PAYLOAD",
    "message": "Lead payload is invalid",
    "details": [
      {
        "field": "phone",
        "message": "phone is required"
      }
    ]
  }
}
```

La landing page doit afficher un message simple :

```text
Succès : Votre demande a bien été envoyée.
Erreur : Veuillez vérifier les champs obligatoires.
Erreur serveur : Une erreur est survenue. Veuillez réessayer.
```

---

# 23. Logs techniques

Le backend doit journaliser les événements suivants :

```text
Lead reçu.
Lead refusé par validation.
Lead stocké dans lead_events.
Synchronisation réussie.
Synchronisation échouée.
Relance de synchronisation.
Suspicion de spam.
Suspicion de doublon.
```

Les logs ne doivent jamais contenir :

```text
Mot de passe.
Token.
Secret.
Chaîne de connexion base.
Données personnelles inutiles.
```

---

# 24. Dashboard de consultation des leads

Dans la phase MVP, un dashboard simulé doit permettre de consulter les leads.

Fonctions minimales :

```text
Lister les leads.
Filtrer par campagne.
Filtrer par landing page.
Filtrer par marque.
Filtrer par type de demande.
Filtrer par statut.
Voir le détail d’un lead.
Voir l’état de synchronisation.
Relancer une synchronisation échouée.
```

Ce dashboard sert à simuler l’expérience des marketeurs.

Il permettra de démontrer le workflow complet :

```text
Landing page cPanel
→ formulaire
→ API
→ base
→ dashboard
```

---

# 25. Relation avec le dashboard existant Auto Hall

Le dashboard existant des marketeurs est déjà utilisé pour consulter certains leads.

Deux scénarios sont possibles en phase réelle :

## Scénario A — Réutilisation du dashboard existant

```text
Les leads du builder sont synchronisés vers les mêmes tables que le dashboard existant lit déjà.
```

Avantage :

```text
Pas besoin de former les marketeurs sur un nouvel outil.
Intégration plus naturelle dans l’existant.
```

Condition :

```text
Le mapping vers testdrive / contacts doit être validé.
```

## Scénario B — Nouveau dashboard dédié au builder

```text
Le builder fournit son propre dashboard de leads.
```

Avantage :

```text
Contrôle complet.
Indépendance technique.
```

Inconvénient :

```text
Risque de créer un outil parallèle inutile.
Risque de disperser les données marketing.
```

Décision recommandée :

```text
Phase 1 : dashboard simulé pour preuve technique.
Phase 2 : réutiliser le dashboard existant si les tables réelles sont accessibles et compatibles.
```

Créer un nouveau dashboard réel uniquement si le dashboard existant ne peut pas lire les nouvelles données.

---

# 26. Pourquoi la simulation est une bonne décision

La simulation n’est pas une solution faible.

C’est une étape professionnelle si elle est faite proprement.

Elle permet de valider :

```text
La création d’une landing page.
L’export ZIP.
Le déploiement cPanel.
La soumission d’un formulaire.
La réception par API.
Le stockage dans lead_events.
La synchronisation vers une table métier simulée.
La consultation par dashboard.
```

Elle évite :

```text
D’attendre les accès réels.
De casser des tables Auto Hall.
De tester directement en production.
D’écrire du code dépendant d’un schéma non validé.
```

---

# 27. Workflow de simulation MVP

```text
1. Créer une campagne dans le builder.
2. Créer une landing page.
3. Ajouter un formulaire.
4. Générer le ZIP.
5. Déployer le ZIP sur un environnement cPanel de test ou local.
6. Soumettre un lead.
7. Recevoir le lead dans /public/leads.
8. Enregistrer dans lead_events.
9. Mapper vers simulated_testdrive ou simulated_contacts.
10. Afficher dans le dashboard simulé.
```

Critère de réussite :

```text
Un lead soumis depuis une landing page exportée doit être visible dans le dashboard simulé.
```

---

# 28. Workflow d’intégration réelle

L’intégration réelle ne doit commencer qu’après validation SI/Digital.

Étapes :

```text
1. Obtenir le schéma réel de testdrive et contacts.
2. Identifier les champs obligatoires.
3. Identifier les contraintes SQL.
4. Identifier les règles métier existantes.
5. Créer un adaptateur réel.
6. Tester sur un environnement non critique.
7. Comparer les leads créés avec les anciennes landing pages.
8. Valider avec SI/Digital.
9. Activer l’écriture réelle.
```

Règle :

```text
Aucune écriture directe dans les vraies tables sans validation technique.
```

---

# 29. Données personnelles et conformité

Les leads contiennent des données personnelles.

Le projet doit appliquer les principes suivants :

```text
Collecter uniquement les champs nécessaires.
Limiter l’accès aux leads.
Tracer les consultations sensibles si nécessaire.
Protéger les données en base.
Ne pas exposer les données dans les logs.
Ne pas envoyer les leads vers des domaines non validés.
```

Même dans un PFE, ce point doit être traité sérieusement.

---

# 30. Erreurs à éviter

| Erreur | Risque |
|---|---|
| Landing page qui écrit directement en SQL | Faille critique |
| Secrets dans le ZIP | Fuite immédiate |
| Pas de table lead_events | Perte de leads |
| Pas de statut de synchronisation | Impossible de diagnostiquer |
| Mapping codé dans le contrôleur | Code rigide |
| Pas de validation backend | Données corrompues |
| Pas de rate limiting | Spam |
| CORS ouvert à tous | Abus externe |
| Nouveau dashboard sans vérifier l’existant | Duplication inutile |
| Intégration réelle sans simulation | Risque sur données Auto Hall |

---

# 31. Tests d’acceptation

## 31.1 Soumission valide

```text
Depuis une landing page exportée, soumettre un formulaire valide.
```

Résultat attendu :

```text
Lead créé dans lead_events.
Statut RECEIVED puis SYNCED.
Lead visible dans le dashboard simulé.
```

## 31.2 Payload invalide

```text
Soumettre un formulaire sans téléphone.
```

Résultat attendu :

```text
Erreur validation.
Aucune synchronisation vers testdrive / contacts.
Erreur claire affichée à l’utilisateur.
```

## 31.3 Synchronisation échouée

```text
Simuler une erreur d’insertion vers simulated_testdrive.
```

Résultat attendu :

```text
Lead conservé dans lead_events.
Statut FAILED.
Erreur stockée dans sync_error.
Relance possible.
```

## 31.4 Rate limiting

```text
Envoyer plusieurs soumissions rapides depuis la même IP.
```

Résultat attendu :

```text
Les soumissions abusives sont bloquées avec 429.
```

## 31.5 Dashboard

```text
Consulter les leads depuis le dashboard.
Filtrer par campagne et type de demande.
```

Résultat attendu :

```text
Les leads sont visibles et filtrables.
```

---

# 32. Décision finale

Le workflow retenu est :

```text
Landing page cPanel
→ /public/leads
→ lead_events
→ adaptateur de synchronisation
→ simulated_testdrive / simulated_contacts
→ dashboard simulé
```

Puis en phase réelle :

```text
Landing page cPanel
→ /public/leads
→ lead_events
→ adaptateur Auto Hall validé
→ testdrive / contacts réels
→ dashboard existant des marketeurs
```

Cette architecture est la plus adaptée parce qu’elle respecte :

```text
La sécurité.
La compatibilité cPanel.
L’existant Auto Hall.
La traçabilité.
La reprise sur erreur.
La séparation des responsabilités.
La possibilité de commencer le développement sans accès réel immédiat.
```

---

# 33. Conclusion

Le workflow des leads est le point le plus sensible du projet.

Le builder peut être réussi visuellement, mais si les leads sont mal collectés, perdus ou mal synchronisés, le projet échoue métier.

La règle finale est donc simple :

```text
Aucun lead ne doit être perdu.
Aucun secret ne doit être exposé.
Aucune landing page ne doit écrire directement en base.
Toute soumission doit passer par une API publique contrôlée.
Toute synchronisation doit être traçable.
```

La simulation des tables Auto Hall est une étape obligatoire et intelligente avant l’intégration réelle.
