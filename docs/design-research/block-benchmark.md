# Block design benchmark — references vs dependencies

**Status:** Design research foundation  
**Scope:** Premium block system for Auto Hall Landing Studio

---

## 1. Why benchmark at all?

Before adding premium blocks (hero offers, spec grids, cinematic galleries), we need a shared vocabulary for:

- layout variants (split, full-bleed, stacked mobile),
- image controls (fit, position, focal point, overlay),
- design controls (tone, density, CTA style),
- brand token application.

Industry-standard block libraries solve similar problems well. We study them; we do **not** copy-paste them into production.

---

## 2. Reference libraries (inspiration only)

| Library | Strengths we borrow conceptually | Why not a direct dependency |
|---------|----------------------------------|-----------------------------|
| **shadcn/ui** | Composable primitives, token-friendly CSS variables, accessible form controls | React + Radix stack; would ship into export if misused; studio already has `design-system/` |
| **Flowbite** | Marketing sections, hero patterns, Tailwind-friendly | Tailwind plugin model; landing export is static HTML/CSS without Tailwind pipeline |
| **Magic UI** | Motion-rich heroes, gradients, premium feel | Framer Motion / React-only; incompatible with static ZIP export |
| **Aceternity UI** | Cinematic heroes, spotlight effects | Heavy client JS, CDN-style patterns; performance risk on cPanel hosting |
| **shadcnblocks** | Pre-built marketing compositions | Paid/registry blocks tied to shadcn; no brand preset integration |

### Decision

```text
References inform our block DEFINITION CONTRACT and CSS architecture.
They are NOT uncontrolled dependencies in package.json.
```

---

## 3. What we extract from each reference

### From shadcn/ui

- Separate **content** from **design tokens**.
- Use semantic control types (`variant`, `size`) instead of free-form CSS.
- Form fields map to a fixed schema, not arbitrary HTML.

### From Flowbite / marketing kits

- Section taxonomy: hero, feature grid, pricing, testimonial, CTA band, FAQ.
- Mobile-first stacking rules for split heroes.
- Consistent vertical rhythm between sections.

### From Magic UI / Aceternity

- **Ideas only:** gradient overlays, subtle border glow, image reveal.
- Implementation must compile to **static CSS classes** in `backend/src/landing-render/`.
- No runtime animation library in export ZIP.

### From shadcnblocks

- Composition patterns: headline + subhead + dual CTA + media.
- Block-level `recommendedBlocks` sequences per brand (see brand presets).

---

## 4. Auto Hall block definition contract

New premium blocks live under `frontend/src/features/builder/` with:

| Concern | Location |
|---------|----------|
| TypeScript contract | `block-registry/block-definition.types.ts` |
| Design controls schema | `block-registry/design-control.types.ts` |
| Image controls schema | `block-registry/image-control.types.ts` |
| Registry | `block-registry/block-registry.ts` |
| Per-block definition | `blocks/<block-id>/<block-id>.definition.ts` |

Each definition exposes:

- `type`, `label`, `category`
- `defaultContent`, `defaultDesign`
- `editableFields`, `designControls`, `imageControls`
- `compatibleBrands`
- `builderRenderer` key (React preview — private app only)
- `exportRenderer` key (backend HTML renderer — source of truth for ZIP)

The legacy `builder-engine/registry/block-registry.ts` remains unchanged in this PR.

---

## 5. Static export rules (non-negotiable)

1. **No React bundle** in export ZIP.
2. **No secrets** (API keys, internal URLs, auth tokens).
3. **HTML + CSS + minimal vanilla JS** for forms and analytics hooks only.
4. **CSS variables** for brand colors (`--lp-brand-primary`, etc.) — populated from preset at render time on backend.
5. **Images** referenced by relative paths or approved CDN URLs stored in asset records.
6. **No third-party UI CSS** from Flowbite/MagicUI/Aceternity CDNs in export.
7. Builder preview may approximate export; **backend `landing-render` wins** on conflicts.

---

## 6. Quality bar for new premium blocks

Before a block graduates from `experimental` to `stable`:

| Criterion | Check |
|-----------|-------|
| Schema | `defaultContent` + controls fully typed |
| Brand | Works with at least 3 brand presets without code forks |
| Image | Supports fit, position, focal point, overlay intensity |
| Responsive | Mobile image optional; layout variant documented |
| Export | Backend renderer key implemented + snapshot test |
| A11y | Heading order, alt text, focusable CTAs |
| Performance | No layout shift; hero image dimensions known |

---

## 7. Next implementation steps (out of this PR)

1. Backend mirror types for `hero_vehicle_offer` export renderer.
2. Wire registry into Studio V3 palette (feature flag).
3. CSS module in `landing-page.css` for hero variants.
4. Brand preset picker in page settings panel.
