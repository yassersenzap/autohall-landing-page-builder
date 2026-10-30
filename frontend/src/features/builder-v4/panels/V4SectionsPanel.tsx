import React from 'react';
import { useBuilderV4Store } from '../store/document.store';
import { cn } from '@/lib/utils';

// ── SVG Thumbnails ────────────────────────────────────────────────────────────

const T = {
  BrandNavbar: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#ffffff" />
      {/* Top navbar strip */}
      <rect x="0" y="20" width="120" height="28" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
      {/* Brand logo placeholder */}
      <circle cx="15" cy="34" r="6" fill="#288fe3" />
      {/* Breadcrumb line */}
      <rect x="30" y="32" width="40" height="4" rx="1" fill="#e2e8f0" />
      {/* Menu links on the right */}
      <rect x="90" y="32" width="10" height="4" rx="1" fill="#94a3b8" />
      <rect x="105" y="32" width="10" height="4" rx="1" fill="#94a3b8" />
    </svg>
  ),
  HeroShowroom: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#f8fafc" />
      {/* Left side text and image */}
      <rect x="8" y="12" width="40" height="4" rx="1.5" fill="#0f172a" />
      <rect x="8" y="20" width="30" height="3" rx="1" fill="#64748b" />
      <rect x="8" y="30" width="44" height="28" rx="2" fill="#cbd5e1" />
      {/* Right side form card */}
      <rect x="66" y="8" width="46" height="52" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="72" y="16" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="72" y="24" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="72" y="32" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="72" y="44" width="34" height="8" rx="2" fill="#002C6C" />
    </svg>
  ),
  HeroMosaic: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#090d16" />
      {/* Asymmetric Mosaic Grid on the left */}
      <rect x="6" y="8" width="28" height="36" rx="2" fill="#1e293b" />
      <rect x="36" y="8" width="20" height="11" rx="1" fill="#334155" />
      <rect x="36" y="21" width="20" height="11" rx="1" fill="#334155" />
      <rect x="36" y="34" width="20" height="10" rx="1" fill="#334155" />
      {/* Left Bottom Text */}
      <rect x="6" y="48" width="50" height="4" rx="1" fill="#ffffff" opacity="0.8" />
      <rect x="6" y="56" width="36" height="3" rx="1" fill="#94a3b8" />
      {/* Right side floating form */}
      <rect x="64" y="8" width="50" height="52" rx="6" fill="#ffffff" />
      <rect x="70" y="16" width="38" height="4" rx="1" fill="#cbd5e1" />
      <rect x="70" y="24" width="38" height="4" rx="1" fill="#cbd5e1" />
      <rect x="70" y="32" width="38" height="4" rx="1" fill="#cbd5e1" />
      <rect x="70" y="44" width="38" height="8" rx="3" fill="#8C1D40" />
    </svg>
  ),
  HeroCinematic: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      {/* Background full image block style */}
      <rect width="120" height="68" fill="#1e293b" />
      <rect width="120" height="68" fill="url(#cinematicOverlayGrad)" />
      <defs>
        <linearGradient id="cinematicOverlayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
        </linearGradient>
      </defs>
      {/* Center Left text */}
      <rect x="8" y="22" width="46" height="5" rx="1.5" fill="#ffffff" />
      <rect x="8" y="32" width="36" height="3.5" rx="1" fill="#e2e8f0" opacity="0.7" />
      {/* Blurred Form card center-right */}
      <rect x="64" y="10" width="48" height="48" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      <rect x="70" y="18" width="36" height="4" rx="1" fill="#ffffff" opacity="0.3" />
      <rect x="70" y="26" width="36" height="4" rx="1" fill="#ffffff" opacity="0.3" />
      <rect x="70" y="34" width="36" height="4" rx="1" fill="#ffffff" opacity="0.3" />
      <rect x="70" y="44" width="36" height="6" rx="2" fill="#288fe3" />
    </svg>
  ),
  HeroImmersiveForm: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#1e3a8a" />
      <rect width="120" height="68" fill="rgba(0,0,0,0.4)" />
      <rect x="8" y="24" width="45" height="6" rx="1.5" fill="#ffffff" />
      <rect x="8" y="34" width="30" height="3" rx="1" fill="#e2e8f0" opacity="0.8" />
      <rect x="66" y="8" width="46" height="52" rx="4" fill="#ffffff" />
      <rect x="72" y="16" width="34" height="4" rx="1.5" fill="#cbd5e1" />
      <rect x="72" y="24" width="34" height="2" rx="1" fill="#e2e8f0" />
      <rect x="72" y="24" width="12" height="2" rx="1" fill="#002C6C" />
      <rect x="72" y="32" width="34" height="4" rx="1" fill="#cbd5e1" />
      <rect x="72" y="40" width="34" height="4" rx="1" fill="#cbd5e1" />
      <rect x="72" y="48" width="34" height="8" rx="2" fill="#002C6C" />
    </svg>
  ),
  Carousel: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#090d16" />
      <rect x="36" y="8" width="48" height="52" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
      <rect x="42" y="44" width="36" height="4" rx="1" fill="#ffffff" />
      <rect x="48" y="52" width="24" height="3" rx="1" fill="#94a3b8" />
      <rect x="-8" y="14" width="36" height="40" rx="3" fill="#1e293b" opacity="0.4" />
      <rect x="92" y="14" width="36" height="40" rx="3" fill="#1e293b" opacity="0.4" />
      <circle cx="20" cy="34" r="5" fill="rgba(255,255,255,0.1)" />
      <path d="M21 31l-3 3 3 3" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="100" cy="34" r="5" fill="rgba(255,255,255,0.1)" />
      <path d="M99 31l3 3-3 3" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  SpecsShowroom: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#ffffff" />
      <circle cx="15" cy="15" r="5" fill="#002C5B" />
      <rect x="26" y="12" width="40" height="6" rx="1.5" fill="#e2e8f0" />
      <rect x="10" y="26" width="60" height="4" rx="1" fill="#94a3b8" />
      <rect x="10" y="34" width="50" height="4" rx="1" fill="#94a3b8" />
      <rect x="85" y="16" width="28" height="36" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="89" y="24" width="20" height="4" rx="1" fill="#002C5B" />
      <rect x="89" y="32" width="20" height="4" rx="1" fill="#e2e8f0" />
      <rect x="89" y="42" width="20" height="6" rx="2" fill="#002C5B" />
    </svg>
  ),
  ContactSection: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#ffffff" />
      <rect x="6" y="8" width="50" height="52" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="12" y="16" width="38" height="4" rx="1" fill="#cbd5e1" />
      <rect x="12" y="24" width="38" height="4" rx="1" fill="#cbd5e1" />
      <rect x="12" y="32" width="38" height="12" rx="2" fill="#cbd5e1" />
      <rect x="12" y="48" width="38" height="6" rx="2" fill="#002C5B" />
      <rect x="68" y="14" width="44" height="40" rx="4" fill="#002C5B" />
    </svg>
  ),

  Footer: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#002C6C" />
      {/* Watermark hint */}
      <text x="60" y="58" fontSize="18" fontWeight="900" fill="#ffffff" opacity="0.08" textAnchor="middle">Auto Hall</text>
      {/* Link columns */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={6 + i * 28} y="10" width="20" height="3" rx="1" fill="#94a3b8" />
          <rect x={6 + i * 28} y="18" width="16" height="2.5" rx="0.5" fill="#cbd5e1" opacity="0.5" />
          <rect x={6 + i * 28} y="24" width="16" height="2.5" rx="0.5" fill="#cbd5e1" opacity="0.5" />
        </g>
      ))}
      {/* Bottom bar */}
      <rect x="6" y="52" width="1" height="0" />
      <line x1="6" y1="46" x2="114" y2="46" stroke="#ffffff" strokeOpacity="0.15" />
      <rect x="6" y="52" width="40" height="3" rx="1" fill="#cbd5e1" opacity="0.6" />
      <circle cx="96" cy="53" r="5" fill="#ffffff" opacity="0.1" />
      <circle cx="108" cy="53" r="5" fill="#ffffff" opacity="0.1" />
    </svg>
  ),
  SpecsGrid: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#f8fafc" />
      {/* Section title */}
      <rect x="30" y="8" width="60" height="5" rx="1.5" fill="#0f172a" />
      {/* 3-col specs grid */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={6 + i * 36} y="22" width="30" height="36" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <rect x={12 + i * 36} y="30" width="18" height="4" rx="1" fill="#002C6C" />
          <rect x={12 + i * 36} y="38" width="14" height="3" rx="1" fill="#94a3b8" />
          <rect x={12 + i * 36} y="44" width="16" height="3" rx="1" fill="#cbd5e1" />
        </g>
      ))}
    </svg>
  ),
  ModelShowcaseGallery: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#0f172a" />
      {/* item-media-first — main large image left */}
      <rect x="6" y="8" width="54" height="52" rx="3" fill="#1e293b" />
      <rect x="6" y="8" width="54" height="52" rx="3" fill="#334155" opacity="0.5" />
      {/* item-media-last — 2x2 thumbnail mosaic right */}
      <rect x="64" y="8" width="24" height="24" rx="2" fill="#334155" />
      <rect x="90" y="8" width="24" height="24" rx="2" fill="#475569" />
      <rect x="64" y="36" width="24" height="24" rx="2" fill="#475569" />
      <rect x="90" y="36" width="24" height="24" rx="2" fill="#334155" />
      {/* "Afficher toutes les photos" button */}
      <rect x="10" y="50" width="42" height="6" rx="1" fill="rgba(0,0,0,0.55)" />
      <rect x="14" y="52" width="24" height="2" rx="0.5" fill="#ffffff" opacity="0.5" />
    </svg>
  ),
  AlternatingShowcase: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#ffffff" />
      {/* Row 1: text left, image right */}
      <rect x="8" y="10" width="46" height="4" rx="1" fill="#0f172a" />
      <rect x="8" y="18" width="36" height="3" rx="0.5" fill="#64748b" />
      <rect x="64" y="8" width="48" height="20" rx="3" fill="#cbd5e1" />
      {/* Row 2: image left, text right */}
      <rect x="8" y="38" width="48" height="20" rx="3" fill="#cbd5e1" />
      <rect x="64" y="40" width="46" height="4" rx="1" fill="#0f172a" />
      <rect x="64" y="48" width="36" height="3" rx="0.5" fill="#64748b" />
    </svg>
  ),
  TacticalFlashCampaign: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#f8fafc" />
      {/* 8/12 image placeholder on left */}
      <rect x="6" y="8" width="70" height="52" rx="3" fill="#cbd5e1" />
      {/* 4/12 form card on right */}
      <rect x="80" y="8" width="34" height="52" rx="4" fill="#002C6C" />
      {/* Form title line */}
      <rect x="85" y="16" width="24" height="3" rx="0.5" fill="#ffffff" opacity="0.9" />
      {/* Form fields */}
      <rect x="85" y="24" width="24" height="3.5" rx="1" fill="#ffffff" opacity="0.2" />
      <rect x="85" y="31" width="24" height="3.5" rx="1" fill="#ffffff" opacity="0.2" />
      <rect x="85" y="38" width="24" height="3.5" rx="1" fill="#ffffff" opacity="0.2" />
      {/* Submit button */}
      <rect x="85" y="47" width="24" height="5" rx="1.5" fill="#ffffff" />
    </svg>
  ),
  MultiStepTestDrive: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#f4f6f8" />
      {/* Visual banner on left */}
      <rect x="6" y="8" width="68" height="52" rx="3" fill="#eef2f6" stroke="#cbd5e1" strokeWidth="0.5" />
      <circle cx="20" cy="24" r="5" fill="#2563eb" opacity="0.3" />
      <rect x="28" y="22" width="32" height="4" rx="1" fill="#0f172a" />
      <rect x="14" y="34" width="52" height="18" rx="2" fill="#cbd5e1" />
      {/* Multi-step form card on right */}
      <rect x="78" y="8" width="36" height="52" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="82" y="14" width="16" height="2" rx="0.5" fill="#2563eb" />
      <rect x="82" y="18" width="26" height="3" rx="0.5" fill="#0f172a" />
      <rect x="82" y="24" width="28" height="1.5" rx="0.5" fill="#e2e8f0" />
      <rect x="82" y="24" width="12" height="1.5" rx="0.5" fill="#2563eb" />
      <rect x="82" y="28" width="28" height="5" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="82" y="35" width="28" height="5" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="82" y="44" width="28" height="8" rx="1.5" fill="#0f172a" />
    </svg>
  ),
  HeroFormUnified: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#f8fafc" />
      <rect x="8" y="12" width="40" height="4" rx="1.5" fill="#0f172a" />
      <rect x="8" y="20" width="30" height="3" rx="1" fill="#64748b" />
      <rect x="8" y="30" width="44" height="28" rx="2" fill="#cbd5e1" />
      <rect x="66" y="8" width="46" height="52" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="72" y="16" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="72" y="24" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="72" y="32" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="72" y="44" width="34" height="8" rx="2" fill="#002C6C" />
    </svg>
  ),
  ImmersiveGallery: () => (
    <svg viewBox="0 0 120 68" fill="none" className="v4-tmpl-thumb">
      <rect width="120" height="68" fill="#0f172a" />
      <rect x="6" y="8" width="54" height="52" rx="3" fill="#1e293b" />
      <rect x="64" y="8" width="24" height="24" rx="2" fill="#334155" />
      <rect x="90" y="8" width="24" height="24" rx="2" fill="#475569" />
      <rect x="64" y="36" width="24" height="24" rx="2" fill="#475569" />
      <rect x="90" y="36" width="24" height="24" rx="2" fill="#334155" />
    </svg>
  ),
};

