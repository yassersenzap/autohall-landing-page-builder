# 04 — Contrats API MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de conception avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit les contrats API du MVP v1.

Il sert de référence pour développer le backend NestJS et connecter le frontend React sans improvisation.

Il précise :

```text
Les routes privées du builder.
Les routes publiques utilisées par les landing pages exportées.
Les formats de requêtes.
Les formats de réponses.
Les statuts HTTP attendus.
Les règles d’authentification.
Les règles d’autorisation.
Les règles de validation.
La structure standard des erreurs.
```

Règle critique :

```text
Aucune route backend ne doit être codée sans contrat clair.
```

Un backend sans contrats API devient rapidement instable : payloads incohérents, frontend fragile, validations dispersées et intégration difficile à maintenir.

---

# 2. Principes généraux

## 2.1 Séparation API privée / API publique

Le projet doit séparer strictement deux familles de routes.

```text
API privée :
/api/auth
/api/users
/api/campaigns
/api/landing-pages
/api/assets
/api/exports
/api/leads
/api/audit-logs

API publique :
/public/leads
```

## 2.2 Règle de sécurité

```text
Les routes /api/* sont réservées au builder privé.
La route /public/leads est la seule route accessible par les landing pages publiques.
```

Une landing page exportée sur cPanel ne doit jamais appeler une route privée.

---

# 3. URL de base

## 3.1 Environnement local

```text
Frontend builder :
http://localhost:5173

Backend API :
http://localhost:3000

PostgreSQL :
localhost:5432
```

## 3.2 Environnement Auto Hall cible

Le builder sera hébergé sur un serveur local Auto Hall avec Docker.

Exemple indicatif :

```text
Frontend builder :
https://builder.local.autohall.ma

Backend API :
https://api-builder.local.autohall.ma
```

Ces URLs exactes devront être validées avec l’équipe SI/Digital.

## 3.3 Landing pages exportées

Les landing pages seront déployées sur des sous-domaines séparés via cPanel.

Exemple :

```text
https://offre-ford.autohall.ma
https://offresav.myautohall.ma
https://campagne-chery.autohall.ma
```

---

# 4. Format standard des réponses

## 4.1 Réponse de succès

Toutes les réponses de succès doivent respecter ce format :

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Pour une liste paginée :

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "message": "Data retrieved successfully"
}
```

## 4.2 Réponse d’erreur

Toutes les erreurs doivent respecter ce format :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "phone",
        "message": "phone is required"
      }
    ]
  },
  "timestamp": "2026-05-18T10:30:00.000Z",
  "path": "/public/leads"
}
```

---

# 5. Codes HTTP standards

| Code | Utilisation |
|---|---|
| 200 | Lecture ou action réussie |
| 201 | Création réussie |
| 204 | Suppression ou action sans contenu |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource introuvable |
| 409 | Conflit métier |
| 422 | Validation métier refusée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur non prévue |

---

# 6. Codes d’erreur applicatifs

| Code | Signification |
|---|---|
| VALIDATION_ERROR | Données invalides |
| AUTH_INVALID_CREDENTIALS | Email ou mot de passe incorrect |
| AUTH_UNAUTHORIZED | Utilisateur non authentifié |
| AUTH_FORBIDDEN | Action non autorisée |
| RESOURCE_NOT_FOUND | Ressource introuvable |
| RESOURCE_CONFLICT | Conflit avec une ressource existante |
| CAMPAIGN_INVALID_STATUS | Statut campagne invalide |
| LANDING_PAGE_INVALID_STATUS | Statut landing page invalide |
| LAYOUT_INVALID | Structure JSON de la page invalide |
| ASSET_INVALID_TYPE | Type de fichier non autorisé |
| EXPORT_FAILED | Échec de génération ZIP |
| LEAD_INVALID_PAYLOAD | Données lead invalides |
| LEAD_RATE_LIMITED | Trop de soumissions |
| SYNC_FAILED | Échec de synchronisation lead |

---

# 7. Authentification

## 7.1 Choix retenu

Pour le builder privé, le choix recommandé est :

```text
Session/JWT sécurisé via cookie HTTP-only.
```

Pourquoi :

```text
Évite le stockage du token dans localStorage.
Réduit l’exposition aux attaques XSS.
Adapté à une application privée interne.
Compatible avec React + NestJS.
```

Alternative acceptable en développement :

```text
Bearer token temporaire.
```

Mais pour une version propre, `localStorage` ne doit pas être considéré comme le standard final.

