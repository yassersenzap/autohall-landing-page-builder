# Automotive landing page patterns

**Status:** Design research foundation  
**Scope:** Section recommendations for Auto Hall campaign landings

---

## 1. Context

Auto Hall landing pages support campaign goals:

- **Promotional offer** — limited-time price or financing
- **Model launch** — new vehicle introduction
- **Range showcase** — multiple trims or powertrains
- **Lead capture** — test drive, callback, brochure
- **SAV / aftersales** — service appointments (separate template family)

This document recommends **sections** and **ordering** for vehicle-focused landings. Block type names align with the premium registry (`hero_vehicle_offer`, etc.) and existing deliverable blocks where noted.

---

## 2. Canonical page anatomy

Typical high-converting automotive landing structure:

```text
1. Hero (offer or model)     — attention, primary CTA
2. Trust / credibility       — brand bar, awards, dealer network
3. Vehicle proof             — features, gallery, video
4. Commercial detail         — pricing, trims, financing
5. Objection handling        — FAQ, testimonials
6. Conversion                — lead form or final CTA
7. Legal footer              — mentions, cookies, dealer info
```

Not every campaign needs all seven; brand presets include `recommendedBlocks` shortcuts.

---

## 3. Section catalog

### 3.1 Hero — vehicle offer (`hero_vehicle_offer`)

**Job:** Communicate model + offer in under 5 seconds.

| Element | Guidance |
|---------|----------|
| Headline | Model name or benefit-led (“Nouveau Ranger”) |
| Subheadline | Offer context or key spec |
| Offer label | Badge: “Offre limitée”, “0% TVA”, etc. |
| Price | Formatted price or “À partir de …” |
| Primary CTA | “Réserver un essai”, “Demander un devis” |
| Secondary CTA | “Voir la fiche technique”, “Configurer” |
| Media | 3/4 front or lifestyle; mobile-specific crop optional |

**Layout variants:** `split-media-right`, `split-media-left`, `full-bleed-overlay`, `stacked-mobile`.

### 3.2 Trust bar (`trust_bar`)

Dealer network, warranty years, stock availability. Keeps hero credible for cold traffic.

### 3.3 Vehicle features (`vehicle_features`)

3-column spec grid: powertrain, safety, technology. Scannable icons + short labels.

### 3.4 Gallery (`gallery`)

Exterior / interior / detail trio. Important for premium brands (Maserati, Alfa Romeo).

### 3.5 Video embed (`video_embed`)

YouTube/Vimeo walkaround. Use after features for consideration-stage visitors.

### 3.6 Vehicle range (`vehicle_range`)

Multiple models or trims on one page (fleet, gamme thermique/HEV templates).

### 3.7 Pricing / trims (`pricing_trim`)

Three-column trim comparison with highlight on recommended grade.

### 3.8 Benefits (`benefits`)

Ownership benefits: warranty, service, financing, trade-in.

### 3.9 Testimonials (`testimonials`)

Social proof; local dealer reviews when available.

### 3.10 FAQ (`faq`)

Financing, delivery time, homologation — reduces call center load.

### 3.11 Lead form (`lead_form` / `hero_form_campaign`)

Form above fold (hero) or dedicated section mid-page. Auto Hall field set enforced by backend.

### 3.12 Final CTA (`final_cta`)

Repeat primary action before footer; matches hero CTA copy.

### 3.13 Footer legal (`footer_legal`)

Mandatory compliance; dealer address and legal mentions.

---

## 4. Patterns by campaign type

### Promotional offer (e.g. Ford monthly promo)

```text
hero_vehicle_offer → trust_bar → vehicle_features → pricing_trim → lead_form → final_cta → footer_legal
```

### Model launch (e.g. new Jeep)

```text
hero_vehicle_offer → gallery → vehicle_features → video_embed → benefits → lead_form → faq → footer_legal
```

### Premium discovery (e.g. Maserati)

```text
hero_vehicle_offer → media_only → gallery → vehicle_features → final_cta → footer_legal
```

### Commercial fleet (e.g. Fuso, Ford Trucks)

```text
hero_vehicle_offer → vehicle_features → rich_text → cta_band → lead_form → footer_legal
```

### Quick lead (minimal)

```text
hero_form_campaign → lead_form → footer_legal
```

(Uses existing deliverable blocks; premium hero replaces `hero_campaign` when brand-aware layout is required.)

---

## 5. Image placement principles

Weak image placement is a known issue in the current rigid blocks. Premium blocks address:

| Control | Purpose |
|---------|---------|
| `imageFit` | `cover` \| `contain` — crop vs full vehicle visibility |
| `imagePosition` | `left` \| `right` \| `background` — layout role |
| `focalPoint` | `center` \| `left` \| `right` \| `top` — crop anchor |
| `overlayIntensity` | `none` → `heavy` — text legibility on photography |
| `mobileImage` | Optional alternate asset for narrow viewports |

**Rules:**

- Lifestyle backgrounds require overlay ≥ `medium` for WCAG contrast on white text.
- Studio cutouts use `contain` on light `backgroundColor` from brand preset.
- Fleet/commercial prefers side profile anchored `focalPoint: left`.

---

## 6. Brand-specific section emphasis

| Brand family | Emphasize | De-emphasize |
|--------------|-----------|--------------|
| European mainstream | Pricing, clear offer badge | Long video |
| American / adventure | Gallery, lifestyle imagery | Dense spec tables |
| Japanese | Trust bar, warranty | Flashy motion |
| Chinese value | Price, financing FAQ | Serif typography |
| Premium | Gallery, media-only cinematics | Loud promo badges |
| Commercial | Features, payload specs | Lifestyle fluff |

---

## 7. Responsive behavior

1. **Hero:** split → stacked; mobile image may differ from desktop.
2. **Grids:** 3-col → 1-col; maintain tap targets ≥ 44px.
3. **Forms:** full-width fields on mobile; sticky CTA optional in later PR.
4. **Typography:** scale from preset `fontStrategy`; no viewport-specific React logic in export.

---

## 8. Measurement hooks (future)

Reserve data attributes for analytics (`data-lp-section`, `data-lp-cta`) in export renderer — not in this foundation PR.

---

## 9. Related documents

- `brand-archetypes.md` — preset tokens and families
- `block-benchmark.md` — reference libraries and static export rules
- `docs/mvp/05-blocks-model.md` — legacy V1 block JSON model
- `docs/mvp/12-landing-render.md` — backend HTML render pipeline
