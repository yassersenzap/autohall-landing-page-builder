import { useEffect } from 'react';
import { useBuilderV4Store } from '../../store/document.store';
import {
  resolveInspectorMode,
  shouldShowBusinessInspector,
  inspectorPanelTitle,
  resolveInspectorNodeId,
} from '../../lib/inspector-target';
import { findPageBlockForNode } from '../../lib/page-builder-ops';
import { IMAGE_LAYER_NAME, FORM_LAYER_NAME } from '../../lib/hero-layers';
import { BusinessInspector } from './BusinessInspector';
import { PageInspector } from './PageInspector';
import { ElementInspector } from './ElementInspector';
import { SectionInspector } from './SectionInspector';
import { ProBlockInspector, isProBlockInspectable, getProBlockLabel } from './ProBlockInspector';
import { getLayerDisplayName } from '../../lib/layer-display';

/**
 * Resolves the contextual label + badge for the right panel header
 * based on what's actually selected, not just the inspector node.
 */
function resolveContextHeader(
  selectedNodeId: string | null,
  nodes: Record<string, import('../../types/nodes.types').BuilderNode>,
  mode: ReturnType<typeof resolveInspectorMode>,
  defaultTitle: string,
): { title: string; badge: string; badgeVariant?: string } {
  if (!selectedNodeId) return { title: defaultTitle, badge: 'Page' };

  const node = nodes[selectedNodeId];
  if (!node) return { title: defaultTitle, badge: '' };

  if (mode === 'hero') {
    if (node.name === IMAGE_LAYER_NAME) return { title: 'Image', badge: 'Image' };
    if (node.name === FORM_LAYER_NAME || node.kind === 'form') return { title: 'Formulaire', badge: 'Formulaire', badgeVariant: 'form' };
    if (node.kind === 'image') return { title: 'Image', badge: 'Image' };
    return { title: defaultTitle || 'Hero + Form', badge: 'Hero', badgeVariant: 'hero' };
  }

  if (mode === 'element') {
    return { title: getLayerDisplayName(node, nodes), badge: '' };
  }

  if (mode === 'section') {
    return { title: defaultTitle, badge: 'Section' };
  }

  return { title: defaultTitle || 'Page', badge: 'Page' };
}

export function V4InspectorContent() {
  const selectedNodeIds = useBuilderV4Store((s) => s.selectedNodeIds);
  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const document = useBuilderV4Store((s) => s.document);
  const setInspectorFocusTab = useBuilderV4Store((s) => s.setInspectorFocusTab);
  const nodes = document.nodes;

  const inspectorNodeId = resolveInspectorNodeId(document, selectedNodeId);
  const showBusiness = shouldShowBusinessInspector(document, selectedNodeId);
  const defaultTitle = inspectorPanelTitle(document, inspectorNodeId);
  const isMulti = selectedNodeIds.length > 1;
  const mode = resolveInspectorMode(document, selectedNodeId);

  const { title, badge, badgeVariant } = resolveContextHeader(
    selectedNodeId, nodes, mode, defaultTitle,
  );

  useEffect(() => {
    if (!selectedNodeId || mode !== 'hero') return;
    const node = nodes[selectedNodeId];
    if (!node) return;
    if (node.name === IMAGE_LAYER_NAME || node.kind === 'image') {
      setInspectorFocusTab('image');
    } else if (node.name === FORM_LAYER_NAME || node.kind === 'form') {
      setInspectorFocusTab('form');
    } else if (node.kind !== 'frame') {
      setInspectorFocusTab('hero');
    }
  }, [selectedNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isMulti) {
    return (
      <div className="v4-inspector-shell">
        <div className="v4-inspector-shell__head v4-inspector-shell__head--mode">
          <span className="v4-inspector-mode-badge">Sélection multiple</span>
        </div>
        <div className="v4-inspector-shell__scroll">
          <p className="v4-inspector-empty__hint px-3 py-4">
            {selectedNodeIds.length} éléments — sélectionnez-en un seul pour éditer.
          </p>
        </div>
      </div>
    );
  }

  /* ── Element inside a regular section ───────────────────────── */
  if (mode === 'element' && selectedNodeId) {
    const pageBlock = findPageBlockForNode(document, selectedNodeId);
    return (
      <div className="v4-inspector-shell">
        <div className="v4-inspector-shell__head v4-inspector-shell__head--element">
          <span className="v4-inspector-v2__title">{title}</span>
        </div>
        <div className="v4-inspector-shell__scroll">
          <ElementInspector nodeId={selectedNodeId} sectionId={pageBlock?.id} />
        </div>
      </div>
    );
  }

  /* ── Pro-block section — prop-based with rich inspector ─────── */
  if (mode === 'section' && selectedNodeId && isProBlockInspectable(selectedNodeId, nodes)) {
    const proLabel = getProBlockLabel(selectedNodeId, nodes);
    return (
      <div className="v4-inspector-shell">
        <div className="v4-inspector-shell__head v4-inspector-shell__head--section">
          <span className="v4-inspector-v2__title">{proLabel}</span>
          <span className="v4-inspector-mode-badge">Section</span>
        </div>
        <div className="v4-inspector-shell__scroll--no-pad">
          <ProBlockInspector nodeId={selectedNodeId} />
        </div>
      </div>
    );
  }

  /* ── Regular section (non-hero, non-pro-block) ──────────────── */
  if (mode === 'section' && selectedNodeId) {
    return (
      <div className="v4-inspector-shell">
        <div className="v4-inspector-shell__head v4-inspector-shell__head--section">
          <span className="v4-inspector-v2__title">{title}</span>
          {badge ? <span className="v4-inspector-mode-badge">{badge}</span> : null}
        </div>
        <div className="v4-inspector-shell__scroll--no-pad">
          <SectionInspector nodeId={selectedNodeId} />
        </div>
      </div>
    );
  }

  /* ── Hero+Form and its children (Image / Form / fields) ─────── */
  if (mode === 'hero' || showBusiness) {
    return (
      <div className="v4-inspector-shell">
        <div className="v4-inspector-shell__head v4-inspector-shell__head--hero">
          <span className="v4-inspector-v2__title">{title}</span>
          {badge ? (
            <span className={`v4-inspector-mode-badge${badgeVariant ? ` v4-inspector-mode-badge--${badgeVariant}` : ''}`}>
              {badge}
            </span>
          ) : null}
        </div>
        <BusinessInspector nodeId={inspectorNodeId} />
      </div>
    );
  }

  /* ── Page / nothing selected ────────────────────────────────── */
  return (
    <div className="v4-inspector-shell" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="v4-inspector-shell__scroll" style={{ flex: 1, padding: 0 }}>
        <PageInspector />
      </div>
    </div>
  );
}
