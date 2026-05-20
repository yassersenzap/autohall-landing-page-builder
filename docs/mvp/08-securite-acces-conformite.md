# 08 — Sécurité, accès et conformité MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de conception avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit les règles de sécurité à appliquer avant et pendant le développement du builder.

Il couvre :

```text
La protection du builder privé.
La gestion des rôles et permissions.
La sécurité des API privées.
La sécurité de l’API publique /public/leads.
La protection des données personnelles.
La gestion des secrets.
La sécurité Docker.
La sécurité PostgreSQL.
La sécurité de l’export ZIP.
Les logs et traces d’audit.
Les contrôles minimaux avant mise en production.
```

Règle critique :

```text
Le builder est un outil interne Auto Hall.
Il ne doit jamais être exposé comme une application publique non protégée.
```

---

# 2. Principe général de sécurité

Le projet repose sur une séparation stricte entre deux mondes :

```text
1. Zone privée
   Builder React + Backend NestJS + PostgreSQL
   Accessible uniquement aux utilisateurs autorisés Auto Hall.

2. Zone publique
   Landing pages exportées sur cPanel
   Accessibles aux visiteurs externes.
```

Cette séparation est non négociable.

Le builder gère :

```text
Les campagnes.
Les templates.
Les landing pages.
Les assets.
Les exports.
Les utilisateurs.
Les permissions.
```

Les landing pages publiques gèrent uniquement :

```text
L’affichage marketing.
La soumission d’un formulaire vers /public/leads.
```

---

# 3. Menaces principales du projet

Les risques à traiter dès la conception sont :

| Risque | Impact |
|---|---|
| Accès non autorisé au builder | Création ou modification frauduleuse de campagnes |
| Fuite de secrets dans l’export ZIP | Compromission technique |
| Injection XSS dans les blocs | Exécution de script malveillant |
| Injection SQL | Corruption ou fuite de données |
| Spam sur /public/leads | Pollution des leads |
| Perte de leads | Échec métier |
| Mauvaise gestion des rôles | Accès trop large |
| Logs contenant des données sensibles | Fuite indirecte |
| Mauvaise configuration Docker | Exposition de services internes |
| CORS trop ouvert | Utilisation abusive de l’API publique |

---

# 4. Acteurs et niveaux d’accès

## 4.1 Rôles MVP

Les rôles retenus pour le MVP sont :

```text
ADMIN
SI_DIGITAL
MARKETER
VIEWER
```

## 4.2 Description des rôles

| Rôle | Description |
|---|---|
| ADMIN | Gère les utilisateurs, paramètres globaux et accès |
| SI_DIGITAL | Gère les aspects techniques, exports, intégration et monitoring |
| MARKETER | Crée et modifie les campagnes et landing pages |
| VIEWER | Consulte uniquement les campagnes et les leads |

---

# 5. Matrice des permissions

| Fonctionnalité | ADMIN | SI_DIGITAL | MARKETER | VIEWER |
|---|---:|---:|---:|---:|
| Se connecter | Oui | Oui | Oui | Oui |
| Gérer les utilisateurs | Oui | Non | Non | Non |
| Créer une campagne | Oui | Oui | Oui | Non |
| Modifier une campagne | Oui | Oui | Oui | Non |
| Supprimer une campagne | Oui | Oui | Non | Non |
| Créer une landing page | Oui | Oui | Oui | Non |
| Modifier une landing page | Oui | Oui | Oui | Non |
| Générer un export ZIP | Oui | Oui | Oui | Non |
| Télécharger un export | Oui | Oui | Oui | Non |
| Consulter les leads | Oui | Oui | Oui | Oui |
| Relancer une synchronisation lead | Oui | Oui | Non | Non |
| Modifier paramètres techniques | Oui | Oui | Non | Non |
| Voir les logs techniques | Oui | Oui | Non | Non |

Règle :

```text
Un rôle ne doit avoir que les droits nécessaires à sa mission.
```

---

# 6. Authentification du builder

Le builder doit imposer une authentification obligatoire.

Routes concernées :

```text
Toutes les routes /api/*
Toutes les pages React privées
Toutes les actions de création, modification, suppression et export
```

Exception :

```text
POST /public/leads
```

Cette route est publique mais fortement contrôlée.

---

# 7. Gestion des sessions et tokens

