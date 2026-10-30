import React from 'react';
import { useBuilderV4Store } from '../store/document.store';

// ── SVG Thumbnails (stacked section previews) ─────────────────────────────────

const T = {
  CampagneThermique: () => (
    <svg viewBox="0 0 160 120" fill="none" className="v4-tmpl-thumb">
      {/* Left: campaign banner image area */}
      <rect width="100" height="120" fill="#e8e8e8" />
      {/* Placeholder image icon */}
      <rect x="30" y="40" width="40" height="30" rx="3" fill="#d0d0d0" />
      <circle cx="42" cy="53" r="5" fill="#b8b8b8" />
      <path d="M30 65 l15-12 10 8 10-10 15 12" stroke="#b8b8b8" strokeWidth="1.5" fill="none" />
      {/* Cars outline suggestion */}
      <rect x="10" y="75" width="80" height="25" rx="2" fill="#d8d8d8" opacity="0.6" />
      <text x="50" y="91" textAnchor="middle" fontSize="6" fill="#a0a0a0">Banniere campagne</text>

      {/* Right: white form card */}
      <rect x="100" width="60" height="120" fill="#f5f5f5" />
      {/* Form card */}
      <rect x="104" y="12" width="52" height="96" rx="4" fill="#ffffff" />
      {/* Progress bar track */}
      <rect x="104" y="12" width="52" height="3" rx="1.5" fill="#eeeeee" />
      {/* Progress fill (step 1 = ~33%) */}
      <rect x="104" y="12" width="17" height="3" rx="1.5" fill="#288fe3" />
      {/* Step header */}
      <rect x="110" y="22" width="40" height="3" rx="1" fill="#e2e8f0" />
      <rect x="108" y="28" width="44" height="4" rx="1" fill="#212529" opacity="0.8" />
      <rect x="110" y="35" width="40" height="2" rx="1" fill="#e2e8f0" />
      {/* Divider */}
      <rect x="104" y="42" width="52" height="1" fill="#eeeeee" />
      {/* Form field (select) */}
      <rect x="110" y="48" width="40" height="2.5" rx="0.5" fill="#e2e8f0" />
      <rect x="110" y="53" width="40" height="8" rx="2" fill="#f1f5f9" stroke="#ced4da" strokeWidth="0.5" />
      {/* Dropdown arrow */}
      <path d="M146 57 l2 2.5 2-2.5" stroke="#6c757d" strokeWidth="0.8" fill="none" />
      {/* Button */}
      <rect x="110" y="67" width="40" height="8" rx="2" fill="#288fe3" />
      {/* Footer */}
      <rect x="104" y="95" width="52" height="13" fill="#f8f9fa" />
      <rect x="118" y="100" width="24" height="2" rx="1" fill="#ced4da" />
    </svg>
  ),
  FordTerritory: () => (
    <svg viewBox="0 0 160 120" fill="none" className="v4-tmpl-thumb">
      {/* Navbar section at top */}
      <rect width="160" height="15" fill="#ffffff" />
      <circle cx="10" cy="7.5" r="2.5" fill="#002C5B" />
      <rect x="20" y="6" width="30" height="3" rx="1" fill="#e2e8f0" />
      <rect x="130" y="6" width="20" height="3" rx="1" fill="#94a3b8" />

      {/* Immersive Gallery */}
      <rect y="15" width="100" height="35" fill="#1e293b" />
      <rect x="102" y="15" width="58" height="17" fill="#334155" />
      <rect x="102" y="33" width="58" height="17" fill="#475569" />

      {/* Specs / Price / Title */}
      <rect y="50" width="160" height="35" fill="#ffffff" />
      <rect x="10" y="58" width="50" height="6" rx="1.5" fill="#0f172a" />
      <rect x="10" y="68" width="80" height="3" rx="0.5" fill="#94a3b8" />
      <rect x="10" y="74" width="60" height="3" rx="0.5" fill="#94a3b8" />
      <rect x="110" y="58" width="40" height="8" rx="2" fill="#002C5B" />
      <rect x="110" y="70" width="30" height="5" rx="1.5" fill="#e2e8f0" />

      {/* Conversion Form (SUV Background with floating lead form) */}
      <rect y="85" width="160" height="35" fill="#090d16" />
      <rect x="55" y="88" width="50" height="30" rx="3" fill="#ffffff" />
      <rect x="60" y="93" width="40" height="3" rx="1" fill="#e2e8f0" />
      <rect x="60" y="98" width="40" height="3" rx="1" fill="#e2e8f0" />
      <rect x="60" y="103" width="40" height="5" rx="1.5" fill="#002C5B" />
    </svg>
  ),
  Chery: () => (
    <svg viewBox="0 0 160 120" fill="none" className="v4-tmpl-thumb">
      {/* Navbar section at top */}
      <rect width="160" height="15" fill="#ffffff" />
      <circle cx="10" cy="7.5" r="2.5" fill="#8C1D40" />
      <rect x="20" y="6" width="30" height="3" rx="1" fill="#e2e8f0" />
      <rect x="130" y="6" width="20" height="3" rx="1" fill="#94a3b8" />

      {/* Hero Form Unified (Immersive Form with red accent) */}
      <rect y="15" width="160" height="45" fill="#8C1D40" />
      <rect x="10" y="22" width="60" height="5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="10" y="30" width="70" height="2.5" rx="0.5" fill="#ffffff" opacity="0.6" />
      <rect x="110" y="20" width="40" height="30" rx="3" fill="#ffffff" />
      <rect x="115" y="25" width="30" height="2.5" rx="0.5" fill="#e2e8f0" />
      <rect x="115" y="30" width="30" height="2.5" rx="0.5" fill="#e2e8f0" />
      <rect x="115" y="35" width="30" height="2.5" rx="0.5" fill="#e2e8f0" />
      <rect x="115" y="42" width="30" height="4" rx="1" fill="#8C1D40" />

      {/* Models Grid (Chery models with red borders/badges) */}
      <rect y="60" width="160" height="35" fill="#ffffff" />
      <rect x="10" y="65" width="40" height="25" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="12" y="67" width="8" height="3" rx="1" fill="#8C1D40" />
      <rect x="15" y="82" width="30" height="4" rx="1" fill="#e2e8f0" />
      <rect x="60" y="65" width="40" height="25" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="62" y="67" width="8" height="3" rx="1" fill="#8C1D40" />
      <rect x="65" y="82" width="30" height="4" rx="1" fill="#e2e8f0" />
      <rect x="110" y="65" width="40" height="25" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="112" y="67" width="8" height="3" rx="1" fill="#8C1D40" />
      <rect x="115" y="82" width="30" height="4" rx="1" fill="#e2e8f0" />

      {/* Footer / Contact */}
      <rect y="95" width="160" height="25" fill="#002C6C" />
      <rect x="10" y="100" width="40" height="4" rx="1.5" fill="#ffffff" />
      <rect x="10" y="108" width="50" height="3" rx="1" fill="#94a3b8" />
    </svg>
  ),

  CampagneFlash: () => (
    <svg viewBox="0 0 160 120" fill="none" className="v4-tmpl-thumb">
      {/* Minimal logo-only navbar */}
      <rect width="160" height="12" fill="#ffffff" />
      <circle cx="10" cy="6" r="2.5" fill="#002C6C" />
      <rect x="20" y="4.5" width="22" height="3" rx="1" fill="#002C6C" opacity="0.6" />
      {/* FLASH badge */}
      <rect x="130" y="3" width="24" height="6" rx="3" fill="#e55c30" />
      <text x="142" y="8" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">FLASH</text>

      {/* Asymmetric hero: 8/12 image + 4/12 form */}
      <rect y="12" width="160" height="108" fill="#f0f4f8" />
      {/* Promo image — large left zone */}
      <rect x="4" y="17" width="100" height="98" rx="3" fill="#1e293b" />
      {/* Car silhouette suggestion */}
      <ellipse cx="54" cy="80" rx="38" ry="20" fill="#334155" />
      <rect x="20" y="58" width="68" height="22" rx="8" fill="#475569" />
      <ellipse cx="32" cy="82" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
      <ellipse cx="76" cy="82" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
      {/* Promo tag on image */}
      <rect x="10" y="22" width="38" height="8" rx="2" fill="#e55c30" />
      <text x="29" y="28" textAnchor="middle" fontSize="4.5" fill="#fff" fontWeight="bold">[OFFRE FLASH]</text>
    </svg>
  ),
  MultiStepTestDriveThumb: () => (
    <svg viewBox="0 0 160 120" fill="none" className="v4-tmpl-thumb">
      {/* Navbar at top */}
      <rect width="160" height="12" fill="#ffffff" />
      <circle cx="10" cy="6" r="2.5" fill="#002C6C" />
      <rect x="20" y="4.5" width="22" height="3" rx="1" fill="#002C6C" opacity="0.6" />
      {/* TEST DRIVE badge */}
      <rect x="120" y="3" width="34" height="6" rx="3" fill="#10b981" />
      <text x="137" y="8" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">DRIVE</text>

      {/* Asymmetric layout */}
      <rect y="12" width="160" height="108" fill="#f0f4f8" />
      {/* Left visual area */}
      <rect x="4" y="17" width="100" height="98" rx="3" fill="#1e293b" />
      <circle cx="54" cy="60" r="16" fill="#334155" />
      {/* Right form card */}
      <rect x="108" y="17" width="48" height="98" rx="4" fill="#011625" />
      {/* Slim progress indicator at top of form */}
      <rect x="108" y="17" width="32" height="2.5" fill="#10b981" />
      {/* Inputs */}
      <rect x="113" y="30" width="38" height="6" rx="2" fill="#ffffff" opacity="0.15" />
      <rect x="113" y="40" width="38" height="6" rx="2" fill="#ffffff" opacity="0.15" />
      {/* Buttons */}
      <rect x="113" y="90" width="38" height="8" rx="2" fill="#10b981" />
    </svg>
  ),
};

