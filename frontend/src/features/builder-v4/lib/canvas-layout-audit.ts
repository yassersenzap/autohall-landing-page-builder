import type { BuilderNode, NodeLayout } from '../types/nodes.types';
import { engineCanMoveable } from './engine-node-matrix';

export const AUDIT_NODE_NAMES = [
  'Frame',
  'HeroImage',
  'HeroSafeArea',
  'HeroContentGroup',
  'HeroContent',
  'Title',
  'FormZone',
  'FloatingFormCard',
  'LeadForm',
] as const;

export type AuditComputedStyles = {
  src?: string | null;
  display: string;
  width: string;
  height: string;
  minHeight: string;
  objectFit: string;
  overflow: string;
  position: string;
  flex: string;
  opacity: string;
  zIndex: string;
};

export type NodeLayoutAudit = {
  name: string;
  kind: string;
  nodeId: string;
  dom: { left: number; top: number; width: number; height: number };
  store: {
    width: number | string | undefined;
    height: number | string | undefined;
    parsedWidth: number;
    parsedHeight: number;
    layout: Partial<NodeLayout>;
  };
  geometry: { width: number; height: number; left: number; top: number };
  moveable: { left: number; top: number; width: number; height: number } | null;
  computed: AuditComputedStyles;
  inSync: boolean;
  moveableOk: boolean;
  syncDelta: { width: number; height: number };
};

const TRACE_STYLE_KEYS = [
  'display',
  'width',
  'height',
  'minHeight',
  'objectFit',
  'overflow',
  'position',
  'flex',
  'opacity',
  'zIndex',
] as const;

function readComputed(element: HTMLElement, img?: HTMLImageElement | null): AuditComputedStyles {
  const styles = getComputedStyle(element);
  const imgStyles = img ? getComputedStyle(img) : null;
  const out: AuditComputedStyles = {
    src: img?.currentSrc || img?.getAttribute('src') || null,
    display: '',
    width: '',
    height: '',
    minHeight: '',
    objectFit: '',
    overflow: '',
    position: '',
    flex: '',
    opacity: '',
    zIndex: '',
  };
  for (const key of TRACE_STYLE_KEYS) {
    const camel = key as keyof AuditComputedStyles;
    if (camel === 'src') continue;
    if (camel === 'objectFit') {
      out.objectFit = imgStyles?.objectFit ?? styles.objectFit;
    } else {
      out[camel] = (styles as unknown as Record<string, string>)[key] ?? styles.getPropertyValue(key);
    }
  }
  return out;
}

function parseStoreSize(
  value: number | string | undefined,
  fallback: number,
): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
    if (value.endsWith('%') || value === 'auto' || value === 'max-content') return fallback;
  }
  return fallback;
}

function usesFlowGeometry(layout: Partial<NodeLayout>): boolean {
  const w = layout.width;
  const h = layout.height;
  return (
    w === '100%' ||
    w === 'max-content' ||
    h === '100%' ||
    h === 'auto' ||
    layout.display === 'grid' ||
    layout.display === 'flex' ||
    layout.minHeight === '100%'
  );
}

export function auditNodeLayout(
  container: HTMLElement,
  nodes: Record<string, BuilderNode>,
  selectedNodeId: string | null,
  rootId: string,
): NodeLayoutAudit[] {
  const containerRect = container.getBoundingClientRect();
  const moveableEl = container.querySelector<HTMLElement>('.moveable-control-box');
  const moveableRect = moveableEl?.getBoundingClientRect() ?? null;

  const toLocal = (rect: DOMRect) => ({
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height,
  });

  const audits: NodeLayoutAudit[] = [];

  for (const name of AUDIT_NODE_NAMES) {
    const node = Object.values(nodes).find((entry) => entry.name === name);
    if (!node || node.visibility.hidden) continue;

    const shell = container.querySelector<HTMLElement>(`[data-v4-node-id="${node.id}"]`);
    if (!shell) continue;

    const rect = shell.getBoundingClientRect();
    const dom = toLocal(rect);
    const img = shell.querySelector<HTMLImageElement>('img');

    const parsedWidth = parseStoreSize(node.layout.width, dom.width);
    const parsedHeight = parseStoreSize(node.layout.height, dom.height);

    const widthDelta = Math.abs(dom.width - parsedWidth);
    const heightDelta = Math.abs(dom.height - parsedHeight);
    const flowSized = usesFlowGeometry(node.layout);
    const inSync = flowSized ? true : widthDelta <= 2 && heightDelta <= 2;

    const canMove = engineCanMoveable(node, rootId);
    const moveable =
      selectedNodeId === node.id && moveableRect && canMove ? toLocal(moveableRect) : null;
    const moveableOk = canMove ? moveable !== null || selectedNodeId !== node.id : moveable === null;

    audits.push({
      name,
      kind: node.kind,
      nodeId: node.id,
      dom,
      store: {
        width: node.layout.width,
        height: node.layout.height,
        parsedWidth,
        parsedHeight,
        layout: {
          display: node.layout.display,
          gridColumn: node.layout.gridColumn,
          gridRow: node.layout.gridRow,
          minHeight: node.layout.minHeight,
          gap: node.layout.gap,
          padding: node.layout.padding,
        },
      },
      geometry: { width: dom.width, height: dom.height, left: dom.left, top: dom.top },
      moveable,
      computed: readComputed(shell, img),
      inSync,
      moveableOk,
      syncDelta: { width: widthDelta, height: heightDelta },
    });
  }

  return audits;
}

export function isAuditFullySynced(audits: NodeLayoutAudit[]): boolean {
  return audits.every((entry) => entry.inSync && entry.moveableOk);
}