Pour le MVP, le backend NestJS peut utiliser :

```text
JWT access token à durée courte.
Refresh token sécurisé si nécessaire.
Hash des mots de passe avec bcrypt ou argon2.
```

Règles :

```text
Ne jamais stocker un mot de passe en clair.
Ne jamais mettre un token JWT dans le code source.
Ne jamais mettre un token privé dans config.js de l’export.
Limiter la durée de vie des tokens.
Révoquer les sessions si nécessaire.
```

Stockage côté frontend :

```text
Éviter localStorage si le niveau de sécurité exigé est élevé.
Préférer cookie HttpOnly Secure SameSite si possible.
```

Pour le MVP local, une stratégie JWT propre peut suffire, mais elle doit rester remplaçable par une stratégie plus robuste si Auto Hall l’exige.

---

# 8. Sécurité des mots de passe

Règles minimales :

```text
Hash obligatoire.
Sel automatique via l’algorithme choisi.
Longueur minimale recommandée : 10 caractères.
Interdire les mots de passe triviaux.
Possibilité de réinitialisation contrôlée.
Ne jamais logger le mot de passe.
```

Interdit :

```text
password stocké en clair
MD5
SHA1 simple
mot de passe envoyé dans les logs
mot de passe dans un fichier .env partagé
```

---

# 9. Protection des routes backend

Chaque module NestJS doit être protégé selon son niveau de sensibilité.

Exemples :

```text
/api/auth/*              → public contrôlé
/api/users/*             → ADMIN
/api/campaigns/*         → ADMIN, SI_DIGITAL, MARKETER
/api/landing-pages/*     → ADMIN, SI_DIGITAL, MARKETER
/api/assets/*            → ADMIN, SI_DIGITAL, MARKETER
/api/exports/*           → ADMIN, SI_DIGITAL, MARKETER
/api/leads/*             → ADMIN, SI_DIGITAL, MARKETER, VIEWER
/api/sync/*              → ADMIN, SI_DIGITAL
/public/leads            → public contrôlé
```

Règle :

```text
Le contrôle d’accès doit être fait côté backend.
Le frontend ne sert qu’à masquer ou afficher les boutons.
```

---

# 10. Guards et décorateurs NestJS

Structure recommandée :

```text
JwtAuthGuard
RolesGuard
PublicRouteDecorator
CurrentUserDecorator
```

Exemple conceptuel :

```text
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SI_DIGITAL')
```

Règle :

```text
Aucune route sensible ne doit dépendre uniquement d’un contrôle frontend.
```

---

# 11. Sécurité de l’API publique `/public/leads`

Cette route est publique parce que les landing pages doivent envoyer des formulaires.

Mais publique ne veut pas dire ouverte sans contrôle.

Contrôles obligatoires :

```text
Validation stricte du payload.
Rate limiting.
Limite de taille du body.
CORS contrôlé.
Nettoyage des champs texte.
Vérification campaignId / landingPageId.
Vérification requestType.
Protection anti-spam minimale.
Logs techniques.
Réponse générique en cas d’erreur serveur.
```

Interdictions :

```text
Retourner une erreur SQL.
Retourner une stack trace.
Accepter des champs illimités.
Accepter une origine inconnue en production.
Insérer directement dans testdrive / contacts sans lead_events.
```

---

# 12. CORS

Configuration MVP :

```text
En local :
- Autoriser localhost frontend builder.
- Autoriser environnement de test.

En production :
- Autoriser uniquement les domaines et sous-domaines validés.
```

Interdit en production :

```text
Access-Control-Allow-Origin: *
```

Règle :

```text
Chaque landing page active doit être associée à une sourceUrl ou un domaine autorisé.
```

---

# 13. Rate limiting

Politique minimale recommandée :

```text
API privée :
- Limiter les tentatives de connexion.
- Bloquer temporairement après plusieurs échecs.

API publique /public/leads :
- 5 soumissions par minute par IP.
- 30 soumissions par heure par IP.
- Limite additionnelle par landingPageId.
```

Objectif :

```text
Limiter le spam, le bruteforce et les abus sans bloquer les vrais visiteurs.
```

---

# 14. Protection anti-spam

MVP recommandé :

```text
Honeypot field invisible dans les formulaires.
Rate limiting.
Détection de doublons.
Validation phone/email.
Journalisation des abus.
```