// ── Section data ──────────────────────────────────────────────────────────────

type SectionDef = {
  id: string;
  label: string;
  desc: string;
  Thumb: React.ComponentType;
  brands?: string[];
  campaignTypes?: string[];
  tags: string[];
};

const SECTIONS: SectionDef[] = [
  // 1. Navigation
  {
    id: 'brand-navbar',
    label: 'Brand Navbar',
    desc: 'Barre de navigation blanche, Ariane & logo officiel',
    Thumb: T.BrandNavbar,
    brands: ['chery', 'ford', 'nissan', 'opel'],
    campaignTypes: ['corporate', 'launch', 'promotion'],
    tags: ['Navigation', 'Navbar', 'Header', 'Structure']
  },

  // 2. Campagne & Conversion
  {
    id: 'multi-step-test-drive',
    label: 'Multi-Step Test Drive (Gamme HEV)',
    desc: 'Formulaire multi-étapes optimisé avec bannière Tiggo et étapes 1/3, 2/3, 3/3',
    Thumb: T.MultiStepTestDrive,
    brands: ['chery', 'ford', 'nissan', 'opel'],
    campaignTypes: ['promotion', 'sav', 'launch'],
    tags: ['Conversion', 'Multi-Step', 'Test Drive', 'Gamme HEV', 'Bannière']
  },
  {
    id: 'hero-form-unified',
    label: 'Hero Form Unified',
    desc: 'Hero unifié avec formulaire de capture de lead instantané',
    Thumb: T.HeroFormUnified,
    brands: ['chery', 'ford', 'nissan', 'opel'],
    campaignTypes: ['promotion', 'launch'],
    tags: ['Hero', 'Lead Form', 'Conversion', 'Showroom']
  },
  {
    id: 'hero-immersive-form',
    label: 'Immersive Lead Hero',
    desc: 'Formulaire de disponibilité multi-étapes avec fond immersif',
    Thumb: T.HeroImmersiveForm,
    campaignTypes: ['launch'],
    tags: ['Hero', 'Lead Form', 'Multi-step', 'Launch', 'Product']
  },
  {
    id: 'hero-showroom',
    label: 'Vehicle Hero',
    desc: 'Hero classique avec visuel véhicule et formulaire direct',
    Thumb: T.HeroShowroom,
    campaignTypes: ['promotion'],
    tags: ['Hero', 'Lead Form', 'Showroom', 'Promotion']
  },
  {
    id: 'tactical-flash-campaign',
    label: 'Tactical Flash Campaign',
    desc: 'Offre promotionnelle tactique avec chrono et formulaire',
    Thumb: T.TacticalFlashCampaign,
    campaignTypes: ['promotion'],
    tags: ['Campagne', 'Flash', 'Promotion', 'Conversion']
  },
  {
    id: 'contact-section',
    label: 'Contact & Succursales',
    desc: 'Formulaire de contact avec coordonnées succursales',
    Thumb: T.ContactSection,
    campaignTypes: ['sav', 'promotion', 'corporate'],
    tags: ['Contact', 'Form', 'SAV', 'Promotion', 'Branch']
  },

  // 3. Caractéristiques
  {
    id: 'specs-grid',
    label: 'Specs Grid',
    desc: 'Grille des caractéristiques et avantages clés du modèle ou SAV',
    Thumb: T.SpecsGrid,
    campaignTypes: ['sav', 'promotion'],
    tags: ['Specifications', 'Specs', 'SAV', 'Promotion', 'Grid']
  },
  {
    id: 'specs-showroom',
    label: 'Model Identity',
    desc: 'Finitions & caractéristiques clés épurées',
    Thumb: T.SpecsShowroom,
    campaignTypes: ['launch'],
    tags: ['Specifications', 'Specs', 'Details', 'Model']
  },
  {
    id: 'alternating-showcase',
    label: 'Alternating Showcase',
    desc: 'Présentation des atouts en zig-zag texte et image',
    Thumb: T.AlternatingShowcase,
    campaignTypes: ['launch', 'promotion'],
    tags: ['Showcase', 'Features', 'Details', 'Zig-zag']
  },

  // 4. Médias
  {
    id: 'immersive-gallery',
    label: 'Galerie Immersive',
    desc: 'Mosaïque photo immersive avec vue plein écran du modèle',
    Thumb: T.ImmersiveGallery,
    campaignTypes: ['launch'],
    tags: ['Galerie', 'Médias', 'Photos', 'Showcase']
  },
  {
    id: 'model-showcase-gallery',
    label: 'Vehicle Gallery',
    desc: 'Mosaïque photo 2x2 du modèle',
    Thumb: T.ModelShowcaseGallery,
    campaignTypes: ['launch'],
    tags: ['Gallery', 'Product', 'Images', 'Photos']
  },
  {
    id: 'carousel',
    label: 'Carousel 3D',
    desc: 'Carousel 3D avec micro-interactions et slider tactile',
    Thumb: T.Carousel,
    campaignTypes: ['promotion', 'launch'],
    tags: ['Carousel', 'Features', 'Interactions', 'Cards']
  },
  {
    id: 'hero-cinematic',
    label: 'Cinematic Hero',
    desc: 'Plein écran vidéo/image avec overlay dégradé',
    Thumb: T.HeroCinematic,
    campaignTypes: ['launch', 'corporate'],
    tags: ['Hero', 'Video', 'Media', 'Launch', 'Cinematic']
  },
  {
    id: 'hero-mosaic',
    label: 'Campaign Mosaic',
    desc: 'Galerie mosaïque asymétrique + formulaire flottant',
    Thumb: T.HeroMosaic,
    campaignTypes: ['promotion', 'launch'],
    tags: ['Hero', 'Lead Form', 'Mosaic', 'Promotion', 'Launch']
  },

  // 5. Footers
  {
    id: 'footer-block',
    label: 'Footer / Mentions Légales',
    desc: 'Filigrane Auto Hall, liens, réseaux sociaux & mentions légales',
    Thumb: T.Footer,
    brands: ['chery', 'ford', 'nissan', 'opel'],
    campaignTypes: ['corporate', 'launch', 'promotion'],
    tags: ['Footer', 'Links', 'Legal', 'Structure']
  },
];

