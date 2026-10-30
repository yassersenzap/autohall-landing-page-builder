import { Slider } from '@/components/ui/shadcn/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/shadcn/toggle-group';
import { useAssetsStore } from '../../store/assets.store';
import { useBuilderV4Store } from '../../store/document.store';
import type { DeviceMode, FrameNodeProps, ImageNodeProps, StackNodeProps, TextNodeProps } from '../../types/nodes.types';
import type { HeroContentAnchor } from '../../types/geometry.types';
import {
  DEFAULT_FORM_COLUMN_WIDTH,
  DEFAULT_HERO_GEOMETRY,
  DEFAULT_HERO_MIN_HEIGHT,
  FORM_WIDTH,
} from '../../types/geometry.types';
import {
  resolveHeroFormProductState,
  HERO_FORM_STATE_LABELS,
  DEFAULT_HERO_FORM_GEOMETRY,
  HERO_IMAGE_BEHAVIOR_LABELS,
  type HeroImageBehavior,
  resolveImageObjectFit
} from '../../lib/studio-compat.js';
import {
  isHeroContentGroupNode,
  layoutForHeroSafeArea,
} from '../../lib/geometry/hero-safe-area';
import { getHeroSafeInset } from '../../lib/geometry/geometry-roles';
import { isSplitHeroLayout } from '../../lib/geometry/hero-layout-context';
import { FORM_ZONE_INNER_OFFSET } from '../../types/geometry.types';
import { parseLayoutPx } from '../../lib/canvas-geometry';
import { getCanvasNodeCapabilities } from '../../lib/canvas-node-capabilities';
import {
  InspectorColorPicker,
  InspectorField,
  InspectorHint,
  InspectorNumberInput,
  InspectorSection,
  InspectorSegmented,
} from './InspectorPrimitives';
import { readNumber, useInspectorNode } from './use-inspector-node';
import { MediaImage } from '../../media/MediaImage';
import { resolveMediaSrc } from '../../media/resolve-media-src';
import { isUserHeroMediaAssigned } from '../../media/hero-media-state';