Option si spam réel :

```text
CAPTCHA.
Blocage temporaire IP.
Liste de domaines email bloqués.
```

Le CAPTCHA ne doit pas être ajouté trop tôt s’il dégrade la conversion marketing.

---

# 15. Validation des entrées

Toutes les entrées doivent être validées côté backend.

Champs concernés :

```text
Formulaires leads.
Création campagne.
Création landing page.
Modification layout_json.
Upload assets.
Export ZIP.
Création utilisateur.
Connexion.
```

Outils recommandés dans NestJS :

```text
DTO
class-validator
ValidationPipe
whitelist
forbidNonWhitelisted
transform
```

Règles :

```text
Aucun payload libre.
Aucun champ inconnu accepté sur les routes sensibles.
Aucune confiance aveugle dans le frontend.
```

---

# 16. Nettoyage et protection XSS

Le builder manipule du contenu marketing saisi par des utilisateurs.

Risque :

```text
Un utilisateur peut saisir du HTML ou du JavaScript malveillant dans un bloc.
Ce contenu peut ensuite être exporté dans index.html.
```

Règles :

```text
Échapper les textes lors de la génération HTML.
Interdire <script>.
Interdire les attributs onclick, onerror, onload.
Interdire javascript: dans les URLs.
Interdire le HTML libre dans le MVP.
Valider toutes les URLs.
```

Champs à protéger :

```text
title
subtitle
content
caption
buttonText
labels
messages
FAQ
metadata
```

---

# 17. Injection SQL

Avec NestJS et un ORM, le risque baisse, mais ne disparaît pas.

Règles :

```text
Utiliser les requêtes paramétrées.
Éviter les concaténations SQL.
Ne jamais construire une requête SQL avec une string utilisateur.
Limiter les droits du compte PostgreSQL.
Valider les filtres et tris.
```

Exemples de champs à contrôler :

```text
search
sortBy
order
filters
dateRange
campaignId
landingPageId
```

---

# 18. Sécurité des uploads assets

Le builder doit permettre d’ajouter des images et médias.

Règles :

```text
Limiter les extensions.
Limiter la taille.
Renommer les fichiers.
Stocker hors dossier exécutable si possible.
Scanner ou contrôler le type MIME.
Refuser les fichiers exécutables.
Refuser les doubles extensions suspectes.
```

Extensions autorisées MVP :

```text
.jpg
.jpeg
.png
.webp
.svg contrôlé
.mp4
.webm
.pdf
```

Extensions interdites :

```text
.php
.exe
.sh
.bat
.cmd
.sql
.env
.js uploadé
.html uploadé
```

---

# 19. Sécurité de l’export ZIP

Le ZIP exporté est public.

Il doit donc être propre.

Interdictions absolues :

```text
.env
Secrets
Tokens privés
Clés API
Connexion SQL
Fichiers backend
Code source du builder
node_modules
package.json du builder
Dockerfile
Scripts non contrôlés
```

Le ZIP doit contenir uniquement :

```text
index.html
css/styles.css
js/config.js
js/lead-form.js
assets nécessaires
README_DEPLOYMENT.txt
```

Règle :

```text
config.js ne contient que des paramètres publics.
```

---

# 20. Gestion des secrets

Les secrets doivent être stockés dans des variables d’environnement.

Exemples :

```text
DATABASE_URL
JWT_SECRET
REFRESH_TOKEN_SECRET
PUBLIC_LEAD_ALLOWED_ORIGINS
SMTP_PASSWORD si email plus tard
```

Règles :

```text
Ne jamais commit .env.
Créer un .env.example sans valeurs sensibles.
Changer les secrets par environnement.
Ne jamais exposer les secrets dans les logs.
Ne jamais mettre de secrets dans le ZIP.
```

---

# 21. Sécurité Docker

Le projet sera déployé sur serveur local Auto Hall avec Docker.

Règles minimales :

```text
Un conteneur par couche : frontend, backend, postgres.
Réseau Docker interne pour backend ↔ postgres.
PostgreSQL non exposé publiquement.
Volumes contrôlés pour les données.
Variables d’environnement séparées.
Images versionnées.
Pas de conteneur en mode privileged.
Redémarrage contrôlé.
```

Exposition recommandée :