## 7.2 Routes d’authentification

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

# 8. API Auth

## 8.1 Login

```text
POST /api/auth/login
```

### Body

```json
{
  "email": "marketer@autohall.ma",
  "password": "StrongPassword123!"
}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Utilisateur Auto Hall",
      "email": "marketer@autohall.ma",
      "role": "MARKETER"
    }
  },
  "message": "Login successful"
}
```

### Erreurs possibles

```text
400 VALIDATION_ERROR
401 AUTH_INVALID_CREDENTIALS
403 AUTH_FORBIDDEN si compte désactivé
```

---

## 8.2 Logout

```text
POST /api/auth/logout
```

### Réponse 200

```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

---

## 8.3 Utilisateur connecté

```text
GET /api/auth/me
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Utilisateur Auto Hall",
    "email": "marketer@autohall.ma",
    "role": "MARKETER",
    "isActive": true
  },
  "message": "Authenticated user retrieved"
}
```

---

# 9. Rôles et autorisations

## 9.1 Rôles

```text
ADMIN
SI_DIGITAL
MARKETER
VIEWER
```

## 9.2 Matrice des permissions

| Action | ADMIN | SI_DIGITAL | MARKETER | VIEWER |
|---|---:|---:|---:|---:|
| Gérer utilisateurs | Oui | Non | Non | Non |
| Créer campagne | Oui | Oui | Oui | Non |
| Modifier campagne | Oui | Oui | Oui | Non |
| Archiver campagne | Oui | Oui | Non | Non |
| Créer landing page | Oui | Oui | Oui | Non |
| Modifier landing page | Oui | Oui | Oui | Non |
| Exporter ZIP | Oui | Oui | Oui | Non |
| Consulter leads | Oui | Oui | Oui | Oui |
| Voir audit logs | Oui | Oui | Non | Non |
| Modifier rôles | Oui | Non | Non | Non |

Règle :

```text
Les permissions doivent être appliquées côté backend, pas seulement dans React.
```

---

# 10. API Users

## 10.1 Lister les utilisateurs

```text
GET /api/users?page=1&limit=20&role=MARKETER&search=yasser
```

### Accès

```text
ADMIN uniquement
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Yasser Sidane",
      "email": "yasser.sidane@autohall.ma",
      "role": "MARKETER",
      "isActive": true,
      "createdAt": "2026-05-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "message": "Users retrieved successfully"
}
```

---

## 10.2 Créer un utilisateur

```text
POST /api/users
```

### Accès

```text
ADMIN uniquement
```

### Body

```json
{
  "fullName": "Yasser Sidane",
  "email": "yasser.sidane@autohall.ma",
  "password": "StrongPassword123!",
  "role": "MARKETER"
}
```

### Réponse 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Yasser Sidane",
    "email": "yasser.sidane@autohall.ma",
    "role": "MARKETER",
    "isActive": true
  },
  "message": "User created successfully"
}
```

### Erreurs possibles

```text
400 VALIDATION_ERROR
409 RESOURCE_CONFLICT si email déjà utilisé
```

---

## 10.3 Désactiver un utilisateur

```text
PATCH /api/users/{id}/deactivate
```

### Accès

```text
ADMIN uniquement
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isActive": false
  },
  "message": "User deactivated successfully"
}
```

---

# 11. API Campaigns

## 11.1 Lister les campagnes

```text
GET /api/campaigns?page=1&limit=20&status=ACTIVE&brand=Ford&search=promo
```

### Accès

```text
ADMIN
SI_DIGITAL
MARKETER
VIEWER
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Promo Ford Mai 2026",
      "brand": "Ford",
      "model": "Ranger",
      "campaignType": "OFFER_REQUEST",
      "status": "ACTIVE",
      "startDate": "2026-05-01",
      "endDate": "2026-05-31",
      "createdAt": "2026-05-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "message": "Campaigns retrieved successfully"
}
```

---

## 11.2 Créer une campagne

```text
POST /api/campaigns
```

### Accès

```text
ADMIN
SI_DIGITAL
MARKETER
```

### Body

```json
{
  "name": "Promo Ford Mai 2026",
  "brand": "Ford",
  "model": "Ranger",
  "campaignType": "OFFER_REQUEST",
  "description": "Campagne promotionnelle Ford",
  "startDate": "2026-05-01",
  "endDate": "2026-05-31"
}
```

