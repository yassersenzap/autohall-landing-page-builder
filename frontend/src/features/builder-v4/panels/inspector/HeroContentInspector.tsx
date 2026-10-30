import { useState } from 'react';
import { GripVertical, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/shadcn/input';
import { useBuilderV4Store } from '../../store/document.store';
import { findImageLayer } from '../../lib/hero-layers';
import { InspectorField, InspectorSection } from './InspectorPrimitives';
import { ContentLayoutSection } from './ContentLayoutSection';
import type { HeroBenefit, HeroTrustBadge, FrameNodeProps } from '../../types/nodes.types';

const BENEFIT_ICONS = ['Shield', 'Percent', 'Truck', 'Star', 'Clock', 'Award', 'CheckCircle', 'Zap', 'Heart', 'Gift', 'Lock', 'Wrench'];

function genId() {
  return `b_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Section Logo ─────────────────────────────────────────── */
function LogoSection({ frameId: _frameId }: { frameId: string }) {
  const node = useBuilderV4Store((s) => s.document.nodes[s.document.rootId]);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  if (!node) return null;
  const props = node.props as FrameNodeProps;
  const visible = props.heroShowLogo ?? false;

  return (
    <InspectorSection title="LOGO" value="hero-logo">
      <div className="v4-marketing__row-header">
        <span className="v4-marketing__label">Logo de la marque</span>
        <button
          type="button"
          className="v4-form-inspector__icon-btn"
          onClick={() => updateNodeProps(rootId, { heroShowLogo: !visible })}
          aria-label={visible ? 'Masquer' : 'Afficher'}
        >
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      {visible ? (
        <InspectorField label="URL du logo">
          <Input
            className="v4-inspector-v2__text"
            placeholder="https://..."
            value={props.heroLogoSrc ?? ''}
            onChange={(e) => updateNodeProps(rootId, { heroLogoSrc: e.target.value })}
          />
        </InspectorField>
      ) : null}
    </InspectorSection>
  );
}

/* ── Section Textes ───────────────────────────────────────── */
function TextBlocksSection({ frameId: _frameId }: { frameId: string }) {
  const node = useBuilderV4Store((s) => s.document.nodes[s.document.rootId]);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const addHeroOverlayText = useBuilderV4Store((s) => s.addHeroOverlayText);

  if (!node) return null;
  const props = node.props as FrameNodeProps;

  return (
    <InspectorSection title="TEXTES MARKETING" value="hero-texts">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Eyebrow */}
        <div className="v4-marketing__block-row">
          <div className="v4-marketing__block-label">
            <button
              type="button"
              className="v4-form-inspector__icon-btn"
              onClick={() => updateNodeProps(rootId, { heroShowEyebrow: !(props.heroShowEyebrow ?? true) })}
            >
              {props.heroShowEyebrow !== false ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            <span>Eyebrow</span>
          </div>
          {props.heroShowEyebrow !== false ? (
            <Input
              className="v4-inspector-v2__text"
              placeholder="Découvrez nos offres"
              value={props.heroEyebrow ?? ''}
              onChange={(e) => updateNodeProps(rootId, { heroEyebrow: e.target.value })}
            />
          ) : null}
        </div>

        {/* Prix */}
        <div className="v4-marketing__block-row">
          <div className="v4-marketing__block-label">
            <button
              type="button"
              className="v4-form-inspector__icon-btn"
              onClick={() => updateNodeProps(rootId, { heroShowPrice: !(props.heroShowPrice ?? false) })}
            >
              {props.heroShowPrice ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            <span>Prix</span>
          </div>
          {props.heroShowPrice ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <Input
                className="v4-inspector-v2__text"
                placeholder="À partir de"
                value={props.heroPriceLabel ?? ''}
                onChange={(e) => updateNodeProps(rootId, { heroPriceLabel: e.target.value })}
              />
              <Input
                className="v4-inspector-v2__text"
                placeholder="249 000 Dhs"
                value={props.heroPrice ?? ''}
                onChange={(e) => updateNodeProps(rootId, { heroPrice: e.target.value })}
              />
            </div>
          ) : null}
        </div>

        {/* Overlays badge / titre / sous-titre */}
        <div className="v4-form-inspector__quick-add" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button type="button" className="v4-form-inspector__quick-btn" onClick={() => addHeroOverlayText({ top: 48, tag: 'span' as const, text: 'Nouveau' })}>Badge</button>
          <button type="button" className="v4-form-inspector__quick-btn" onClick={() => addHeroOverlayText({ top: 80, tag: 'h2' as const, text: 'Titre promo' })}>Titre</button>
          <button type="button" className="v4-form-inspector__quick-btn" onClick={() => addHeroOverlayText({ top: 124, tag: 'p' as const, text: 'Sous-titre' })}>Sous-titre</button>
        </div>
      </div>
    </InspectorSection>
  );
}

/* ── Section Avantages ────────────────────────────────────── */
function BenefitsSection() {
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const node = useBuilderV4Store((s) => s.document.nodes[s.document.rootId]);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!node) return null;
  const props = node.props as FrameNodeProps;
  const benefits: HeroBenefit[] = props.heroBenefits ?? [];
  const visible = props.heroShowBenefits ?? true;

  function patch(next: HeroBenefit[]) {
    updateNodeProps(rootId, { heroBenefits: next });
  }

  function addBenefit() {
    const nb: HeroBenefit = { id: genId(), icon: 'CheckCircle', title: 'Avantage', description: '', color: '#22c55e', enabled: true };
    patch([...benefits, nb]);
    setExpanded(nb.id);
  }

  function updateBenefit(id: string, diff: Partial<HeroBenefit>) {
    patch(benefits.map((b) => (b.id === id ? { ...b, ...diff } : b)));
  }

  function removeBenefit(id: string) {
    patch(benefits.filter((b) => b.id !== id));
    if (expanded === id) setExpanded(null);
  }

  function reorder(fromIdx: number, toIdx: number) {
    const next = [...benefits];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    patch(next);
  }

  return (
    <InspectorSection title="AVANTAGES" value="hero-benefits">
      <div className="v4-marketing__row-header" style={{ marginBottom: 8 }}>
        <span className="v4-marketing__label">{benefits.length} avantage{benefits.length !== 1 ? 's' : ''}</span>
        <button
          type="button"
          className="v4-form-inspector__icon-btn"
          onClick={() => updateNodeProps(rootId, { heroShowBenefits: !visible })}
        >
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {benefits.map((b, idx) => (
          <div
            key={b.id}
            className={['v4-benefit-row', dragOver === idx ? 'v4-benefit-row--drag-over' : ''].filter(Boolean).join(' ')}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(idx); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => { e.preventDefault(); setDragOver(null); const from = Number(e.dataTransfer.getData('text/plain')); reorder(from, idx); }}
          >
            <div className="v4-benefit-row__head">
              <span className="v4-benefit-row__grip" aria-hidden><GripVertical size={12} /></span>

              {/* Pastille couleur */}
              <input
                type="color"
                className="v4-benefit-row__color"
                value={b.color ?? '#22c55e'}
                onChange={(e) => updateBenefit(b.id, { color: e.target.value })}
                title="Couleur"
              />

              {/* Icône selector */}
              <select
                className="v4-benefit-row__icon-sel"
                value={b.icon ?? ''}
                onChange={(e) => updateBenefit(b.id, { icon: e.target.value })}
                title="Icône"
              >
                {BENEFIT_ICONS.map((ic) => <option key={ic} value={ic}>{ic || '—'}</option>)}
              </select>

              {/* Titre inline */}
              <input
                className="v4-benefit-row__title"
                value={b.title}
                placeholder="Avantage"
                onChange={(e) => updateBenefit(b.id, { title: e.target.value })}
              />

              {/* Toggle visibilité */}
              <button type="button" className="v4-form-inspector__icon-btn" onClick={() => updateBenefit(b.id, { enabled: !(b.enabled ?? true) })}>
                {b.enabled !== false ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>

              {/* Expand / collapse */}
              <button type="button" className="v4-form-inspector__icon-btn" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                {expanded === b.id ? '▲' : '▼'}
              </button>

              {/* Supprimer */}
              <button type="button" className="v4-form-inspector__icon-btn v4-form-inspector__icon-btn--danger" onClick={() => removeBenefit(b.id)}>
                <Trash2 size={13} />
              </button>
            </div>

            {expanded === b.id ? (
              <div className="v4-benefit-row__body">
                <InspectorField label="Description">
                  <textarea
                    className="v4-form-inspector__textarea"
                    rows={2}
                    value={b.description ?? ''}
                    placeholder="Détail de l'avantage"
                    onChange={(e) => updateBenefit(b.id, { description: e.target.value })}
                  />
                </InspectorField>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <button type="button" className="v4-form-inspector__footer-btn" onClick={addBenefit}>
        <Plus size={14} />
        Ajouter un avantage
      </button>
    </InspectorSection>
  );
}

/* ── Section CTA secondaire ───────────────────────────────── */
function SecondaryCtaSection() {
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const node = useBuilderV4Store((s) => s.document.nodes[s.document.rootId]);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  if (!node) return null;
  const props = node.props as FrameNodeProps;
  const visible = props.heroShowSecondaryCta ?? false;

  return (
    <InspectorSection title="CTA SECONDAIRE" value="hero-secondary-cta">
      <div className="v4-marketing__row-header">
        <span className="v4-marketing__label">Bouton secondaire</span>
        <button type="button" className="v4-form-inspector__icon-btn" onClick={() => updateNodeProps(rootId, { heroShowSecondaryCta: !visible })}>
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      {visible ? (
        <>
          <InspectorField label="Texte">
            <Input className="v4-inspector-v2__text" placeholder="En savoir plus" value={props.heroSecondaryCtaLabel ?? ''} onChange={(e) => updateNodeProps(rootId, { heroSecondaryCtaLabel: e.target.value })} />
          </InspectorField>
          <InspectorField label="URL">
            <Input className="v4-inspector-v2__text" placeholder="https://..." value={props.heroSecondaryCtaUrl ?? ''} onChange={(e) => updateNodeProps(rootId, { heroSecondaryCtaUrl: e.target.value })} />
          </InspectorField>
        </>
      ) : null}
    </InspectorSection>
  );
}

/* ── Section Trust Badges ─────────────────────────────────── */
function TrustBadgesSection() {
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const node = useBuilderV4Store((s) => s.document.nodes[s.document.rootId]);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  if (!node) return null;
  const props = node.props as FrameNodeProps;
  const visible = props.heroShowTrustBadges ?? false;
  const badges: HeroTrustBadge[] = props.heroTrustBadges ?? [];

  function patch(next: HeroTrustBadge[]) {
    updateNodeProps(rootId, { heroTrustBadges: next });
  }

  return (
    <InspectorSection title="TRUST BADGES" value="hero-trust">
      <div className="v4-marketing__row-header" style={{ marginBottom: 8 }}>
        <span className="v4-marketing__label">{badges.length} badge{badges.length !== 1 ? 's' : ''}</span>
        <button type="button" className="v4-form-inspector__icon-btn" onClick={() => updateNodeProps(rootId, { heroShowTrustBadges: !visible })}>
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {badges.map((badge, idx) => (
          <div key={badge.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              className="v4-inspector-v2__text"
              style={{ flex: 1 }}
              value={badge.text}
              placeholder="Livraison 48h"
              onChange={(e) => patch(badges.map((b, i) => i === idx ? { ...b, text: e.target.value } : b))}
            />
            <button type="button" className="v4-form-inspector__icon-btn v4-form-inspector__icon-btn--danger" onClick={() => patch(badges.filter((_, i) => i !== idx))}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="v4-form-inspector__footer-btn"
        onClick={() => patch([...badges, { id: genId(), text: 'Badge', enabled: true }])}
      >
        <Plus size={14} />
        Ajouter un badge
      </button>
    </InspectorSection>
  );
}

/* ── Section Textes de contenu (badge/titre/description existants) ──
   Direct edit inputs for HeroBadge/HeroTitle/HeroSubtitle/HeroDescription
   text nodes already present in the document — regardless of how deeply
   they're nested (e.g. inside a custom left-column stack). */
const EDITABLE_TEXT_NODE_LABELS: Record<string, string> = {
  HeroBadge: 'Badge',
  HeroTitle: 'Titre (H1)',
  HeroSubtitle: 'Sous-titre',
  HeroDescription: 'Description',
};

function EditableTextBlocksSection() {
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);

  const textNodes = Object.values(nodes).filter(
    (n) => n.kind === 'text' && EDITABLE_TEXT_NODE_LABELS[n.name],
  );
  if (textNodes.length === 0) return null;

  return (
    <InspectorSection title="TEXTES" value="editable-text-blocks">
      {textNodes.map((node) => {
        const props = node.props as { text?: string };
        const isLong = node.name === 'HeroDescription' || node.name === 'HeroSubtitle';
        return (
          <InspectorField key={node.id} label={EDITABLE_TEXT_NODE_LABELS[node.name]}>
            {isLong ? (
              <textarea
                className="v4-inspector-v2__text"
                rows={3}
                value={props.text ?? ''}
                onChange={(e) => updateNodeProps(node.id, { text: e.target.value })}
              />
            ) : (
              <input
                className="v4-inspector-v2__text"
                value={props.text ?? ''}
                onChange={(e) => updateNodeProps(node.id, { text: e.target.value })}
              />
            )}
          </InspectorField>
        );
      })}
    </InspectorSection>
  );
}

/* ── Composant principal ──────────────────────────────────── */
export function HeroContentInspector({ frameId }: { frameId: string }) {
  const imageLayer = useBuilderV4Store((s) => findImageLayer(s.document.nodes, s.document.rootId));
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);

  return (
    <>
      <EditableTextBlocksSection />
      <LogoSection frameId={frameId} />
      <TextBlocksSection frameId={frameId} />
      <BenefitsSection />
      <SecondaryCtaSection />
      <TrustBadgesSection />

      {/* Affichage contenu marketing sur l'image */}
      <InspectorSection title="AFFICHAGE" value="content-display">
        <div className="flex items-center gap-2" style={{ margin: '4px 0' }}>
          <input
            type="checkbox"
            id="toggle-marketing-content"
            checked={(imageLayer?.props as { showMarketingContent?: boolean })?.showMarketingContent ?? !Boolean((imageLayer?.props as { src?: string })?.src?.trim())}
            onChange={(e) => {
              if (!imageLayer) return;
              updateNodeProps(imageLayer.id, { showMarketingContent: e.target.checked });
            }}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <label htmlFor="toggle-marketing-content" style={{ color: 'var(--zinc-300)', fontSize: '13px', cursor: 'pointer' }}>
            Afficher contenu sur l'image
          </label>
        </div>
        <InspectorField label="Légende image">
          <input
            className="v4-inspector-v2__text"
            value={(imageLayer?.props as { alt?: string })?.alt ?? ''}
            placeholder="Description accessibilité"
            onChange={(e) => {
              if (!imageLayer) return;
              updateNodeProps(imageLayer.id, { alt: e.target.value });
            }}
          />
        </InspectorField>
      </InspectorSection>

      {frameId ? <ContentLayoutSection /> : null}
    </>
  );
}