```text
Frontend builder : accès interne Auto Hall.
Backend API : accès interne + route publique maîtrisée si nécessaire.
PostgreSQL : jamais exposé publiquement.
```

---

# 22. Sécurité PostgreSQL

Règles :

```text
Compte PostgreSQL dédié à l’application.
Pas d’utilisation du superuser postgres par l’application.
Droits limités.
Sauvegardes régulières.
Connexion uniquement depuis le backend.
Migrations versionnées.
```

Interdit :

```text
Exposer PostgreSQL sur Internet.
Partager le mot de passe DB.
Utiliser le compte admin pour l’application.
```

---

# 23. Journalisation et audit

Le système doit garder une trace des actions importantes.

Événements à journaliser :

```text
Connexion réussie.
Échec de connexion.
Création campagne.
Modification campagne.
Suppression campagne.
Création landing page.
Modification layout_json.
Export ZIP généré.
Lead reçu.
Lead synchronisé.
Erreur de synchronisation.
Relance de synchronisation.
Création utilisateur.
Changement de rôle.
```

Données à éviter dans les logs :

```text
Mot de passe.
Token.
Secret.
Payload complet contenant trop de données personnelles.
Chaîne de connexion base.
```

Règle :

```text
Logger ce qui permet de diagnostiquer sans exposer inutilement les données sensibles.
```

---

# 24. Protection des données personnelles

Les leads contiennent des données personnelles.

Règles :

```text
Collecter uniquement les données nécessaires.
Limiter l’accès aux leads.
Ne pas exposer les leads publiquement.
Masquer les données sensibles dans les logs.
Prévoir suppression ou archivage si demandé par Auto Hall.
Limiter les exports manuels non contrôlés.
```

Champs concernés :

```text
Nom complet.
Téléphone.
Email.
Ville.
Message.
Préférences.
```

---

# 25. Gestion des erreurs

Le backend doit retourner des erreurs propres.

Exemple correct :

```json
{
  "success": false,
  "error": {
    "code": "LEAD_INVALID_PAYLOAD",
    "message": "Lead payload is invalid"
  }
}
```

Interdit :

```text
Stack trace brute.
Erreur SQL complète.
Chemin fichier serveur.
Nom interne de service sensible.
Contenu .env.
```

Règle :

```text
Les erreurs techniques sont loggées côté serveur.
L’utilisateur reçoit un message contrôlé.
```

---

# 26. Sécurité frontend builder

Le frontend React doit appliquer les règles suivantes :

```text
Ne pas stocker de secret.
Ne pas faire confiance aux rôles frontend.
Gérer l’expiration de session.
Protéger les routes privées.
Afficher ou masquer les actions selon le rôle.
Ne pas injecter de HTML non nettoyé.
Ne pas utiliser dangerouslySetInnerHTML sauf justification stricte.
```

Règle :

```text
Le frontend améliore l’expérience, mais la sécurité réelle reste côté backend.
```

---

# 27. Sécurité du panneau d’édition

Le panneau d’inspection des blocs doit limiter les entrées.

Exemples :

```text
Champ couleur → color picker contrôlé.
Champ URL → validation URL.
Champ alignment → liste enum.
Champ requestType → liste enum.
Champ image → sélection depuis assets.
Champ texte → longueur maximale.
```

Interdit :

```text
Champ CSS libre.
Champ HTML libre.
Champ JavaScript libre.
Champ iframe libre.
```

---

# 28. Sécurité de la prévisualisation

La prévisualisation dans le builder doit utiliser le même modèle de blocs que l’export.

Règles :

```text
Ne pas exécuter du code utilisateur.
Ne pas rendre du HTML libre non nettoyé.
Afficher les blocs via composants contrôlés.
Prévisualiser desktop/tablet/mobile.
```

Risque à éviter :

```text
Un utilisateur injecte un script dans un bloc, le script s’exécute dans le navigateur d’un administrateur.
```

---

# 29. Sauvegardes et restauration

Même en MVP, il faut prévoir une politique minimale.

À sauvegarder :

```text
Base PostgreSQL builder.
Assets uploadés.
Exports générés si conservés localement.
Fichiers de configuration hors secrets.
```

Règles :

```text
Sauvegardes régulières.
Test de restauration.
Protection des backups.
Pas de backup contenant des secrets en clair sans contrôle.
```

---

# 30. Environnements