// ── Template data ─────────────────────────────────────────────────────────────

type TemplateDef = {
  id: string;
  label: string;
  desc: string;
  sections: string[];
  Thumb: React.ComponentType;
  category: 'pages' | 'starters' | 'conversion';
  brands?: string[];
  campaignTypes?: string[];
  tags: string[];
};

const TEMPLATES: TemplateDef[] = [
  {
    id:       'fiche-modele-officielle',
    label:    'Fiche Modèle Officielle',
    desc:     'Navbar · Hero Form Immersif · Showroom · Alternating · Galerie · Footer',
    sections: ['Brand Navbar', 'HeroImmersiveForm', 'ModelIdentityShowroom', 'AlternatingShowcase', 'ModelShowcaseGallery', 'Footer'],
    Thumb:    T.FordTerritory,
    category: 'pages',
    brands:   ['ford', 'chery', 'nissan', 'opel'],
    campaignTypes: ['launch', 'corporate'],
    tags:     ['Full Page', 'Showroom', 'Official', 'Model', 'Launch']
  },

  {
    id:       'decouverte-gamme-energie',
    label:    'Découverte de Gamme Énergie',
    desc:     'Navbar · Hero Mosaic · Alternating · Footer',
    sections: ['Brand Navbar', 'HeroMosaicGrid', 'AlternatingShowcase', 'Footer'],
    Thumb:    T.Chery,
    category: 'pages',
    brands:   ['chery'],
    campaignTypes: ['launch', 'promotion'],
    tags:     ['Full Page', 'Range', 'Energy', 'Chery', 'Launch']
  },
  {
    id:       'autohall-sav-starter',
    label:    'Auto Hall SAV (Officiel)',
    desc:     'Bloc autonome — bandeau de marque, visuel véhicule et formulaire de rappel rapide bicolore, entièrement éditable en un seul bloc.',
    sections: ['Campagne Flash Promo'],
    Thumb:    T.CampagneFlash,
    category: 'starters',
    brands:   ['chery', 'ford', 'nissan', 'opel'],
    campaignTypes: ['promotion', 'sav'],
    tags:     ['Starter', 'SAV', 'Promotion', 'Officiel']
  },
  {
    id:       'multi-step-test-drive',
    label:    'Multi-Step Test Drive',
    desc:     'Formulaire multi-étapes pour réservation d’essais routiers. Optimisé pour la conversion avec barre de progression.',
    sections: ['Multi-Step Test Drive'],
    Thumb:    T.MultiStepTestDriveThumb,
    category: 'conversion',
    brands:   ['chery', 'ford', 'nissan', 'opel'],
    campaignTypes: ['promotion', 'sav'],
    tags:     ['Starter', 'Multi-Step', 'Test Drive', 'Conversion']
  },
];

