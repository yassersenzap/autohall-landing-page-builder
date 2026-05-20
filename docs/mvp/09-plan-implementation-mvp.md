# 09 — Plan d’implémentation technique MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de préparation avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit l’ordre d’implémentation du MVP.

Il sert à éviter une erreur classique :

```text
Commencer par coder l’interface du builder sans avoir verrouillé le socle backend,
le modèle de données, la sécurité, l’export ZIP et le workflow des leads.
```

Le projet doit être développé par couches stables :

```text
Infrastructure
→ Backend core
→ Authentification et rôles
→ Modèle métier
→ Builder React
→ Export ZIP
→ Collecte des leads
→ Dashboard simulé
→ Tests et stabilisation
```

Règle critique :

```text
On ne code pas un builder visuel avant d’avoir une base backend propre.
```

---

# 2. Périmètre du MVP

Le MVP doit prouver le workflow complet :

```text
1. Un utilisateur Auto Hall se connecte au builder.
2. Il crée une campagne.
3. Il crée une landing page.
4. Il compose la page avec des blocs contrôlés.
5. Il configure un formulaire de lead.
6. Il prévisualise la page.
7. Il génère un ZIP compatible cPanel.
8. Il déploie la page exportée.
9. Un visiteur soumet un formulaire.
10. Le lead arrive dans /public/leads.
11. Le lead est stocké dans lead_events.
12. Le lead est synchronisé vers une table simulée.
13. Le marketeur consulte le lead dans un dashboard simulé.
```

Tout ce qui ne sert pas ce workflow est secondaire.

---

# 3. Fonctionnalités incluses MVP

## 3.1 Authentification

```text
Connexion utilisateur.
Déconnexion.
Protection des routes privées.
Rôles : ADMIN, SI_DIGITAL, MARKETER, VIEWER.
```

## 3.2 Gestion des campagnes

```text
Créer une campagne.
Lister les campagnes.
Modifier une campagne.
Changer le statut d’une campagne.
```

## 3.3 Gestion des landing pages

```text
Créer une landing page.
Modifier les métadonnées.
Sauvegarder layout_json.
Prévisualiser la page.
```

## 3.4 Builder visuel

```text
Ajouter un bloc.
Supprimer un bloc.
Réordonner les blocs.
Sélectionner un bloc.
Modifier les propriétés dans un panneau d’inspection.
Prévisualiser desktop/tablet/mobile.
```

Blocs MVP :

```text
hero
text
image
button
form
features
cards
faq
spacer
```

## 3.5 Assets

```text
Uploader une image.
Lister les assets.
Sélectionner une image dans un bloc.
Copier les assets dans l’export ZIP.
```

## 3.6 Export ZIP

```text
Générer index.html.
Générer css/styles.css.
Générer js/config.js.
Générer js/lead-form.js.
Inclure les assets.
Inclure README_DEPLOYMENT.txt.
Télécharger le ZIP.
Historiser l’export.
```

## 3.7 Collecte des leads

```text
POST /public/leads.
Validation du payload.
Stockage dans lead_events.
Synchronisation vers simulated_testdrive ou simulated_contacts.
Statut de synchronisation.
```

## 3.8 Dashboard simulé

```text
Lister les leads.
Filtrer par campagne.
Filtrer par type de demande.
Voir le détail d’un lead.
Voir le statut de synchronisation.
```

---

# 4. Fonctionnalités hors MVP

Ces éléments ne doivent pas bloquer le développement initial :

```text
Drag-and-drop très avancé façon Framer complet.
Éditeur HTML libre.
Éditeur CSS libre.
Animations avancées.
A/B testing.
Workflow de validation multi-niveaux.
Publication automatique vers cPanel.
Connexion directe aux vraies tables Auto Hall.
SSO entreprise.
CAPTCHA avancé.
Analytics marketing complet.
IA de génération de contenu.
```

Règle :

```text
Un MVP industriel n’est pas un produit incomplet.
C’est un périmètre réduit mais propre, sécurisé et démontrable de bout en bout.
```

---

# 5. Ordre correct de développement