Prévoir au minimum :

```text
local
staging
production
```

Même si le PFE commence en local, le code doit être prêt pour séparation d’environnements.

Chaque environnement doit avoir :

```text
Ses variables d’environnement.
Sa base.
Ses URLs.
Ses règles CORS.
Ses comptes de test.
```

---

# 31. Checklist sécurité avant développement

Avant d’écrire le code final, valider :

```text
Rôles définis.
Permissions définies.
Routes privées identifiées.
Route publique /public/leads identifiée.
Stratégie JWT ou session définie.
Politique CORS définie.
Politique rate limiting définie.
Règles de validation DTO définies.
Extensions assets autorisées définies.
Structure ZIP autorisée définie.
Secrets listés.
.env.example prévu.
Logs sensibles interdits.
Docker non exposé inutilement.
PostgreSQL non public.
```

---

# 32. Checklist sécurité avant déploiement

Avant une démonstration ou livraison :

```text
Aucun secret dans Git.
Aucun .env dans l’export ZIP.
Aucun mot de passe en clair.
Routes privées protégées.
Rôles testés.
POST /public/leads testé avec payload invalide.
Rate limiting testé.
CORS testé.
Export ZIP inspecté.
Upload fichier dangereux refusé.
Logs vérifiés.
Base sauvegardée.
Compte admin par défaut changé.
```

---

# 33. Tests sécurité MVP

## 33.1 Accès non authentifié

```text
Accéder à /api/campaigns sans token.
```

Résultat attendu :

```text
401 Unauthorized.
```

## 33.2 Accès rôle insuffisant

```text
Utilisateur MARKETER tente de gérer les utilisateurs.
```

Résultat attendu :

```text
403 Forbidden.
```

## 33.3 Payload lead invalide

```text
Envoyer un lead sans phone.
```

Résultat attendu :

```text
400 Bad Request.
Aucune synchronisation.
```

## 33.4 Spam API publique

```text
Envoyer plusieurs leads rapidement depuis la même IP.
```

Résultat attendu :

```text
429 Too Many Requests.
```

## 33.5 XSS dans un bloc

```text
Saisir <script>alert(1)</script> dans un titre.
```

Résultat attendu :

```text
Script refusé ou échappé.
Aucune exécution dans le builder ni dans l’export.
```

## 33.6 Upload dangereux

```text
Uploader fichier shell.php.
```

Résultat attendu :

```text
Fichier refusé.
```

## 33.7 Export ZIP

```text
Inspecter le ZIP généré.
```

Résultat attendu :

```text
Aucun .env.
Aucun secret.
Aucun fichier backend.
Aucun node_modules.
```

---

# 34. Risques résiduels

Même après ces mesures, certains risques restent possibles :

```text
Spam sophistiqué.
Erreur humaine lors du déploiement cPanel.
Mauvaise configuration DNS.
Mauvais mapping vers tables réelles.
Fuite par capture d’écran ou export manuel de leads.
```

Mesures :

```text
Logs.
Validation SI/Digital.
README de déploiement.
Table lead_events.
Adaptateur de synchronisation.
Contrôles d’accès.
```

---

# 35. Décision finale

La stratégie de sécurité retenue est :

```text
Builder privé protégé par authentification.
RBAC strict.
Routes backend protégées.
API publique unique pour les leads.
Validation backend systématique.
Aucun secret dans les exports.
Aucune écriture directe depuis cPanel vers la base.
PostgreSQL isolé dans Docker.
Logs et audit des actions critiques.
Simulation avant intégration réelle.
```

Cette stratégie est adaptée au contexte Auto Hall parce qu’elle protège à la fois :

```text
Le builder.
Les données marketing.
Les landing pages publiques.
L’écosystème existant.
Les futures intégrations avec testdrive et contacts.
```

---

# 36. Conclusion

La sécurité ne doit pas être ajoutée à la fin du projet.

Elle doit guider la conception dès le départ.

La règle finale est simple :

```text
Le builder est privé.
Les landing pages sont publiques.
Les secrets restent côté serveur.
Les leads passent par une API contrôlée.
Les rôles limitent les actions.
Les exports ne contiennent que du statique sûr.
```

Si ces règles sont respectées, le projet peut évoluer vers une intégration réelle Auto Hall sans devenir une dette technique ou une faille de sécurité.