### Réponse 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Promo Ford Mai 2026",
    "brand": "Ford",
    "model": "Ranger",
    "campaignType": "OFFER_REQUEST",
    "status": "DRAFT"
  },
  "message": "Campaign created successfully"
}
```

---

## 11.3 Lire une campagne

```text
GET /api/campaigns/{id}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Promo Ford Mai 2026",
    "brand": "Ford",
    "model": "Ranger",
    "campaignType": "OFFER_REQUEST",
    "description": "Campagne promotionnelle Ford",
    "status": "DRAFT",
    "startDate": "2026-05-01",
    "endDate": "2026-05-31",
    "createdBy": {
      "id": "uuid",
      "fullName": "Yasser Sidane"
    }
  },
  "message": "Campaign retrieved successfully"
}
```

---

## 11.4 Modifier une campagne

```text
PATCH /api/campaigns/{id}
```

### Body

```json
{
  "name": "Promo Ford Juin 2026",
  "description": "Mise à jour de la campagne",
  "status": "ACTIVE"
}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Promo Ford Juin 2026",
    "status": "ACTIVE"
  },
  "message": "Campaign updated successfully"
}
```

---

## 11.5 Archiver une campagne

```text
PATCH /api/campaigns/{id}/archive
```

### Accès

```text
ADMIN
SI_DIGITAL
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ARCHIVED"
  },
  "message": "Campaign archived successfully"
}
```

---

# 12. API Landing Pages

## 12.1 Lister les landing pages

```text
GET /api/landing-pages?page=1&limit=20&campaignId=uuid&status=DRAFT
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "campaignId": "uuid",
      "title": "Landing Ford Ranger",
      "slug": "landing-ford-ranger",
      "status": "DRAFT",
      "lastExportedAt": null,
      "createdAt": "2026-05-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "message": "Landing pages retrieved successfully"
}
```

---

## 12.2 Créer une landing page

```text
POST /api/landing-pages
```

### Body

```json
{
  "campaignId": "uuid",
  "title": "Landing Ford Ranger",
  "slug": "landing-ford-ranger"
}
```

### Réponse 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campaignId": "uuid",
    "title": "Landing Ford Ranger",
    "slug": "landing-ford-ranger",
    "status": "DRAFT",
    "layoutJson": {
      "version": "1.0",
      "page": {
        "title": "Landing Ford Ranger",
        "language": "fr"
      },
      "blocks": []
    }
  },
  "message": "Landing page created successfully"
}
```

---

## 12.3 Lire une landing page

```text
GET /api/landing-pages/{id}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campaignId": "uuid",
    "title": "Landing Ford Ranger",
    "slug": "landing-ford-ranger",
    "status": "DRAFT",
    "layoutJson": {
      "version": "1.0",
      "page": {
        "title": "Landing Ford Ranger",
        "language": "fr"
      },
      "blocks": []
    },
    "createdAt": "2026-05-18T10:30:00.000Z",
    "updatedAt": "2026-05-18T10:30:00.000Z"
  },
  "message": "Landing page retrieved successfully"
}
```

---

## 12.4 Sauvegarder le layout

```text
PUT /api/landing-pages/{id}/layout
```

### Body

```json
{
  "layoutJson": {
    "version": "1.0",
    "page": {
      "title": "Promo Auto Hall",
      "language": "fr",
      "theme": {
        "primaryColor": "#003B73",
        "fontFamily": "Inter"
      }
    },
    "blocks": [
      {
        "id": "block_hero_001",
        "type": "hero",
        "order": 1,
        "props": {
          "title": "Promo exclusive Auto Hall",
          "subtitle": "Découvrez nos offres",
          "buttonText": "Je suis intéressé",
          "buttonTarget": "#lead-form"
        }
      }
    ],
    "form": {
      "enabled": true,
      "requestType": "TEST_DRIVE",
      "fields": ["full_name", "phone", "email", "city"]
    }
  }
}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DRAFT",
    "updatedAt": "2026-05-18T10:30:00.000Z"
  },
  "message": "Landing page layout saved successfully"
}
```

### Erreurs possibles

```text
400 VALIDATION_ERROR
422 LAYOUT_INVALID
404 RESOURCE_NOT_FOUND
```

---

## 12.5 Changer le statut d’une landing page

```text
PATCH /api/landing-pages/{id}/status
```

### Body

```json
{
  "status": "READY"
}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "READY"
  },
  "message": "Landing page status updated successfully"
}
```

---

# 13. API Assets

## 13.1 Upload d’un asset

```text
POST /api/landing-pages/{id}/assets
Content-Type: multipart/form-data
```

### Accès

```text
ADMIN
SI_DIGITAL
MARKETER
```