// ── Custom Select Component ──────────────────────────────────────────────────

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  searchable?: boolean;
}

function CustomSelect({ label, value, onChange, options, searchable }: CustomSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  const selectedOption = options.find(o => o.value === value) || options[0];
  const filtered = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
        {label}
      </span>
      
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs transition-colors hover:bg-zinc-800 focus:outline-none"
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
      >
        <span className="truncate">
          {selectedOption.label}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 text-zinc-500 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none', marginLeft: 6 }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            className="absolute top-[calc(100%+4px)] left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 p-1 flex flex-col gap-1"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            }}
          >
            {searchable && (
              <div className="p-1">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="w-full h-7 px-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs outline-none"
                  style={{ boxSizing: 'border-box' }}
                />
              </div>
            )}
            <div className="max-h-[140px] overflow-y-auto flex flex-col gap-0.5">
              {filtered.map(opt => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-[10px] text-zinc-500 py-2 text-center">
                  Aucun résultat
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────


export function V4TemplatesPanel() {
  const loadTemplate = useBuilderV4Store((s) => s.loadTemplate);
  const insertCanvasBlock = useBuilderV4Store((s) => s.insertCanvasBlock);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);
  const [activeTab, setActiveTab] = React.useState<'pages' | 'starters' | 'conversion'>('pages');
  const [search, setSearch] = React.useState('');
  const [selectedBrand, setSelectedBrand] = React.useState('all');
  const [selectedCampaign, setSelectedCampaign] = React.useState('all');
  const [expandedTplId, setExpandedTplId] = React.useState<string | null>(null);

  function handleInsert(tplId: string) {
    loadTemplate('blank');
    insertCanvasBlock(tplId);
    setRightPanelOpen(false);
  }

  const activeTemplates = TEMPLATES.filter(t => {
    if (t.category !== activeTab) return false;
    
    // Brand filter (brand-agnostic templates are shown for all brands)
    if (selectedBrand !== 'all') {
      if (t.brands && !t.brands.includes(selectedBrand)) return false;
    }
    
    // Campaign filter (campaign-agnostic templates are shown for all campaigns)
    if (selectedCampaign !== 'all') {
      if (t.campaignTypes && !t.campaignTypes.includes(selectedCampaign)) return false;
    }
    
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchLabel = t.label.toLowerCase().includes(q);
      const matchDesc = t.desc.toLowerCase().includes(q);
      const matchTags = t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchLabel && !matchDesc && !matchTags) return false;
    }
    
    return true;
  });

  const brandOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'chery', label: 'Chery' },
    { value: 'ford', label: 'Ford' },
    { value: 'nissan', label: 'Nissan' },
    { value: 'opel', label: 'Opel' },
  ];

  const campaignOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'launch', label: 'Lancement' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'sav', label: 'Après-Vente' },
    { value: 'corporate', label: 'Corporate' },
  ];

  function renderTemplateCard(tpl: TemplateDef) {
    const { Thumb } = tpl;
    const isExpanded = expandedTplId === tpl.id;

    return (
      <div
        key={tpl.id}
        data-testid={`template-${tpl.id}`}
        onClick={() => handleInsert(tpl.id)}
        style={{
          display: 'flex', flexDirection: 'column', gap: 0,
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left',
          overflow: 'hidden', transition: 'border-color 180ms ease, background 180ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
      >
        <div style={{ width: '100%', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Thumb />
        </div>

        <div style={{ padding: '10px 12px 12px', boxSizing: 'border-box' }}>
          <p style={{ margin: '0 0 3px', fontSize: 11.5, fontWeight: 700, color: '#e4e4e7', lineHeight: 1.4 }}>{tpl.label}</p>
          <p style={{ margin: '0 0 8px', fontSize: 10.5, color: '#71717a', lineHeight: 1.4 }}>{tpl.desc}</p>
          
          {/* Metadata Badges: Max 2 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {tpl.tags.slice(0, 2).map((tag, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 600, color: '#e4e4e7', background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Structure Preview Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedTplId(isExpanded ? null : tpl.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a1a1aa',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 0',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <span>{isExpanded ? 'Masquer la structure' : 'Voir la structure'}</span>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {isExpanded && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
              {tpl.sections.map((s, i) => (
                <span key={i} style={{ fontSize: 9, color: '#a1a1aa', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '1px 5px' }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="v4-lib-panel" data-testid="templates-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '10px 8px', boxSizing: 'border-box' }}>

      {/* ── Filters: Search + Dropdowns (Mutualisés au sommet) ──── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, background: 'rgba(0,0,0,0.15)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <input
            type="text"
            placeholder="Rechercher un template ou tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs outline-none transition-colors focus:border-zinc-700"
            style={{ boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <CustomSelect
            label="Marque"
            value={selectedBrand}
            onChange={setSelectedBrand}
            options={brandOptions}
            searchable={true}
          />
          <CustomSelect
            label="Campagne"
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            options={campaignOptions}
            searchable={false}
          />
        </div>
      </div>

      {/* ── Switcher d'onglets ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 3,
        borderRadius: 10,
        marginBottom: 12,
        gap: 3,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}>
        {([
          { value: 'pages', label: 'Full Pages' },
          { value: 'starters', label: 'Starters' },
          { value: 'conversion', label: 'Conversion' },
        ] as const).map((t) => {
          const isActive = activeTab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setActiveTab(t.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '7px 10px',
                borderRadius: 7,
                background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
                color: isActive ? '#f4f4f5' : '#52525b',
                transition: 'background 180ms ease, color 180ms ease',
                lineHeight: 1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Liste des templates ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 10px', color: '#71717a', fontSize: 11 }}>
            Aucun template ne correspond aux filtres
          </div>
        ) : (
          activeTemplates.map(renderTemplateCard)
        )}
      </div>
    </div>
  );
}