L’ordre recommandé est le suivant :

```text
Phase 0 — Initialisation projet
Phase 1 — Infrastructure Docker
Phase 2 — Backend NestJS core
Phase 3 — Base PostgreSQL et migrations
Phase 4 — Authentification et RBAC
Phase 5 — Modules métier backend
Phase 6 — Frontend React shell
Phase 7 — Builder visuel MVP
Phase 8 — Export ZIP
Phase 9 — API publique leads
Phase 10 — Dashboard leads simulé
Phase 11 — Tests, logs et stabilisation
Phase 12 — Démo end-to-end
```

Ne pas inverser cet ordre.

Coder le builder avant l’export et les blocs JSON est une dette technique directe.

---

# 6. Phase 0 — Initialisation projet

## 6.1 Objectif

Créer une base de projet propre.

## 6.2 Livrables

```text
Repository Git initialisé.
Arborescence claire.
README principal.
Dossiers docs/ conservés.
Backend NestJS créé.
Frontend React créé.
Docker préparé.
.env.example préparé.
.gitignore correct.
```

## 6.3 Structure recommandée

```text
autohall-landing-builder/
│
├── docs/
│   ├── 01-cadrage.md
│   ├── 02-backlog.md
│   ├── 03-modele-donnees.md
│   ├── 04-contrats-api.md
│   ├── 05-blocks-model.md
│   ├── 06-specification-export-zip.md
│   ├── 07-workflow-leads.md
│   ├── 08-securite-acces-conformite.md
│   └── 09-plan-implementation-mvp.md
│
├── backend/
│   └── NestJS
│
├── frontend/
│   └── React
│
├── docker/
│   ├── postgres/
│   └── nginx/
│
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

## 6.4 Critères d’acceptation

```text
Le projet démarre localement.
Le backend démarre.
Le frontend démarre.
PostgreSQL démarre via Docker.
Aucun secret n’est commité.
```

---

# 7. Phase 1 — Infrastructure Docker

## 7.1 Objectif

Préparer un environnement reproductible.

## 7.2 Services Docker MVP

```text
postgres
backend
frontend
```

Optionnel :

```text
pgadmin uniquement en local si nécessaire
nginx reverse proxy si besoin
```

## 7.3 Règles

```text
PostgreSQL ne doit pas être exposé publiquement.
Le backend communique avec PostgreSQL via réseau Docker.
Les variables sensibles passent par .env.
Les versions des images doivent être fixées.
```

## 7.4 Critères d’acceptation

```text
docker compose up lance les services.
Le backend se connecte à PostgreSQL.
Le frontend appelle le backend.
Les volumes PostgreSQL persistent les données.
```

---

# 8. Phase 2 — Backend NestJS core

## 8.1 Objectif

Créer une architecture backend modulaire.

## 8.2 Modules à créer

```text
AuthModule
UsersModule
CampaignsModule
LandingPagesModule
AssetsModule
ExportsModule
LeadsModule
SyncModule
CommonModule
```

## 8.3 Structure backend recommandée

```text
backend/src/
│
├── main.ts
├── app.module.ts
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   └── utils/
│
├── auth/
├── users/
├── campaigns/
├── landing-pages/
├── assets/
├── exports/
├── leads/
└── sync/
```

## 8.4 Standards obligatoires

```text
DTO pour chaque payload.
ValidationPipe global.
Gestion d’erreurs centralisée.
Logs structurés.
Pas de logique métier dans les contrôleurs.
Services séparés.
Pas de requêtes SQL brutes non contrôlées.
```

---

# 9. Phase 3 — Base PostgreSQL et migrations

## 9.1 Objectif

Créer le modèle de données stable.

## 9.2 Tables MVP

```text
users
campaigns
landing_pages
assets
exports
lead_events
simulated_testdrive
simulated_contacts
audit_logs
```

## 9.3 Règles

```text
Toutes les tables ont un id UUID.
Toutes les tables critiques ont created_at et updated_at.
Les suppressions sensibles doivent être soft delete si nécessaire.
layout_json doit être stocké en jsonb.
raw_payload et metadata doivent être stockés en jsonb.
```

## 9.4 Critères d’acceptation

```text
Les migrations créent toutes les tables.
Les relations principales fonctionnent.
Les contraintes empêchent les données incohérentes.
Un seed crée un utilisateur admin de test.
```

---

# 10. Phase 4 — Authentification et RBAC

## 10.1 Objectif

Protéger le builder privé.

## 10.2 Tâches

```text
Créer login.
Hasher les mots de passe.
Générer JWT.
Créer JwtAuthGuard.
Créer RolesGuard.
Créer décorateur @Roles.
Créer décorateur @CurrentUser.
Protéger les routes privées.
```

## 10.3 Critères d’acceptation

```text
Un utilisateur non connecté ne peut pas accéder aux routes privées.
Un rôle insuffisant reçoit 403.
Un utilisateur connecté peut accéder aux modules autorisés.
```

---

# 11. Phase 5 — Modules métier backend

## 11.1 CampaignsModule

Fonctions :

```text
Créer campagne.
Lister campagnes.
Voir détail campagne.
Modifier campagne.
Changer statut.
```

## 11.2 LandingPagesModule

Fonctions :

```text
Créer landing page.
Lister par campagne.
Voir détail.
Modifier métadonnées.
Sauvegarder layout_json.
Valider layout_json.
```

## 11.3 AssetsModule

Fonctions :

```text
Uploader fichier.
Valider extension.
Renommer fichier.
Lister assets.
Associer à campagne ou landing page.
```

## 11.4 ExportsModule

Fonctions :

```text
Valider landing page.
Générer fichiers statiques.
Créer ZIP.
Calculer checksum.
Historiser export.
Télécharger ZIP.
```

## 11.5 LeadsModule

Fonctions :

```text
Recevoir lead public.
Valider payload.
Stocker lead_events.
Lister leads.
Voir détail lead.
```

## 11.6 SyncModule

Fonctions :

```text
Mapper lead vers destination.
Synchroniser vers simulated_testdrive.
Synchroniser vers simulated_contacts.
Gérer erreurs.
Relancer synchronisation.
```

---

# 12. Phase 6 — Frontend React shell

## 12.1 Objectif

Créer l’interface privée de base.

## 12.2 Pages MVP

```text
/login
/dashboard
/campaigns
/campaigns/:id
/landing-pages/:id/builder
/exports
/leads
/settings
```

## 12.3 Structure frontend recommandée

```text
frontend/src/
│
├── app/
│   ├── router.jsx
│   └── providers.jsx
│
├── api/
│   ├── httpClient.js
│   ├── authApi.js
│   ├── campaignsApi.js
│   ├── landingPagesApi.js
│   ├── exportsApi.js
│   └── leadsApi.js
│
├── components/
│   ├── layout/
│   ├── ui/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── campaigns/
│   ├── landing-pages/
│   ├── builder/
│   ├── exports/
│   └── leads/
│
└── main.jsx
```

## 12.4 Critères d’acceptation

```text
L’utilisateur peut se connecter.
Les routes privées sont protégées.
Le layout interne est stable.
Les appels API sont centralisés.
Les erreurs API sont affichées proprement.
```

---

# 13. Phase 7 — Builder visuel MVP

## 13.1 Objectif

Créer un éditeur visuel fonctionnel, pas un clone complet de Framer.

## 13.2 Composants principaux

```text
BuilderPage
BuilderCanvas
BlockRenderer
Toolbox
InspectorPanel
ResponsivePreviewToolbar
SaveBar
```

## 13.3 Actions MVP

```text
Ajouter bloc.
Sélectionner bloc.
Modifier props.
Supprimer bloc.
Monter / descendre bloc.
Sauvegarder layout_json.
Prévisualiser desktop/tablet/mobile.
```

## 13.4 Règle critique

```text
Le builder manipule uniquement un JSON contrôlé.
Il ne manipule pas du HTML libre.
```

## 13.5 Critères d’acceptation

```text
Une page peut être composée avec plusieurs blocs.
Les modifications sont sauvegardées.
Le rendu preview correspond à la structure JSON.
Le formulaire peut être configuré.
```

---

# 14. Phase 8 — Export ZIP

## 14.1 Objectif

Générer une landing page statique déployable sur cPanel.

## 14.2 Tâches

```text
Créer ExportService.
Créer HtmlRenderer.
Créer CssRenderer.
Créer ConfigRenderer.
Créer LeadFormScriptRenderer.
Créer ZipService.
Créer ExportValidator.
```

## 14.3 Fichiers générés

```text
index.html
css/styles.css
js/config.js
js/lead-form.js
assets/
README_DEPLOYMENT.txt
```

## 14.4 Critères d’acceptation

```text
Le ZIP est généré.
Le ZIP s’ouvre localement.
Le rendu est correct.
Aucun secret n’est présent.
Les assets sont chargés.
Le formulaire pointe vers /public/leads.
```

---

# 15. Phase 9 — API publique leads

## 15.1 Objectif

Recevoir les leads depuis les landing pages déployées.

## 15.2 Tâches

```text
Créer endpoint POST /public/leads.
Créer PublicLeadDto.
Valider les champs.
Ajouter rate limiting.
Ajouter CORS contrôlé.
Stocker dans lead_events.
Appeler SyncService.
Retourner réponse propre.
```

## 15.3 Critères d’acceptation

```text
Un lead valide est accepté.
Un lead invalide est refusé.
Un spam basique est limité.
Un lead est visible en base.
Une erreur de sync ne supprime pas le lead.
```

---

# 16. Phase 10 — Dashboard leads simulé

## 16.1 Objectif

Démontrer la consultation des leads côté marketing.

## 16.2 Fonctionnalités

```text
Table des leads.
Filtres.
Détail lead.
Statut sync.
Destination sync.
Relance sync pour SI_DIGITAL/Admin.
```

## 16.3 Critères d’acceptation

```text
Un lead soumis depuis une landing page exportée est visible.
Le marketeur peut filtrer les leads par campagne.
SI_DIGITAL peut voir les erreurs de synchronisation.
```

---

# 17. Phase 11 — Tests et stabilisation

## 17.1 Tests backend

```text
Tests unitaires services.
Tests validation DTO.
Tests guards RBAC.
Tests export ZIP.
Tests lead workflow.
```

## 17.2 Tests frontend

```text
Rendu login.
Protection routes.
Création campagne.
Builder blocs.
Sauvegarde layout_json.
Affichage leads.
```

## 17.3 Tests end-to-end manuels

```text
Créer campagne.
Créer landing page.
Ajouter blocs.
Exporter ZIP.
Déployer/tester index.html.
Soumettre lead.
Voir lead dans dashboard.
```

---

# 18. Phase 12 — Démo end-to-end

## 18.1 Scénario de démonstration

```text
1. Connexion en tant que marketeur.
2. Création d’une campagne Ford.
3. Création d’une landing page.
4. Ajout d’un hero, features et formulaire.
5. Prévisualisation mobile.
6. Export ZIP.
7. Déploiement local ou cPanel test.
8. Soumission d’un lead.
9. Consultation du lead dans dashboard.
10. Vérification dans lead_events et simulated_contacts/testdrive.
```

## 18.2 Critère de réussite

```text
Le workflow complet fonctionne sans intervention manuelle dans le code exporté.
```

---

# 19. Définition of Done technique

Une fonctionnalité est terminée seulement si :

```text
Le code est propre.
Les DTO sont validés.
Les erreurs sont gérées.
Les permissions sont appliquées.
Les logs utiles existent.
Les tests minimaux passent.
La documentation est à jour.
Aucun secret n’est exposé.
L’interface affiche les erreurs proprement.
```

Si une fonctionnalité marche uniquement dans le cas parfait, elle n’est pas terminée.

---

# 20. Règles de qualité de code

## 20.1 Backend

```text
Contrôleurs minces.
Services métier séparés.
DTO systématiques.
Pas de logique SQL dans les contrôleurs.
Exceptions contrôlées.
Modules cohérents.
Tests sur services critiques.
```

## 20.2 Frontend

```text
Composants courts.
API centralisée.
État builder structuré.
Pas de duplication de logique de blocs.
Pas de HTML libre.
Gestion propre loading/error/empty state.
```

## 20.3 Base de données

```text
Migrations versionnées.
Relations explicites.
Contraintes utiles.
Indexes sur les champs filtrés.
Pas de champ fourre-tout sauf jsonb justifié.
```

---

# 21. Branches Git recommandées

Pour rester propre :

```text
main
develop
feature/auth-rbac
feature/campaigns
feature/landing-pages
feature/builder-mvp
feature/export-zip
feature/public-leads
feature/leads-dashboard
```

Règle :

```text
Chaque grosse fonctionnalité doit être développée sur une branche dédiée.
```

---

# 22. Commits recommandés

Format simple :

```text
feat(auth): add login endpoint
feat(builder): add hero block renderer
fix(export): correct asset relative paths
docs(api): update public leads contract
test(leads): add invalid payload tests
```

Éviter :

```text
update
fix
test
final version
modif
```

---

# 23. Variables d’environnement à préparer

## 23.1 Backend

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ALLOWED_ORIGINS
PUBLIC_LEAD_RATE_LIMIT
EXPORT_STORAGE_PATH
ASSETS_STORAGE_PATH
```

