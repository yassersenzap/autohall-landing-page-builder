# Bilan d’avancement technique — Auto Hall Landing Page Builder V1

> **Date du rapport :** 5 juin 2026  
> **Branche auditée :** `docs/v1-project-status-report` (basée sur `main`, commit `2cba73d`)  
> **Périmètre :** audit factuel du dépôt local — sans modification du code métier.

---

## 1. Résumé exécutif

Auto Hall Landing Page Builder est une plateforme interne permettant à l’équipe marketing / SI Digital de créer des landing pages campagne, de les prévisualiser, de les exporter en ZIP statique et de suivre les leads générés. La V1 actuelle repose sur un **Builder V3** (React + iframe canvas + Zustand) couplé à un **backend NestJS** avec **PostgreSQL/Prisma**.

Le parcours principal fonctionne de bout en bout : authentification JWT, gestion campagnes → landing pages → versions, édition studio, preview, export ZIP (HTML + `lead-form.js` + `landing-config.js`), soumission de leads (preview et export local `file://`), consultation CRM leads avec statuts et suivi interne. Le projet a été **containerisé** (`docker-compose.yml`, Dockerfiles backend/frontend) pour faciliter la démonstration et la remise.

Cette V1 est **présentable et livrable** comme preuve de concept PFE, mais **n’est pas un builder premium final**. L’édition reste structurée par blocs prédéfinis (pas de canvas libre type Framer/Webflow), le média manager est fonctionnel mais limité, les templates/sections manquent de profondeur métier Auto Hall, et la qualité visuelle des pages exportées dépend fortement du contenu saisi plutôt que d’un design system landing mature.

Les builds frontend/backend passent, les tests unitaires passent (81 frontend, 60 backend). Le schéma Prisma est valide. La configuration Docker Compose est syntaxiquement correcte ; le build d’images Docker n’a pas pu être exécuté sur la machine d’audit (daemon Docker arrêté).

---

## 2. Objectif produit de la V1

La V1 vise à permettre à l’équipe interne Auto Hall de :

1. **Créer** des landing pages marketing rattachées à des campagnes et des versions de page ;
2. **Composer** une page via un studio visuel par blocs (hero, formulaire lead, galerie, FAQ, etc.) ;
3. **Prévisualiser** le rendu desktop/mobile avant publication ;
4. **Exporter** un package ZIP statique déployable sur un hébergement type cPanel ;
5. **Collecter et suivre** les leads soumis depuis les formulaires (API publique + CRM interne).

La V1 **ne vise pas** : un éditeur WYSIWYG libre, un hébergement intégré des landing pages, des intégrations CRM tierces (Salesforce, Zoho, etc.), ni un workflow de publication automatique vers un CDN.

---

## 3. Architecture actuelle

### Vue d’ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend React/Vite (port 5173 dev / 8080 Docker Nginx)       │
│  Dashboard · Campagnes · Studio V3 · Preview · Leads CRM        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST + JWT (Bearer)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend NestJS (port 3000)                                     │
│  Auth · Campagnes · Versions · Blocs · Assets · Preview/Export  │
│  Leads publics + CRM · Renderer HTML landing                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Prisma + adapter pg
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL 16                                                  │
└─────────────────────────────────────────────────────────────────┘

Export ZIP ──► HTML statique + JS (lead-form.js, landing-config.js)
               ──► déployé hors plateforme (cPanel, etc.)
               ──► formulaires POST vers API publique backend
