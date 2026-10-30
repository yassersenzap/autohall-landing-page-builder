# Builder V4 — Livraison produit Auto Hall

Route: **http://localhost:5173/builder-v4**

Références métier : [gamme-thermique](https://www.autohall.ma/campagne/gamme-thermique) · [gamme-hev](https://www.autohall.ma/campagne/gamme-hev) · [offres AV](https://offresav.myautohall.ma/) · [Ford promo](https://fordpromo.myautohall.ma/)

## Statut livraison (Staff audit)

| Domaine | Statut | Notes |
|---------|--------|-------|
| **Hero + Form atomique** | ✅ | Image / Content / Form = couches internes ; lifecycle testé (97 tests unitaires) |
| **Image hero** | ✅ | Upload, drag-drop, crop/zoom, overlay, blur, brightness, **saturation**, cover/contain/fill |
| **Contenu overlay** | ✅ | Ancrage, offsets, smart backdrop ; max-width fixe 480px (slider à venir) |
| **Form builder** | 🟡 | Champs dynamiques (8 types) ; multi-étapes : modèle OK, UI authoring partielle |
| **Hero layout** | ✅ | Presets 50/50 → 70/30, 55/45, 65/35, fullscreen, floating ; hauteur, gap, padding |
| **Canvas** | ✅ | Moveable + Selecto, guides magnétiques, undo/redo, delete, duplicate HeroBlock |
| **Panneau gauche** | 🟡 | Layers + Media OK ; Blocks = Hero actif, Contenu/Sections visibles (verrouillés v1) |
| **Panneau droit** | ✅ | HERO · IMAGE · CONTENT · FORM — pas de jargon CSS technique |
| **Export HTML** | 🔴 | **Bloquant déploiement** — pas de pipeline V4 document → landing publiée |
| **Save API** | 🔴 | Persist localStorage uniquement |
| **Blocs secondaires** | 🔴 | FAQ, Features, Footer… catalogués mais non implémentés (v1.1) |

## Priorités avant mise en production

1. **Export backend** — sérialiser `BuilderDocument` → HTML/CSS (réutiliser `landing-render` ou nouveau renderer V4)
2. **Save API** — persister document + assets côté NestJS/Prisma
3. **E2E parité thermique** — baseline visuelle vs autohall.ma
4. **Form multi-étapes** — UI pour assigner champs par étape + barre de progression
5. **6 blocs secondaires** — un par sprint, jamais avant export stable

## Architecture Hero + Form

```
Page (Frame)
└── HeroBlock          ← seul bloc sélectionnable
    ├── HeroImage      ← couche IMAGE (upload ne touche que ça)
    ├── HeroSafeArea   ← couche CONTENT
    └── FormZone       ← couche FORM
        └── LeadForm   ← Form builder dynamique
```

Fichiers clés :

- `lib/hero-block-layers.ts` — atomicité image/form
- `lib/document-lifecycle.ts` — source de vérité empty/full
- `panels/inspector/BusinessInspector.tsx` — inspector métier
- `constants/blocks-catalog.ts` — catalogue produit
- `templates/campaign-hero-form.ts` — template thermique

## Tests

```bash
npm test -- src/features/builder-v4          # 97+ tests unitaires
npm run test:e2e -- --grep builder-v4          # Playwright canvas/campaign
```

## Interdit en production

- Puck, inspecteur technique (Layout/Grid/Flex), nodes visibles dans Layers
- Insertion hero-only / form-only (toujours preset complet)
- Features catalogue non implémentées activées sans renderer + export

## Stack

Zustand · FrameRenderer · shadcn · Moveable · Selecto · dnd-kit · Lexical · Playwright