## 23.2 Frontend

```text
VITE_API_BASE_URL
VITE_APP_NAME
```

## 23.3 PostgreSQL

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
```

Règle :

```text
.env réel ignoré par Git.
.env.example versionné sans secrets.
```

---

# 24. Priorités absolues

Les priorités techniques sont :

```text
1. Sécurité.
2. Workflow complet des leads.
3. Export ZIP fiable.
4. Modèle de blocs contrôlé.
5. Simplicité de déploiement.
6. Dashboard marketing exploitable.
7. Design propre mais pas décoratif inutile.
```

Un builder visuellement impressionnant mais incapable de collecter proprement les leads est un échec.

---

# 25. Pièges à éviter

| Piège | Conséquence |
|---|---|
| Commencer par UI builder avancée | Dette énorme |
| Stocker HTML libre | XSS et export fragile |
| Oublier lead_events | Perte de leads |
| Exporter React dans ZIP | Page lourde et inutile |
| CORS ouvert à tous | Abus API |
| Pas de RBAC | Accès non maîtrisé |
| Pas de migrations | Base non reproductible |
| Pas de tests export | ZIP inutilisable sur cPanel |
| Connexion directe cPanel → DB | Faille critique |
| Nouveau dashboard réel trop tôt | Duplication inutile |

---

# 26. Livrable attendu avant premier sprint de code

Avant de coder, le dossier projet doit contenir :

```text
docs/01-cadrage.md
docs/02-backlog.md
docs/03-modele-donnees.md
docs/04-contrats-api.md
docs/05-blocks-model.md
docs/06-specification-export-zip.md
docs/07-workflow-leads.md
docs/08-securite-acces-conformite.md
docs/09-plan-implementation-mvp.md
README.md
.env.example
docker-compose.yml initial
```

Ensuite seulement, le code final peut commencer.

---

# 27. Prochaine étape après ce document

La prochaine étape logique est :

```text
10 — Stratégie de tests et recette MVP
```

Ce document devra définir :

```text
Les tests unitaires.
Les tests d’intégration.
Les tests manuels.
Les cas de recette.
Le scénario de démonstration.
La checklist avant livraison.
```

---

# 28. Conclusion

Le développement doit être séquencé de manière stricte.

La bonne stratégie n’est pas de coder vite le builder visuel. La bonne stratégie est de construire une chaîne fiable :

```text
Données propres
→ API propre
→ Sécurité propre
→ Builder contrôlé
→ Export fiable
→ Leads traçables
→ Dashboard exploitable
```

Le MVP doit prouver une chose :

```text
Auto Hall peut créer une landing page, la déployer sur cPanel,
collecter un lead, le stocker proprement et le consulter sans dépendre
d’un développement manuel à chaque campagne.
```

C’est ce workflow complet qui donne de la valeur au projet.