export function PositionSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeLayout } = useInspectorNode(nodeId);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  if (!node) return null;

  const { showPositionInspector } = getCanvasNodeCapabilities(node, rootId);
  if (!showPositionInspector) return null;

  return (
    <InspectorSection title="Position" value="position">
      <InspectorField label="X">
        <InspectorNumberInput
          value={readNumber(node.layout.left)}
          onChange={(left) => updateNodeLayout({ position: 'absolute', left })}
        />
      </InspectorField>
      <InspectorField label="Y">
        <InspectorNumberInput
          value={readNumber(node.layout.top)}
          onChange={(top) => updateNodeLayout({ position: 'absolute', top })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function SizeSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeLayout } = useInspectorNode(nodeId);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  if (!node) return null;

  const { showSizeInspector } = getCanvasNodeCapabilities(node, rootId);
  if (!showSizeInspector) return null;

  return (
    <InspectorSection title="Size" value="size">
      <InspectorField label="W">
        <InspectorNumberInput
          value={readNumber(node.layout.width, 100)}
          min={1}
          onChange={(width) => updateNodeLayout({ width })}
        />
      </InspectorField>
      <InspectorField label="H">
        <InspectorNumberInput
          value={readNumber(node.layout.height, 100)}
          min={1}
          onChange={(height) => updateNodeLayout({ height })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function OpacitySection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  if (!node) return null;

  const { showOpacityInspector } = getCanvasNodeCapabilities(node, rootId);
  if (!showOpacityInspector) return null;

  return (
    <InspectorSection title="Opacity" value="opacity">
      <InspectorField label="Opacity">
        <Slider
          value={[node.style.opacity ?? 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([opacity]) => updateNodeStyle({ opacity })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function LayoutSection({
  nodeId,
  showGrid = false,
}: {
  nodeId: string;
  showGrid?: boolean;
}) {
  const { node, updateNodeLayout } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Layout" value="layout">
      {showGrid ? (
        <InspectorField label="Columns">
          <input
            className="v4-inspector-v2__text"
            value={node.layout.columns ?? ''}
            onChange={(event) => updateNodeLayout({ columns: event.target.value })}
          />
        </InspectorField>
      ) : null}
      <InspectorField label="Display">
        <InspectorSegmented
          value={node.layout.display ?? 'flex'}
          options={[
            { value: 'flex', label: 'Flex' },
            { value: 'grid', label: 'Grid' },
            { value: 'block', label: 'Block' },
          ]}
          onChange={(display) => updateNodeLayout({ display })}
        />
      </InspectorField>
      <InspectorField label="Min H">
        <InspectorNumberInput
          value={readNumber(node.layout.minHeight, 0)}
          min={0}
          onChange={(minHeight) => updateNodeLayout({ minHeight })}
        />
      </InspectorField>
      <InspectorField label="Max W">
        <InspectorNumberInput
          value={readNumber(node.layout.maxWidth, 0)}
          min={0}
          onChange={(maxWidth) => updateNodeLayout({ maxWidth })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function StackSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeLayout } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Stack" value="stack">
      <InspectorField label="Direction">
        <InspectorSegmented
          value={node.layout.direction ?? 'column'}
          options={[
            { value: 'row', label: 'Row' },
            { value: 'column', label: 'Col' },
          ]}
          onChange={(direction) => updateNodeLayout({ direction })}
        />
      </InspectorField>
      <InspectorField label="Gap">
        <Slider
          value={[node.layout.gap ?? 0]}
          min={0}
          max={64}
          step={4}
          onValueChange={([gap]) => updateNodeLayout({ gap })}
        />
      </InspectorField>
      <InspectorField label="Align">
        <Select
          value={node.layout.align ?? 'stretch'}
          onValueChange={(align) =>
            updateNodeLayout({ align: align as NonNullable<typeof node.layout.align> })
          }
        >
          <SelectTrigger className="v4-inspector-v2__select-trigger" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </InspectorField>
      <InspectorField label="Justify">
        <Select
          value={node.layout.justify ?? 'start'}
          onValueChange={(justify) =>
            updateNodeLayout({ justify: justify as NonNullable<typeof node.layout.justify> })
          }
        >
          <SelectTrigger className="v4-inspector-v2__select-trigger" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="space-between">Space</SelectItem>
          </SelectContent>
        </Select>
      </InspectorField>
      <InspectorField label="Wrap">
        <InspectorSegmented
          value={node.layout.flexWrap ?? 'nowrap'}
          options={[
            { value: 'nowrap', label: 'No' },
            { value: 'wrap', label: 'Wrap' },
          ]}
          onChange={(flexWrap) => updateNodeLayout({ flexWrap })}
        />
      </InspectorField>
      <InspectorField label="Padding">
        <Slider
          value={[node.layout.padding ?? 0]}
          min={0}
          max={96}
          step={4}
          onValueChange={([padding]) => updateNodeLayout({ padding })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function FillSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Fill" value="fill">
      <InspectorField label="Couleur">
        <InspectorColorPicker
          value={node.style.background ?? '#ffffff'}
          onChange={(background) => updateNodeStyle({ background })}
        />
      </InspectorField>
      <InspectorField label="Gradient">
        <input
          className="v4-inspector-v2__text"
          value={node.style.backgroundGradient ?? ''}
          placeholder="linear-gradient(...)"
          onChange={(event) => updateNodeStyle({ backgroundGradient: event.target.value })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function BorderSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Border" value="border">
      <InspectorField label="Width">
        <InspectorNumberInput
          value={node.style.borderWidth ?? 0}
          min={0}
          onChange={(borderWidth) => updateNodeStyle({ borderWidth })}
        />
      </InspectorField>
      <InspectorField label="Radius">
        <Slider
          value={[node.style.borderRadius ?? 0]}
          min={0}
          max={48}
          step={1}
          onValueChange={([borderRadius]) => updateNodeStyle({ borderRadius })}
        />
      </InspectorField>
      <InspectorField label="Color">
        <InspectorColorPicker
          value={node.style.borderColor ?? '#e4e4e7'}
          onChange={(borderColor) => updateNodeStyle({ borderColor })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function ShadowSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Shadow" value="shadow">
      <InspectorField label="X">
        <InspectorNumberInput
          value={node.style.shadowX ?? 0}
          onChange={(shadowX) => updateNodeStyle({ shadow: true, shadowX })}
        />
      </InspectorField>
      <InspectorField label="Y">
        <InspectorNumberInput
          value={node.style.shadowY ?? 4}
          onChange={(shadowY) => updateNodeStyle({ shadow: true, shadowY })}
        />
      </InspectorField>
      <InspectorField label="Blur">
        <InspectorNumberInput
          value={node.style.shadowBlur ?? 12}
          min={0}
          onChange={(shadowBlur) => updateNodeStyle({ shadow: true, shadowBlur })}
        />
      </InspectorField>
      <InspectorField label="Spread">
        <InspectorNumberInput
          value={node.style.shadowSpread ?? 0}
          onChange={(shadowSpread) => updateNodeStyle({ shadow: true, shadowSpread })}
        />
      </InspectorField>
      <InspectorField label="Color">
        <InspectorColorPicker
          value={node.style.shadowColor ?? '#00000040'}
          onChange={(shadowColor) => updateNodeStyle({ shadow: true, shadowColor })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function TypographySection({
  nodeId,
  showAlign = true,
}: {
  nodeId: string;
  showAlign?: boolean;
}) {
  const { node, updateNodeStyle, updateNodeProps } = useInspectorNode(nodeId);
  if (!node || (node.kind !== 'text' && node.kind !== 'input')) return null;
  const textProps = node.kind === 'text' ? (node.props as TextNodeProps) : undefined;

  return (
    <InspectorSection title="Typography" value="typography">
      <InspectorField label="Font">
        <Select
          value={node.style.fontFamily ?? 'Inter'}
          onValueChange={(fontFamily) => updateNodeStyle({ fontFamily })}
        >
          <SelectTrigger className="v4-inspector-v2__select-trigger" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Geist">Geist</SelectItem>
            <SelectItem value="system-ui">System</SelectItem>
          </SelectContent>
        </Select>
      </InspectorField>
      <InspectorField label="Weight">
        <Slider
          value={[typeof node.style.fontWeight === 'number' ? node.style.fontWeight : 400]}
          min={300}
          max={800}
          step={100}
          onValueChange={([fontWeight]) => updateNodeStyle({ fontWeight })}
        />
      </InspectorField>
      <InspectorField label="Size">
        <Slider
          value={[typeof node.style.fontSize === 'number' ? node.style.fontSize : 16]}
          min={10}
          max={72}
          step={1}
          onValueChange={([fontSize]) => updateNodeStyle({ fontSize })}
        />
      </InspectorField>
      <InspectorField label="Line H">
        <Slider
          value={[typeof node.style.lineHeight === 'number' ? node.style.lineHeight : 1.5]}
          min={1}
          max={2}
          step={0.05}
          onValueChange={([lineHeight]) => updateNodeStyle({ lineHeight })}
        />
      </InspectorField>
      <InspectorField label="Tracking">
        <Slider
          value={[node.style.letterSpacing ?? 0]}
          min={-2}
          max={8}
          step={0.1}
          onValueChange={([letterSpacing]) => updateNodeStyle({ letterSpacing })}
        />
      </InspectorField>
      {showAlign && textProps ? (
        <InspectorField label="Align">
          <InspectorSegmented
            value={textProps.align ?? 'left'}
            options={[
              { value: 'left', label: 'L' },
              { value: 'center', label: 'C' },
              { value: 'right', label: 'R' },
            ]}
            onChange={(align) => updateNodeProps({ align })}
          />
        </InspectorField>
      ) : null}
      <InspectorField label="Color">
        <InspectorColorPicker
          value={node.style.color ?? '#18181b'}
          onChange={(color) => updateNodeStyle({ color })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function TransformSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Transform" value="transform" defaultOpen={false}>
      <InspectorField label="Scale">
        <Slider
          value={[node.style.scale ?? 100]}
          min={50}
          max={200}
          step={1}
          onValueChange={([scale]) => updateNodeStyle({ scale })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function EffectsSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Effects" value="effects" defaultOpen={false}>
      <InspectorField label="Blur">
        <Slider
          value={[node.style.blur ?? 0]}
          min={0}
          max={24}
          step={1}
          onValueChange={([blur]) => updateNodeStyle({ blur })}
        />
      </InspectorField>
      <InspectorField label="Backdrop">
        <Slider
          value={[node.style.backdropBlur ?? 0]}
          min={0}
          max={24}
          step={1}
          onValueChange={([backdropBlur]) => updateNodeStyle({ backdropBlur })}
        />
      </InspectorField>
      <InspectorField label="Blend">
        <Select
          value={node.style.blendMode ?? 'normal'}
          onValueChange={(blendMode) =>
            updateNodeStyle({ blendMode: blendMode as NonNullable<typeof node.style.blendMode> })
          }
        >
          <SelectTrigger className="v4-inspector-v2__select-trigger" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="multiply">Multiply</SelectItem>
            <SelectItem value="screen">Screen</SelectItem>
            <SelectItem value="overlay">Overlay</SelectItem>
          </SelectContent>
        </Select>
      </InspectorField>
    </InspectorSection>
  );
}

export function ResponsiveSection({ nodeId }: { nodeId: string }) {
  const { node, deviceMode, updateNodeLayout, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node) return null;

  const modes: DeviceMode[] = ['desktop', 'tablet', 'mobile'];

  return (
    <InspectorSection title="Responsive" value="responsive" defaultOpen={false}>
      <InspectorField label="Viewport">
        <ToggleGroup
          type="single"
          value={deviceMode}
          className="v4-inspector-v2__toggle-group"
          onValueChange={() => undefined}
        >
          {modes.map((mode) => (
            <ToggleGroupItem key={mode} value={mode} disabled className="v4-inspector-v2__toggle-item">
              {mode}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </InspectorField>
      <InspectorField label="Slot">
        <span className="v4-inspector-v2__muted">Editing {deviceMode}</span>
      </InspectorField>
      <InspectorField label="Padding">
        <Slider
          value={[node.layout.padding ?? 0]}
          min={0}
          max={96}
          step={4}
          onValueChange={([padding]) => updateNodeLayout({ padding })}
        />
      </InspectorField>
      <InspectorField label="Opacity">
        <Slider
          value={[node.style.opacity ?? 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([opacity]) => updateNodeStyle({ opacity })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function HeroRootGeometrySection({ nodeId: _nodeId, businessMode: _businessMode = false }: { nodeId: string; businessMode?: boolean }) {
  const frameId = useBuilderV4Store((s) => s.document.rootId);
  const node = useBuilderV4Store((s) => s.document.nodes[frameId]);
  const document = useBuilderV4Store((s) => s.document);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const getAsset = useAssetsStore((s) => s.getAsset);
  const applyHeroGeometry = useBuilderV4Store((s) => s.applyHeroGeometry);
  if (!node || node.kind !== 'frame') return null;

  const productState = resolveHeroFormProductState(document, getAsset, previewMode);

  const props = node.props as FrameNodeProps;
  const geo = props.heroFormGeometry ?? DEFAULT_HERO_FORM_GEOMETRY;
  const hero = {
    layoutMode: geo.mode === 'floating-card' ? ('floating' as const) : ('split' as const),
    leftRatio: geo.leftRatio,
    rightRatio: geo.rightRatio,
    minHeight: geo.minHeight,
    gap: geo.gap,
    padding: geo.padding,
    formColumnWidth: geo.formColumnWidth,
    formColumnMode: 'ratio' as const,
  };
  const minHeight = hero.minHeight ?? DEFAULT_HERO_MIN_HEIGHT;
  const showSplitRatio = hero.layoutMode === 'split';

  const VISUAL_LAYOUTS = [
    {
      id: 'split-68-32', label: 'Split', sublabel: '68/32', layoutMode: 'split' as const, leftRatio: 68, rightRatio: 32,
      svg: <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="27" height="24" rx="2" fill="currentColor" opacity=".25"/><rect x="29" y="0" width="11" height="24" rx="2" fill="currentColor" opacity=".5"/></svg>,
    },
    {
      id: 'split-50-50', label: 'Left Form', sublabel: '50/50', layoutMode: 'split' as const, leftRatio: 50, rightRatio: 50,
      svg: <svg viewBox="0 0 40 24" fill="none"><rect x="0" y="0" width="19" height="24" rx="2" fill="currentColor" opacity=".25"/><rect x="21" y="0" width="19" height="24" rx="2" fill="currentColor" opacity=".5"/></svg>,
    },
    {
      id: 'split-60-40', label: 'Équilibré', sublabel: '60/40', layoutMode: 'split' as const, leftRatio: 60, rightRatio: 40,
      svg: <svg viewBox="0 0 40 24" fill="none"><rect x="0" y="0" width="23" height="24" rx="2" fill="currentColor" opacity=".25"/><rect x="25" y="0" width="15" height="24" rx="2" fill="currentColor" opacity=".5"/></svg>,
    },
    {
      id: 'split-70-30', label: 'Large Img', sublabel: '70/30', layoutMode: 'split' as const, leftRatio: 70, rightRatio: 30,
      svg: <svg viewBox="0 0 40 24" fill="none"><rect x="0" y="0" width="28" height="24" rx="2" fill="currentColor" opacity=".25"/><rect x="30" y="0" width="10" height="24" rx="2" fill="currentColor" opacity=".5"/></svg>,
    },
    {
      id: 'floating', label: 'Floating', sublabel: 'Card', layoutMode: 'floating' as const, leftRatio: 68, rightRatio: 32,
      svg: <svg viewBox="0 0 40 24" fill="none"><rect x="0" y="0" width="40" height="24" rx="2" fill="currentColor" opacity=".2"/><rect x="25" y="3" width="13" height="18" rx="3" fill="currentColor" opacity=".6"/></svg>,
    },
    {
      id: 'split-thermique', label: 'Thermo', sublabel: 'Auto Hall', layoutMode: 'split' as const, leftRatio: 65, rightRatio: 35,
      svg: <svg viewBox="0 0 40 24" fill="none"><rect x="0" y="0" width="26" height="24" rx="2" fill="currentColor" opacity=".25"/><rect x="28" y="0" width="12" height="24" rx="2" fill="currentColor" opacity=".45"/><rect x="28" y="18" width="12" height="6" rx="1" fill="currentColor" opacity=".3"/></svg>,
    },
  ];

  function applyVisualLayout(layout: typeof VISUAL_LAYOUTS[number]) {
    if (layout.layoutMode === 'floating') {
      applyHeroGeometry({ layoutMode: 'floating', gap: 0, padding: 0 });
    } else {
      applyHeroGeometry({ layoutMode: 'split', leftRatio: layout.leftRatio, rightRatio: layout.rightRatio, gap: 0, padding: 0 });
    }
  }

  function isVisualActive(layout: typeof VISUAL_LAYOUTS[number]): boolean {
    if (layout.layoutMode !== hero.layoutMode) return false;
    if (layout.layoutMode === 'floating') return true;
    return hero.leftRatio === layout.leftRatio && hero.rightRatio === layout.rightRatio;
  }

  return (
    <InspectorSection title="HERO" value="hero-geometry">
      <InspectorField label="État">
        <span className="v4-inspector-v2__state-pill" data-state={productState} data-testid="hero-form-state-pill">
          {HERO_FORM_STATE_LABELS[productState]}
        </span>
      </InspectorField>

      {/* ── Visual layout picker ──────────────────────────────── */}
      <InspectorField label="Variante">
        <div className="v4-layout-picker">
          {VISUAL_LAYOUTS.map((layout) => {
            const active = isVisualActive(layout);
            return (
              <button
                key={layout.id}
                type="button"
                className={['v4-layout-picker__card', active ? 'v4-layout-picker__card--active' : ''].filter(Boolean).join(' ')}
                onClick={() => applyVisualLayout(layout)}
                data-testid={`hero-layout-${layout.id}`}
                title={`${layout.label} ${layout.sublabel}`}
              >
                <span className="v4-layout-picker__svg">{layout.svg}</span>
                <span className="v4-layout-picker__label">{layout.label}</span>
                <span className="v4-layout-picker__sub">{layout.sublabel}</span>
              </button>
            );
          })}
        </div>
      </InspectorField>
      <InspectorField label="Hauteur section">
        <Slider
          value={[minHeight]}
          min={480}
          max={960}
          step={8}
          onValueChange={([nextHeight]) => applyHeroGeometry({ minHeight: nextHeight })}
          data-testid="hero-min-height-slider"
        />
        <span className="v4-inspector-v2__hint">{minHeight}px</span>
      </InspectorField>
      {showSplitRatio ? (
        <InspectorField label="Proportion image / form">
          <Slider
            value={[hero.leftRatio]}
            min={30}
            max={70}
            step={5}
            onValueChange={([leftRatio]) =>
              applyHeroGeometry({
                layoutMode: 'split',
                leftRatio,
                rightRatio: 100 - leftRatio,
              })
            }
            data-testid="hero-split-ratio-slider"
          />
          <span className="v4-inspector-v2__hint">
            {hero.leftRatio}% image · {hero.rightRatio}% form
          </span>
        </InspectorField>
      ) : null}
      <InspectorField label="Espacement (gap)">
        <Slider
          value={[hero.gap ?? 0]}
          min={0}
          max={48}
          step={4}
          onValueChange={([gap]) => applyHeroGeometry({ gap })}
          data-testid="hero-gap-slider"
        />
        <span className="v4-inspector-v2__hint">{hero.gap ?? 0}px</span>
      </InspectorField>
      <InspectorField label="Padding section">
        <Slider
          value={[hero.padding ?? 0]}
          min={0}
          max={64}
          step={4}
          onValueChange={([padding]) => applyHeroGeometry({ padding })}
          data-testid="hero-padding-slider"
        />
        <span className="v4-inspector-v2__hint">{hero.padding ?? 0}px</span>
      </InspectorField>
    </InspectorSection>
  );
}

export function HeroContentSnapSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps, updateNodeLayout } = useInspectorNode(nodeId);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const updateNodesLayout = useBuilderV4Store((s) => s.updateNodesLayout);
  const updateNodePropsById = useBuilderV4Store((s) => s.updateNodeProps);

  if (!node || node.kind !== 'stack' || !isHeroContentGroupNode(node, nodes)) return null;

  const groupNode = node;
  const props = node.props as StackNodeProps;
  const anchor = props.contentAnchor ?? 'center-left';
  const offsetX = props.contentOffsetX ?? 0;
  const offsetY = props.contentOffsetY ?? 0;

  function applyPlacement(
    nextAnchor: HeroContentAnchor,
    nextOffsetX: number,
    nextOffsetY: number,
  ) {
    updateNodeProps({
      contentAnchor: nextAnchor,
      contentOffsetX: nextOffsetX,
      contentOffsetY: nextOffsetY,
    });

    const safeArea = groupNode.parentId ? nodes[groupNode.parentId] : null;
    if (safeArea?.name === 'HeroSafeArea') {
      const inset = getHeroSafeInset();
      updateNodesLayout({
        [safeArea.id]: layoutForHeroSafeArea(nextAnchor, inset),
        [groupNode.id]: { marginLeft: nextOffsetX, marginTop: nextOffsetY },
      });
      updateNodePropsById(safeArea.id, {
        contentAnchor: nextAnchor,
        contentOffsetX: nextOffsetX,
        contentOffsetY: nextOffsetY,
      });
      return;
    }

    updateNodeLayout({ marginLeft: nextOffsetX, marginTop: nextOffsetY });
  }

  return (
    <InspectorSection title="CONTENT" value="hero-content-zone">
      <InspectorField label="Position">
        <InspectorSegmented
          value={anchor}
          options={[
            { value: 'top-left', label: 'Haut' },
            { value: 'center-left', label: 'Centre' },
            { value: 'bottom-left', label: 'Bas' },
          ]}
          onChange={(value) => applyPlacement(value as HeroContentAnchor, offsetX, offsetY)}
        />
      </InspectorField>
      <InspectorField label="Décalage X">
        <InspectorNumberInput
          value={offsetX}
          min={-48}
          max={48}
          onChange={(contentOffsetX) => applyPlacement(anchor, contentOffsetX, offsetY)}
        />
      </InspectorField>
      <InspectorField label="Décalage Y">
        <InspectorNumberInput
          value={offsetY}
          min={-48}
          max={48}
          onChange={(contentOffsetY) => applyPlacement(anchor, offsetX, contentOffsetY)}
        />
      </InspectorField>
      <InspectorField label="Smart overlay">
        <input
          type="checkbox"
          checked={Boolean(props.smartBackdrop ?? true)}
          onChange={(event) => updateNodeProps({ smartBackdrop: event.target.checked })}
        />
      </InspectorField>
      {props.smartBackdrop !== false ? (
        <InspectorField label="Overlay">
          <Slider
            value={[props.backdropOpacity ?? 55]}
            min={20}
            max={85}
            step={1}
            onValueChange={([backdropOpacity]) => updateNodeProps({ backdropOpacity })}
          />
        </InspectorField>
      ) : null}
    </InspectorSection>
  );
}

export function FloatingFormWidthSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeLayout } = useInspectorNode(nodeId);
  const document = useBuilderV4Store((s) => s.document);
  const applyHeroGeometry = useBuilderV4Store((s) => s.applyHeroGeometry);
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const rootId = document.rootId;
  const frame = document.nodes[rootId];
  const hero = frame?.kind === 'frame' ? (frame.props as FrameNodeProps).heroGeometry ?? DEFAULT_HERO_GEOMETRY : DEFAULT_HERO_GEOMETRY;

  if (
    !node
    || (node.name !== 'FormLayer' && node.name !== 'FloatingFormCard')
    || (node.kind !== 'form' && node.kind !== 'card')
  ) {
    return null;
  }

  const splitMode = isSplitHeroLayout(document);
  const formColumnWidth = hero.formColumnWidth ?? DEFAULT_FORM_COLUMN_WIDTH;
  const cardInnerWidth = Math.max(280, formColumnWidth - FORM_ZONE_INNER_OFFSET);

  if (splitMode) {
    return (
      <InspectorSection title="FORM" value="form-width">
        <InspectorHint>
          En mode Thermique, le formulaire est ancré dans la colonne droite. Ajustez la largeur via
          le layout HERO.
        </InspectorHint>
        <InspectorField label="Largeur formulaire">
          <Slider
            value={[formColumnWidth]}
            min={360}
            max={560}
            step={4}
            onValueChange={([nextWidth]) => applyHeroGeometry({ formColumnWidth: nextWidth })}
            data-testid="form-column-slider-split"
          />
          <span className="v4-inspector-v2__hint">{formColumnWidth}px · carte {cardInnerWidth}px</span>
        </InspectorField>
        <InspectorField label="Layout HERO">
          <button
            type="button"
            className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
            onClick={() => selectNode(rootId)}
            data-testid="form-inspector-select-hero"
          >
            Ouvrir layout Hero
          </button>
        </InspectorField>
      </InspectorSection>
    );
  }

  const width = Math.min(
    FORM_WIDTH.max,
    Math.max(
      FORM_WIDTH.min,
      parseLayoutPx(node.layout.width, FORM_WIDTH.min) ||
        parseLayoutPx(node.layout.maxWidth, FORM_WIDTH.min),
    ),
  );

  function applyWidth(nextWidth: number) {
    const clamped = Math.min(FORM_WIDTH.max, Math.max(FORM_WIDTH.min, nextWidth));
    updateNodeLayout({
      width: clamped,
      minWidth: FORM_WIDTH.min,
      maxWidth: FORM_WIDTH.max,
    });
  }

  return (
    <InspectorSection title="FORM" value="form-width">
      <InspectorHint>Mode overlay — déplacez le formulaire sur le canvas ou ajustez la largeur.</InspectorHint>
      <InspectorField label="Largeur">
        <Slider
          value={[width]}
          min={FORM_WIDTH.min}
          max={FORM_WIDTH.max}
          step={1}
          onValueChange={([nextWidth]) => applyWidth(nextWidth)}
          data-testid="form-width-slider"
        />
        <span className="v4-inspector-v2__hint">{width}px</span>
      </InspectorField>
    </InspectorSection>
  );
}

export function HeroImageOverlaySection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps } = useInspectorNode(nodeId);
  if (!node || node.kind !== 'image') return null;
  const props = node.props as ImageNodeProps;

  return (
    <InspectorSection title="Overlay" value="hero-overlay">
      <InspectorField label="Activer">
        <input
          type="checkbox"
          checked={Boolean(props.overlayEnabled)}
          onChange={(event) => updateNodeProps({ overlayEnabled: event.target.checked })}
        />
      </InspectorField>
      {props.overlayEnabled ? (
        <>
          <InspectorField label="Couleur">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="color"
                style={{ width: 34, height: 34, padding: 2, border: '1px solid var(--v4-border)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
                value={props.overlayColor ?? '#000000'}
                onChange={(e) => updateNodeProps({ overlayColor: e.target.value })}
              />
              <input
                className="v4-inspector-v2__text"
                value={props.overlayColor ?? '#000000'}
                onChange={(e) => updateNodeProps({ overlayColor: e.target.value })}
              />
            </div>
          </InspectorField>
          <InspectorField label={`Opacité · ${props.overlayOpacity ?? 35}%`}>
            <Slider
              value={[props.overlayOpacity ?? 35]}
              min={0}
              max={100}
              step={1}
              onValueChange={([overlayOpacity]) => updateNodeProps({ overlayOpacity })}
            />
          </InspectorField>
          <InspectorField label="Dégradé">
            <input
              type="checkbox"
              checked={Boolean(props.overlayGradient)}
              onChange={(e) => updateNodeProps({ overlayGradient: e.target.checked })}
            />
          </InspectorField>
          {props.overlayGradient ? (
            <InspectorField label="Direction">
              <select
                className="v4-inspector-v2__text"
                value={props.overlayDirection ?? 'to bottom'}
                onChange={(e) => updateNodeProps({ overlayDirection: e.target.value })}
                style={{ height: 28 }}
              >
                <option value="to bottom">Haut → Bas</option>
                <option value="to top">Bas → Haut</option>
                <option value="to right">Gauche → Droite</option>
                <option value="to left">Droite → Gauche</option>
                <option value="to bottom right">Diagonale ↘</option>
              </select>
            </InspectorField>
          ) : null}
        </>
      ) : null}
    </InspectorSection>
  );
}

export function HeroImageEffectsSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle, updateNodeProps } = useInspectorNode(nodeId);
  if (!node || node.kind !== 'image') return null;
  const props = node.props as ImageNodeProps;

  return (
    <InspectorSection title="Effets" value="hero-effects">
      <InspectorField label={`Blur · ${node.style.blur ?? 0}px`}>
        <Slider value={[node.style.blur ?? 0]} min={0} max={12} step={1} onValueChange={([blur]) => updateNodeStyle({ blur })} />
      </InspectorField>
      <InspectorField label={`Luminosité · ${node.style.brightness ?? 100}%`}>
        <Slider value={[node.style.brightness ?? 100]} min={50} max={150} step={1} onValueChange={([brightness]) => updateNodeStyle({ brightness })} />
      </InspectorField>
      <InspectorField label={`Contraste · ${(node.style as any).contrast ?? 100}%`}>
        <Slider value={[(node.style as any).contrast ?? 100]} min={50} max={200} step={1} onValueChange={([contrast]) => updateNodeStyle({ contrast } as any)} />
      </InspectorField>
      <InspectorField label={`Saturation · ${node.style.saturation ?? 100}%`}>
        <Slider value={[node.style.saturation ?? 100]} min={0} max={200} step={1} onValueChange={([saturation]) => updateNodeStyle({ saturation })} data-testid="hero-image-saturation-slider" />
      </InspectorField>

      {/* Focus point */}
      <InspectorField label={`Focus X · ${props.focusX ?? 50}%`}>
        <Slider value={[props.focusX ?? 50]} min={0} max={100} step={1} onValueChange={([focusX]) => updateNodeProps({ focusX })} />
      </InspectorField>
      <InspectorField label={`Focus Y · ${props.focusY ?? 50}%`}>
        <Slider value={[props.focusY ?? 50]} min={0} max={100} step={1} onValueChange={([focusY]) => updateNodeProps({ focusY })} />
      </InspectorField>
    </InspectorSection>
  );
}

export function HeroImageMobileSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps } = useInspectorNode(nodeId);
  if (!node || node.kind !== 'image') return null;
  const props = node.props as ImageNodeProps;

  return (
    <InspectorSection title="Image Mobile" value="hero-image-mobile">
      <InspectorField label="URL image mobile">
        <div className="v4-url-import">
          <input
            type="url"
            className="v4-inspector-v2__text v4-url-import__input"
            placeholder="https://... (optionnel)"
            defaultValue={props.mobileSrc ?? ''}
            onBlur={(e) => {
              const url = e.target.value.trim();
              updateNodeProps({ mobileSrc: url || undefined });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value.trim();
                updateNodeProps({ mobileSrc: url || undefined });
              }
            }}
          />
          <button
            type="button"
            className="v4-url-import__apply"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              const url = input?.value.trim();
              updateNodeProps({ mobileSrc: url || undefined });
            }}
          >↵</button>
        </div>
      </InspectorField>
      {props.mobileSrc ? (
        <InspectorField label="Position mobile">
          <select
            className="v4-inspector-v2__text"
            value={props.position ?? 'cover'}
            onChange={(e) => updateNodeProps({ position: e.target.value as 'cover' | 'contain' | 'original' })}
            style={{ height: 28 }}
          >
            <option value="cover">Cover (remplir)</option>
            <option value="contain">Contain (conserver)</option>
            <option value="original">Original (taille réelle)</option>
          </select>
        </InspectorField>
      ) : null}
      <p className="v4-inspector-v2__hint" style={{ margin: '4px 0 0' }}>
        Laissez vide pour utiliser la même image sur mobile.
      </p>
    </InspectorSection>
  );
}

export function ImageCropSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle } = useInspectorNode(nodeId);
  if (!node || node.kind !== 'image') return null;

  return (
    <InspectorSection title="Recadrage" value="image-crop">
      <InspectorField label="Zoom">
        <Slider
          value={[node.style.scale ?? 100]}
          min={50}
          max={200}
          step={1}
          onValueChange={([scale]) => updateNodeStyle({ scale })}
        />
      </InspectorField>
      <InspectorField label="Position X">
        <Slider
          value={[node.style.objectPositionX ?? 50]}
          min={0}
          max={100}
          step={1}
          onValueChange={([objectPositionX]) => updateNodeStyle({ objectPositionX })}
        />
      </InspectorField>
      <InspectorField label="Position Y">
        <Slider
          value={[node.style.objectPositionY ?? 50]}
          min={0}
          max={100}
          step={1}
          onValueChange={([objectPositionY]) => updateNodeStyle({ objectPositionY })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function AdvancedSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeVisibility, updateNodeAdvanced } = useInspectorNode(nodeId);
  if (!node) return null;

  return (
    <InspectorSection title="Advanced" value="advanced" defaultOpen={false}>
      <InspectorField label="Visible">
        <input
          type="checkbox"
          checked={!node.visibility.hidden}
          onChange={(event) => updateNodeVisibility({ hidden: !event.target.checked })}
        />
      </InspectorField>
      <InspectorField label="Locked">
        <input
          type="checkbox"
          checked={Boolean(node.visibility.locked)}
          onChange={(event) => updateNodeVisibility({ locked: event.target.checked })}
        />
      </InspectorField>
      <InspectorField label="CSS vars">
        <textarea
          className="v4-inspector-v2__textarea"
          value={node.advanced?.cssVariables ?? ''}
          placeholder="--token: value"
          onChange={(event) => updateNodeAdvanced({ cssVariables: event.target.value })}
        />
      </InspectorField>
      <InspectorField label="Class">
        <input
          className="v4-inspector-v2__text"
          value={node.advanced?.customClass ?? ''}
          onChange={(event) => updateNodeAdvanced({ customClass: event.target.value })}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function ImageMediaSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeProps, updateNodeStyle } = useInspectorNode(nodeId);
  const getAsset = useAssetsStore((s) => s.getAsset);
  const clearHeroImageMedia = useBuilderV4Store((s) => s.clearHeroImageMedia);
  if (!node || node.kind !== 'image') return null;
  const props = node.props as ImageNodeProps;
  const assigned = isUserHeroMediaAssigned(props, getAsset);
  const linkedAsset = props.assetId ? getAsset(props.assetId) : undefined;
  const { src: previewSrc } = resolveMediaSrc(props, getAsset);

  function openMediaUpload() {
    useBuilderV4Store.getState().setLeftSidebarTab('media');
  }

  function openMediaLibrary() {
    useBuilderV4Store.getState().setLeftSidebarTab('media');
  }

  const behavior: HeroImageBehavior = props.imageBehavior ?? 'campaign-poster';

  function setImageBehavior(next: HeroImageBehavior) {
    updateNodeProps({ imageBehavior: next });
    updateNodeStyle({ objectFit: resolveImageObjectFit(next) });
  }

  return (
    <InspectorSection title="IMAGE" value="image">
      <div className="v4-inspector-asset">
        {assigned ? (
          <MediaImage
            src={previewSrc}
            alt={props.alt || 'Hero'}
            variant="inspector"
            testId="inspector-media-preview"
          />
        ) : (
          <div className="v4-inspector-asset__empty" data-testid="inspector-media-empty">
            <p className="v4-inspector-asset__empty-title">Aucune image hero</p>
            <p className="v4-inspector-asset__empty-hint">
              Importez une image ou choisissez-en une dans la bibliothèque.
            </p>
          </div>
        )}
        <p className="v4-inspector-asset__meta">
          {assigned && linkedAsset ? linkedAsset.name : assigned ? 'Image liée' : 'En attente d\'import'}
        </p>
        <div className="v4-inspector-asset__actions">
          <button
            type="button"
            className="v4-inspector-asset__btn v4-inspector-asset__btn--primary"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openMediaUpload();
            }}
            data-testid="inspector-import-image"
          >
            {assigned ? 'Changer l\'image' : 'Importer une image'}
          </button>
          <button
            type="button"
            className="v4-inspector-asset__btn"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openMediaLibrary();
            }}
            data-testid="inspector-open-media"
          >
            Bibliothèque Media
          </button>
          {assigned ? (
            <button
              type="button"
              className="v4-inspector-asset__btn v4-inspector-asset__btn--danger"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                clearHeroImageMedia(nodeId);
              }}
              data-testid="inspector-remove-image"
            >
              Supprimer
            </button>
          ) : null}
        </div>
      </div>
      {/* URL import */}
      <InspectorField label="URL image">
        <div className="v4-url-import">
          <input
            type="url"
            className="v4-inspector-v2__text v4-url-import__input"
            placeholder="https://..."
            defaultValue={props.src ?? ''}
            data-testid="inspector-image-url"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value.trim();
                if (url) updateNodeProps({ src: url, assetId: undefined });
              }
            }}
            onBlur={(e) => {
              const url = e.target.value.trim();
              if (url && url !== (props.src ?? '')) {
                updateNodeProps({ src: url, assetId: undefined });
              }
            }}
          />
          <button
            type="button"
            className="v4-url-import__apply"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              const url = input?.value.trim();
              if (url) updateNodeProps({ src: url, assetId: undefined });
            }}
          >
            ↵
          </button>
        </div>
      </InspectorField>
      <InspectorField label="Alt">
        <input
          className="v4-inspector-v2__text"
          value={props.alt}
          onChange={(event) => updateNodeProps({ alt: event.target.value })}
        />
      </InspectorField>
      <InspectorField label="Image Behavior">
        <InspectorSegmented
          value={behavior}
          options={(
            Object.entries(HERO_IMAGE_BEHAVIOR_LABELS) as [HeroImageBehavior, string][]
          ).map(([value, label]) => ({ value, label }))}
          onChange={(imageBehavior) => setImageBehavior(imageBehavior as HeroImageBehavior)}
        />
      </InspectorField>
    </InspectorSection>
  );
}

