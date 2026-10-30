import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { FormInspectorPanel } from './FormInspectorPanel';
import type { ButtonNodeProps, InputNodeProps, ImageNodeProps } from '../../types/nodes.types';
import { InspectorField, InspectorHint, InspectorSection } from './InspectorPrimitives';
import {
  BorderSection,
  FillSection,
  FloatingFormWidthSection,
  HeroContentSnapSection,
  HeroImageEffectsSection,
  HeroImageOverlaySection,
  HeroRootGeometrySection,
  ImageCropSection,
  ImageMediaSection,
  LayoutSection,
  ResponsiveSection,
  ShadowSection,
  SizeSection,
  StackSection,
  TypographySection,
} from './InspectorSections';
import { useBuilderV4Store } from '../../store/document.store';
import { isHeroContentGroupNode } from '../../lib/geometry/hero-safe-area';
import { useInspectorNode } from './use-inspector-node';
import { useAssetsStore } from '../../store/assets.store';
import { campaignBlockStatus } from '../../lib/campaign-block-restore';
import { isUserHeroMediaAssigned } from '../../media/hero-media-state';

export function FrameInspector({ nodeId }: { nodeId: string }) {
  const clearCanvas = useBuilderV4Store((s) => s.clearCanvas);
  const addHeroOverlayText = useBuilderV4Store((s) => s.addHeroOverlayText);
  const restoreCampaignHeroImage = useBuilderV4Store((s) => s.restoreCampaignHeroImage);
  const restoreCampaignForm = useBuilderV4Store((s) => s.restoreCampaignForm);
  const restoreFullCampaignTemplate = useBuilderV4Store((s) => s.restoreFullCampaignTemplate);
  const document = useBuilderV4Store((s) => s.document);
  const { hasHeroImage, hasForm } = campaignBlockStatus(document);

  return (
    <div className="v4-inspector-v2" data-inspector="frame">
      <HeroRootGeometrySection nodeId={nodeId} />
      {!hasHeroImage || !hasForm ? (
        <InspectorSection title="Blocs manquants" value="missing-blocks">
          {!hasHeroImage ? (
            <InspectorField label="Image">
              <button
                type="button"
                className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
                onClick={() => restoreCampaignHeroImage()}
                data-testid="inspector-restore-hero-image"
              >
                Restaurer l&apos;image hero
              </button>
            </InspectorField>
          ) : null}
          {!hasForm ? (
            <InspectorField label="Formulaire">
              <button
                type="button"
                className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
                onClick={() => restoreCampaignForm()}
                data-testid="inspector-restore-form"
              >
                Restaurer le formulaire
              </button>
            </InspectorField>
          ) : null}
          <InspectorField label="Template">
            <button
              type="button"
              className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
              onClick={() => restoreFullCampaignTemplate()}
              data-testid="inspector-restore-full-template"
            >
              Restaurer Hero + Form complet
            </button>
          </InspectorField>
        </InspectorSection>
      ) : null}
      {hasHeroImage ? (
        <InspectorSection title="Contenu hero" value="hero-content-add">
          <InspectorField label="Texte">
            <button
              type="button"
              className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
              onClick={() => addHeroOverlayText()}
              data-testid="inspector-add-hero-text"
            >
              Ajouter un texte
            </button>
          </InspectorField>
        </InspectorSection>
      ) : null}
      <InspectorSection title="Page" value="page-actions">
        <InspectorField label="Canvas">
          <button
            type="button"
            className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
            onClick={() => clearCanvas()}
            data-testid="inspector-clear-canvas"
          >
            Vider la page
          </button>
        </InspectorField>
      </InspectorSection>
    </div>
  );
}

export function StackInspector({ nodeId }: { nodeId: string }) {
  const { node } = useInspectorNode(nodeId);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const isHeroContentGroup = node ? isHeroContentGroupNode(node, nodes) : false;
  if (isHeroContentGroup) {
    return (
      <div className="v4-inspector-v2" data-inspector="stack">
        <HeroContentSnapSection nodeId={nodeId} />

      </div>
    );
  }

  return (
    <div className="v4-inspector-v2" data-inspector="stack">
      <StackSection nodeId={nodeId} />

    </div>
  );
}