### Form-data

```text
file: image.jpg
altText: Image promotionnelle Ford
```

### Réponse 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "landingPageId": "uuid",
    "originalName": "image.jpg",
    "storedName": "asset_uuid.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 204800,
    "publicPath": "assets/images/asset_uuid.jpg",
    "altText": "Image promotionnelle Ford"
  },
  "message": "Asset uploaded successfully"
}
```

### Contraintes

```text
Taille maximale recommandée : 5 MB par fichier image.
Extensions autorisées : jpg, jpeg, png, webp, svg contrôlé.
Extensions interdites : php, exe, sh, bat, env, sql.
```

---

## 13.2 Lister les assets d’une page

```text
GET /api/landing-pages/{id}/assets
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "originalName": "image.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 204800,
      "publicPath": "assets/images/asset_uuid.jpg",
      "altText": "Image promotionnelle Ford"
    }
  ],
  "message": "Assets retrieved successfully"
}
```

---

## 13.3 Supprimer un asset

```text
DELETE /api/assets/{id}
```

### Réponse 204

```text
No content
```

Règle :

```text
Un asset utilisé dans layout_json ne doit pas être supprimé sans validation.
```

---

# 14. API Export ZIP

## 14.1 Générer un export ZIP

```text
POST /api/landing-pages/{id}/export
```

### Accès

```text
ADMIN
SI_DIGITAL
MARKETER
```

### Body

```json
{
  "targetEnvironment": "CPANEL",
  "publicBaseUrl": "https://offre-ford.autohall.ma"
}
```

### Réponse 201

```json
{
  "success": true,
  "data": {
    "exportId": "uuid",
    "landingPageId": "uuid",
    "zipFilename": "landing-ford-ranger.zip",
    "downloadUrl": "/api/exports/uuid/download",
    "checksum": "sha256-checksum",
    "createdAt": "2026-05-18T10:30:00.000Z"
  },
  "message": "Export generated successfully"
}
```

### Critères de validation avant export

```text
La landing page existe.
Le layout_json est valide.
La page contient au moins un bloc.
Les assets référencés existent.
Le formulaire est correctement configuré si activé.
Aucun secret n’est inclus.
```

---

## 14.2 Télécharger un export ZIP

```text
GET /api/exports/{id}/download
```

### Réponse 200

```text
Content-Type: application/zip
Content-Disposition: attachment; filename="landing-ford-ranger.zip"
```

---

## 14.3 Lister les exports d’une landing page

```text
GET /api/landing-pages/{id}/exports
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "zipFilename": "landing-ford-ranger.zip",
      "status": "SUCCESS",
      "checksum": "sha256-checksum",
      "createdAt": "2026-05-18T10:30:00.000Z"
    }
  ],
  "message": "Exports retrieved successfully"
}
```

---

# 15. API publique de collecte des leads

## 15.1 Route publique

```text
POST /public/leads
```

Cette route est appelée par les landing pages exportées sur cPanel.

Elle est publique, mais elle doit être contrôlée.

## 15.2 Body attendu

```json
{
  "campaignId": "uuid",
  "landingPageId": "uuid",
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
    "utmCampaign": "promo-mai-2026"
  }
}
```

## 15.3 Champs obligatoires

```text
campaignId
landingPageId
fullName
phone
requestType
sourceUrl
```

## 15.4 Réponse 201

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

## 15.5 Erreurs possibles

```text
400 VALIDATION_ERROR
404 RESOURCE_NOT_FOUND si campaignId ou landingPageId inexistant
422 LEAD_INVALID_PAYLOAD
429 LEAD_RATE_LIMITED
500 Erreur serveur
```

## 15.6 Règles de sécurité

```text
Activer rate limiting.
Valider tous les champs.
Nettoyer les chaînes de caractères.
Ne jamais retourner d’erreur SQL.
Ne jamais exposer le schéma interne.
Ne jamais accepter un payload illimité.
Conserver raw_payload pour traçabilité.
```

## 15.7 Réponse en cas d’erreur

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
  },
  "timestamp": "2026-05-18T10:30:00.000Z",
  "path": "/public/leads"
}
```

---

# 16. API Leads Dashboard

Ces routes sont privées. Elles servent à consulter les leads reçus dans le dashboard simulé.

## 16.1 Lister les leads

```text
GET /api/leads?page=1&limit=20&campaignId=uuid&status=SYNCED&requestType=TEST_DRIVE
```

### Accès