```

### Responsabilités par couche

| Couche | Rôle | Emplacement principal |
|--------|------|------------------------|
| **Frontend React/Vite** | UI interne, studio, preview client, CRM leads | `frontend/src/` |
| **Backend NestJS** | API, auth, persistance, compilation HTML export, assets | `backend/src/` |
| **PostgreSQL/Prisma** | Données métier (users, campagnes, blocs, leads) | `backend/prisma/` |
| **Landing render** | Rendu HTML/CSS des blocs (preview + export) | `backend/src/landing-render/` |
| **Export statique** | ZIP, scripts JS leads, config landing | `backend/src/page-export/`, `backend/src/studio-v2-renderer/builder-v3-*` |
| **Docker** | Orchestration Postgres + backend + frontend | `docker-compose.yml`, `*/Dockerfile` |

### Séparation frontend / backend / export

- **Frontend** : édite le document (blocs, thème, SEO) via Zustand ; persiste via API blocs + brouillon localStorage ; déclenche export via `POST .../studio-v3-export`.
- **Backend** : source de vérité BDD ; compile le document V3 en HTML5 via `BuilderV3HtmlCompilerService` ; produit le ZIP ; sert l’API leads publique.
- **Export** : autonome une fois déployé — le ZIP ne nécessite pas le frontend ; les leads remontent vers le backend via URL absolue injectée dans `landing-config.js`.

---

## 4. Modules fonctionnels réalisés

| Module | État actuel | Maturité | Remarques |
|--------|-------------|----------|-----------|
| **Authentification** | Login JWT, `/api/auth/me`, forgot/reset password (lien console) | Fonctionnel | Rôles : ADMIN, SI_DIGITAL, MARKETER, VIEWER. Reset password loggé en dev, pas d’email SMTP. |
| **Dashboard** | KPIs leads, liens rapides | Fonctionnel | `LeadDashboardMetrics`, `GET /api/lead-events/dashboard`. |
| **Campagnes** | CRUD, statuts DRAFT/ACTIVE/ARCHIVED | Fonctionnel | `backend/src/campaigns/`, `CampaignsPage`. |
| **Landing pages** | CRUD par campagne, slug, statut | Fonctionnel | `landing-pages.controller.ts`. |
| **Versions** | Numérotation, statut DRAFT/PUBLISHED, publish | Fonctionnel | Publish requis pour certains exports legacy. |
| **Studio / Builder V3** | Éditeur iframe, DnD blocs, inspecteur, thème, SEO | Fonctionnel — limité | Route officielle `/page-versions/:id/studio`. ~20 blocs stables en palette. |
| **Preview** | Preview interactive (formulaires actifs) | Fonctionnel | `/page-versions/:id/studio/preview`, `BuilderPreviewProvider`. |
| **Export ZIP** | Export V3 via document JSON + compiler HTML | Fonctionnel | `POST /api/page-versions/:id/studio-v3-export`. Contient `index.html`, `js/lead-form.js`, `js/landing-config.js`. |
| **Leads** | API publique + CRM (liste, détail, statut, suivi, historique, purge admin) | Fonctionnel | `lead-events/`, `public-leads.controller.ts`. Export local `file://` géré (fallback sourceUrl). |
| **Médias / assets** | Upload API par version, rendu preview/export | Partiel | `page-assets/`, hook `usePageAssets`. Pas de bibliothèque média riche ; `MediaUploader` page settings utilise parfois des blob URLs locales. |
| **Docker** | Compose Postgres + backend + frontend Nginx | Fonctionnel (config) | Migrations auto au démarrage backend. Build images non testé sur machine d’audit. |
| **Documentation** | README racine, frontend README, docs/mvp/*, demo checklist | Partielle | README racine encore partiellement orienté « Postgres seul » ; ce rapport comble le bilan V1. |

---

## 5. État du builder / studio

### Ce qui fonctionne aujourd’hui

- **Studio V3** (`frontend/src/features/builder-v3/`) : layout triptyque (palette / canvas iframe / inspecteur).
- **Canvas isolé** via iframe + React Portal (`IframeCanvas`, `inject-iframe-styles.ts`) — évite les conflits CSS studio vs landing.
- **Drag-and-drop** des blocs (`@dnd-kit`, `SortableCanvasBlock`).
- **Store document** Zustand (`builder-document.store.ts`) avec persistance localStorage par `pageVersionId`.
- **~20 blocs stables** en palette (`block-registry.ts`, catégories hero/conversion/content/trust/footer).
- **Thème page** : couleurs primaire/secondaire, polices Google Fonts, SEO (meta, OG, favicon).
- **Preview** séparée avec formulaires lead actifs et panneau de succès (`FormSuccessPanel`).
- **Sauvegarde** vers API blocs (`save-builder-v3.ts`).
- **Export** depuis la topbar studio (`export-builder-v3.ts` → backend compiler).

### Limites actuelles

| Domaine | Limite constatée |
|---------|------------------|
| **UX éditeur** | Inspecteur dense, peu guidé pour utilisateurs non techniques ; pas de onboarding ; undo/redo limité ou absent. |
| **Système de blocs** | Blocs prédéfinis avec props structurées — pas de placement libre, pas de composants custom, blocs legacy `disabled` encore en registry pour compatibilité rendu. |
| **Média manager** | Upload API existe (`usePageAssets`) mais pas de UI type DAM ; `MediaUploader` (SEO) crée des `blob:` URLs non persistées côté serveur. |
| **Personnalisation visuelle** | Variantes par bloc (layout, background) mais pas de grille/spacing global avancé ; pas de responsive fin par breakpoint au-delà du toggle desktop/mobile. |
| **Preview mobile** | Toggle largeur iframe — pas de simulation device réaliste (safe areas, touch, perf). |
| **Qualité export** | HTML compilé avec Tailwind CDN — dépendance réseau externe ; rendu variable selon contenu ; pas de minification/purge CSS avancée. |

### Comparaison honnête avec builders modernes

| Critère | Framer / Webflow / Zoho LP / Swipe Pages | Auto Hall V1 |
|---------|------------------------------------------|--------------|
| Édition visuelle libre | Canvas libre, positioning pixel-perfect | Blocs empilés, props contrôlées |
| Design system | Composants + tokens matures | Tokens partiels (thème page + CSS landing) |
| Templates | Bibliothèques riches sectorielles | Blocs génériques Auto Hall, pas de marketplace templates |
| Médias | CDN, banques, optimisation | Upload basique, pas de pipeline image |
| Publish | Hébergement intégré, domaines custom | Export ZIP manuel |
| Formulaires / leads | Intégrations natives | API Auto Hall custom — fonctionnelle mais mono-produit |
| Collaboration | Multi-utilisateur temps réel | Non |
| Mobile | Breakpoints natifs | Toggle simplifié |

**Conclusion builder :** base technique solide pour un PFE, mais **niveau produit SaaS premium : non atteint**.

---

## 6. État de la containerisation Docker

### Fichiers présents

| Fichier | Description |
|---------|-------------|
| `docker-compose.yml` | Postgres 16, backend NestJS, frontend Nginx, pgAdmin (profil optionnel) |
| `backend/Dockerfile` | Multi-stage `node:20-alpine`, build NestJS, entrypoint migrations |
| `backend/docker-entrypoint.sh` | `prisma migrate deploy` puis `npm run start:prod` |
| `frontend/Dockerfile` | Build Vite (contexte racine) + Nginx 1.27 |
| `frontend/nginx.conf` | SPA `try_files $uri $uri/ /index.html` |
| `backend/tsconfig.scripts.json` | Scripts utilitaires (purge leads) |
| `.env.example` | Variables Docker (POSTGRES_*, JWT_SECRET, VITE_API_BASE_URL, etc.) |

### Lancement

```bash
cp .env.example .env
# Renseigner POSTGRES_PASSWORD et JWT_SECRET (obligatoires)

docker compose up --build -d

# Premier admin (optionnel)
docker compose exec backend npm run db:seed
```

| Service | Port hôte par défaut |
|---------|---------------------|
| Frontend (Nginx) | 8080 |
| Backend API | 3000 |
| PostgreSQL | 5432 |

### Automatisé vs manuel

| Automatisé | Manuel / `.env` |
|------------|-----------------|
| Migrations Prisma au démarrage backend | `POSTGRES_PASSWORD`, `JWT_SECRET` obligatoires |
| Healthchecks postgres + backend | `VITE_API_BASE_URL` (build-time frontend) |
| Volumes `postgres_data`, `backend_storage` | Seed admin (`db:seed`) |
| Restart policies | CORS, PUBLIC_API_BASE_URL pour exports réels |

### Limites Docker actuelles

- **Pas de CI/CD** Docker intégrée au dépôt.
- **`VITE_API_BASE_URL` figée au build** — changer l’URL API en prod implique rebuild frontend.
- **Pas de TLS/HTTPS** dans Compose (reverse proxy externe requis en prod).
- **Seed non lancé automatiquement** (volontaire, sécurité).
- **Build images non validé** sur la machine d’audit (Docker Desktop arrêté).

### Prêt pour démo locale Docker ?

**Oui, sous réserve** : Docker Desktop démarré, `.env` renseigné, `docker compose up --build`, puis seed manuel. La configuration Compose est valide (`docker compose config` OK).

---

## 7. Qualité technique actuelle

### Architecture et séparation

- **Backend NestJS modulaire** : un module par domaine (`campaigns`, `page-blocks`, `lead-events`, `studio-v2-renderer`, etc.) — `app.module.ts`.
- **Frontend feature-based** : `features/builder-v3/` (UI studio), `features/builder-engine/` (store, registry, defaults), pages route-level.
- **Renderer centralisé côté backend** pour preview/export HTML — cohérence preview ↔ ZIP.
- **Dette legacy** : modules `studio-v2` backend encore présents (`StudioV2DocumentModule`, document Puck JSON) alors que le frontend Visual Studio V2 a été retiré ; routes legacy redirigent vers V3.

### Lisibilité

- Code TypeScript strict, conventions homogènes NestJS + React.
- Documentation frontend builder détaillée (`frontend/README.md`).
- Tests unitaires présents sur registry, store, render helpers, export static.

### Stabilité

- Builds production OK (frontend + backend).
- Correctif récent `status-badge.tsx` (clé `ARCHIVED` dupliquée) — commit `2cba73d`.
- Pas de tests E2E exécutés dans cet audit.

### Dette technique notable

| Zone | Fichiers / constat |
|------|-------------------|
| Double pipeline export | Export legacy blocs (`page-export`) + export V3 (`builder-v3-export`) |
| Studio V2 backend | `backend/src/studio-v2/`, `studio-v2-renderer/` — code mort partiel côté UI |
| Médias blob vs API | `MediaUploader.tsx` vs `use-page-assets.ts` — deux modèles coexistent |
| README racine | Mentionne `docker/` Postgres seul, pas la stack complète |
| Tests E2E | Script `test:e2e` backend présent, non exécuté |
| npm audit backend | 3 vulnérabilités modérées signalées (non traitées) |

---

## 8. Tests et validation

Audit exécuté le **5 juin 2026** sur branche `docs/v1-project-status-report`.

| Commande | Résultat |
|----------|----------|
| `cd frontend && npm run build` | **OK** — Vite build ~2 s, 1929 modules |
| `cd frontend && npm test` | **OK** — 25 fichiers, **81 tests** passés |
| `cd backend && npm run build` | **OK** — `nest build` sans erreur |
| `cd backend && npm test` | **OK** — 17 suites, **60 tests** passés |
| `cd backend && npx prisma validate` | **OK** — schéma valide |
| `npx prisma generate` | **Non exécuté** (non requis — build backend OK) |
| `docker compose config` | **OK** — syntaxe valide (avec POSTGRES_PASSWORD + JWT_SECRET) |
| `docker compose build` | **Non testé** — Docker daemon indisponible sur machine d’audit |
| `docker compose up` | **Non testé** — idem |
| `npm run test:e2e` (backend) | **Non testé** |
| `npm run lint` | **Non testé** |

---

## 9. Limites actuelles de la V1

1. **Builder limité** — blocs prédéfinis, pas d’édition visuelle libre ni de composants custom.
2. **UX perfectible** — courbe d’apprentissage, inspecteur technique, peu de guidage métier.
3. **Templates / sections** — palette de blocs générique, pas de bibliothèque « campagne Auto Hall » clé en main.
4. **Média manager** — pas de bibliothèque centralisée, risque blob URLs non exportables, pas d’optimisation images.
5. **Design system landing** — CSS landing (`landing-page.css`) + tokens partiels, pas de système complet Figma ↔ code.
6. **Preview mobile** — toggle largeur uniquement, pas de QA multi-devices.
7. **Guidage utilisateur non technique** — pas de wizard, checklist in-page, ou validation contenu assistée.
8. **Qualité pages exportées** — Tailwind CDN, dépendance externe, SEO basique, pas de score perf garanti.
9. **Publish** — pas de déploiement one-click ; remise manuelle ZIP + config API.
10. **Intégrations** — pas de connecteurs CRM / analytics / email marketing.
11. **Legacy backend V2** — code et routes API V2 encore présents, complexité maintenance.
12. **Auth reset** — mot de passe oublié sans envoi email réel (console log).

---

## 10. Roadmap recommandée après V1

### Phase 1 — Stabilisation V1 / démo / Docker / documentation

| | |
|--|--|
| **Objectif** | Livraison propre, démo reproductible, doc à jour |
| **Tâches** | Aligner README sur Docker complet ; valider `docker compose up` en CI ; checklist démo V3 ; purge leads avant soutenance |
| **Priorité** | Haute |
| **Complexité** | Faible |
| **Impact** | Confiance encadrant + équipe SI |

### Phase 2 — Amélioration builder UX

| | |
|--|--|
| **Objectif** | Réduire la friction éditeur pour marketeurs |
| **Tâches** | Undo/redo ; onboarding ; inspecteur simplifié ; feedback sauvegarde ; raccourcis clavier |
| **Priorité** | Haute |
| **Complexité** | Moyenne |
| **Impact** | Adoption interne |

### Phase 3 — Média manager professionnel

| | |
|--|--|
| **Objectif** | Gestion fiable des visuels campagne |
| **Tâches** | Bibliothèque assets par campagne ; upload obligatoire API ; vignettes ; suppression blob URLs ; formats/tailles |
| **Priorité** | Haute |
| **Complexité** | Moyenne–élevée |
| **Impact** | Qualité export + autonomie métier |

### Phase 4 — Bibliothèque de sections Auto Hall

| | |
|--|--|
| **Objectif** | Templates campagne prêts à l’emploi |
| **Tâches** | Starters par marque/modèle ; sections pré-remplies ; duplication page ; presets promo |
| **Priorité** | Moyenne |
| **Complexité** | Moyenne |
| **Impact** | Vitesse de production landing |

### Phase 5 — Design system landing pages

| | |
|--|--|
| **Objectif** | Cohérence visuelle marque Auto Hall |
| **Tâches** | Tokens Figma ; composants landing ; typographie/spacing ; dark/light export |
| **Priorité** | Moyenne |
| **Complexité** | Élevée |
| **Impact** | Qualité perçue vs concurrence |

### Phase 6 — Export / publish robuste

| | |
|--|--|
| **Objectif** | ZIP production-grade |
| **Tâches** | CSS inline ou build Tailwind dédié ; assets embarqués ; validation pre-export ; config domaine ; purge CDN doc |
| **Priorité** | Moyenne |
| **Complexité** | Élevée |
| **Impact** | Fiabilité déploiement cPanel |

### Phase 7 — Reporting leads et intégrations

| | |
|--|--|
| **Objectif** | Exploitation métier des leads |
| **Tâches** | Exports CSV ; webhooks ; sync CRM ; tableaux de bord avancés ; notifications email |
| **Priorité** | Basse–moyenne |
| **Complexité** | Élevée |
| **Impact** | Valeur business long terme |

---

## 11. Conclusion

Le projet **Auto Hall Landing Page Builder V1** est **présentable comme livrable PFE** : parcours complet campagne → studio → preview → export → leads, stack moderne, tests unitaires verts, containerisation en place.

Il démontre une **base technique solide** (NestJS modulaire, Prisma, renderer backend unifié, studio iframe isolé). En revanche, il **n’est pas encore un builder final premium** : l’UX, le média manager, les templates et le design system landing doivent monter en qualité pour rivaliser avec des solutions du marché.

La suite du développement doit prioriser **expérience produit et qualité visuelle des landing exportées**, pas seulement l’ajout de fonctionnalités techniques.

---

## Annexe — Référence technique rapide

### Structure dépôt

```
AutoHall-LP-Builder/
├── frontend/          # React 19, Vite 8, Builder V3
├── backend/           # NestJS 11, Prisma 7, landing-render
├── backend/prisma/    # schema + 5 migrations SQL
├── docs/              # mvp/, architecture/, demo/, status/
├── docker/            # README Postgres (historique)
├── docker-compose.yml # Stack complète
└── .env.example
```

### Routes frontend principales

| Route | Page |
|-------|------|
| `/login` | Connexion |
| `/dashboard` | Tableau de bord |
| `/campaigns` | Campagnes |
| `/campaigns/:id/landing-pages` | Landings |
| `/landing-pages/:id/versions` | Versions |
| `/page-versions/:id/studio` | Builder V3 |
| `/page-versions/:id/studio/preview` | Preview |
| `/leads`, `/leads/:id` | CRM leads |

### API backend principales

| Préfixe | Usage |
|---------|-------|
| `/api/auth/*` | Authentification |
| `/api/campaigns` | Campagnes |
| `/api/campaigns/:id/landing-pages` | Landing pages |
| `/api/landing-pages/:id/versions` | Versions |
| `/api/page-versions/:id/blocks` | Blocs V3 |
| `/api/page-versions/:id/preview` | Preview HTML |
| `/api/page-versions/:id/studio-v3-export` | Export ZIP V3 |
| `/api/page-versions/:id/assets` | Upload assets |
| `/api/public/leads` | Soumission lead (export/preview) |
| `/api/lead-events/*` | CRM leads interne |
| `/health`, `/health/db` | Santé |

### Modèles Prisma (15)

`User`, `Campaign`, `LandingPage`, `PageVersion`, `PageBlock`, `PageVersionStudioDocument`, `Form`, `FormField`, `LandingPageAsset`, `ExportJob`, `LeadEvent`, `LeadStatusHistory`, `SimulatedTestdrive`, `SimulatedContact`, `AuditLog`

### Scripts npm

**Backend :** `start:dev`, `start:prod`, `build`, `test`, `db:migrate`, `db:seed`, `db:purge-leads`  
**Frontend :** `dev`, `build`, `test`, `lint`, `preview`

### État Git (audit)

- Branche courante : `docs/v1-project-status-report`
- Dernier commit connu sur `main` : `2cba73d` — `fix: resolve duplicate ARCHIVED status key blocking production build`
- Working tree propre au moment de la rédaction (hors création de ce document)