const CATEGORIES = [
  { id: 'navigation', label: '1. NAVIGATION', ids: ['brand-navbar'] },
  { id: 'conversion', label: '2. CAMPAGNE & CONVERSION', ids: ['multi-step-test-drive', 'hero-form-unified', 'hero-immersive-form', 'hero-showroom', 'tactical-flash-campaign', 'contact-section'] },
  { id: 'specs', label: '3. CARACTÉRISTIQUES', ids: ['specs-grid', 'specs-showroom', 'alternating-showcase'] },
  { id: 'media', label: '4. MÉDIAS', ids: ['immersive-gallery', 'model-showcase-gallery', 'carousel', 'hero-cinematic', 'hero-mosaic'] },
  { id: 'footers', label: '5. FOOTER & LÉGAL', ids: ['footer-block'] }
];

// ── Component ─────────────────────────────────────────────────────────────────

export function V4SectionsPanel() {
  const [search, setSearch] = React.useState('');
  const [catalogPulse, setCatalogPulse] = React.useState(false);
  const insertCanvasBlock = useBuilderV4Store((s) => s.insertCanvasBlock);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);

  function handleInsert(id: string) {
    insertCanvasBlock(id);
    setRightPanelOpen(true);
  }

  React.useEffect(() => {
    function handler(e: Event) {
      if ((e as CustomEvent).detail !== 'sections') return;
      setCatalogPulse(true);
      const timer = setTimeout(() => setCatalogPulse(false), 700);
      return () => clearTimeout(timer);
    }
    window.addEventListener('highlight-sidebar-tab', handler);
    return () => window.removeEventListener('highlight-sidebar-tab', handler);
  }, []);

  const categoriesWithBlocks = CATEGORIES.map(cat => {
    const blocksInCat = SECTIONS.filter(s => cat.ids.includes(s.id));
    const filteredBlocks = blocksInCat.filter(s => {
      // Search query matches label, description or tags
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchLabel = s.label.toLowerCase().includes(q);
        const matchDesc = s.desc.toLowerCase().includes(q);
        const matchTags = s.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchLabel && !matchDesc && !matchTags) return false;
      }
      
      return true;
    });
    
    return {
      ...cat,
      blocks: filteredBlocks
    };
  }).filter(cat => cat.blocks.length > 0);

  return (
    <div
      className={cn('v4-lib-panel', catalogPulse && 'animate-pulse duration-700')}
      data-testid="sections-panel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '10px 8px', boxSizing: 'border-box' }}
    >
      {/* ── Filters: Search Only ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, background: 'rgba(0,0,0,0.15)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 6,
              color: '#e4e4e7',
              fontSize: 11,
              padding: '6px 10px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* ── Vertical Navigation Hierarchy ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {categoriesWithBlocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 10px', color: '#71717a', fontSize: 11 }}>
            Aucun bloc ne correspond à la recherche
          </div>
        ) : (
          categoriesWithBlocks.map(cat => (
            <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Category Header Label */}
              <h3 style={{
                margin: '0 0 2px',
                fontSize: 9.5,
                fontWeight: 800,
                color: '#52525b',
                letterSpacing: '0.08em',
                paddingLeft: 4
              }}>
                {cat.label}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cat.blocks.map(s => {
                  const { Thumb } = s;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className="v4-lib-card v4-lib-card--row"
                      onClick={() => handleInsert(s.id)}
                      title={s.label}
                      data-testid={`section-${s.id}`}
                      style={{
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left',
                        transition: 'background 160ms ease, border-color 160ms ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }}
                    >
                      <div style={{ width: 72, flexShrink: 0, borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Thumb />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#e4e4e7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>{s.label}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#71717a', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{s.desc}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                          {s.tags.map((tag, idx) => (
                            <span key={idx} style={{ fontSize: 8.5, fontWeight: 600, color: '#a1a1aa', background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 4px', textTransform: 'uppercase' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

