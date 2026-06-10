# Auto Hall — Brand archetypes

**Status:** Design research foundation  
**Scope:** Premium brand-aware landing page blocks  
**Audience:** Builder engineers, designers, campaign operators

---

## 1. Purpose

Auto Hall distributes multiple automotive brands under one retail network. Each brand carries a distinct visual identity that must survive the transition from the internal React builder to exported static landing pages.

This document defines **brand families** and **visual archetypes** used by the brand preset system (`frontend/src/features/builder/brand-presets/`). Presets are the single source of truth for colors, typography strategy, button treatment, image treatment, and recommended block sequences.

---

## 2. Auto Hall brand families

Brands visible on the official Auto Hall website are grouped by commercial positioning and visual tone.

| Family | Brands | Positioning | Visual tone |
|--------|--------|-------------|-------------|
| **European mainstream** | Opel, Fiat, Alfa Romeo | Volume retail, lifestyle, heritage | Clean grids, bold primaries, approachable sans-serif |
| **American / adventure** | Ford, Jeep | Capability, freedom, utility | Strong contrast, wide imagery, rugged or confident CTAs |
| **Japanese reliability** | Nissan, Mitsubishi, Fuso | Trust, durability, fleet | Balanced layouts, functional hierarchy, red or corporate blues |
| **Chinese value / tech** | Chery, DFSK, Foton, Seres | Price-led or EV innovation | High-energy accents, product-forward heroes, modern sans |
| **Premium / luxury** | Maserati, Alfa Romeo (upper trims) | Exclusivity, craft | Dark backgrounds, serif accents, restrained motion |
| **Commercial / fleet** | Ford Trucks, Fuso, Gaz, Industriel & Agricole | B2B, payload, ROI | Utility layouts, spec tables, high information density |

All sixteen supported brands:

`opel`, `ford`, `dfsk`, `nissan`, `mitsubishi`, `fiat`, `fuso`, `chery`, `foton`, `seres`, `jeep`, `gaz`, `alfa_romeo`, `ford_trucks`, `maserati`, `industriel_agricole`

---

## 3. Visual archetypes by brand

Each archetype maps to preset tokens (`primaryColor`, `fontStrategy`, `buttonStyle`, `imageStyle`) and informs block design defaults.

### 3.1 European mainstream — example: Opel

- **Palette:** High-visibility yellow primary on white or light grey; black typography.
- **Typography:** Geometric sans (Opel Sans–like); tight headline tracking.
- **Imagery:** Studio cut-out or 3/4 front on neutral background; minimal overlay.
- **CTAs:** Pill or rounded rectangle; primary fill, dark text on yellow.
- **Recommended blocks:** `hero_vehicle_offer`, `vehicle_features`, `pricing_trim`, `lead_form`, `final_cta`.

### 3.2 American confidence — example: Ford

- **Palette:** Ford blue primary, white backgrounds, dark secondary text.
- **Typography:** Humanist sans; bold headlines.
- **Imagery:** Lifestyle + vehicle composite; moderate gradient overlay for legibility.
- **CTAs:** Rounded rectangle; white-on-blue primary.
- **Recommended blocks:** `hero_vehicle_offer`, `vehicle_range`, `benefits`, `cta_band`, `lead_form`.

### 3.3 Adventure / outdoor — example: Jeep

- **Palette:** Forest green primary, sand or stone neutrals, white text on dark hero.
- **Typography:** Condensed sans or rugged display for headlines.
- **Imagery:** Full-bleed outdoor scenes; strong bottom gradient overlay.
- **CTAs:** Outline or solid; high contrast on photography.
- **Recommended blocks:** `hero_vehicle_offer`, `gallery`, `vehicle_features`, `testimonials`, `lead_form`.

### 3.4 Italian premium — example: Alfa Romeo

- **Palette:** Alfa red, anthracite, white space.
- **Typography:** Elegant sans with occasional serif for model names.
- **Imagery:** Cinematic wide shots; controlled vignette.
- **CTAs:** Minimal outline or red fill; generous padding.
- **Recommended blocks:** `hero_vehicle_offer`, `media_only`, `vehicle_features`, `final_cta`.

### 3.5 Value / tech — example: Chery

- **Palette:** Gold or amber accent on dark or white; energetic secondary.
- **Typography:** Modern geometric sans; large numerals for offers.
- **Imagery:** Product hero with spec callouts; optional split layout.
- **CTAs:** Rounded, high-saturation primary.
- **Recommended blocks:** `hero_vehicle_offer`, `pricing_trim`, `benefits`, `faq`, `lead_form`.

### 3.6 Commercial fleet — example: Fuso, Ford Trucks

- **Palette:** Corporate red or fleet blue; light grey sections for specs.
- **Typography:** Industrial sans; tabular figures for payload/pricing.
- **Imagery:** Side profile or cab shot; lower overlay intensity.
- **CTAs:** Rectangular, utilitarian; secondary “download brochure” pattern.
- **Recommended blocks:** `hero_vehicle_offer`, `vehicle_features`, `rich_text`, `cta_band`, `lead_form`.

### 3.7 Luxury — example: Maserati

- **Palette:** Deep navy or black, silver/platinum accent, minimal color noise.
- **Typography:** Luxury serif for headlines, light sans for body.
- **Imagery:** Full-bleed, low overlay; focal point on vehicle silhouette.
- **CTAs:** Ghost or thin outline; understated copy (“Discover”, “Configure”).
- **Recommended blocks:** `hero_vehicle_offer`, `media_only`, `gallery`, `final_cta`.

---

## 4. Preset contract (implementation)

Each brand preset in code exposes:

| Field | Role |
|-------|------|
| `id` | Stable key referenced by blocks and campaigns |
| `name` | Display label in builder |
| `category` | Archetype family (see table §2) |
| `tone` | `light` \| `dark` \| `mixed` default page mood |
| Color tokens | `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`, `textColor` |
| `fontStrategy` | Abstract strategy key resolved at render time |
| `buttonStyle` | `pill` \| `rounded` \| `rectangular` \| `ghost` |
| `imageStyle` | `studio-cutout` \| `lifestyle-bleed` \| `cinematic` \| `utility-side` |
| `recommendedBlocks` | Ordered block type hints for page starters |

Presets are **data only** in this PR. Renderers (builder preview + backend export) will consume them in a follow-up PR.

---

## 5. Rules for brand consistency

1. **Never hardcode brand hex values inside block components.** Read from preset or resolved theme.
2. **Block `brandId` must match a preset `id`.** Validation layer comes in a later PR.
3. **Export uses CSS variables**, not inline React styles from the builder bundle.
4. **One brand per landing page** in MVP; multi-brand pages are out of scope.
5. **Adjust presets centrally** — campaign operators should not edit raw color JSON unless advanced mode is explicitly enabled later.

---

## 6. References (inspiration only)

See `block-benchmark.md` for why external UI libraries are not imported directly.

Official Auto Hall brand pages and distributor sites inform palette choices; presets are approximations tuned for landing conversion, not pixel-perfect trademark reproduction.