export function TextInspector({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps, updateNodeStyle, updateNodeLayout } = useInspectorNode(nodeId);
  const [activeTab, setActiveTab] = useState('typography');
  if (!node || node.kind !== 'text') return null;
  const props = node.props as import('../../types/nodes.types').TextNodeProps;

  const TAG_OPTIONS = [
    { value: 'h1', label: 'H1' },
    { value: 'h2', label: 'H2' },
    { value: 'h3', label: 'H3' },
    { value: 'h4', label: 'H4' },
    { value: 'p',  label: '¶' },
    { value: 'span', label: 'Sp' },
  ] as const;

  return (
    <div className="v4-inspector-v2" data-inspector="text">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="v4-business-inspector__tabs" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }}>
          <TabsTrigger value="typography" className="v4-business-inspector__tab">TYPOGRAPHY</TabsTrigger>
          <TabsTrigger value="spacing" className="v4-business-inspector__tab">SPACING</TabsTrigger>
          <TabsTrigger value="color" className="v4-business-inspector__tab">COLOR</TabsTrigger>
          <TabsTrigger value="responsive" className="v4-business-inspector__tab">RESPONSIVE</TabsTrigger>
        </TabsList>

        <TabsContent value="typography">
          <InspectorSection title="Balise" value="tag">
            <InspectorField label="Tag HTML">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                {TAG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateNodeProps({ tag: opt.value })}
                    style={{
                      height: 28,
                      border: '1px solid',
                      borderColor: props.tag === opt.value ? 'rgba(109,40,217,0.6)' : 'rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      background: props.tag === opt.value ? 'rgba(109,40,217,0.18)' : 'transparent',
                      color: props.tag === opt.value ? '#a78bfa' : '#71717a',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </InspectorField>
          </InspectorSection>
          <TypographySection nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="spacing">
          <InspectorSection title="Dimensions & Spacing" value="text-spacing">
            <InspectorField label="Max-width">
              <input
                type="number"
                className="v4-inspector-v2__text"
                placeholder="auto"
                value={node.layout?.maxWidth ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  updateNodeLayout({ maxWidth: v ? Number(v) : undefined });
                }}
                style={{ height: 28 }}
              />
            </InspectorField>
            <InspectorField label="Marge haut">
              <input
                type="number"
                className="v4-inspector-v2__text"
                placeholder="0"
                value={node.layout?.marginTop ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  updateNodeLayout({ marginTop: v ? Number(v) : undefined });
                }}
                style={{ height: 28 }}
              />
            </InspectorField>
            <InspectorField label="Marge bas">
              <input
                type="number"
                className="v4-inspector-v2__text"
                placeholder="0"
                value={node.layout?.marginBottom ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  updateNodeLayout({ marginBottom: v ? Number(v) : undefined });
                }}
                style={{ height: 28 }}
              />
            </InspectorField>
            <InspectorField label="Marge gauche">
              <input
                type="number"
                className="v4-inspector-v2__text"
                placeholder="0"
                value={node.layout?.marginLeft ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  updateNodeLayout({ marginLeft: v ? Number(v) : undefined });
                }}
                style={{ height: 28 }}
              />
            </InspectorField>
            <InspectorField label="Padding">
              <input
                type="number"
                className="v4-inspector-v2__text"
                placeholder="0"
                value={node.layout?.padding ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  updateNodeLayout({ padding: v ? Number(v) : undefined });
                }}
                style={{ height: 28 }}
              />
            </InspectorField>
          </InspectorSection>
        </TabsContent>

        <TabsContent value="color">
          <InspectorSection title="Couleur & Opacité" value="text-color">
            <InspectorField label="Texte">
              <div className="v4-color-row" style={{ display: 'flex', gap: 6 }}>
                <input
                  type="color"
                  className="v4-color-swatch"
                  value={node.style.color ?? '#18181b'}
                  onChange={(e) => updateNodeStyle({ color: e.target.value })}
                />
                <input
                  className="v4-inspector-v2__text"
                  value={node.style.color ?? ''}
                  onChange={(e) => updateNodeStyle({ color: e.target.value })}
                  placeholder="#18181b"
                />
              </div>
            </InspectorField>
            <InspectorField label="Fond">
              <div className="v4-color-row" style={{ display: 'flex', gap: 6 }}>
                <input
                  type="color"
                  className="v4-color-swatch"
                  value={node.style.background ?? '#transparent'}
                  onChange={(e) => updateNodeStyle({ background: e.target.value })}
                />
                <input
                  className="v4-inspector-v2__text"
                  value={node.style.background ?? ''}
                  onChange={(e) => updateNodeStyle({ background: e.target.value })}
                  placeholder="transparent"
                />
              </div>
            </InspectorField>
            <InspectorField label="Opacité">
              <input
                type="range"
                min={0}
                max={100}
                value={node.style.opacity ?? 100}
                onChange={(e) => updateNodeStyle({ opacity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#6d28d9' }}
              />
              <span className="v4-inspector-v2__hint" style={{ margin: '4px 0 0' }}>{node.style.opacity ?? 100}%</span>
            </InspectorField>
          </InspectorSection>
        </TabsContent>

        <TabsContent value="responsive">
          <ResponsiveSection nodeId={nodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ImageInspector({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps, updateNodeStyle } = useInspectorNode(nodeId);
  const [activeTab, setActiveTab] = useState('content');
  const getAsset = useAssetsStore((s) => s.getAsset);
  const addHeroOverlayText = useBuilderV4Store((s) => s.addHeroOverlayText);
  if (!node || node.kind !== 'image') return null;

  const isHeroImage = node.name === 'HeroImage';
  const assigned = isUserHeroMediaAssigned(node.props as ImageNodeProps, getAsset);
  const props = node.props as { src?: string; alt?: string; customClass?: string };

  return (
    <div className="v4-inspector-v2" data-inspector="image">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="v4-business-inspector__tabs" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }}>
          <TabsTrigger value="content" className="v4-business-inspector__tab">CONTENT</TabsTrigger>
          <TabsTrigger value="style" className="v4-business-inspector__tab">STYLE</TabsTrigger>
          <TabsTrigger value="layout" className="v4-business-inspector__tab">LAYOUT</TabsTrigger>
          <TabsTrigger value="advanced" className="v4-business-inspector__tab">ADVANCED</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          {isHeroImage ? (
            <ImageMediaSection nodeId={nodeId} />
          ) : (
            <InspectorSection title="Source Image" value="image-url">
              <InspectorField label="URL">
                <div className="v4-url-import">
                  <input
                    type="url"
                    className="v4-inspector-v2__text v4-url-import__input"
                    placeholder="https://..."
                    defaultValue={props.src ?? ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const url = (e.target as HTMLInputElement).value.trim();
                        if (url) updateNodeProps({ src: url });
                      }
                    }}
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url && url !== (props.src ?? '')) updateNodeProps({ src: url });
                    }}
                  />
                </div>
              </InspectorField>
              <InspectorField label="Alt">
                <input
                  className="v4-inspector-v2__text"
                  value={props.alt ?? ''}
                  onChange={(e) => updateNodeProps({ alt: e.target.value })}
                />
              </InspectorField>
            </InspectorSection>
          )}
          
          {assigned || !isHeroImage ? (
            <ImageCropSection nodeId={nodeId} />
          ) : null}
        </TabsContent>

        <TabsContent value="style">
          {isHeroImage && assigned ? (
            <>
              <HeroImageOverlaySection nodeId={nodeId} />
              <HeroImageEffectsSection nodeId={nodeId} />
            </>
          ) : null}
          <BorderSection nodeId={nodeId} />
          <ShadowSection nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="layout">
          <SizeSection nodeId={nodeId} />
          <LayoutSection nodeId={nodeId} />
          <InspectorSection title="Ajustement & Remplissage" value="image-fit">
            <InspectorField label="Object Fit">
              <select
                className="v4-inspector-v2__text"
                value={node.style?.objectFit ?? 'cover'}
                onChange={(e) => updateNodeStyle({ objectFit: e.target.value as any })}
                style={{ height: 28 }}
              >
                <option value="cover">Remplir (Cover)</option>
                <option value="contain">Contenir (Contain)</option>
                <option value="fill">Étirer (Fill)</option>
              </select>
            </InspectorField>
          </InspectorSection>
        </TabsContent>

        <TabsContent value="advanced">
          <InspectorSection title="Avancé" value="image-advanced">
            <InspectorField label="Classe CSS">
              <input
                className="v4-inspector-v2__text"
                placeholder="custom-image-class"
                value={props.customClass ?? ''}
                onChange={(e) => updateNodeProps({ customClass: e.target.value })}
                style={{ height: 28 }}
              />
            </InspectorField>
          </InspectorSection>
          
          {isHeroImage ? (
            <InspectorSection title="Texte overlay" value="hero-text-add">
              <InspectorHint>Glissez « Texte » depuis Blocks, ou ajoutez ici.</InspectorHint>
              <InspectorField label="Calque">
                <button
                  type="button"
                  className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
                  onClick={() => addHeroOverlayText({ heroImageId: nodeId })}
                  data-testid="inspector-hero-image-add-text"
                >
                  Ajouter un texte
                </button>
              </InspectorField>
            </InspectorSection>
          ) : null}
          
          <ResponsiveSection nodeId={nodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function CardInspector({ nodeId }: { nodeId: string }) {
  const { node } = useInspectorNode(nodeId);
  const isFloatingForm = node?.name === 'FloatingFormCard';

  if (isFloatingForm) {
    return (
      <div className="v4-inspector-v2" data-inspector="card">
        <FloatingFormWidthSection nodeId={nodeId} />

      </div>
    );
  }

  return (
    <div className="v4-inspector-v2" data-inspector="card">
      <StackSection nodeId={nodeId} />
      <SizeSection nodeId={nodeId} />
      <FillSection nodeId={nodeId} />
      <BorderSection nodeId={nodeId} />

    </div>
  );
}

export function SectionInspector({ nodeId }: { nodeId: string }) {
  return (
    <div className="v4-inspector-v2" data-inspector="section">
      <StackSection nodeId={nodeId} />
      <LayoutSection nodeId={nodeId} />

    </div>
  );
}

const BTN_SIZES = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
] as const;