```text
ADMIN
SI_DIGITAL
MARKETER
VIEWER
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Client Exemple",
      "phone": "0600000000",
      "email": "client@example.com",
      "city": "Casablanca",
      "brand": "Ford",
      "model": "Ranger",
      "requestType": "TEST_DRIVE",
      "status": "SYNCED",
      "syncDestination": "simulated_testdrive",
      "createdAt": "2026-05-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "message": "Leads retrieved successfully"
}
```

---

## 16.2 Lire le détail d’un lead

```text
GET /api/leads/{id}
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campaignId": "uuid",
    "landingPageId": "uuid",
    "fullName": "Client Exemple",
    "phone": "0600000000",
    "email": "client@example.com",
    "city": "Casablanca",
    "brand": "Ford",
    "model": "Ranger",
    "requestType": "TEST_DRIVE",
    "message": "Je souhaite être contacté.",
    "sourceUrl": "https://offre-ford.autohall.ma",
    "rawPayload": {
      "fullName": "Client Exemple",
      "phone": "0600000000"
    },
    "status": "SYNCED",
    "syncDestination": "simulated_testdrive",
    "syncError": null,
    "syncedAt": "2026-05-18T10:31:00.000Z",
    "createdAt": "2026-05-18T10:30:00.000Z"
  },
  "message": "Lead retrieved successfully"
}
```

---

## 16.3 Relancer une synchronisation échouée

```text
POST /api/leads/{id}/retry-sync
```

### Accès

```text
ADMIN
SI_DIGITAL
```

### Réponse 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING_RETRY"
  },
  "message": "Lead sync retry scheduled"
}
```

---

# 17. API Audit Logs

## 17.1 Lister les logs d’audit

```text
GET /api/audit-logs?page=1&limit=50&action=LANDING_PAGE_EXPORTED
```

### Accès

```text
ADMIN
SI_DIGITAL
```

### Réponse 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "LANDING_PAGE_EXPORTED",
      "entityType": "landing_page",
      "entityId": "uuid",
      "metadata": {
        "zipFilename": "landing-ford-ranger.zip"
      },
      "createdAt": "2026-05-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  },
  "message": "Audit logs retrieved successfully"
}
```

---

# 18. Validation des DTO

## 18.1 Règles générales

Tous les DTO doivent être validés côté backend.

```text
Pas de validation uniquement côté frontend.
Pas de champ libre sans limite.
Pas de payload JSON illimité.
Pas d’ID accepté sans vérification d’existence.
```

## 18.2 Règles exemples

| Champ | Règle |
|---|---|
| email | Format email valide |
| phone | Non vide, longueur contrôlée |
| fullName | Non vide, max 180 caractères |
| slug | Lettres minuscules, chiffres, tirets |
| status | Valeur dans enum autorisé |
| role | Valeur dans enum autorisé |
| layoutJson | Structure validée |
| file | Type et taille contrôlés |

---

# 19. Pagination et filtres

## 19.1 Paramètres standards

```text
page
limit
search
status
sortBy
sortOrder
```

## 19.2 Valeurs par défaut

```text
page = 1
limit = 20
sortOrder = desc
```

## 19.3 Limite maximale

```text
limit maximum = 100
```

Règle :

```text
Aucune liste ne doit retourner un nombre illimité de lignes.
```

---

# 20. CORS

## 20.1 API privée

L’API privée doit accepter uniquement le frontend builder.

Exemple local :

```text
http://localhost:5173
```

Exemple cible :

```text
https://builder.local.autohall.ma
```

## 20.2 API publique

La route `/public/leads` peut être appelée par les domaines de campagnes autorisés.

Exemples :

```text
https://offresav.myautohall.ma
https://offre-ford.autohall.ma
https://campagne-chery.autohall.ma
```

Règle :

```text
Ne pas ouvrir CORS à * en production.
```

---

# 21. Rate limiting

La route la plus exposée est :

```text
POST /public/leads
```

Recommandation MVP :

```text
Limiter par IP.
Limiter par sourceUrl.
Limiter par landingPageId.
```

Exemple de politique :

```text
5 soumissions par minute par IP.
30 soumissions par heure par IP.
```

Le but n’est pas de bloquer les vrais clients, mais d’éviter le spam basique.

---

# 22. Logs techniques

Le backend doit journaliser :

```text
Connexion réussie.
Connexion échouée.
Création campagne.
Modification landing page.
Génération export ZIP.
Réception lead.
Échec validation lead.
Échec synchronisation lead.
Relance synchronisation.
```

