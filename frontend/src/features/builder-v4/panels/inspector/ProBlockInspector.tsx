import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { uploadOrEmbedImage } from '../../lib/upload-image-asset';
import { HexColorPicker } from 'react-colorful';
import { Plus, Trash2, Zap, ShipWheel, Shield, Monitor, Armchair, ImagePlus, X, Leaf, Gauge, Calendar, Cpu, Battery, Thermometer, Check } from 'lucide-react';
import { useBuilderV4Store } from '../../store/document.store';
import { getProBlockType, isVillesListSynced, AUTOHALL_OFFICIAL_CITIES, FINITION_ICON_PRESETS, SPEC_KEY_FEATURE_ICON_PRESETS, DEFAULT_CONTACT_FIELDS } from '../../lib/pro-blocks';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/shadcn/popover';
import { AUTOHALL_BRANDS } from '@/config/brands';
import type {
  BrandNavbarBlockProps,
  SpecsGridBlockProps,
  ModelShowcaseGalleryBlockProps,
  ModelShowcaseGalleryRadius,
  ModelShowcaseGalleryGap,
  ConversionFormSplitBlockProps,
  HeroConversionBaseProps,
  HeroImmersiveFormProps,
  CarouselBlockProps,
  CarouselItem,
  SpecItem,
  BrandNavbarLink,
  SpecsShowroomBlockProps,
  SpecKeyFeature,
  ContactSectionBlockProps,
  ContactFormField,
  ContactFieldId,
  ModelsGridBlockProps,
  VehicleModelItem,
  FinitionItem,
  FinitionOption,
  FinitionIconPresetKey,
  CampaignGammeThermiqueBlockProps,
  FooterBlockProps,
  TacticalFlashCampaignBlockProps,
} from '../../lib/pro-blocks';

// ── Shared UI Primitives (Sleek Dark Theme) ──────────────────────────────────

function PLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', marginBottom: 4 }}>
      {children}
    </label>
  );
}

function PInput({ value, onChange, onFocus, placeholder, type = 'text', disabled = false }: { value: string; onChange: (v: string) => void; onFocus?: () => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <input
      type={type}
      className="v4-prop-input bg-[#252525] border border-[#3A3A3A] text-gray-200 rounded-md p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none w-full transition-colors"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={onFocus}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  );
}

function PTextarea({ value, onChange, placeholder, height = 64 }: { value: string; onChange: (v: string) => void; placeholder?: string; height?: number }) {
  return (
    <textarea
      className="v4-prop-input bg-[#252525] border border-[#3A3A3A] text-gray-200 rounded-md p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none w-full transition-colors resize-y"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        height,
      }}
    />
  );
}

function PSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', cursor: 'pointer' }}>
      <span style={{ fontSize: 12, color: '#d1d5db' }}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{
          width: 16,
          height: 16,
          accentColor: '#288fe3',
          cursor: 'pointer',
        }}
      />
    </label>
  );
}

function PColorRow({ value, onChange, label, disabled = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PLabel>{label}</PLabel>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value ?? '#e85d04'}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            border: '1px solid #27272a',
            borderRadius: 6,
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <PInput value={value} onChange={onChange} placeholder="#e85d04" disabled={disabled} />
      </div>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="border-b border-[#252525] mb-3">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 mt-6">
        {title}
      </h4>
    </div>
  );
}

function MediaUploadZone({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (!files || !files[0]) return;
    const file = files[0];

    // Show immediate local preview while uploading
    const localUrl = URL.createObjectURL(file);
    onChange(localUrl);
    setUploading(true);
    setUploadFailed(false);

    try {
      // Upload to server so the asset URL is persistent and bundlable in ZIP export
      const result = await uploadOrEmbedImage(file);
      // Replace the ephemeral blob URL with the permanent server/asset URL
      onChange(result.src);
      // Only revoke now — the blob is safely superseded by the server URL above.
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      console.warn('[MediaUploadZone] Server upload failed:', err);
      setUploadFailed(true);
      toast.error("Échec du téléversement de l'image", {
        description: "L'aperçu local reste visible, mais l'image ne sera pas sauvegardée tant que le téléversement n'a pas réussi. Réessayez.",
      });
      // Deliberately do NOT revoke localUrl here — it's still the only value in
      // `value`, so revoking it now would blank the preview we just promised to keep.
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      void handleFiles(e.target.files);
    }
  };

  const isServerUrl = value && (value.includes('/api/public/assets/') || value.startsWith('http'));
  const isBlobUrl = value && value.startsWith('blob:');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <PLabel>{label}</PLabel>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#288fe3' : uploading ? '#f59e0b' : uploadFailed ? '#ef4444' : '#27272a'}`,
          borderRadius: 8,
          background: '#09090b',
          padding: '16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 200ms',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} disabled={uploading} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {uploading ? (
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>⏳ Téléversement en cours…</span>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragActive ? '#288fe3' : '#a1a1aa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span style={{ fontSize: 11, color: '#e4e4e7' }}>
                Glisser-déposer une image ou <span style={{ color: '#288fe3', fontWeight: 600 }}>parcourir</span>
              </span>
              <span style={{ fontSize: 9, color: '#71717a' }}>PNG, JPG, WEBP jusqu'à 5 Mo</span>
            </>
          )}
        </div>
      </div>
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <img src={value} style={{ width: 48, height: 32, borderRadius: 4, objectFit: 'cover', border: '1px solid #27272a' }} />
          <span style={{ fontSize: 10, color: uploadFailed ? '#ef4444' : isServerUrl ? '#4ade80' : '#f59e0b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
            {uploading ? 'Téléversement…' : uploadFailed ? '✕ Échec — aperçu local uniquement, réessayez' : isBlobUrl ? '⚠ Aperçu local (non sauvegardé)' : isServerUrl ? '✓ Image sauvegardée sur le serveur' : value}
          </span>
        </div>
      )}
    </div>
  );
}

// ── 1. Navbar Inspector ───────────────────────────────────────────────────────

function BrandNavbarInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as BrandNavbarBlockProps;
  const patch = (partial: Partial<BrandNavbarBlockProps>) => updateBlockProps(nodeId, partial);

  const updateNavLink = (idx: number, key: keyof BrandNavbarLink, val: string) => {
    const navLinks = [...(props.navLinks ?? [])];
    navLinks[idx] = { ...navLinks[idx], [key]: val };
    
    // Maintain backwards compatibility:
    const links = navLinks.map(n => ({ id: n.id, label: n.label, href: n.href }));
    patch({ navLinks, links });
  };

  const addNavLink = () => {
    const newId = `link_${Date.now()}`;
    const navLinks = [...(props.navLinks ?? []), { id: newId, label: 'Nouveau lien', href: '#' }];
    
    // Maintain backwards compatibility:
    const links = navLinks.map(n => ({ id: n.id, label: n.label, href: n.href }));
    patch({ navLinks, links });
  };

  const removeNavLink = (idx: number) => {
    const navLinks = (props.navLinks ?? []).filter((_, i) => i !== idx);
    
    // Maintain backwards compatibility:
    const links = navLinks.map(n => ({ id: n.id, label: n.label, href: n.href }));
    patch({ navLinks, links });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionDivider title="Marque & Logo" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Marque de référence</PLabel>
        <select
          value={props.brand ?? 'Ford'}
          onChange={e => patch({ brand: e.target.value })}
          style={{ height: 32, background: '#09090b', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7', fontSize: 12, padding: '0 8px', outline: 'none', width: '100%', cursor: 'pointer' }}
        >
          <option value="Ford">Ford</option>
          <option value="Chery">Chery</option>
          <option value="Opel">Opel</option>
          <option value="BYD">BYD</option>
          <option value="Maserati">Maserati</option>
        </select>
      </div>

      <MediaUploadZone
        value={props.logoUrl ?? ''}
        onChange={v => patch({ logoUrl: v, logoSrc: v })}
        label="Logo de la marque"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Texte alternatif de la marque</PLabel>
        <PInput value={props.altText ?? ''} onChange={v => patch({ altText: v })} placeholder="Nom de la marque..." />
      </div>

      <SectionDivider title="Disposition" />
      <PSwitch label="Fixer la barre au défilement (Sticky)" checked={!!props.sticky} onChange={v => patch({ sticky: v })} />

      <SectionDivider title="Liens de Navigation" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(props.navLinks ?? []).map((link, idx) => (
          <div key={link.id || idx} style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', background: '#09090b', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#52525b' }}>LIEN {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeNavLink(idx)}
                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PInput value={link.label} onChange={v => updateNavLink(idx, 'label', v)} placeholder="Texte du lien" />
              <PInput value={link.href} onChange={v => updateNavLink(idx, 'href', v)} placeholder="Ancrage (Ex: #specs-grid)" />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addNavLink}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 32, borderRadius: 6, border: '1px dashed #27272a',
            background: 'transparent', color: '#71717a', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            marginTop: 4,
          }}
        >
          <Plus size={10} /> Ajouter un lien
        </button>
      </div>

      <SectionDivider title="Actions de droite" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Numéro de téléphone</PLabel>
        <PInput
          value={props.phoneNumber ?? '0 800 09 28 28'}
          onChange={v => patch({ phoneNumber: v })}
          placeholder="Ex: 0 800 09 28 28"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Lien du bouton</PLabel>
        <PInput
          value={props.contactHref ?? '/fr/contact'}
          onChange={v => patch({ contactHref: v })}
          placeholder="Ex: /fr/contact ou #contact-section"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Libellé du bouton</PLabel>
        <PInput
          value={props.contactLabel ?? 'Contact'}
          onChange={v => patch({ contactLabel: v })}
          placeholder="Ex: Contact ou Réserver"
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <PLabel>Couleur fond CTA</PLabel>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="color"
              value={props.contactBgColor ?? '#002c6c'}
              onChange={e => patch({ contactBgColor: e.target.value })}
              style={{ width: 28, height: 28, border: 'none', borderRadius: 4, background: 'none', cursor: 'pointer', padding: 0 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#a1a1aa' }}>{props.contactBgColor ?? '#002c6c'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <PLabel>Couleur texte CTA</PLabel>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="color"
              value={props.contactTextColor ?? '#ffffff'}
              onChange={e => patch({ contactTextColor: e.target.value })}
              style={{ width: 28, height: 28, border: 'none', borderRadius: 4, background: 'none', cursor: 'pointer', padding: 0 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#a1a1aa' }}>{props.contactTextColor ?? '#ffffff'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. Hero Showroom Inspector ────────────────────────────────────────────────

// ── 2. Hero Conversion Unified Inspector ──────────────────────────────────────

function HeroCommonFormInspector({
  nodeId,
  blockType,
}: {
  nodeId: string;
  blockType: 'hero-showroom' | 'hero-mosaic' | 'hero-cinematic';
}) {
  const node = useBuilderV4Store((s) => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store((s) => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'design' | 'routing'>('content');

  if (!node) return null;

  const props = node.props as HeroConversionBaseProps;
  const patch = (partial: any) => updateBlockProps(nodeId, partial);

  const updateModel = (idx: number, val: string) => {
    const list = [...(props.modelsList ?? [])];
    list[idx] = val;
    patch({ modelsList: list });
  };

  const addModel = () => {
    const list = [...(props.modelsList ?? []), 'Nouveau Modèle'];
    patch({ modelsList: list });
  };

  const removeModel = (idx: number) => {
    const list = (props.modelsList ?? []).filter((_: string, i: number) => i !== idx);
    patch({ modelsList: list });
  };

  const updateVille = (idx: number, val: string) => {
    const list = [...(props.villesList ?? [])];
    list[idx] = val;
    patch({ villesList: list });
  };

  const addVille = () => {
    const list = [...(props.villesList ?? []), 'Nouvelle Ville'];
    patch({ villesList: list });
  };

  const removeVille = (idx: number) => {
    const list = (props.villesList ?? []).filter((_: string, i: number) => i !== idx);
    patch({ villesList: list });
  };

  const isMultiStep = props.formMode === 'multi-step';
  const selectedBrand = props.brandKey ? AUTOHALL_BRANDS.find((b) => b.id === props.brandKey) : undefined;
  const landingPageType = useBuilderV4Store((s) => s.document.meta?.landingPageType) ?? 'brand';
  const isModelLanding = landingPageType === 'model';

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: 4 }}>
        {(['content', 'layout', 'design', 'routing'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #288fe3' : '2px solid transparent',
              color: activeTab === tab ? '#e4e4e7' : '#71717a',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab === 'content'
              ? 'Contenu'
              : tab === 'layout'
                ? 'Disposition'
                : tab === 'design'
                  ? 'Design'
                  : 'Routage'}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Appliquer un modèle de marque" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Marque Auto Hall</PLabel>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: selectedBrand?.primaryColor ?? '#3f3f46',
                  pointerEvents: 'none',
                }}
              />
              <select
                value={props.brandKey ?? ''}
                onChange={(e) => {
                  const id = e.target.value;
                  const preset = AUTOHALL_BRANDS.find((b) => b.id === id);
                  if (!preset) {
                    patch({ brandKey: null });
                    return;
                  }
                  patch({
                    brandKey: preset.id,
                    brandLogoUrl: preset.logo,
                    colorPrimary: preset.primaryColor,
                    colorSecondary: preset.secondaryColor,
                    villesList: [...AUTOHALL_OFFICIAL_CITIES],
                  });
                }}
                style={{
                  height: 34,
                  width: '100%',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 6,
                  color: '#e4e4e7',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '0 10px 0 28px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Aucune marque (personnalisé)</option>
                {AUTOHALL_BRANDS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.4, marginTop: -8 }}>
            Injecte la palette de couleurs officielle et les villes du réseau Auto Hall. Complétez ensuite le titre,
            la description et les visuels du modèle mis en avant.
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Logo de la marque</PLabel>
            <MediaUploadZone
              value={props.brandLogoUrl ?? ''}
              onChange={(v) => patch({ brandLogoUrl: v || null })}
              label="Logo affiché au-dessus du titre"
            />
            {props.brandKey && !selectedBrand?.logo && !props.brandLogoUrl ? (
              <span style={{ fontSize: 10, color: '#fb923c', lineHeight: 1.4 }}>
                Aucun logo officiel enregistré pour {selectedBrand?.name} — uploadez-le ici pour l'afficher sur le canevas.
              </span>
            ) : null}
          </div>

          <SectionDivider title="Textes Principaux" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Badge</PLabel>
            <PInput value={props.badgeText ?? ''} onChange={(v) => patch({ badgeText: v })} placeholder="OFFRE EXCLUSIVE" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Titre (H1)</PLabel>
            <PInput value={props.title ?? ''} onChange={(v) => patch({ title: v })} placeholder="Titre..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Description</PLabel>
            <PTextarea
              value={props.description ?? ''}
              onChange={(v) => patch({ description: v })}
              placeholder="Description..."
              height={60}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Prix d'appel (Ex: À partir de X DH*)</PLabel>
            <PInput value={props.priceAppel ?? ''} onChange={(v) => patch({ priceAppel: v })} placeholder="159 000 DH*" />
          </div>

          <SectionDivider title="Mode du Formulaire" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Type de parcours</PLabel>
            <select
              value={props.formMode ?? 'multi-step'}
              onChange={(e) => patch({ formMode: e.target.value as any })}
              style={{
                height: 32,
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: 6,
                color: '#e4e4e7',
                fontSize: 12,
                padding: '0 8px',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="multi-step">Essai routier en 3 étapes (Modèle → Ville → Coordonnées)</option>
              <option value="single-step">Formulaire de capture direct (1 étape)</option>
            </select>
          </div>

          {isMultiStep ? (
            <>
              <SectionDivider title="Textes du Formulaire (3 étapes)" />
              {isModelLanding ? (
                <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.4 }}>
                  Page en mode "Landing de Modèle" — l'Étape 1 (choix du véhicule) est masquée sur le canevas, le
                  formulaire démarre directement à l'Étape 2.
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Étape 1 : Titre</PLabel>
                  <PInput
                    value={props.step1Title ?? 'Sélectionnez le véhicule'}
                    onChange={(v) => patch({ step1Title: v })}
                    onFocus={() => patch({ studioPreviewStep: 1 })}
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Étape 2 : Titre</PLabel>
                <PInput
                  value={props.step2Title ?? 'Disponibilité'}
                  onChange={(v) => patch({ step2Title: v })}
                  onFocus={() => patch({ studioPreviewStep: 2 })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Étape 3 : Titre</PLabel>
                <PInput
                  value={props.step3Title ?? 'Coordonnées'}
                  onChange={(v) => patch({ step3Title: v })}
                  onFocus={() => patch({ studioPreviewStep: 3 })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Libellé bouton "Suivant"</PLabel>
                <PInput value={props.btnNextLabel ?? 'Suivant'} onChange={(v) => patch({ btnNextLabel: v })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Libellé bouton "Retour"</PLabel>
                <PInput value={props.btnBackLabel ?? 'Retour'} onChange={(v) => patch({ btnBackLabel: v })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Libellé bouton "Valider"</PLabel>
                <PInput value={props.btnSubmitLabel ?? 'Valider'} onChange={(v) => patch({ btnSubmitLabel: v })} />
              </div>
            </>
          ) : (
            <>
              <SectionDivider title="Textes du Formulaire (1 étape)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Titre du Formulaire</PLabel>
                <PInput value={props.singleStepTitle ?? 'Demande de rappel rapide'} onChange={(v) => patch({ singleStepTitle: v })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Libellé bouton "Envoyer"</PLabel>
                <PInput value={props.btnSubmitLabel ?? 'Valider'} onChange={(v) => patch({ btnSubmitLabel: v })} />
              </div>
            </>
          )}

          <SectionDivider title="Gamme de Modèles" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(props.modelsList ?? []).map((model: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <PInput value={model} onChange={(v) => updateModel(idx, v)} placeholder="Modèle..." />
                <button
                  type="button"
                  onClick={() => removeModel(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addModel}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: 28,
                borderRadius: 6,
                border: '1px dashed #27272a',
                background: 'transparent',
                color: '#71717a',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Ajouter un modèle
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionDivider title="Villes de Succursales" />
            {!isVillesListSynced(props.villesList ?? []) && (
              <button
                type="button"
                onClick={() => patch({ villesList: [...AUTOHALL_OFFICIAL_CITIES] })}
                style={{
                  height: 20,
                  padding: '0 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  border: '1px solid rgba(251,146,60,0.4)',
                  borderRadius: 4,
                  background: 'rgba(251,146,60,0.1)',
                  color: '#fb923c',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                Resync officiel
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(props.villesList ?? []).map((ville: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <PInput value={ville} onChange={(v) => updateVille(idx, v)} placeholder="Ville..." />
                <button
                  type="button"
                  onClick={() => removeVille(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVille}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: 28,
                borderRadius: 6,
                border: '1px dashed #27272a',
                background: 'transparent',
                color: '#71717a',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Ajouter une ville
            </button>
          </div>
        </div>
      )}

      {activeTab === 'layout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isMultiStep && (
            <>
              <SectionDivider title="Aperçu & Étape" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Étape de Preview Studio</PLabel>
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    background: '#09090b',
                    padding: 2,
                    borderRadius: 6,
                    border: '1px solid #27272a',
                  }}
                >
                  {([1, 2, 3] as const).filter((stepVal) => !isModelLanding || stepVal >= 2).map((stepVal) => (
                    <button
                      key={stepVal}
                      type="button"
                      onClick={() => patch({ studioPreviewStep: stepVal })}
                      style={{
                        flex: 1,
                        height: 26,
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: props.studioPreviewStep === stepVal ? 'rgba(40,143,227,0.15)' : 'transparent',
                        color: props.studioPreviewStep === stepVal ? '#3b82f6' : '#71717a',
                      }}
                    >
                      Étape {stepVal}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <SectionDivider title="Disposition" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Inverser la disposition</PLabel>
            <button
              type="button"
              onClick={() => patch({ layoutReversed: !props.layoutReversed })}
              style={{
                height: 32,
                borderRadius: 6,
                border: '1px solid #27272a',
                background: props.layoutReversed ? 'rgba(40,143,227,0.15)' : '#09090b',
                color: props.layoutReversed ? '#3b82f6' : '#e4e4e7',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {props.layoutReversed ? 'Formulaire à gauche / Contenu à droite' : 'Contenu à gauche / Formulaire à droite'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Type de média</PLabel>
            <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
              {([
                { value: 'image', label: 'Image unique' },
                { value: 'gallery', label: 'Galerie' },
                { value: 'video', label: 'Vidéo' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => patch({ mediaType: opt.value })}
                  style={{
                    flex: 1,
                    height: 26,
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: (props.mediaType ?? 'image') === opt.value ? 'rgba(40,143,227,0.15)' : 'transparent',
                    color: (props.mediaType ?? 'image') === opt.value ? '#3b82f6' : '#71717a',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <SectionDivider title="Géométrie & Composition" />
          <MediaUploadZone
            value={props.vehicleImage ?? ''}
            onChange={(v) => patch({ vehicleImage: v })}
            label={blockType === 'hero-showroom' ? "Image principale du véhicule" : "Image principale de fond"}
          />

          {blockType === 'hero-mosaic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Position du formulaire</PLabel>
              <select
                value={props.mosaicFormLayout ?? 'side'}
                onChange={(e) => patch({ mosaicFormLayout: e.target.value as 'side' | 'below' })}
                style={{
                  height: 32,
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 6,
                  color: '#e4e4e7',
                  fontSize: 12,
                  padding: '0 8px',
                  outline: 'none',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                <option value="side">À côté de la galerie (split)</option>
                <option value="below">En dessous de la galerie (catalogue aéré)</option>
              </select>
            </div>
          )}

          {(props.mediaType ?? 'image') === 'gallery' && (
            <>
              <SectionDivider title="Galerie (Images de détail)" />
              <MediaUploadZone
                value={props.detailImage1 ?? ''}
                onChange={(v) => patch({ detailImage1: v })}
                label="Détail 1 (Intérieur)"
              />
              <MediaUploadZone
                value={props.detailImage2 ?? ''}
                onChange={(v) => patch({ detailImage2: v })}
                label="Détail 2 (Jantes)"
              />
              <MediaUploadZone
                value={props.detailImage3 ?? ''}
                onChange={(v) => patch({ detailImage3: v })}
                label="Détail 3 (Cockpit)"
              />
            </>
          )}

          {(props.mediaType ?? 'image') === 'video' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>URL Vidéo d'Arrière-plan (MP4/WebM)</PLabel>
              <PInput
                value={props.bgVideoUrl ?? ''}
                onChange={(v) => patch({ bgVideoUrl: v })}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          )}

          {blockType === 'hero-cinematic' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Hauteur de la section</PLabel>
                <select
                  value={props.cinematicMinHeight ?? '80vh'}
                  onChange={(e) => patch({ cinematicMinHeight: e.target.value as '80vh' | 'screen' })}
                  style={{
                    height: 32,
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: 6,
                    color: '#e4e4e7',
                    fontSize: 12,
                    padding: '0 8px',
                    outline: 'none',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <option value="80vh">80vh — Impact fort</option>
                  <option value="screen">100vh — Plein écran</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Style de la carte formulaire</PLabel>
                <select
                  value={props.formCardStyle ?? 'glass'}
                  onChange={(e) => patch({ formCardStyle: e.target.value as 'glass' | 'solid' })}
                  style={{
                    height: 32,
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: 6,
                    color: '#e4e4e7',
                    fontSize: 12,
                    padding: '0 8px',
                    outline: 'none',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <option value="glass">Verre dépoli (backdrop-blur)</option>
                  <option value="solid">Blanc pur contrasté</option>
                </select>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Marge Supérieure (Padding Top)</PLabel>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.paddingTop ?? 80}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={props.paddingTop ?? 80}
              onChange={(e) => patch({ paddingTop: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Marge Inférieure (Padding Bottom)</PLabel>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.paddingBottom ?? 80}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={props.paddingBottom ?? 80}
              onChange={(e) => patch({ paddingBottom: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {activeTab === 'design' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Design System & Surcharges" />

          <PColorRow
            value={props.colorPrimary ?? '#002C6C'}
            onChange={(v) => patch({ colorPrimary: v })}
            label="Couleur Primaire (Boutons, Progress)"
          />
          <PColorRow value={props.colorSecondary ?? '#1b7ac8'} onChange={(v) => patch({ colorSecondary: v })} label="Couleur Secondaire" />
          <PColorRow value={props.colorText ?? '#ffffff'} onChange={(v) => patch({ colorText: v })} label="Couleur du Texte" />
          <PColorRow
            value={props.colorBgSection ?? '#090d16'}
            onChange={(v) => patch({ colorBgSection: v })}
            label="Couleur de Fond"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Arrondi des Boutons & Cartes</PLabel>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.borderRadiusButtons ?? 8}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={props.borderRadiusButtons ?? 8}
              onChange={(e) => patch({ borderRadiusButtons: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Opacité de l'Arrière-plan (Overlay)</PLabel>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.bgOverlayOpacity ?? 50}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={props.bgOverlayOpacity ?? 50}
              onChange={(e) => patch({ bgOverlayOpacity: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {activeTab === 'routing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Routage et Collecte des Leads" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: '#09090b',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #27272a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 8 }}>
                <span style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 600 }}>Enregistrer localement sur le Builder</span>
                <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3 }}>
                  Stocke les leads dans la base de données SQL locale pour affichage dans le Dashboard.
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: '#288fe3',
                  cursor: 'not-allowed',
                  marginTop: 2,
                }}
              />
            </div>

            <div style={{ height: '1px', background: '#27272a', margin: '4px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PSwitch
                label="Synchroniser avec l'API Centrale Auto Hall"
                checked={!!props.syncToAutoHallBase}
                onChange={(v) => patch({ syncToAutoHallBase: v })}
              />
              <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3, marginTop: -6 }}>
                Transmet les données de conversion directement au CRM central du groupe Auto Hall.
              </span>
            </div>

            {props.syncToAutoHallBase && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, paddingLeft: 4 }}>
                <PLabel>URL API Centrale Auto Hall</PLabel>
                <PInput
                  value={props.autoHallApiUrl ?? ''}
                  onChange={(v) => patch({ autoHallApiUrl: v })}
                  placeholder="https://api.autohall.ma/v1/leads"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HeroShowroomInspector({ nodeId }: { nodeId: string }) {
  return <HeroCommonFormInspector nodeId={nodeId} blockType="hero-showroom" />;
}

function HeroMosaicInspector({ nodeId }: { nodeId: string }) {
  return <HeroCommonFormInspector nodeId={nodeId} blockType="hero-mosaic" />;
}

function HeroCinematicInspector({ nodeId }: { nodeId: string }) {
  return <HeroCommonFormInspector nodeId={nodeId} blockType="hero-cinematic" />;
}

function HeroImmersiveFormInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store((s) => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store((s) => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'routing'>('content');

  if (!node) return null;

  const props = node.props as HeroImmersiveFormProps;
  const patch = (partial: any) => updateBlockProps(nodeId, partial);

  const selectedBrand = props.brandKey ? AUTOHALL_BRANDS.find((b) => b.id === props.brandKey) : undefined;

  const updateModel = (idx: number, val: string) => {
    const list = [...(props.modelsList ?? [])];
    list[idx] = val;
    patch({ modelsList: list });
  };

  const addModel = () => {
    const list = [...(props.modelsList ?? []), 'Nouveau Modèle'];
    patch({ modelsList: list });
  };

  const removeModel = (idx: number) => {
    const list = (props.modelsList ?? []).filter((_: string, i: number) => i !== idx);
    patch({ modelsList: list });
  };

  const updateVille = (idx: number, val: string) => {
    const list = [...(props.villesList ?? [])];
    list[idx] = val;
    patch({ villesList: list });
  };

  const addVille = () => {
    const list = [...(props.villesList ?? []), 'Nouvelle Ville'];
    patch({ villesList: list });
  };

  const removeVille = (idx: number) => {
    const list = (props.villesList ?? []).filter((_: string, i: number) => i !== idx);
    patch({ villesList: list });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: 4 }}>
        {(['content', 'design', 'routing'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #288fe3' : '2px solid transparent',
              color: activeTab === tab ? '#e4e4e7' : '#71717a',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab === 'content' ? 'Contenu' : tab === 'design' ? 'Design' : 'Routage'}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="INFOS PRINCIPALES" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Sélectionner la Marque</PLabel>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: selectedBrand?.primaryColor ?? '#3f3f46',
                  pointerEvents: 'none',
                }}
              />
              <select
                value={props.brandKey ?? ''}
                onChange={(e) => {
                  const id = e.target.value;
                  const preset = AUTOHALL_BRANDS.find((b) => b.id === id);
                  if (!preset) {
                    patch({ brandKey: null });
                    return;
                  }
                  patch({
                    brandKey: preset.id,
                    brandLogoUrl: preset.logo,
                    colorPrimary: preset.primaryColor,
                    colorSecondary: preset.secondaryColor,
                    modelsList: preset.models || [],
                  });
                }}
                style={{
                  height: 34,
                  width: '100%',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 6,
                  color: '#e4e4e7',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '0 10px 0 28px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Aucune marque (personnalisé)</option>
                {AUTOHALL_BRANDS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Image de fond du Hero</PLabel>
            <MediaUploadZone
              value={props.bgImage ?? ''}
              onChange={(v) => patch({ bgImage: v || null })}
              label="Bannière d'arrière-plan"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Slogan de gauche (H1)</PLabel>
            <PInput
              value={props.title ?? ''}
              onChange={(v) => patch({ title: v })}
              placeholder="Ex: Découvrez une nouvelle dimension de conduite..."
            />
          </div>

          <SectionDivider title="TEXTES DES ÉTAPES" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#18181b', padding: 8, borderRadius: 8, border: '1px solid #27272a' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Étape 1 : Disponibilité</span>
            <PLabel>Titre Étape 1</PLabel>
            <PInput
              value={props.step1Title ?? ''}
              onChange={(v) => patch({ step1Title: v })}
              onFocus={() => patch({ studioPreviewStep: 1 })}
              placeholder="Commençons par confirmer votre disponibilité..."
            />
            <PLabel>Sous-titre Étape 1</PLabel>
            <PInput
              value={props.step1Subtitle ?? ''}
              onChange={(v) => patch({ step1Subtitle: v })}
              onFocus={() => patch({ studioPreviewStep: 1 })}
              placeholder="Sous-titre de l'étape 1..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#18181b', padding: 8, borderRadius: 8, border: '1px solid #27272a' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Étape 2 : Coordonnées</span>
            <PLabel>Titre Étape 2</PLabel>
            <PInput
              value={props.step2Title ?? ''}
              onChange={(v) => patch({ step2Title: v })}
              onFocus={() => patch({ studioPreviewStep: 2 })}
              placeholder="Enfin, Fournir votre nom et téléphone..."
            />
            <PLabel>Sous-titre Étape 2</PLabel>
            <PInput
              value={props.step2Subtitle ?? ''}
              onChange={(v) => patch({ step2Subtitle: v })}
              onFocus={() => patch({ studioPreviewStep: 2 })}
              placeholder="Sous-titre de l'étape 2..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#18181b', padding: 8, borderRadius: 8, border: '1px solid #27272a' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Étape 3 : Confirmation/Succès</span>
            <PLabel>Titre Étape 3 (Succès)</PLabel>
            <PInput
              value={props.step3Title ?? ''}
              onChange={(v) => patch({ step3Title: v })}
              onFocus={() => patch({ studioPreviewStep: 3 })}
              placeholder="Demande Enregistrée !..."
            />
            <PLabel>Sous-titre Étape 3 (Message)</PLabel>
            <PInput
              value={props.step3Subtitle ?? ''}
              onChange={(v) => patch({ step3Subtitle: v })}
              onFocus={() => patch({ studioPreviewStep: 3 })}
              placeholder="Notre équipe Auto Hall prendra contact avec vous..."
            />
          </div>

          <SectionDivider title="CONFIG DES BOUTONS" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Bouton "Suivant"</PLabel>
            <PInput value={props.btnNextLabel ?? 'Suivant'} onChange={(v) => patch({ btnNextLabel: v })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Bouton "Retour"</PLabel>
            <PInput value={props.btnBackLabel ?? 'Retour'} onChange={(v) => patch({ btnBackLabel: v })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Bouton "Valider/Soumettre"</PLabel>
            <PInput value={props.btnSubmitLabel ?? 'Valider'} onChange={(v) => patch({ btnSubmitLabel: v })} />
          </div>

          <SectionDivider title="GAMMES ET VILLES" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(props.modelsList ?? []).map((model: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <PInput value={model} onChange={(v) => updateModel(idx, v)} placeholder="Modèle..." />
                <button
                  type="button"
                  onClick={() => removeModel(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addModel}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: 28,
                borderRadius: 6,
                border: '1px dashed #27272a',
                background: 'transparent',
                color: '#71717a',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Ajouter un modèle
            </button>
          </div>

          <SectionDivider title="Villes de Succursales" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(props.villesList ?? []).map((ville: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <PInput value={ville} onChange={(v) => updateVille(idx, v)} placeholder="Ville..." />
                <button
                  type="button"
                  onClick={() => removeVille(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVille}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: 28,
                borderRadius: 6,
                border: '1px dashed #27272a',
                background: 'transparent',
                color: '#71717a',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Ajouter une ville
            </button>
          </div>
        </div>
      )}

      {activeTab === 'design' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Aperçu Studio" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Étape active pour l'aperçu du canevas</PLabel>
            <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
              {([1, 2, 3] as const).map((stepVal) => (
                <button
                  key={stepVal}
                  type="button"
                  onClick={() => patch({ studioPreviewStep: stepVal })}
                  style={{
                    flex: 1,
                    height: 26,
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: props.studioPreviewStep === stepVal ? 'rgba(40,143,227,0.15)' : 'transparent',
                    color: props.studioPreviewStep === stepVal ? '#3b82f6' : '#71717a',
                  }}
                >
                  Étape {stepVal}
                </button>
              ))}
            </div>
          </div>

          <SectionDivider title="Disposition & Arrière-plan" />
          
          {/* Card Position Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Position de la carte</PLabel>
            <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
              <button
                type="button"
                onClick={() => patch({ cardPosition: 'left' })}
                style={{
                  flex: 1,
                  height: 26,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: props.cardPosition === 'left' ? 'rgba(40,143,227,0.15)' : 'transparent',
                  color: props.cardPosition === 'left' ? '#3b82f6' : '#71717a',
                }}
              >
                Gauche
              </button>
              <button
                type="button"
                onClick={() => patch({ cardPosition: 'right' })}
                style={{
                  flex: 1,
                  height: 26,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: props.cardPosition !== 'left' ? 'rgba(40,143,227,0.15)' : 'transparent',
                  color: props.cardPosition !== 'left' ? '#3b82f6' : '#71717a',
                }}
              >
                Droite
              </button>
            </div>
          </div>

          {/* Overlay Opacity Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Opacité de l'overlay</PLabel>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa' }}>{props.overlayOpacity ?? 50}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={props.overlayOpacity ?? 50}
              onChange={(e) => patch({ overlayOpacity: parseInt(e.target.value, 10) })}
              style={{ width: '100%', height: 6, borderRadius: 3, background: '#27272a', accentColor: '#288fe3', outline: 'none', cursor: 'pointer' }}
            />
          </div>

          {/* Background Blur Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Floutage d'arrière-plan (Blur)</PLabel>
            <select
              value={props.bgBlur ?? 'none'}
              onChange={(e) => patch({ bgBlur: e.target.value })}
              style={{
                height: 34,
                width: '100%',
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: 6,
                color: '#e4e4e7',
                fontSize: 12,
                fontWeight: 600,
                padding: '0 10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="none">Aucun flou (backdrop-blur-none)</option>
              <option value="2px">Léger (blur 2px)</option>
              <option value="4px">Artistique (blur 4px)</option>
            </select>
          </div>

          <SectionDivider title="Couleurs de Marque" />
          <div style={{ background: '#1c1c1e', padding: 10, borderRadius: 8, border: '1px solid #2d2d30' }}>
            <span style={{ fontSize: 11, color: '#fb923c', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              {selectedBrand 
                ? `Couleurs héritées de la marque "${selectedBrand.name}"` 
                : "Couleurs héritées par défaut (Ford)"}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#e4e4e7' }}>
                <span>Primaire (Boutons) :</span>
                <span style={{ fontWeight: 700, color: selectedBrand?.primaryColor ?? '#002C6C' }}>{selectedBrand?.primaryColor ?? '#002C6C'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#e4e4e7' }}>
                <span>Secondaire (Boutons secondaires) :</span>
                <span style={{ fontWeight: 700, color: selectedBrand?.secondaryColor ?? '#1b7ac8' }}>{selectedBrand?.secondaryColor ?? '#1b7ac8'}</span>
              </div>
            </div>
          </div>

          <PColorRow
            value={props.colorPrimary ?? selectedBrand?.primaryColor ?? '#002C6C'}
            onChange={(v) => patch({ colorPrimary: v })}
            label="Surcharge Couleur Primaire"
          />
          <PColorRow
            value={props.colorSecondary ?? selectedBrand?.secondaryColor ?? '#1b7ac8'}
            onChange={(v) => patch({ colorSecondary: v })}
            label="Surcharge Couleur Secondaire"
          />
          <PColorRow
            value={props.colorBgSection ?? '#ffffff'}
            onChange={(v) => patch({ colorBgSection: v })}
            label="Couleur de Fond de la Carte"
          />
        </div>
      )}

      {activeTab === 'routing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Routage et Collecte des Leads" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: '#09090b',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #27272a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 8 }}>
                <span style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 600 }}>Enregistrer localement sur le Builder</span>
                <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3 }}>
                  Stocke les leads dans la base de données SQL locale pour affichage dans le Dashboard.
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: '#288fe3',
                  cursor: 'not-allowed',
                  marginTop: 2,
                }}
              />
            </div>

            <div style={{ height: '1px', background: '#27272a', margin: '4px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PSwitch
                label="Synchroniser avec l'API Centrale Auto Hall"
                checked={!!props.syncToAutoHallBase}
                onChange={(v) => patch({ syncToAutoHallBase: v })}
              />
              <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3, marginTop: -6 }}>
                Transmet les données de conversion directement au CRM central du groupe Auto Hall.
              </span>
            </div>

            {props.syncToAutoHallBase && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, paddingLeft: 4 }}>
                <PLabel>URL API Centrale Auto Hall</PLabel>
                <PInput
                  value={props.autoHallApiUrl ?? ''}
                  onChange={(v) => patch({ autoHallApiUrl: v })}
                  placeholder="https://api.autohall.ma/v1/leads"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 3. Specs Grid Inspector ───────────────────────────────────────────────────

function SpecsGridInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as SpecsGridBlockProps;
  const patch = (partial: Partial<SpecsGridBlockProps>) => updateBlockProps(nodeId, partial);

  const updateSpec = (idx: number, key: keyof SpecItem, val: any) => {
    const specs = [...(props.specs ?? [])];
    specs[idx] = { ...specs[idx], [key]: val };
    patch({ specs });
  };

  const addSpec = () => {
    const specs = [...(props.specs ?? []), { label: 'Caractéristique', value: 'Valeur', icon: 'Star', hidden: false }];
    patch({ specs });
  };

  const removeSpec = (idx: number) => {
    const specs = (props.specs ?? []).filter((_, i) => i !== idx);
    patch({ specs });
  };

  const ICONS = ['Zap', 'Cpu', 'Star', 'Award', 'Shield', 'Check', 'Download', 'Phone', 'Clock'];

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionDivider title="En-tête" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Titre de la section</PLabel>
        <PInput value={props.title ?? ''} onChange={v => patch({ title: v })} placeholder="Caractéristiques" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Nombre de colonnes</PLabel>
        <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
          {([2, 3, 4] as const).map(col => (
            <button
              key={col}
              type="button"
              onClick={() => patch({ columns: col })}
              style={{
                flex: 1, height: 26, border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: props.columns === col ? 'rgba(40,143,227,0.15)' : 'transparent',
                color: props.columns === col ? '#3b82f6' : '#71717a',
              }}
            >
              {col} Colonnes
            </button>
          ))}
        </div>
      </div>

      <SectionDivider title={`Fiches (${props.specs?.length ?? 0})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(props.specs ?? []).map((spec, idx) => (
          <div key={idx} style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', background: '#09090b', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#52525b' }}>CARACTÉRISTIQUE {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeSpec(idx)}
                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 6 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <PLabel>Libellé</PLabel>
                <PInput value={spec.label} onChange={v => updateSpec(idx, 'label', v)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <PLabel>Valeur</PLabel>
                <PInput value={spec.value} onChange={v => updateSpec(idx, 'value', v)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, alignItems: 'center' }}>
              <div>
                <PLabel>Icône</PLabel>
                <select
                  value={spec.icon ?? 'Star'}
                  onChange={e => updateSpec(idx, 'icon', e.target.value)}
                  style={{ width: '100%', height: 28, background: '#18181b', border: '1px solid #27272a', borderRadius: 4, color: '#e4e4e7', fontSize: 11, outline: 'none' }}
                >
                  {ICONS.map(ico => <option key={ico} value={ico}>{ico}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#d1d5db', cursor: 'pointer', marginTop: 14 }}>
                <input type="checkbox" checked={spec.hidden} onChange={e => updateSpec(idx, 'hidden', e.target.checked)} style={{ width: 14, height: 14, cursor: 'pointer' }} />
                Masquer
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSpec}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 32, borderRadius: 6, border: '1px dashed #27272a',
            background: 'transparent', color: '#71717a', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={12} /> Ajouter une caractéristique
        </button>
      </div>
    </div>
  );
}

// ── 4. Immersive Gallery Inspector ────────────────────────────────────────────

const MODEL_SHOWCASE_THUMB_KEYS = [1, 2, 3, 4] as const;

const MODEL_SHOWCASE_RADIUS_OPTIONS: { value: ModelShowcaseGalleryRadius; label: string }[] = [
  { value: 'sm', label: 'Faible' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Fort' },
];

const MODEL_SHOWCASE_GAP_OPTIONS: { value: ModelShowcaseGalleryGap; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
];

function ModelShowcaseGalleryInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  if (!node) return null;

  const props = node.props as ModelShowcaseGalleryBlockProps;
  const patch = (partial: Partial<ModelShowcaseGalleryBlockProps>) => updateBlockProps(nodeId, partial);

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: 4 }}>
        {(['content', 'design'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #288fe3' : '2px solid transparent',
              color: activeTab === tab ? '#e4e4e7' : '#71717a',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab === 'content' ? 'Contenu' : 'Design'}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Bouton d'action" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Texte du bouton</PLabel>
            <PInput value={props.buttonText ?? ''} onChange={v => patch({ buttonText: v })} placeholder="Afficher toutes les photos" />
          </div>

          <SectionDivider title="Image Principale (gauche)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 10, background: '#09090b', border: '1px solid #27272a', borderRadius: 8 }}>
            <MediaUploadZone
              value={props.mainImage ?? ''}
              onChange={v => patch({ mainImage: v })}
              label="Image principale (upload ou URL)"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Texte alternatif (SEO)</PLabel>
              <PInput value={props.mainImageAlt ?? ''} onChange={v => patch({ mainImageAlt: v })} placeholder="Vue principale du véhicule" />
            </div>
          </div>

          <SectionDivider title="Vignettes (mosaïque de droite)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MODEL_SHOWCASE_THUMB_KEYS.map((n) => {
              const imgKey = `thumbImage${n}` as const;
              const altKey = `thumbImage${n}Alt` as const;
              return (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 10, background: '#09090b', border: '1px solid #27272a', borderRadius: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#288fe3' }}>VIGNETTE {n}</span>
                  <MediaUploadZone
                    value={props[imgKey] ?? ''}
                    onChange={v => patch({ [imgKey]: v } as Partial<ModelShowcaseGalleryBlockProps>)}
                    label="Image (upload ou URL)"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <PLabel>Texte alternatif (SEO)</PLabel>
                    <PInput
                      value={props[altKey] ?? ''}
                      onChange={v => patch({ [altKey]: v } as Partial<ModelShowcaseGalleryBlockProps>)}
                      placeholder={`Détail du véhicule ${n}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'design' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Arrondi des bordures" />
          <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
            {MODEL_SHOWCASE_RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => patch({ borderRadius: opt.value })}
                style={{
                  flex: 1,
                  height: 26,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: (props.borderRadius ?? 'md') === opt.value ? 'rgba(40,143,227,0.15)' : 'transparent',
                  color: (props.borderRadius ?? 'md') === opt.value ? '#3b82f6' : '#71717a',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <SectionDivider title="Espacement" />
          <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
            {MODEL_SHOWCASE_GAP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => patch({ gap: opt.value })}
                style={{
                  flex: 1,
                  height: 26,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: (props.gap ?? 'standard') === opt.value ? 'rgba(40,143,227,0.15)' : 'transparent',
                  color: (props.gap ?? 'standard') === opt.value ? '#3b82f6' : '#71717a',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 5. Conversion Form Split Inspector ────────────────────────────────────────

function ConversionFormSplitInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as ConversionFormSplitBlockProps;
  const patch = (partial: Partial<ConversionFormSplitBlockProps>) => updateBlockProps(nodeId, partial);

  const updateBenefit = (idx: number, text: string) => {
    const benefits = [...(props.benefits ?? [])];
    benefits[idx] = { ...benefits[idx], text };
    patch({ benefits });
  };

  const toggleBenefit = (idx: number, enabled: boolean) => {
    const benefits = [...(props.benefits ?? [])];
    benefits[idx] = { ...benefits[idx], enabled };
    patch({ benefits });
  };

  const addBenefit = () => {
    const benefits = [...(props.benefits ?? []), { id: `b_${Date.now()}`, text: 'Nouvel avantage', enabled: true }];
    patch({ benefits });
  };

  const removeBenefit = (idx: number) => {
    const benefits = (props.benefits ?? []).filter((_, i) => i !== idx);
    patch({ benefits });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionDivider title="Arguments de Vente (Gauche)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Titre de la zone</PLabel>
        <PInput value={props.benefitsTitle} onChange={v => patch({ benefitsTitle: v })} placeholder="Avantages" />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <PLabel>Liste d'arguments</PLabel>
        {(props.benefits ?? []).map((benefit, idx) => (
          <div key={benefit.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={benefit.enabled} onChange={e => toggleBenefit(idx, e.target.checked)} style={{ cursor: 'pointer', accentColor: '#288fe3' }} />
            <PInput value={benefit.text} onChange={v => updateBenefit(idx, v)} placeholder="Avantage..." />
            <button
              type="button"
              onClick={() => removeBenefit(idx)}
              style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addBenefit}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 28, borderRadius: 6, border: '1px dashed #27272a',
            background: 'transparent', color: '#71717a', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={10} /> Ajouter un argument
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        <PLabel>Texte de Garantie / Réassurance</PLabel>
        <PInput value={props.guaranteeText} onChange={v => patch({ guaranteeText: v })} placeholder="Sécurité et sérénité..." />
      </div>

      <SectionDivider title="Champs du Formulaire (Droite)" />
      <PSwitch label="Champ Modèle" checked={props.showModel} onChange={v => patch({ showModel: v })} />
      <PSwitch label="Champ Ville" checked={props.showCity} onChange={v => patch({ showCity: v })} />
      <PSwitch label="Champ Date Souhaitée" checked={props.showDate} onChange={v => patch({ showDate: v })} />
      <PSwitch label="Champ Nom Complet" checked={props.showName} onChange={v => patch({ showName: v })} />
      <PSwitch label="Champ Téléphone" checked={props.showPhone} onChange={v => patch({ showPhone: v })} />

      <SectionDivider title="Consentement & Action" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Bouton d'action (CTA)</PLabel>
        <PInput value={props.ctaLabel} onChange={v => patch({ ctaLabel: v })} placeholder="Valider" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Clause de Consentement RGPD</PLabel>
        <PTextarea value={props.gdprConsent} onChange={v => patch({ gdprConsent: v })} placeholder="RGPD..." height={64} />
      </div>
      <PColorRow value={props.accentColor ?? '#288fe3'} onChange={v => patch({ accentColor: v })} label="Couleur Accent Formulaire" />
    </div>
  );
}

/*
function HeroArtInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as HeroArtBlockProps;
  const patch = (partial: Partial<HeroArtBlockProps>) => updateBlockProps(nodeId, partial);

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionDivider title="Contenu du Hero" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Titre Principal</PLabel>
        <PInput value={props.title ?? ''} onChange={v => patch({ title: v })} placeholder="Titre..." />
      </div>

      <MediaUploadZone
        value={props.imageUrl ?? ''}
        onChange={v => patch({ imageUrl: v })}
        label="Image d'arrière-plan"
      />
    </div>
  );
}
*/

function CarouselInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as CarouselBlockProps;
  const patch = (partial: Partial<CarouselBlockProps>) => updateBlockProps(nodeId, partial);

  const updateItem = (idx: number, key: keyof CarouselItem, val: string) => {
    const items = [...(props.items ?? [])];
    items[idx] = { ...items[idx], [key]: val };
    patch({ items });
  };

  const addItem = () => {
    const items = [...(props.items ?? []), { title: 'Nouveau Véhicule', category: 'Catégorie', button: 'Découvrir', src: '' }];
    patch({ items });
  };

  const removeItem = (idx: number) => {
    const items = (props.items ?? []).filter((_, i) => i !== idx);
    patch({ items });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionDivider title={`Éléments du Carousel (${props.items?.length ?? 0})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(props.items ?? []).map((item, idx) => (
          <div key={idx} style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', background: '#09090b', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#52525b' }}>CARTE {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Titre</PLabel>
              <PInput value={item.title} onChange={v => updateItem(idx, 'title', v)} placeholder="Titre de la carte" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Catégorie</PLabel>
              <PInput value={item.category ?? ''} onChange={v => updateItem(idx, 'category', v)} placeholder="Ex: SUV, Citadine" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Libellé Bouton</PLabel>
              <PInput value={item.button ?? 'Découvrir'} onChange={v => updateItem(idx, 'button', v)} placeholder="Découvrir" />
            </div>
            <MediaUploadZone
              value={item.src ?? ''}
              onChange={v => updateItem(idx, 'src', v)}
              label="Image de la carte"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 32, borderRadius: 6, border: '1px dashed #27272a',
            background: 'transparent', color: '#71717a', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            marginTop: 4,
          }}
        >
          <Plus size={12} /> Ajouter un élément
        </button>
      </div>
    </div>
  );
}

const FINITION_ICON_COMPONENTS: Record<FinitionIconPresetKey, React.ComponentType<{ size?: number }>> = {
  Zap, ShipWheel, Shield, Monitor, Armchair, Leaf, Gauge, Calendar, Cpu, Battery, Thermometer,
};

function IconPresetPicker({ value, onChange }: { value?: FinitionIconPresetKey; onChange: (v: FinitionIconPresetKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: '#000000', border: '1px solid #27272a', borderRadius: 6, padding: 2, flexShrink: 0 }}>
      {FINITION_ICON_PRESETS.map(preset => {
        const IconComp = FINITION_ICON_COMPONENTS[preset.key];
        const active = value === preset.key;
        return (
          <button
            key={preset.key}
            type="button"
            title={preset.label}
            onClick={() => onChange(preset.key)}
            style={{
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 4, cursor: 'pointer',
              background: active ? '#288fe3' : 'transparent',
              color: active ? '#ffffff' : '#a1a1aa',
            }}
          >
            <IconComp size={13} />
          </button>
        );
      })}
    </div>
  );
}

/** Bouton carré compact affichant l'icône active ; ouvre une grille d'icônes dans un Popover au clic. */
function KeyFeatureIconButtonPicker({
  value,
  onChange,
}: {
  value?: FinitionIconPresetKey;
  onChange: (v: FinitionIconPresetKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ActiveIcon = FINITION_ICON_COMPONENTS[value ?? 'ShipWheel'];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Choisir une icône"
          style={{
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #27272a', borderRadius: 6, background: '#fafafa', color: '#18181b',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ActiveIcon size={17} />
        </button>
      </PopoverTrigger>
      <PopoverContent style={{ width: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {SPEC_KEY_FEATURE_ICON_PRESETS.map((preset) => {
            const IconComp = FINITION_ICON_COMPONENTS[preset.key];
            const active = (value ?? 'ShipWheel') === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                title={preset.label}
                onClick={() => { onChange(preset.key); setOpen(false); }}
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid ' + (active ? '#288fe3' : '#27272a'), borderRadius: 6, cursor: 'pointer',
                  background: active ? '#288fe3' : 'transparent',
                  color: active ? '#ffffff' : '#a1a1aa',
                }}
              >
                <IconComp size={16} />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FinitionOptionRow({
  option,
  onChange,
  onRemove,
}: {
  option: FinitionOption;
  onChange: (patch: Partial<FinitionOption>) => void;
  onRemove: () => void;
}) {
  const [showCustomImage, setShowCustomImage] = useState(!!option.icon);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, background: '#000000', border: '1px solid #1c1c1f', borderRadius: 6 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <PInput value={option.label} onChange={v => onChange({ label: v })} placeholder="Libellé de l'option..." />
        <IconPresetPicker value={option.iconPreset} onChange={v => onChange({ iconPreset: v })} />
        <button
          type="button"
          onClick={onRemove}
          style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2, flexShrink: 0 }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {!showCustomImage && (
        <button
          type="button"
          onClick={() => setShowCustomImage(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', color: '#52525b', fontSize: 10, cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
        >
          <ImagePlus size={11} /> Téléverser une image personnalisée
        </button>
      )}

      {showCustomImage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#71717a' }}>Image personnalisée (remplace l'icône)</span>
            <button
              type="button"
              onClick={() => { onChange({ icon: '' }); setShowCustomImage(false); }}
              style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
              aria-label="Retirer l'image personnalisée"
            >
              <X size={12} />
            </button>
          </div>
          <MediaUploadZone
            value={option.icon ?? ''}
            onChange={v => onChange({ icon: v })}
            label=""
          />
        </div>
      )}
    </div>
  );
}

function SpecsShowroomInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [expandedFinitionIdx, setExpandedFinitionIdx] = useState<number | null>(0);

  if (!node) return null;

  const props = node.props as SpecsShowroomBlockProps;
  const patch = (partial: Partial<SpecsShowroomBlockProps>) => updateBlockProps(nodeId, partial);

  const updateFinition = (idx: number, key: keyof FinitionItem, val: any) => {
    const finitions = [...(props.finitions ?? [])];
    finitions[idx] = { ...finitions[idx], [key]: val };
    patch({ finitions });
  };

  const updateFinitionOption = (finIdx: number, optIdx: number, patchOpt: Partial<FinitionOption>) => {
    const finitions = [...(props.finitions ?? [])];
    const options = [...(finitions[finIdx].options ?? [])];
    options[optIdx] = { ...options[optIdx], ...patchOpt };
    finitions[finIdx] = { ...finitions[finIdx], options };
    patch({ finitions });
  };

  const addFinitionOption = (finIdx: number) => {
    const finitions = [...(props.finitions ?? [])];
    const options = [...(finitions[finIdx].options ?? []), { label: 'Nouvelle option', iconPreset: 'Shield' as const }];
    finitions[finIdx] = { ...finitions[finIdx], options };
    patch({ finitions });
  };

  const removeFinitionOption = (finIdx: number, optIdx: number) => {
    const finitions = [...(props.finitions ?? [])];
    const options = (finitions[finIdx].options ?? []).filter((_val: FinitionOption, i: number) => i !== optIdx);
    finitions[finIdx] = { ...finitions[finIdx], options };
    patch({ finitions });
  };

  const addFinition = () => {
    const finitions = [...(props.finitions ?? []), { name: 'NOUVELLE FINITION', desc: 'Description...', options: [{ label: 'Option 1' }], pdfUrl: '' }];
    patch({ finitions });
    setExpandedFinitionIdx(finitions.length);
  };

  const removeFinition = (idx: number) => {
    const finitions = (props.finitions ?? []).filter((_val: FinitionItem, i: number) => i !== idx);
    patch({ finitions });
    if (expandedFinitionIdx === idx) {
      setExpandedFinitionIdx(null);
    }
  };

  const updateLegalMention = (idx: number, val: string) => {
    const legalMentions = [...(props.legalMentions ?? [])];
    legalMentions[idx] = val;
    patch({ legalMentions });
  };

  const addLegalMention = () => {
    const legalMentions = [...(props.legalMentions ?? []), '*Nouvelle mention'];
    patch({ legalMentions });
  };

  const removeLegalMention = (idx: number) => {
    const legalMentions = (props.legalMentions ?? []).filter((_val: string, i: number) => i !== idx);
    patch({ legalMentions });
  };

  const updateKeyFeature = (idx: number, partial: Partial<SpecKeyFeature>) => {
    const keyFeatures = [...(props.keyFeatures ?? [])];
    keyFeatures[idx] = { ...keyFeatures[idx], ...partial };
    patch({ keyFeatures });
  };

  const addKeyFeature = () => {
    const keyFeatures = [...(props.keyFeatures ?? []), { text: 'Nouvelle caractéristique', iconPreset: 'Shield' as const }];
    patch({ keyFeatures });
  };

  const removeKeyFeature = (idx: number) => {
    const keyFeatures = (props.keyFeatures ?? []).filter((_val: SpecKeyFeature, i: number) => i !== idx);
    patch({ keyFeatures });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Selector Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'content' ? '2px solid #288fe3' : '2px solid transparent',
            color: activeTab === 'content' ? '#288fe3' : '#71717a',
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          CONTENU
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'design' ? '2px solid #288fe3' : '2px solid transparent',
            color: activeTab === 'design' ? '#288fe3' : '#71717a',
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          DESIGN
        </button>
      </div>

      {activeTab === 'content' && (
        <>
          <SectionDivider title="Infos Principales" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Titre du Modèle</PLabel>
            <PInput value={props.title ?? ''} onChange={v => patch({ title: v })} placeholder="[Modèle]" />
            <span style={{ fontSize: 9, color: '#71717a' }}>
              En mode "Landing de Modèle", le modèle actif de la page remplace automatiquement ce titre.
            </span>
          </div>

          <MediaUploadZone
            value={props.logoUrl ?? ''}
            onChange={v => patch({ logoUrl: v })}
            label="Logo de secours (si aucune marque de page n'est active)"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Description Générale</PLabel>
            <PTextarea value={props.description ?? ''} onChange={v => patch({ description: v })} placeholder="Description du modèle..." height={80} />
          </div>

          <SectionDivider title="Caractéristiques Clés (puces)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(props.keyFeatures ?? []).map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <KeyFeatureIconButtonPicker
                  value={feature.iconPreset}
                  onChange={(v) => updateKeyFeature(idx, { iconPreset: v })}
                />
                <PInput value={feature.text} onChange={(v) => updateKeyFeature(idx, { text: v })} placeholder="Texte de la puce..." />
                <button
                  type="button"
                  onClick={() => removeKeyFeature(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addKeyFeature}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 28, borderRadius: 6, border: '1px dashed #27272a', background: 'transparent', color: '#71717a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={10} /> Ajouter une caractéristique
            </button>
          </div>

          <SectionDivider title="Tarif & Rappel (Droite)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Prix de départ</PLabel>
            <PInput value={props.priceAppel ?? ''} onChange={v => patch({ priceAppel: v })} placeholder="370 000 DH*" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Texte Bouton CTA</PLabel>
            <PInput value={props.ctaLabel ?? ''} onChange={v => patch({ ctaLabel: v })} placeholder="Me faire rappeler" />
            <span style={{ fontSize: 9, color: '#71717a' }}>
              Fait toujours défiler vers le bloc Hero + Formulaire d'essai routier.
            </span>
          </div>

          <SectionDivider title="Mentions Légales (sous le prix)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(props.legalMentions ?? []).map((mention, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <PInput value={mention} onChange={v => updateLegalMention(idx, v)} placeholder="*Mention légale..." />
                <button
                  type="button"
                  onClick={() => removeLegalMention(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLegalMention}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 28, borderRadius: 6, border: '1px dashed #27272a',
                background: 'transparent', color: '#71717a', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Ajouter une mention
            </button>
          </div>

          <SectionDivider title={`Finitions (${props.finitions?.length ?? 0})`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(props.finitions ?? []).map((fin: FinitionItem, idx: number) => {
              const isExpanded = expandedFinitionIdx === idx;
              return (
                <div key={idx} style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', background: '#09090b', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setExpandedFinitionIdx(isExpanded ? null : idx)}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#288fe3' }}>{fin.name || 'FINITION'}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: '#71717a' }}>{isExpanded ? 'Réduire' : 'Modifier'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFinition(idx);
                        }}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #1c1c1f', paddingTop: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <PLabel>Nom Finition</PLabel>
                        <PInput value={fin.name} onChange={v => updateFinition(idx, 'name', v)} placeholder="TITANIUM" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <PLabel>Description Finition</PLabel>
                        <PTextarea value={fin.desc} onChange={v => updateFinition(idx, 'desc', v)} placeholder="Description..." height={50} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <PLabel>Lien Fiche PDF</PLabel>
                        <PInput value={fin.pdfUrl} onChange={v => updateFinition(idx, 'pdfUrl', v)} placeholder="https://..." />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <PLabel>Options Clés</PLabel>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(fin.options ?? []).map((opt: FinitionOption, optIdx: number) => (
                            <FinitionOptionRow
                              key={optIdx}
                              option={opt}
                              onChange={patchOpt => updateFinitionOption(idx, optIdx, patchOpt)}
                              onRemove={() => removeFinitionOption(idx, optIdx)}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => addFinitionOption(idx)}
                            style={{
                              height: 24, border: '1px dashed #27272a', background: 'transparent', color: '#71717a',
                              fontSize: 10, fontWeight: 600, cursor: 'pointer', borderRadius: 4, marginTop: 2
                            }}
                          >
                            + Ajouter Option
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addFinition}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 32, borderRadius: 6, border: '1px dashed #27272a',
                background: 'transparent', color: '#71717a', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={12} /> Ajouter une Finition
            </button>
          </div>
        </>
      )}

      {activeTab === 'design' && (
        <>
          <SectionDivider title="Options de Design" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PSwitch
              label="Afficher la carte de prix"
              checked={props.showPriceCard !== false}
              onChange={v => patch({ showPriceCard: v })}
            />
            <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3 }}>
              Décochez cet interrupteur si la landing page est de type purement informative ou SAV.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
            <PColorRow value={props.colorPrimary ?? ''} onChange={v => patch({ colorPrimary: v })} label="Couleur de marque forcée" />
          </div>
        </>
      )}
    </div>
  );
}

function ContactSectionInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as ContactSectionBlockProps;
  const patch = (partial: Partial<ContactSectionBlockProps>) => updateBlockProps(nodeId, partial);

  const updateVille = (idx: number, val: string) => {
    const list = [...(props.villesList ?? [])];
    list[idx] = val;
    patch({ villesList: list });
  };

  const addVille = () => {
    const list = [...(props.villesList ?? []), 'Nouvelle Ville'];
    patch({ villesList: list });
  };

  const removeVille = (idx: number) => {
    const list = (props.villesList ?? []).filter((_val: string, i: number) => i !== idx);
    patch({ villesList: list });
  };

  const contactFields = props.fields ?? DEFAULT_CONTACT_FIELDS;
  const updateContactField = (id: ContactFieldId, patchField: Partial<ContactFormField>) => {
    const fields = contactFields.map(f => f.id === id ? { ...f, ...patchField } : f);
    patch({ fields });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionDivider title="EN-TÊTE" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Titre</PLabel>
        <PInput value={props.title ?? ''} onChange={v => patch({ title: v })} placeholder="Nous Contacter" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Sous-titre</PLabel>
        <PInput value={props.subtitle ?? ''} onChange={v => patch({ subtitle: v })} placeholder="Sous-titre..." />
      </div>

      <SectionDivider title="DESIGN & IMAGE" />
      <MediaUploadZone
        value={props.imageUrl ?? ''}
        onChange={v => patch({ imageUrl: v })}
        label="Image d'illustration"
      />
      <PColorRow value={props.accentColor ?? '#002C6C'} onChange={v => patch({ accentColor: v })} label="Couleur Accent" />
      <PColorRow value={props.bgColor ?? '#ffffff'} onChange={v => patch({ bgColor: v })} label="Couleur de Fond" />

      <SectionDivider title="OPTIONS FORMULAIRE" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PLabel>Bouton d'envoi</PLabel>
        <PInput value={props.submitLabel ?? ''} onChange={v => patch({ submitLabel: v })} placeholder="Soumettre" />
      </div>

      {/* Fields options grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        <PLabel>Champs et visibilité</PLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px 12px', alignItems: 'center', background: '#09090b', padding: 8, borderRadius: 8, border: '1px solid #1c1c1f' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Champ</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', textAlign: 'center' }}>Afficher</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', textAlign: 'center' }}>Requis</span>
          
          {contactFields.map((field) => (
            <React.Fragment key={field.id}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e4e4e7' }}>{field.label}</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={field.enabled}
                  onChange={e => updateContactField(field.id, { enabled: e.target.checked })}
                  style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={e => updateContactField(field.id, { required: e.target.checked })}
                  disabled={!field.enabled}
                  style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Placeholders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <PLabel>Textes d'aide (Placeholders)</PLabel>
        {contactFields.filter(f => f.enabled).map(field => (
          <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#a1a1aa', width: 90, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {field.label}
            </span>
            <PInput
              value={field.placeholder}
              onChange={v => updateContactField(field.id, { placeholder: v })}
              placeholder="Texte d'aide..."
            />
          </div>
        ))}
      </div>

      {/* Villes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <PLabel>Villes disponibles dans la liste</PLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', background: '#09090b', padding: 8, borderRadius: 8, border: '1px solid #1c1c1f' }}>
          {(props.villesList ?? []).map((ville: string, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <PInput value={ville} onChange={v => updateVille(idx, v)} />
              <button
                type="button"
                onClick={() => removeVille(idx)}
                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVille}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 28, borderRadius: 6, border: '1px dashed #27272a',
            background: 'transparent', color: '#71717a', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={10} /> Ajouter une Ville
        </button>
      </div>
    </div>
  );
}

function ModelsGridInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  if (!node) return null;

  const props = node.props as ModelsGridBlockProps;
  const patch = (partial: Partial<ModelsGridBlockProps>) => updateBlockProps(nodeId, partial);

  const models = props.models ?? [];

  const updateModel = (idx: number, partial: Partial<VehicleModelItem>) => {
    const next = [...models];
    next[idx] = { ...next[idx], ...partial };
    patch({ models: next });
  };

  const addModel = () => {
    const next = [
      ...models,
      {
        id: 'model_' + Math.random().toString(36).substring(2, 9),
        name: 'Nouveau Modèle',
        price: '0 DH',
        badge: 'Neuf',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        link: '#'
      }
    ];
    patch({ models: next });
  };

  const removeModel = (idx: number) => {
    const next = models.filter((_, i) => i !== idx);
    patch({ models: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 10px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <PLabel>Titre de Section</PLabel>
        <PInput value={props.title ?? ''} onChange={v => patch({ title: v })} placeholder="Nos Modèles" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <PLabel>Sous-titre de Section</PLabel>
        <PTextarea value={props.subtitle ?? ''} onChange={v => patch({ subtitle: v })} placeholder="Découvrez notre sélection" />
      </div>

      <SectionDivider title="Liste des Véhicules" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {models.map((model, idx) => (
          <div
            key={model.id || idx}
            style={{
              padding: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid #27272a',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => removeModel(idx)}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'transparent', border: 'none', color: '#f87171',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Supprimer ce modèle"
            >
              <Trash2 size={14} />
            </button>

            <div style={{ paddingRight: 24 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#e4e4e7' }}>Véhicule #{idx + 1}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Nom complet</PLabel>
              <PInput value={model.name} onChange={v => updateModel(idx, { name: v })} placeholder="CHERY TIGGO 7" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Prix</PLabel>
              <PInput value={model.price} onChange={v => updateModel(idx, { price: v })} placeholder="289 000 DH" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Badge (HEV, PHEV...)</PLabel>
              <PInput value={model.badge} onChange={v => updateModel(idx, { badge: v })} placeholder="PHEV" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Image (URL)</PLabel>
              <PInput value={model.image} onChange={v => updateModel(idx, { image: v })} placeholder="https://..." />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Lien du bouton</PLabel>
              <PInput value={model.link} onChange={v => updateModel(idx, { link: v })} placeholder="/marque/chery/modele/..." />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addModel}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 32, borderRadius: 6, border: '1px dashed #27272a',
            background: 'transparent', color: '#a1a1aa', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'border-color 150ms, color 150ms'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#288fe3'; e.currentTarget.style.color = '#e4e4e7'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#a1a1aa'; }}
        >
          <Plus size={14} /> Ajouter un Véhicule
        </button>
      </div>
    </div>
  );
}

// ── 11. Campaign Gamme Thermique Inspector ────────────────────────────────────

// ── Sub-primitives specific to this inspector ────────────────────────────────

function IGLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.09em',
      color: '#52525b', marginBottom: 5,
    }}>
      {children}
    </label>
  );
}

function IGSegmented<T extends string>({
  value, options, onChange, full = false,
}: {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
  full?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', gap: 2,
      background: '#09090b', padding: 3,
      borderRadius: 8, border: '1px solid #27272a',
      ...(full ? { width: '100%' } : {}),
    }} role="group">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, height: 28,
              border: active ? '1px solid #3b82f620' : '1px solid transparent',
              borderRadius: 6,
              background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: active ? '#60a5fa' : '#52525b',
              fontSize: 11, fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              transition: 'all 150ms ease',
            }}
          >
            {opt.icon && <span style={{ opacity: active ? 1 : 0.5 }}>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function IGColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <IGLabel>{label}</IGLabel>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            width: 32, height: 32, borderRadius: 7, flexShrink: 0,
            border: '2px solid #27272a', cursor: 'pointer',
            background: value || '#f2f2f2',
            boxShadow: open ? `0 0 0 3px ${value}33` : 'none',
            transition: 'box-shadow 200ms',
          }}
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#f2f2f2"
          style={{
            flex: 1, height: 32, padding: '0 10px',
            background: '#09090b', border: '1px solid #27272a',
            borderRadius: 6, color: '#e4e4e7', fontSize: 12, outline: 'none',
          }}
        />
      </div>
      {open && (
        <div style={{ marginTop: 4, borderRadius: 10, overflow: 'hidden', border: '1px solid #27272a' }}>
          <HexColorPicker color={value || '#f2f2f2'} onChange={onChange} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}

function IGSwitch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', cursor: 'pointer', gap: 8 }}>
      <div>
        <span style={{ fontSize: 12, color: '#d1d5db', display: 'block', lineHeight: 1.4 }}>{label}</span>
        {hint && <span style={{ fontSize: 10, color: '#52525b', lineHeight: 1.4 }}>{hint}</span>}
      </div>
      <div
        style={{
          width: 36, height: 20, borderRadius: 10, flexShrink: 0,
          background: checked ? '#3b82f6' : '#27272a',
          position: 'relative', transition: 'background 200ms',
          cursor: 'pointer',
        }}
        onClick={() => onChange(!checked)}
      >
        <div style={{
          position: 'absolute', top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          transition: 'left 200ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
    </label>
  );
}

function IGAccordion({ title, badge, defaultOpen = false, open: controlledOpen, onOpenChange, children }: {
  title: string; badge?: string; defaultOpen?: boolean; open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode;
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = (v: boolean) => {
    setLocalOpen(v);
    onOpenChange?.(v);
  };
  return (
    <div style={{ borderRadius: 8, border: '1px solid #1c1c1f', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', background: '#0f0f11', border: 'none',
          cursor: 'pointer', gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontSize: 9, fontWeight: 800, background: 'rgba(59,130,246,0.15)',
              color: '#60a5fa', borderRadius: 4, padding: '1px 6px',
              border: '1px solid rgba(59,130,246,0.2)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {badge}
            </span>
          )}
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path d="M2 4l4 4 4-4" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '12px', background: '#0c0a09', borderTop: '1px solid #1c1c1f', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function IGTabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'flex', background: '#09090b',
      borderBottom: '1px solid #18181b',
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            style={{
              flex: 1, height: 38, border: 'none',
              borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'transparent',
              color: isActive ? '#e4e4e7' : '#52525b',
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              cursor: 'pointer', transition: 'all 150ms ease',
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

function CampaignGammeThermiqueInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'Disposition' | 'Style' | 'Contenu'>('Disposition');
  const [openAccordion, setOpenAccordion] = useState<1 | 2 | 3 | null>(1);

  if (!node) return null;

  const props = node.props as CampaignGammeThermiqueBlockProps;
  const patch = (partial: Partial<CampaignGammeThermiqueBlockProps>) => updateBlockProps(nodeId, partial);

  const updateModel = (idx: number, val: string) => {
    const list = [...(props.modelsList ?? [])];
    list[idx] = val;
    patch({ modelsList: list });
  };
  const addModel = () => patch({ modelsList: [...(props.modelsList ?? []), 'Nouveau Modele'] });
  const removeModel = (idx: number) => patch({ modelsList: (props.modelsList ?? []).filter((_, i) => i !== idx) });

  const updateVille = (idx: number, val: string) => {
    const list = [...(props.villesList ?? [])];
    list[idx] = val;
    patch({ villesList: list });
  };
  const addVille = () => patch({ villesList: [...(props.villesList ?? []), 'Nouvelle Ville'] });
  const removeVille = (idx: number) => patch({ villesList: (props.villesList ?? []).filter((_, i) => i !== idx) });

  const TABS = ['Disposition', 'Style', 'Contenu'] as const;

  const renderFieldControls = (fieldId: string, title: string, hasActiveToggle = false) => {
    const fields = props.fields ?? [
      { id: 'modele', label: 'Modèle', placeholder: '', required: true, active: true },
      { id: 'ville', label: 'Ville', placeholder: '', required: true, active: true },
      { id: 'date', label: 'Date préférée pour l’essai', placeholder: '', required: true, active: true },
      { id: 'nom', label: 'Nom', placeholder: 'Entrez votre nom', required: true, active: true },
      { id: 'tel', label: 'Téléphone', placeholder: 'Entrez votre Téléphone', required: true, active: true },
      { id: 'email', label: 'Email', placeholder: 'Entrez votre adresse email', required: true, active: false },
    ];
    const fIdx = fields.findIndex(f => f.id === fieldId);
    const field = fields[fIdx] || { label: '', placeholder: '', required: true, active: true };

    const updateField = (patchData: Partial<typeof field>) => {
      const newFields = [...fields];
      if (fIdx === -1) {
        newFields.push({ id: fieldId as any, label: title, placeholder: '', required: true, active: true, ...patchData });
      } else {
        newFields[fIdx] = { ...field, ...patchData };
      }
      patch({ fields: newFields });
    };

    return (
      <div style={{ background: '#09090b', borderRadius: 8, padding: '10px 12px', border: '1px solid #1c1c1f', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f4f4f5' }}>{title}</span>
          {hasActiveToggle && (
            <IGSwitch
              label=""
              checked={field.active}
              onChange={v => updateField({ active: v })}
            />
          )}
        </div>

        {field.active && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #1c1c1f', paddingTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>Champ obligatoire</span>
              <input
                type="checkbox"
                checked={field.required}
                onChange={e => updateField({ required: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 10, color: '#71717a' }}>Libellé (Label)</span>
              <PInput
                value={field.label}
                onChange={v => updateField({ label: v })}
                placeholder="Libellé du champ..."
              />
            </div>
            {fieldId !== 'modele' && fieldId !== 'ville' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, color: '#71717a' }}>Texte d'aide (Placeholder)</span>
                <PInput
                  value={field.placeholder ?? ''}
                  onChange={v => updateField({ placeholder: v })}
                  placeholder="Placeholder du champ..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#0c0a09', color: '#e4e4e7' }}>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0c0a09', flexShrink: 0 }}>
        <IGTabBar
          tabs={[...TABS]}
          active={activeTab}
          onChange={v => setActiveTab(v as typeof activeTab)}
        />
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ══════════════ ONGLET 1 : DISPOSITION & MEDIAS ═══════════════ */}
        {activeTab === 'Disposition' && (
          <>
            {/* Banner upload */}
            <MediaUploadZone
              value={props.bannerImage ?? ''}
              onChange={v => patch({ bannerImage: v })}
              label="Visuel de campagne"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <IGLabel>Texte alternatif</IGLabel>
              <PInput value={props.bannerAlt ?? ''} onChange={v => patch({ bannerAlt: v })} placeholder="Description de l'image..." />
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: '#18181b', margin: '4px 0' }} />

            {/* Image sizing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <IGLabel>Ajustement du visuel</IGLabel>
              <IGSegmented<'contain' | 'cover'>
                value={props.imageSizing ?? 'cover'}
                onChange={v => patch({ imageSizing: v })}
                full
                options={[
                  {
                    value: 'contain',
                    label: 'Contain',
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="1" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="3" y="3" width="7" height="7" rx="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1" />
                      </svg>
                    ),
                  },
                  {
                    value: 'cover',
                    label: 'Cover',
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="0.5" y="0.5" width="12" height="12" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="2" y="2" width="9" height="9" rx="0.5" fill="currentColor" fillOpacity="0.35" />
                      </svg>
                    ),
                  },
                ]}
              />
              <p style={{ margin: 0, fontSize: 10, color: '#52525b', lineHeight: 1.6 }}>
                {(props.imageSizing ?? 'contain') === 'contain'
                  ? 'Image visible en totalite, fond visible sur les cotes.'
                  : 'Image recadree pour remplir la zone, centree.'}
              </p>
            </div>

            {/* Form position */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <IGLabel>Position du formulaire</IGLabel>
              <IGSegmented<'right' | 'left'>
                value={props.formPosition ?? 'right'}
                onChange={v => patch({ formPosition: v })}
                full
                options={[
                  {
                    value: 'right',
                    label: 'Droite',
                    icon: (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <rect x="0.5" y="0.5" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1" />
                        <rect x="9" y="0.5" width="3.5" height="9" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    ),
                  },
                  {
                    value: 'left',
                    label: 'Gauche',
                    icon: (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <rect x="0.5" y="0.5" width="3.5" height="9" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
                        <rect x="5" y="0.5" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    ),
                  },
                ]}
              />
            </div>

            {/* Layout background */}
            <IGColorPicker
              label="Arriere-plan (fond derriere l'image)"
              value={props.layoutBackground ?? '#f2f2f2'}
              onChange={v => patch({ layoutBackground: v })}
            />
          </>
        )}

        {/* ══════════════ ONGLET 2 : STYLE DE LA CARTE ══════════════════ */}
        {activeTab === 'Style' && (
          <>
            {/* Primary color */}
            <IGColorPicker
              label="Couleur principale (boutons + barre)"
              value={props.colorPrimary ?? '#288fe3'}
              onChange={v => patch({ colorPrimary: v })}
            />

            {/* Input border color */}
            <IGColorPicker
              label="Bordure des champs de saisie"
              value={props.inputBorderColor ?? '#d1d5db'}
              onChange={v => patch({ inputBorderColor: v })}
            />

            <div style={{ height: 1, background: '#18181b', margin: '4px 0' }} />

            {/* Shadow switch */}
            <div style={{ background: '#09090b', borderRadius: 8, padding: '4px 10px', border: '1px solid #1c1c1f' }}>
              <IGSwitch
                label="Ombre portee"
                hint="Applique shadow-2xl sur la carte formulaire"
                checked={props.formShadow !== false}
                onChange={v => patch({ formShadow: v })}
              />
            </div>

            <div style={{ height: 1, background: '#18181b', margin: '4px 0' }} />

            {/* Form background */}
            <IGColorPicker
              label="Fond de la colonne formulaire"
              value={props.formBgColor ?? props.formBg ?? '#ffffff'}
              onChange={v => patch({ formBgColor: v, formBg: v })}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <IGLabel>Arrondi des composants (Boîte & Inputs)</IGLabel>
              <PSelect
                value={props.borderRadius ?? 'none'}
                onChange={v => patch({ borderRadius: v as any })}
                options={[
                  { value: 'none', label: 'Aucun (0px)' },
                  { value: 'md', label: 'Moyen (8px)' },
                  { value: 'lg', label: 'Grand (12px)' },
                ]}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IGLabel>Opacité de fond du formulaire</IGLabel>
                <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.bgOpacity ?? props.formBgOpacity ?? 95}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={props.bgOpacity ?? props.formBgOpacity ?? 95}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  patch({ bgOpacity: val, formBgOpacity: val });
                }}
                style={{ width: '100%', height: 4, background: '#27272a', borderRadius: 2, appearance: 'none', outline: 'none', cursor: 'pointer' }}
              />
            </div>
          </>
        )}

        {/* ══════════════ ONGLET 3 : CONTENU & ETAPES ═══════════════════ */}
        {activeTab === 'Contenu' && (
          <>
            {/* Step preview badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <IGLabel>Apercu de l'etape dans le studio</IGLabel>
              <div style={{ display: 'flex', gap: 4 }}>
                {([1, 2, 3] as const).map(stepVal => {
                  const active = props.studioPreviewStep === stepVal;
                  return (
                    <button
                      key={stepVal}
                      type="button"
                      onClick={() => { patch({ studioPreviewStep: stepVal }); setOpenAccordion(stepVal); }}
                      style={{
                        flex: 1, height: 30, borderRadius: 6,
                        background: active ? 'rgba(59,130,246,0.15)' : '#0f0f11',
                        color: active ? '#60a5fa' : '#52525b',
                        fontSize: 11, fontWeight: 700,
                        cursor: 'pointer',
                        border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid #27272a',
                        transition: 'all 150ms',
                      } as React.CSSProperties}
                    >
                      Etape {stepVal}
                    </button>
                  );
                })}
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#52525b', lineHeight: 1.5 }}>
                Force l'affichage de l'etape choisie sur le canvas sans remplir le formulaire.
              </p>
            </div>

            <div style={{ background: '#09090b', borderRadius: 8, padding: '4px 10px', border: '1px solid #1c1c1f' }}>
              <IGSwitch
                label="Personnaliser la structure et les véhicules"
                hint="Permet de modifier la liste des modèles et textes du formulaire"
                checked={!!props.customizeVehicles}
                onChange={v => patch({ customizeVehicles: v })}
              />
            </div>

            <button
              type="button"
              onClick={() => patch({
                step1Title: 'Sélectionnez le véhicule que vous souhaitez essayer',
                step2Title: 'Commençons par confirmer votre disponibilité',
                step3Title: 'Enfin, Fournir votre nom et téléphone',
                btnNextLabel: 'Suivant',
                btnBackLabel: 'Retour',
                btnSubmitLabel: 'Soumettre',
                modelsList: [
                  'CHERY TIGGO 4 CROSS HEV',
                  'CHERY TIGGO 7 PRO PHEV',
                  'CHERY TIGGO 8 PHEV',
                  'CHERY TIGGO 3X',
                  'CHERY ARRIZO 6',
                ],
                customizeVehicles: false,
              })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 150ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              Réinitialiser le formulaire
            </button>

            <div style={{ height: 1, background: '#18181b', margin: '4px 0' }} />

            {/* Accordion — Etape 1 */}
            <IGAccordion title="Etape 1 / 3" badge="Vehicule" open={openAccordion === 1} onOpenChange={v => setOpenAccordion(v ? 1 : null)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <IGLabel>Titre</IGLabel>
                <PInput
                  value={props.step1Title ?? ''}
                  onChange={v => patch({ step1Title: v })}
                  placeholder="Selectionnez le vehicule..."
                />
              </div>

              {props.customizeVehicles && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  <IGLabel>Liste des modeles</IGLabel>
                  {(props.modelsList ?? []).map((model, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <PInput value={model} onChange={v => updateModel(idx, v)} placeholder="Modele..." />
                      <button
                        type="button"
                        onClick={() => removeModel(idx)}
                        style={{
                          flexShrink: 0, width: 26, height: 26, border: '1px solid #27272a',
                          borderRadius: 5, background: '#0f0f11', color: '#52525b',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addModel}
                    style={{
                      height: 28, borderRadius: 6, border: '1px dashed #27272a',
                      background: 'transparent', color: '#52525b', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}
                  >
                    <Plus size={10} /> Ajouter un modele
                  </button>
                </div>
              )}

              <div style={{ height: 1, background: '#1c1c1f', margin: '8px 0' }} />
              {renderFieldControls('modele', 'Champ Modèle')}
            </IGAccordion>

            {/* Accordion — Etape 2 */}
            <IGAccordion title="Etape 2 / 3" badge="Disponibilite" open={openAccordion === 2} onOpenChange={v => setOpenAccordion(v ? 2 : null)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <IGLabel>Titre</IGLabel>
                <PInput
                  value={props.step2Title ?? ''}
                  onChange={v => patch({ step2Title: v })}
                  placeholder="Choisissez votre ville..."
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <IGLabel>Liste des villes</IGLabel>
                  {!isVillesListSynced(props.villesList ?? []) && (
                    <button
                      type="button"
                      onClick={() => patch({ villesList: [...AUTOHALL_OFFICIAL_CITIES] })}
                      style={{
                        height: 20, padding: '0 8px', fontSize: 9, fontWeight: 700,
                        border: '1px solid rgba(251,146,60,0.4)', borderRadius: 4,
                        background: 'rgba(251,146,60,0.1)', color: '#fb923c',
                        cursor: 'pointer', letterSpacing: '0.04em',
                      }}
                    >
                      Resync officiel
                    </button>
                  )}
                </div>

                {!isVillesListSynced(props.villesList ?? []) && (
                  <div style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: 'rgba(251,146,60,0.08)',
                    border: '1px solid rgba(251,146,60,0.25)',
                    fontSize: 10, color: '#fb923c', lineHeight: 1.6,
                  }}>
                    Liste desynchronisee — la remontee CRM peut etre bloquee.
                  </div>
                )}

                {(props.villesList ?? []).map((ville, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <PInput value={ville} onChange={v => updateVille(idx, v)} placeholder="Ville..." />
                    <button
                      type="button"
                      onClick={() => removeVille(idx)}
                      style={{
                        flexShrink: 0, width: 26, height: 26, border: '1px solid #27272a',
                        borderRadius: 5, background: '#0f0f11', color: '#52525b',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVille}
                  style={{
                    height: 28, borderRadius: 6, border: '1px dashed #27272a',
                    background: 'transparent', color: '#52525b', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <Plus size={10} /> Ajouter une ville
                </button>
              </div>

              <div style={{ height: 1, background: '#1c1c1f', margin: '8px 0' }} />
              {renderFieldControls('ville', 'Champ Ville')}
              {renderFieldControls('date', 'Champ Date Essai', true)}
            </IGAccordion>

            {/* Accordion — Etape 3 + Boutons */}
            <IGAccordion title="Etape 3 / 3" badge="Coordonnees" open={openAccordion === 3} onOpenChange={v => setOpenAccordion(v ? 3 : null)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <IGLabel>Titre</IGLabel>
                <PInput
                  value={props.step3Title ?? ''}
                  onChange={v => patch({ step3Title: v })}
                  placeholder="Vos coordonnees..."
                />
              </div>

              <div style={{ height: 1, background: '#1c1c1f' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <IGLabel>Libelles des boutons</IGLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 9, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Suivant</span>
                    <PInput value={props.btnNextLabel ?? 'Suivant'} onChange={v => patch({ btnNextLabel: v })} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 9, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Retour</span>
                    <PInput value={props.btnBackLabel ?? 'Retour'} onChange={v => patch({ btnBackLabel: v })} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 9, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Valider (soumission)</span>
                  <PInput value={props.btnSubmitLabel ?? 'Soumettre'} onChange={v => patch({ btnSubmitLabel: v })} />
                </div>
              </div>

              <div style={{ height: 1, background: '#1c1c1f', margin: '8px 0' }} />
              {renderFieldControls('nom', 'Champ Nom')}
              {renderFieldControls('tel', 'Champ Téléphone')}
              {renderFieldControls('email', 'Champ Email', true)}
            </IGAccordion>

            {/* Accordion — Routage & Leads */}
            <IGAccordion title="Routage & Leads">
              <div style={{ background: '#09090b', borderRadius: 7, padding: '4px 10px', border: '1px solid #1c1c1f' }}>
                <IGSwitch
                  label="Synchroniser avec l'API Auto Hall"
                  hint="Active la remontee des leads dans le CRM central"
                  checked={!!props.syncToAutoHallBase}
                  onChange={v => patch({ syncToAutoHallBase: v })}
                />
              </div>
              {props.syncToAutoHallBase && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  <IGLabel>URL de l'API</IGLabel>
                  <PInput
                    value={props.autoHallApiUrl ?? ''}
                    onChange={v => patch({ autoHallApiUrl: v })}
                    placeholder="https://api.autohall.ma/v1/leads"
                  />
                </div>
              )}
            </IGAccordion>
          </>
        )}
      </div>
    </div>
  );
}

function PSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          height: 32,
          padding: '0 28px 0 10px',
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: 6,
          color: '#e4e4e7',
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '16px',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#09090b', color: '#e4e4e7' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}




function FooterInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [openSubSection, setOpenSubSection] = useState<'group' | 'services' | 'careers' | null>('group');

  if (!node) return null;

  const props = node.props as FooterBlockProps;
  const patch = (partial: Partial<FooterBlockProps>) => updateBlockProps(nodeId, partial);

  const patchSocial = (key: keyof FooterBlockProps['socialLinks'], value: string) => {
    patch({ socialLinks: { ...(props.socialLinks ?? {}), [key]: value } });
  };
  const patchLegal = (key: keyof FooterBlockProps['legalLinks'], value: string) => {
    patch({ legalLinks: { ...(props.legalLinks ?? {}), [key]: value } });
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
      <SectionDivider title="CONTENU DES COLONNES" />
      
      {/* Sub-sections tabs to keep it clean */}
      <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 3, borderRadius: 6, border: '1px solid #1c1c1f' }}>
        <button
          type="button"
          onClick={() => setOpenSubSection('group')}
          style={{
            flex: 1, padding: '4px 6px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4,
            background: openSubSection === 'group' ? '#27272a' : 'transparent',
            color: openSubSection === 'group' ? '#ffffff' : '#71717a', cursor: 'pointer'
          }}
        >
          Groupe
        </button>
        <button
          type="button"
          onClick={() => setOpenSubSection('services')}
          style={{
            flex: 1, padding: '4px 6px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4,
            background: openSubSection === 'services' ? '#27272a' : 'transparent',
            color: openSubSection === 'services' ? '#ffffff' : '#71717a', cursor: 'pointer'
          }}
        >
          Services
        </button>
        <button
          type="button"
          onClick={() => setOpenSubSection('careers')}
          style={{
            flex: 1, padding: '4px 6px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4,
            background: openSubSection === 'careers' ? '#27272a' : 'transparent',
            color: openSubSection === 'careers' ? '#ffffff' : '#71717a', cursor: 'pointer'
          }}
        >
          Carrières
        </button>
      </div>

      {openSubSection === 'group' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, background: '#09090b', border: '1px solid #1c1c1f', borderRadius: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Titre Colonne</PLabel>
            <PInput value={props.groupTitle ?? 'Groupe Auto Hall'} onChange={v => patch({ groupTitle: v })} />
          </div>
          <div style={{ borderTop: '1px solid #1c1c1f', margin: '4px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 1</span>
            <PInput value={props.groupLink1Label ?? 'À propos de nous'} onChange={v => patch({ groupLink1Label: v })} placeholder="Libellé..." />
            <PInput value={props.groupLink1Url ?? ''} onChange={v => patch({ groupLink1Url: v })} placeholder="Lien URL..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 2</span>
            <PInput value={props.groupLink2Label ?? 'Actualités'} onChange={v => patch({ groupLink2Label: v })} placeholder="Libellé..." />
            <PInput value={props.groupLink2Url ?? ''} onChange={v => patch({ groupLink2Url: v })} placeholder="Lien URL..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 3</span>
            <PInput value={props.groupLink3Label ?? 'Réseau'} onChange={v => patch({ groupLink3Label: v })} placeholder="Libellé..." />
            <PInput value={props.groupLink3Url ?? ''} onChange={v => patch({ groupLink3Url: v })} placeholder="Lien URL..." />
          </div>
        </div>
      )}

      {openSubSection === 'services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, background: '#09090b', border: '1px solid #1c1c1f', borderRadius: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Titre Colonne</PLabel>
            <PInput value={props.servicesTitle ?? 'Nos Services'} onChange={v => patch({ servicesTitle: v })} />
          </div>
          <div style={{ borderTop: '1px solid #1c1c1f', margin: '4px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 1</span>
            <PInput value={props.servicesLink1Label ?? 'Vente de véhicules'} onChange={v => patch({ servicesLink1Label: v })} placeholder="Libellé..." />
            <PInput value={props.servicesLink1Url ?? ''} onChange={v => patch({ servicesLink1Url: v })} placeholder="Lien URL..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 2</span>
            <PInput value={props.servicesLink2Label ?? 'Service Après-Vente'} onChange={v => patch({ servicesLink2Label: v })} placeholder="Libellé..." />
            <PInput value={props.servicesLink2Url ?? ''} onChange={v => patch({ servicesLink2Url: v })} placeholder="Lien URL..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 3</span>
            <PInput value={props.servicesLink3Label ?? 'Pièces de rechange'} onChange={v => patch({ servicesLink3Label: v })} placeholder="Libellé..." />
            <PInput value={props.servicesLink3Url ?? ''} onChange={v => patch({ servicesLink3Url: v })} placeholder="Lien URL..." />
          </div>
        </div>
      )}

      {openSubSection === 'careers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, background: '#09090b', border: '1px solid #1c1c1f', borderRadius: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Titre Colonne</PLabel>
            <PInput value={props.careersTitle ?? 'Carrières'} onChange={v => patch({ careersTitle: v })} />
          </div>
          <div style={{ borderTop: '1px solid #1c1c1f', margin: '4px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 1</span>
            <PInput value={props.careersLink1Label ?? 'Offres d’emploi'} onChange={v => patch({ careersLink1Label: v })} placeholder="Libellé..." />
            <PInput value={props.careersLink1Url ?? ''} onChange={v => patch({ careersLink1Url: v })} placeholder="Lien URL..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 2</span>
            <PInput value={props.careersLink2Label ?? 'Candidature spontanée'} onChange={v => patch({ careersLink2Label: v })} placeholder="Libellé..." />
            <PInput value={props.careersLink2Url ?? ''} onChange={v => patch({ careersLink2Url: v })} placeholder="Lien URL..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 600 }}>LIEN 3</span>
            <PInput value={props.careersLink3Label ?? 'Pourquoi nous rejoindre'} onChange={v => patch({ careersLink3Label: v })} placeholder="Libellé..." />
            <PInput value={props.careersLink3Url ?? ''} onChange={v => patch({ careersLink3Url: v })} placeholder="Lien URL..." />
          </div>
        </div>
      )}

      <SectionDivider title="RÉSEAUX SOCIAUX" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>Facebook URL</PLabel>
          <PInput value={props.socialLinks?.facebook ?? ''} onChange={v => patchSocial('facebook', v)} placeholder="https://facebook.com/..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>Instagram URL</PLabel>
          <PInput value={props.socialLinks?.instagram ?? ''} onChange={v => patchSocial('instagram', v)} placeholder="https://instagram.com/..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>LinkedIn URL</PLabel>
          <PInput value={props.socialLinks?.linkedin ?? ''} onChange={v => patchSocial('linkedin', v)} placeholder="https://linkedin.com/..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>YouTube URL</PLabel>
          <PInput value={props.socialLinks?.youtube ?? ''} onChange={v => patchSocial('youtube', v)} placeholder="https://youtube.com/..." />
        </div>
        <span style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3 }}>
          Si un champ est laissé vide, l'icône associée se masquera automatiquement sur le canevas.
        </span>
      </div>

      <SectionDivider title="LIENS JURIDIQUES (BAS DE PAGE)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>Mentions Légales URL</PLabel>
          <PInput value={props.legalLinks?.mentionsLegales ?? ''} onChange={v => patchLegal('mentionsLegales', v)} placeholder="https://..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>Politique de Confidentialité URL</PLabel>
          <PInput value={props.legalLinks?.politiqueConfidentialite ?? ''} onChange={v => patchLegal('politiqueConfidentialite', v)} placeholder="https://..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PLabel>Conditions de Service URL</PLabel>
          <PInput value={props.legalLinks?.conditionsService ?? ''} onChange={v => patchLegal('conditionsService', v)} placeholder="https://..." />
        </div>
      </div>

      <SectionDivider title="OPTIONS D'AFFICHAGE (SWITCHES)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PSwitch
          label="Afficher la colonne Marques"
          checked={props.showBrandsColumn !== false}
          onChange={v => patch({ showBrandsColumn: v })}
        />
        <PSwitch
          label="Afficher la colonne Carrières"
          checked={props.showCareersColumn !== false}
          onChange={v => patch({ showCareersColumn: v })}
        />
        
        <div style={{ borderTop: '1px solid #1c1c1f', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Texte du Filigrane</PLabel>
            <PInput value={props.watermarkText ?? 'Auto Hall'} onChange={v => patch({ watermarkText: v })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Texte de Copyright</PLabel>
            <PInput value={props.copyrightText ?? ''} onChange={v => patch({ copyrightText: v })} />
          </div>
          <PColorRow value={props.bgColor ?? '#002C6C'} onChange={v => patch({ bgColor: v })} label="Couleur de Fond" />
        </div>
      </div>
    </div>
  );
}

function AlternatingShowcaseInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  if (!node) return null;

  const props = node.props as any;
  const items = props.items || [];
  const patch = (partial: any) => updateBlockProps(nodeId, partial);

  const updateItem = (index: number, partialItem: any) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], ...partialItem };
    patch({ items: nextItems });
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      badge: 'NOUVEAU',
      title: 'Titre de l’atout',
      description: 'Description détaillée de cet atout.',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      linkUrl: '#form_test_drive',
      linkLabel: 'Explorer',
      feature1Icon: 'Shield',
      feature1Title: 'Caractéristique 1',
      feature1Desc: 'Courte description.',
      feature2Icon: 'Zap',
      feature2Title: 'Caractéristique 2',
      feature2Desc: 'Courte description.',
    };
    patch({ items: [...items, newItem] });
  };

  const removeItem = (index: number) => {
    const nextItems = items.filter((_: any, i: number) => i !== index);
    patch({ items: nextItems });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #27272a', background: '#09090b', padding: '0 10px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          style={{
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'content' ? '#3b82f6' : '#71717a',
            borderBottom: activeTab === 'content' ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Contenu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          style={{
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'design' ? '#3b82f6' : '#71717a',
            borderBottom: activeTab === 'design' ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Style / Design
        </button>
      </div>

      {activeTab === 'content' && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
          <SectionDivider title="INFOS PRINCIPALES" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item: any, idx: number) => (
              <div 
                key={item.id || idx} 
                style={{ 
                  background: '#18181b', 
                  padding: 10, 
                  borderRadius: 8, 
                  border: '1px solid #27272a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>
                    Ligne {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Badge (ex: DESIGN)</PLabel>
                  <PInput value={item.badge} onChange={(v) => updateItem(idx, { badge: v })} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Titre Principal</PLabel>
                  <PInput value={item.title} onChange={(v) => updateItem(idx, { title: v })} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Description</PLabel>
                  <PTextarea value={item.description} onChange={(v) => updateItem(idx, { description: v })} height={60} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Image d'atout (URL)</PLabel>
                  <MediaUploadZone
                    value={item.imageUrl}
                    onChange={(v) => updateItem(idx, { imageUrl: v || '' })}
                    label="Image de l'atout"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>URL de redirection (Bouton)</PLabel>
                  <PInput value={item.linkUrl} onChange={(v) => updateItem(idx, { linkUrl: v })} placeholder="#form_test_drive" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Libellé du Bouton</PLabel>
                  <PInput value={item.linkLabel} onChange={(v) => updateItem(idx, { linkLabel: v })} placeholder="Explorer" />
                </div>

                {/* Sub-divider for micro-features */}
                <div style={{ borderTop: '1px solid #27272a', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Micro-Atout 1
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <PLabel>Icône (ex: Shield, Zap, Cpu, Navigation)</PLabel>
                      <select
                        value={item.feature1Icon}
                        onChange={(e) => updateItem(idx, { feature1Icon: e.target.value })}
                        style={{
                          height: 30,
                          width: '100%',
                          background: '#09090b',
                          border: '1px solid #27272a',
                          borderRadius: 6,
                          color: '#e4e4e7',
                          fontSize: 11,
                          padding: '0 8px',
                          outline: 'none',
                        }}
                      >
                        <option value="Shield">Shield (Sécurité)</option>
                        <option value="Zap">Zap (Performance/Électrique)</option>
                        <option value="Cpu">Cpu (Technologie)</option>
                        <option value="Navigation">Navigation (Aide)</option>
                      </select>
                    </div>
                    <div>
                      <PLabel>Titre Micro-Atout 1</PLabel>
                      <PInput value={item.feature1Title} onChange={(v) => updateItem(idx, { feature1Title: v })} />
                    </div>
                    <div>
                      <PLabel>Description Micro-Atout 1</PLabel>
                      <PInput value={item.feature1Desc} onChange={(v) => updateItem(idx, { feature1Desc: v })} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #27272a', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Micro-Atout 2
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <PLabel>Icône (ex: Shield, Zap, Cpu, Navigation)</PLabel>
                      <select
                        value={item.feature2Icon}
                        onChange={(e) => updateItem(idx, { feature2Icon: e.target.value })}
                        style={{
                          height: 30,
                          width: '100%',
                          background: '#09090b',
                          border: '1px solid #27272a',
                          borderRadius: 6,
                          color: '#e4e4e7',
                          fontSize: 11,
                          padding: '0 8px',
                          outline: 'none',
                        }}
                      >
                        <option value="Shield">Shield (Sécurité)</option>
                        <option value="Zap">Zap (Performance/Électrique)</option>
                        <option value="Cpu">Cpu (Technologie)</option>
                        <option value="Navigation">Navigation (Aide)</option>
                      </select>
                    </div>
                    <div>
                      <PLabel>Titre Micro-Atout 2</PLabel>
                      <PInput value={item.feature2Title} onChange={(v) => updateItem(idx, { feature2Title: v })} />
                    </div>
                    <div>
                      <PLabel>Description Micro-Atout 2</PLabel>
                      <PInput value={item.feature2Desc} onChange={(v) => updateItem(idx, { feature2Desc: v })} />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 32,
              borderRadius: 6,
              border: '1px dashed #3b82f6',
              background: 'rgba(59,130,246,0.05)',
              color: '#3b82f6',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 10,
            }}
          >
            <Plus size={14} /> Ajouter une section d'atout
          </button>
        </div>
      )}

      {activeTab === 'design' && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Options de Style" />
          <span style={{ fontSize: 11, color: '#71717a' }}>
            Les boutons et les fonds colorés s'adaptent automatiquement à la couleur primaire de la marque sélectionnée.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Tactical Flash Campaign Inspector ──────────────────────────────────────────

function TacticalFlashCampaignInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  if (!node) return null;

  const props = node.props as TacticalFlashCampaignBlockProps;
  const patch = (partial: Partial<TacticalFlashCampaignBlockProps>) => updateBlockProps(nodeId, partial);

  const updateVille = (idx: number, val: string) => {
    const list = [...(props.villesList ?? [])];
    list[idx] = val;
    patch({ villesList: list });
  };
  const addVille = () => patch({ villesList: [...(props.villesList ?? []), 'Nouvelle Ville'] });
  const removeVille = (idx: number) => patch({ villesList: (props.villesList ?? []).filter((_, i) => i !== idx) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: 4 }}>
        {(['content', 'design'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #288fe3' : '2px solid transparent',
              color: activeTab === tab ? '#e4e4e7' : '#71717a',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab === 'content' ? 'Contenu' : 'Design'}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Configuration du visuel" />
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 6,
          }}>
            <MediaUploadZone
              value={props.promoImageUrl ?? ''}
              onChange={(v) => patch({ promoImageUrl: v || null })}
              label="Visuel de campagne (colonne gauche)"
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Texte alternatif</PLabel>
              <PInput value={props.promoImageAlt ?? ''} onChange={(v) => patch({ promoImageAlt: v })} placeholder="Description de l'image..." />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Ajustement du visuel</PLabel>
              <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
                {([
                  { value: 'cover', label: 'Cover (Remplir)' },
                  { value: 'contain', label: 'Contain (Flou Ambilight)' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => patch({ imageFit: opt.value, visualFitMode: opt.value })}
                    style={{
                      flex: 1, height: 26, border: 'none', borderRadius: 4,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: (props.visualFitMode ?? props.imageFit ?? 'cover') === opt.value ? 'rgba(40,143,227,0.15)' : 'transparent',
                      color: (props.visualFitMode ?? props.imageFit ?? 'cover') === opt.value ? '#3b82f6' : '#71717a',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <PLabel>Hauteur maximale du visuel</PLabel>
                <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.imageMaxHeight ?? 360}px</span>
              </div>
              <input
                type="range"
                min="160"
                max="700"
                step="10"
                value={props.imageMaxHeight ?? 360}
                onChange={(e) => patch({ imageMaxHeight: parseInt(e.target.value), maxVisualHeight: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PLabel>Arrondi des angles du visuel</PLabel>
              <div style={{ display: 'flex', gap: 4, background: '#09090b', padding: 2, borderRadius: 6, border: '1px solid #27272a' }}>
                {(
                  [
                    { value: 'none', label: 'None' },
                    { value: 'lg', label: 'LG' },
                    { value: 'xl', label: 'XL' },
                    { value: '2xl', label: '2XL' },
                    { value: '3xl', label: '3XL' },
                    { value: 'full', label: 'Full' },
                  ] as Array<{ value: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'; label: string }>
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => patch({ imageRadius: opt.value })}
                    style={{
                      flex: 1, height: 26, border: 'none', borderRadius: 4,
                      fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      background: (props.imageRadius ?? '2xl') === opt.value ? 'rgba(40,143,227,0.15)' : 'transparent',
                      color: (props.imageRadius ?? '2xl') === opt.value ? '#3b82f6' : '#71717a',
                    }}
                  >
                    {opt.label ?? opt.value.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <MediaUploadZone
              value={props.brandLogoUrl ?? ''}
              onChange={(v) => patch({ brandLogoUrl: v || null })}
              label="Logo de la marque (le cas échéant)"
            />
          </div>

          <SectionDivider title="Colonne marketing" />
          {!props.hideMarketingText && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Badge supérieur</PLabel>
                <PInput value={props.badgeText ?? ''} onChange={(v) => patch({ badgeText: v })} placeholder="OFFRE EXCLUSIVE SAV" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Titre principal (H1)</PLabel>
                <PTextarea value={props.headline ?? ''} onChange={(v) => patch({ headline: v })} placeholder="Titre de l'offre..." height={56} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PLabel>Description</PLabel>
                <PTextarea value={props.description ?? ''} onChange={(v) => patch({ description: v })} placeholder="Description de l'offre..." height={72} />
              </div>

              <SectionDivider title="Prix d'appel" />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Libellé</PLabel>
                  <PInput value={props.priceLabel ?? ''} onChange={(v) => patch({ priceLabel: v })} placeholder="À partir de" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Valeur</PLabel>
                  <PInput value={props.priceValue ?? ''} onChange={(v) => patch({ priceValue: v })} placeholder="199" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PLabel>Suffixe</PLabel>
                  <PInput value={props.priceSuffix ?? ''} onChange={(v) => patch({ priceSuffix: v })} placeholder="DH*" />
                </div>
              </div>
            </>
          )}

          <SectionDivider title="Formulaire de conversion" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Titre du formulaire</PLabel>
            <PInput value={props.formTitle ?? ''} onChange={(v) => patch({ formTitle: v })} placeholder="CONTACTEZ-MOI" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PLabel>Texte du bouton de soumission</PLabel>
            <PInput value={props.btnSubmitLabel ?? ''} onChange={(v) => patch({ btnSubmitLabel: v })} placeholder="Envoyer" />
          </div>

          <SectionDivider title="Villes proposées" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(props.villesList ?? []).map((ville, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <PInput value={ville} onChange={(v) => updateVille(idx, v)} placeholder="Ville..." />
                <button
                  type="button"
                  onClick={() => removeVille(idx)}
                  style={{ border: 'none', background: 'transparent', color: '#52525b', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVille}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 28, borderRadius: 6, border: '1px dashed #27272a',
                background: 'transparent', color: '#71717a', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Ajouter une ville
            </button>
          </div>
        </div>
      )}

      {activeTab === 'design' && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionDivider title="Design Tooling" />
          <PSwitch
            label="Mode Visuel - Masquer les textes marketing"
            checked={props.hideMarketingText ?? false}
            onChange={(v) => patch({ hideMarketingText: v })}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Padding global (Gaps & Espacement)</PLabel>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.globalPadding ?? 32}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="128"
              step="4"
              value={props.globalPadding ?? 32}
              onChange={(e) => patch({ globalPadding: parseInt(e.target.value), sectionPadding: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PLabel>Arrondi Carte (Formulaire & Bouton)</PLabel>
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>{props.borderRadius ?? 16}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={props.borderRadius ?? 16}
              onChange={(e) => patch({ borderRadius: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#288fe3', cursor: 'pointer' }}
            />
          </div>

          <SectionDivider title="Couleurs" />
          <PColorRow
            value={props.colorPrimary ?? '#0051a3'}
            onChange={(v) => patch({ colorPrimary: v })}
            label="Couleur primaire (prix, bouton, accent)"
          />
          <PColorRow
            value={props.colorSecondary ?? '#1b7ac8'}
            onChange={(v) => patch({ colorSecondary: v })}
            label="Couleur secondaire"
          />
          <PColorRow
            value={props.colorAccent ?? '#1b7ac8'}
            onChange={(v) => patch({ colorAccent: v })}
            label="Couleur d'accentuation des formulaires"
          />
          <PColorRow value={props.colorBgSection ?? '#f8fafc'} onChange={(v) => patch({ colorBgSection: v })} label="Fond de la section" />
          <PColorRow value={props.formBgColor ?? '#030914'} onChange={(v) => patch({ formBgColor: v })} label="Fond de la carte formulaire" />
        </div>
      )}
    </div>
  );
}

// ── Multi Step Test Drive Inspector ─────────────────────────────────────────

function LayoutControl({ props, patch }: any) {
  const isOfficial = (props.layoutMode ?? 'official') === 'official';

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
          Mode de layout
        </label>
        <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
          {([
            { value: 'official', label: '70/30' },
            { value: 'split', label: '50/50' },
            { value: 'full', label: 'Plein' }
          ] as const).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                if (opt.value === 'official') {
                  patch({
                    layoutMode: 'official',
                    imagePosition: 'left',
                    imageFit: 'cover',
                    blockPadding: 'normal',
                    elementRounded: 'none'
                  });
                } else {
                  patch({ layoutMode: opt.value });
                }
              }}
              className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                (props.layoutMode ?? 'official') === opt.value 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!isOfficial && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Position de l'image
          </label>
          <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
            {['left', 'right'].map(pos => (
              <button
                key={pos}
                type="button"
                onClick={() => patch({ imagePosition: pos })}
                className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                  (props.imagePosition ?? 'left') === pos 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {pos === 'left' ? 'À gauche' : 'À droite'}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isOfficial && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Ajustement de l'image
            </label>
            <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
              {([
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' }
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => patch({ imageFit: opt.value })}
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                    (props.imageFit ?? 'cover') === opt.value 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Espacement du bloc
            </label>
            <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
              {([
                { value: 'normal', label: 'Normal' },
                { value: 'large', label: 'Large' }
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => patch({ blockPadding: opt.value })}
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                    (props.blockPadding ?? 'normal') === opt.value 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ImageControl({ props, patch }: any) {
  const imageUrl = props.promoImageUrl || props.imageSrc;

  return (
    <div className="space-y-3">
      <MediaUploadZone
        value={imageUrl ?? ''}
        onChange={(v) => patch({ promoImageUrl: v || null, imageSrc: v || null })}
        label="Visuel de l'offre"
      />
      {imageUrl && (
        <div className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="w-16 h-10 rounded overflow-hidden border border-zinc-700 bg-zinc-900 flex-shrink-0 flex items-center justify-center">
            <img src={imageUrl} alt="Miniature offre" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/70 rounded-full w-fit">
              <Check className="w-3 h-3 text-emerald-400" /> Image sauvegardée
            </span>
            <span className="text-[10px] text-zinc-400 truncate block font-mono">
              {imageUrl}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentControl({ props, patch }: any) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
          Titre principal (H1)
        </label>
        <textarea 
          value={props.headline ?? ''} 
          onChange={(e) => patch({ headline: e.target.value })} 
          placeholder="Réservez votre essai routier..." 
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 focus:border-zinc-500 transition-colors outline-none font-mono resize-y"
          rows={2}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
          Description
        </label>
        <textarea 
          value={props.description ?? ''} 
          onChange={(e) => patch({ description: e.target.value })} 
          placeholder="Description de l'offre..." 
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 focus:border-zinc-500 transition-colors outline-none font-mono resize-y"
          rows={3}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
          Badge supérieur
        </label>
        <input 
          type="text" 
          value={props.badgeText ?? ''} 
          onChange={(e) => patch({ badgeText: e.target.value })} 
          placeholder="TEST DRIVE" 
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 focus:border-zinc-500 transition-colors outline-none font-mono"
        />
      </div>
    </div>
  );
}

function FormConfig({ props, patch }: any) {
  const [newVilleInput, setNewVilleInput] = useState('');
  const [newModeleInput, setNewModeleInput] = useState('');

  const villes = props.villesList ?? [];
  const modeles = props.modelesList ?? [];

  const addVille = () => {
    if (!newVilleInput.trim()) return;
    patch({ villesList: [...villes, newVilleInput.trim()] });
    setNewVilleInput('');
  };

  const removeVille = (idx: number) => {
    patch({ villesList: villes.filter((_: any, i: number) => i !== idx) });
  };

  const addModele = () => {
    if (!newModeleInput.trim()) return;
    patch({ modelesList: [...modeles, newModeleInput.trim()] });
    setNewModeleInput('');
  };

  const removeModele = (idx: number) => {
    patch({ modelesList: modeles.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
          Titre du formulaire
        </label>
        <input 
          type="text" 
          value={props.formTitle ?? ''} 
          onChange={(e) => patch({ formTitle: e.target.value })} 
          placeholder="RÉSERVER UN ESSAI" 
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 focus:border-zinc-500 transition-colors outline-none font-mono"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
          Sous-titre
        </label>
        <input 
          type="text" 
          value={props.formSubtitle ?? ''} 
          onChange={(e) => patch({ formSubtitle: e.target.value })} 
          placeholder="Complétez vos informations pour planifier votre essai." 
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 focus:border-zinc-500 transition-colors outline-none font-mono"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
          Texte du bouton CTA
        </label>
        <input 
          type="text" 
          value={props.btnSubmitLabel ?? ''} 
          onChange={(e) => patch({ btnSubmitLabel: e.target.value })} 
          placeholder="Confirmer mon essai" 
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 focus:border-zinc-500 transition-colors outline-none font-mono"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Modèles configurés ({modeles.length})
        </label>
        <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg max-h-36 overflow-y-auto">
          {modeles.length === 0 ? (
            <span className="text-zinc-600 text-xs italic">Aucun modèle</span>
          ) : (
            modeles.map((model: string, index: number) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded"
              >
                <span className="truncate max-w-[120px]">{model}</span>
                <button 
                  type="button" 
                  onClick={() => removeModele(index)} 
                  className="text-zinc-400 hover:text-red-400 transition-colors ml-0.5 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-1.5">
          <input 
            type="text" 
            placeholder="Ajouter un modèle..."
            value={newModeleInput}
            onChange={(e) => setNewModeleInput(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addModele(); } }}
          />
          <button 
            type="button" 
            onClick={addModele}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Villes / Succursales configurées ({villes.length})
        </label>
        <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg max-h-36 overflow-y-auto">
          {villes.length === 0 ? (
            <span className="text-zinc-600 text-xs italic">Aucune ville</span>
          ) : (
            villes.map((ville: string, index: number) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded"
              >
                <span className="truncate max-w-[120px]">{ville}</span>
                <button 
                  type="button" 
                  onClick={() => removeVille(index)} 
                  className="text-zinc-400 hover:text-red-400 transition-colors ml-0.5 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-1.5">
          <input 
            type="text" 
            placeholder="Ajouter une ville / succursale..."
            value={newVilleInput}
            onChange={(e) => setNewVilleInput(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVille(); } }}
          />
          <button 
            type="button" 
            onClick={addVille}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

function MultiStepTestDriveInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store(s => s.document.nodes[nodeId]);
  const updateBlockProps = useBuilderV4Store(s => s.updateBlockProps);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  if (!node) return null;

  const props = node.props as any;
  const patch = (partial: any) => updateBlockProps(nodeId, partial);
  const hasOfferVisual = Boolean(props.promoImageUrl || props.imageSrc);

  return (
    <div className="w-full h-full overflow-y-auto divide-y divide-zinc-800 text-xs text-zinc-300">
      <div className="flex border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
         <button 
            type="button" 
            onClick={() => setActiveTab('content')} 
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activeTab === 'content' ? 'text-zinc-100 border-b-2 border-zinc-100 bg-zinc-900/40' : 'text-zinc-500 hover:text-zinc-300'}`}
         >
           CONTENU
         </button>
         <button 
            type="button" 
            onClick={() => setActiveTab('design')} 
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activeTab === 'design' ? 'text-zinc-100 border-b-2 border-zinc-100 bg-zinc-900/40' : 'text-zinc-500 hover:text-zinc-300'}`}
         >
           DESIGN
         </button>
      </div>

      {activeTab === 'content' && (
        <>
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Visuel de l'offre</h4>
            <ImageControl props={props} patch={patch} />
          </div>
          {!hasOfferVisual && (
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Contenu marketing</h4>
              <ContentControl props={props} patch={patch} />
            </div>
          )}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Configuration Formulaire & Options</h4>
            <FormConfig props={props} patch={patch} />
          </div>
        </>
      )}
      
      {activeTab === 'design' && (
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Disposition & design</h4>
          <LayoutControl props={props} patch={patch} />
        </div>
      )}
    </div>
  );
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export function isProBlockInspectable(nodeId: string, nodes: Record<string, import('../../types/nodes.types').BuilderNode>): boolean {
  const node = nodes[nodeId];
  if (!node || node.kind !== 'section') return false;
  const bt = getProBlockType(node);
  return [
    'brand-navbar',
    'hero-showroom',
    'hero-mosaic',
    'hero-cinematic',
    'hero-immersive-form',
    'specs-grid',
    'model-showcase-gallery',
    'conversion-form-split',
    'carousel',
    'specs-showroom',
    'contact-section',
    'models-grid',
    'campaign-gamme-thermique',
    'footer-block',
    'alternating-showcase',
    'tactical-flash-campaign',
    'multi-step-test-drive',
  ].includes(bt ?? '');
}

export function getProBlockLabel(nodeId: string, nodes: Record<string, import('../../types/nodes.types').BuilderNode>): string {
  const node = nodes[nodeId];
  if (!node) return 'Section';
  const bt = getProBlockType(node);
  const labels: Record<string, string> = {
    'brand-navbar': 'Brand Navbar',
    'hero-showroom': 'Hero Showroom (Image + Infos, Formulaire)',
    'hero-mosaic': 'Hero Mosaic Grid & Form',
    'hero-cinematic': 'Hero Cinematic Overlay',
    'specs-grid': 'Specs Grid',
    'model-showcase-gallery': 'Model Showcase Gallery',
    'conversion-form-split': 'Conversion Form Split',
    'carousel': 'Carousel',
    'specs-showroom': 'Model Identity Showroom',
    'contact-section': 'Nous Contacter',
    'models-grid': 'Grille de Modeles',
    'campaign-gamme-thermique': 'Campagne Gamme Thermique',
    'hero-immersive-form': 'Hero Immersive Form',
    'footer-block': 'Footer',
    'alternating-showcase': 'Alternating Showcase',
    'tactical-flash-campaign': 'Campagne Flash Promo',
    'multi-step-test-drive': 'Multi-Step Test Drive',
  };
  return (bt && labels[bt]) ?? (node.props as { label?: string }).label ?? 'Section';
}

export function ProBlockInspector({ nodeId }: { nodeId: string }) {
  const nodes = useBuilderV4Store(s => s.document.nodes);
  const node = nodes[nodeId];
  if (!node) return null;

  const bt = getProBlockType(node);

  const content = (() => {
    switch (bt) {
      case 'brand-navbar':                  return <BrandNavbarInspector nodeId={nodeId} />;
      case 'hero-showroom':                 return <HeroShowroomInspector nodeId={nodeId} />;
      case 'hero-mosaic':                   return <HeroMosaicInspector nodeId={nodeId} />;
      case 'hero-cinematic':                return <HeroCinematicInspector nodeId={nodeId} />;
      case 'hero-immersive-form':           return <HeroImmersiveFormInspector nodeId={nodeId} />;
      case 'specs-grid':                    return <SpecsGridInspector nodeId={nodeId} />;
      case 'model-showcase-gallery':        return <ModelShowcaseGalleryInspector nodeId={nodeId} />;
      case 'conversion-form-split':         return <ConversionFormSplitInspector nodeId={nodeId} />;
      case 'carousel':                      return <CarouselInspector nodeId={nodeId} />;
      case 'specs-showroom':                return <SpecsShowroomInspector nodeId={nodeId} />;
      case 'contact-section':               return <ContactSectionInspector nodeId={nodeId} />;
      case 'models-grid':                   return <ModelsGridInspector nodeId={nodeId} />;
      case 'campaign-gamme-thermique':      return <CampaignGammeThermiqueInspector nodeId={nodeId} />;
      case 'footer-block':                  return <FooterInspector nodeId={nodeId} />;
      case 'alternating-showcase':          return <AlternatingShowcaseInspector nodeId={nodeId} />;
      case 'tactical-flash-campaign':       return <TacticalFlashCampaignInspector nodeId={nodeId} />;
      case 'multi-step-test-drive':         return <MultiStepTestDriveInspector nodeId={nodeId} />;
      default:                              return null;
    }
  })();

  if (!content) return null;

  return (
    <div className="bg-[#121212] min-h-full w-full">
      {content}
    </div>
  );
}