const BTN_ANIMATIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'shimmer', label: 'Shimmer' },
] as const;

const BTN_ICONS = ['', 'ArrowRight', 'ChevronRight', 'Phone', 'Mail', 'Car', 'Calendar', 'Star', 'CheckCircle', 'Zap', 'Gift', 'Play'];

export function ButtonInspector({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps, updateNodeStyle } = useInspectorNode(nodeId);
  const [activeTab, setActiveTab] = useState('text');
  if (!node || node.kind !== 'button') return null;
  const props = node.props as ButtonNodeProps;
  const style = node.style;

  function colorRow(value: string, onChange: (v: string) => void, placeholder: string) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="color" className="v4-color-swatch" value={value || placeholder} onChange={(e) => onChange(e.target.value)} />
        <input className="v4-inspector-v2__text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
    );
  }

  return (
    <div className="v4-inspector-v2" data-inspector="button">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="v4-business-inspector__tabs" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }}>
          <TabsTrigger value="text" className="v4-business-inspector__tab">TEXT</TabsTrigger>
          <TabsTrigger value="size" className="v4-business-inspector__tab">SIZE</TabsTrigger>
          <TabsTrigger value="color" className="v4-business-inspector__tab">COLOR</TabsTrigger>
          <TabsTrigger value="animation" className="v4-business-inspector__tab">ANIM.</TabsTrigger>
        </TabsList>

        {/* ── TEXT ─────────────────────────────────────────────── */}
        <TabsContent value="text">
          <InspectorSection title="Contenu" value="button-content">
            <InspectorField label="Texte">
              <input className="v4-inspector-v2__text" value={props.label} onChange={(e) => updateNodeProps({ label: e.target.value })} placeholder="Label du bouton" style={{ height: 28 }} />
            </InspectorField>
            <InspectorField label="Lien">
              <input className="v4-inspector-v2__text" value={props.href ?? ''} onChange={(e) => updateNodeProps({ href: e.target.value })} placeholder="https://..." type="url" style={{ height: 28 }} />
            </InspectorField>
            <InspectorField label="Variante">
              <select className="v4-inspector-v2__text" value={props.variant ?? 'primary'} onChange={(e) => updateNodeProps({ variant: e.target.value })} style={{ height: 28 }}>
                <option value="primary">Primaire</option>
                <option value="secondary">Secondaire</option>
                <option value="outline">Contour</option>
                <option value="text">Texte seul</option>
              </select>
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Icônes" value="button-icons">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InspectorField label="Icône gauche">
                <select className="v4-inspector-v2__text" value={props.iconLeft ?? ''} onChange={(e) => updateNodeProps({ iconLeft: e.target.value || undefined })} style={{ height: 28 }}>
                  {BTN_ICONS.map((ic) => <option key={ic} value={ic}>{ic || '— Aucune'}</option>)}
                </select>
              </InspectorField>
              <InspectorField label="Icône droite">
                <select className="v4-inspector-v2__text" value={props.iconRight ?? ''} onChange={(e) => updateNodeProps({ iconRight: e.target.value || undefined })} style={{ height: 28 }}>
                  {BTN_ICONS.map((ic) => <option key={ic} value={ic}>{ic || '— Aucune'}</option>)}
                </select>
              </InspectorField>
            </div>
          </InspectorSection>
        </TabsContent>

        {/* ── SIZE ─────────────────────────────────────────────── */}
        <TabsContent value="size">
          <InspectorSection title="Taille" value="button-size">
            <InspectorField label="Taille prédéfinie">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {BTN_SIZES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateNodeProps({ size: value })}
                    style={{
                      height: 32, border: '1px solid',
                      borderColor: (props.size ?? 'md') === value ? 'rgba(232,93,4,0.6)' : 'rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      background: (props.size ?? 'md') === value ? 'rgba(232,93,4,0.18)' : 'transparent',
                      color: (props.size ?? 'md') === value ? '#fdba74' : '#71717a',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >{label}</button>
                ))}
              </div>
            </InspectorField>
            <InspectorField label={`Radius · ${props.borderRadius ?? style.borderRadius ?? 8}px`}>
              <input type="range" min={0} max={40} step={1}
                value={props.borderRadius ?? style.borderRadius ?? 8}
                onChange={(e) => { const v = Number(e.target.value); updateNodeProps({ borderRadius: v }); updateNodeStyle({ borderRadius: v }); }}
                style={{ width: '100%', accentColor: '#e85d04' }}
              />
            </InspectorField>
          </InspectorSection>
          <SizeSection nodeId={nodeId} />
          <LayoutSection nodeId={nodeId} />
        </TabsContent>

        {/* ── COLOR ────────────────────────────────────────────── */}
        <TabsContent value="color">
          <InspectorSection title="Normal" value="button-colors-normal">
            <InspectorField label="Fond">{colorRow(style.background ?? '', (v) => updateNodeStyle({ background: v }), '#e85d04')}</InspectorField>
            <InspectorField label="Texte">{colorRow(style.color ?? '', (v) => updateNodeStyle({ color: v }), '#ffffff')}</InspectorField>
          </InspectorSection>
          <InspectorSection title="Hover" value="button-colors-hover">
            <InspectorField label="Fond hover">{colorRow(props.hoverBackground ?? '', (v) => updateNodeProps({ hoverBackground: v }), '#c4410c')}</InspectorField>
            <InspectorField label="Texte hover">{colorRow(props.hoverColor ?? '', (v) => updateNodeProps({ hoverColor: v }), '#ffffff')}</InspectorField>
          </InspectorSection>
          <InspectorSection title="Style" value="button-shadow">
            <InspectorField label="Ombre">
              <select className="v4-inspector-v2__text" value={style.shadow ? 'yes' : 'no'} onChange={(e) => updateNodeStyle({ shadow: e.target.value === 'yes' })} style={{ height: 28 }}>
                <option value="no">Aucune</option>
                <option value="yes">Standard</option>
              </select>
            </InspectorField>
          </InspectorSection>
        </TabsContent>

        {/* ── ANIMATION ────────────────────────────────────────── */}
        <TabsContent value="animation">
          <InspectorSection title="Animation" value="button-animation">
            <InspectorField label="Type">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {BTN_ANIMATIONS.map(({ value, label }) => (
                  <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name={`btn-anim-${nodeId}`}
                      checked={(props.animation ?? 'none') === value}
                      onChange={() => updateNodeProps({ animation: value })}
                      style={{ accentColor: '#e85d04' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Avancé" value="button-advanced">
            <InspectorField label="Classe CSS">
              <input className="v4-inspector-v2__text" placeholder="custom-btn" value={props.customClass ?? ''} onChange={(e) => updateNodeProps({ customClass: e.target.value })} style={{ height: 28 }} />
            </InspectorField>
          </InspectorSection>
          <ResponsiveSection nodeId={nodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function FormInspector({ nodeId }: { nodeId: string }) {
  return (
    <div className="v4-inspector-v2" data-inspector="form" style={{ padding: '0 4px' }}>
      <FormInspectorPanel nodeId={nodeId} />
    </div>
  );
}

export function InputInspector({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps } = useInspectorNode(nodeId);
  if (!node || node.kind !== 'input') return null;
  const props = node.props as InputNodeProps;

  return (
    <div className="v4-inspector-v2" data-inspector="input">
      <InspectorSection title="Input" value="input">
        <InspectorField label="Label">
          <input
            className="v4-inspector-v2__text"
            value={props.label}
            onChange={(event) => updateNodeProps({ label: event.target.value })}
          />
        </InspectorField>
        <InspectorField label="Placeholder">
          <input
            className="v4-inspector-v2__text"
            value={props.placeholder ?? ''}
            onChange={(event) => updateNodeProps({ placeholder: event.target.value })}
          />
        </InspectorField>
        <InspectorField label="Required">
          <input
            type="checkbox"
            checked={Boolean(props.required)}
            onChange={(event) => updateNodeProps({ required: event.target.checked })}
          />
        </InspectorField>
      </InspectorSection>
      <TypographySection nodeId={nodeId} showAlign={false} />

    </div>
  );
}