Les logs ne doivent jamais contenir :

```text
Mot de passe.
Token.
Secret.
Connexion SQL.
Payload sensible inutile.
```

---

# 23. Contrat minimal du fichier `js/config.js` exporté

Chaque ZIP doit contenir un fichier `js/config.js`.

Exemple :

```javascript
window.LANDING_CONFIG = {
  campaignId: "uuid",
  landingPageId: "uuid",
  leadEndpoint: "https://api-builder.local.autohall.ma/public/leads",
  sourceUrl: "https://offre-ford.autohall.ma",
  requestType: "TEST_DRIVE"
};
```

Règle :

```text
Ce fichier peut contenir des identifiants publics de campagne/page.
Il ne doit jamais contenir de secret.
```

---

# 24. Contrat minimal du script `js/lead-form.js`

Le script exporté doit :

```text
Lire les champs du formulaire.
Lire window.LANDING_CONFIG.
Construire le payload.
Envoyer POST /public/leads.
Afficher un message de succès.
Afficher un message d’erreur simple.
Empêcher les doubles clics pendant l’envoi.
```

Il ne doit pas :

```text
Contenir une connexion SQL.
Contenir un token privé.
Masquer les erreurs serveur dans la console uniquement.
Faire confiance aux validations frontend.
```

---

# 25. Workflow API complet

```text
1. Utilisateur se connecte
   POST /api/auth/login

2. Utilisateur crée une campagne
   POST /api/campaigns

3. Utilisateur crée une landing page
   POST /api/landing-pages

4. Utilisateur sauvegarde le layout
   PUT /api/landing-pages/{id}/layout

5. Utilisateur upload des assets
   POST /api/landing-pages/{id}/assets

6. Utilisateur génère un ZIP
   POST /api/landing-pages/{id}/export

7. Utilisateur télécharge le ZIP
   GET /api/exports/{id}/download

8. ZIP déployé manuellement sur cPanel

9. Visiteur remplit le formulaire public
   POST /public/leads

10. Lead enregistré dans lead_events

11. Lead synchronisé vers simulated_testdrive ou simulated_contacts

12. Marketeur consulte le dashboard
   GET /api/leads
```

---

# 26. Tests d’acceptation API

## 26.1 Auth

```text
Login avec identifiants valides : succès.
Login avec mauvais mot de passe : 401.
Accès route privée sans session : 401.
Accès action ADMIN avec rôle MARKETER : 403.
```

## 26.2 Campagnes

```text
Créer campagne valide : succès.
Créer campagne sans marque : erreur validation.
Archiver campagne avec rôle non autorisé : 403.
```

## 26.3 Landing pages

```text
Créer landing page valide : succès.
Créer landing page sans campagne : erreur.
Sauvegarder layout valide : succès.
Sauvegarder layout invalide : 422.
```

## 26.4 Export

```text
Exporter page valide : ZIP généré.
Exporter page avec asset manquant : erreur.
Télécharger export existant : succès.
Télécharger export inexistant : 404.
```

## 26.5 Leads publics

```text
Soumettre lead valide : lead_events créé.
Soumettre lead sans téléphone : erreur.
Soumettre trop de leads : 429.
Soumettre depuis domaine non autorisé : refus CORS.
```

---

# 27. Risques API à éviter

| Risque | Conséquence |
|---|---|
| Mélanger routes privées et publiques | Surface d’attaque plus grande |
| Ouvrir CORS à tous les domaines | Risque de spam et abus |
| Retourner des erreurs SQL | Fuite d’information |
| Stocker le token dans localStorage | Exposition XSS |
| Ne pas valider layout_json | Export cassé |
| Ne pas limiter /public/leads | Spam massif |
| Ne pas paginer les listes | Performance dégradée |
| Laisser le frontend gérer seul les permissions | Faille critique |
| Mettre un secret dans config.js | Fuite publique immédiate |

---

# 28. Conclusion

Ce contrat API fixe la structure minimale nécessaire pour développer proprement le MVP.

La priorité n’est pas d’avoir beaucoup de routes. La priorité est d’avoir des routes stables, validées, sécurisées et cohérentes avec le workflow cible :

```text
Builder privé
→ API privée sécurisée
→ Export ZIP
→ Landing page cPanel
→ API publique contrôlée
→ lead_events
→ Simulation testdrive / contacts
→ Dashboard leads
```

La règle d’architecture reste non négociable :

```text
Une landing page publique ne doit jamais accéder directement à une base de données.
Elle doit passer par /public/leads.
```