export function FormBusinessSection({ nodeId }: { nodeId: string }) {
  const { node, updateNodeStyle, updateNodeProps } = useInspectorNode(nodeId);
  const document = useBuilderV4Store((s) => s.document);
  const applyHeroGeometry = useBuilderV4Store((s) => s.applyHeroGeometry);
  const rootId = document.rootId;
  const frame = document.nodes[rootId];
  const geo = frame?.kind === 'frame'
    ? ((frame.props as FrameNodeProps).heroFormGeometry ?? DEFAULT_HERO_FORM_GEOMETRY)
    : DEFAULT_HERO_FORM_GEOMETRY;
  const formColumnWidth = geo.formColumnWidth ?? DEFAULT_FORM_COLUMN_WIDTH;

  if (!node || node.name !== 'FormLayer' || node.kind !== 'form') {
    return null;
  }

  const formProps = node.props as import('../../types/nodes.types').FormNodeProps;
  const cardRadius = formProps.cardRadius ?? node.style.borderRadius ?? 12;
  const splitMode = isSplitHeroLayout(document);

  if (splitMode) {
    return (
      <InspectorSection title="Apparence" value="form-appearance">
        <InspectorField label="Largeur">
          <Slider
            value={[formColumnWidth]}
            min={FORM_WIDTH.min}
            max={FORM_WIDTH.max}
            step={4}
            onValueChange={([nextWidth]) => applyHeroGeometry({ formColumnWidth: nextWidth })}
            data-testid="form-column-slider-split"
          />
          <span className="v4-inspector-v2__hint">{formColumnWidth}px</span>
        </InspectorField>
        <InspectorField label="Radius">
          <Slider
            value={[cardRadius]}
            min={0}
            max={32}
            step={1}
            onValueChange={([radius]) => {
              if (node.kind === 'form') updateNodeProps({ cardRadius: radius });
              else updateNodeStyle({ borderRadius: radius });
            }}
          />
        </InspectorField>
        <InspectorField label="Shadow">
          <Slider
            value={[node.style.shadowBlur ?? 24]}
            min={0}
            max={48}
            step={1}
            onValueChange={([shadowBlur]) => updateNodeStyle({ shadow: true, shadowBlur })}
          />
        </InspectorField>
      </InspectorSection>
    );
  }

  const width = Math.min(FORM_WIDTH.max, Math.max(FORM_WIDTH.min, formColumnWidth));

  return (
    <>
      <InspectorField label="Largeur">
        <Slider
          value={[width]}
          min={FORM_WIDTH.min}
          max={FORM_WIDTH.max}
          step={4}
          onValueChange={([nextWidth]) => applyHeroGeometry({ formColumnWidth: nextWidth })}
          data-testid="form-width-slider"
        />
        <span className="v4-inspector-v2__hint">{width}px</span>
      </InspectorField>
      <InspectorField label="Radius">
        <Slider
          value={[cardRadius]}
          min={0}
          max={32}
          step={1}
          onValueChange={([radius]) => {
            if (node.kind === 'form') updateNodeProps({ cardRadius: radius });
            else updateNodeStyle({ borderRadius: radius });
          }}
        />
      </InspectorField>
      <InspectorField label="Shadow">
        <Slider
          value={[node.style.shadowBlur ?? 24]}
          min={0}
          max={48}
          step={1}
          onValueChange={([shadowBlur]) => updateNodeStyle({ shadow: true, shadowBlur })}
        />
      </InspectorField>
    </>
  );
}

export { DeleteBlockSection } from './DeleteBlockSection';
