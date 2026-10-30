import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { isCampaignTemplate } from './campaign-structure';
import { isHeroContentGroupNode } from './geometry/hero-safe-area';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text';

function findChildByName(
  nodes: Record<string, BuilderNode>,
  parent: BuilderNode,
  name: string,
): BuilderNode | undefined {
  return parent.children
    .map((id) => nodes[id])
    .find((child) => child?.name === name);
}

function findNestedChildByName(
  nodes: Record<string, BuilderNode>,
  parent: BuilderNode,
  name: string,
): BuilderNode | undefined {
  for (const childId of parent.children) {
    const child = nodes[childId];
    if (!child) continue;
    if (child.name === name) return child;
    const nested = findNestedChildByName(nodes, child, name);
    if (nested) return nested;
  }
  return undefined;
}

function findHeroOverlayTexts(nodes: Record<string, BuilderNode>, heroImage: BuilderNode): BuilderNode[] {
  const safeArea = findChildByName(nodes, heroImage, 'HeroSafeArea');
  if (!safeArea) return [];
  return safeArea.children
    .map((id) => nodes[id])
    .filter((child): child is BuilderNode => Boolean(child && isHeroOverlayTextNode(child, nodes)));
}

function findNestedContentGroups(nodes: Record<string, BuilderNode>, parent: BuilderNode): BuilderNode[] {
  const groups: BuilderNode[] = [];
  for (const childId of parent.children) {
    const child = nodes[childId];
    if (!child) continue;
    if (isHeroContentGroupNode(child, nodes)) groups.push(child);
    groups.push(...findNestedContentGroups(nodes, child));
  }
  return groups;
}

/** Business layer rows under Page → Hero → Image / Content / Form. */
export function resolveHeroSectionChildren(
  document: BuilderDocument,
): BuilderNode[] {
  if (!isCampaignTemplate(document)) return [];

  const frame = document.nodes[document.rootId];
  if (!frame) return [];

  const heroImage = findChildByName(document.nodes, frame, 'HeroImage');
  const form = findNestedChildByName(document.nodes, frame, 'FloatingFormCard');
  const overlayTexts = heroImage ? findHeroOverlayTexts(document.nodes, heroImage) : [];
  const legacyContent = heroImage ? findNestedContentGroups(document.nodes, heroImage) : [];

  const rows: BuilderNode[] = [];
  if (heroImage) rows.push(heroImage);
  if (legacyContent.length > 0) {
    rows.push(...legacyContent);
  } else if (overlayTexts.length > 0) {
    rows.push(...overlayTexts);
  }
  if (form) rows.push(form);
  return rows;
}

export function pageHasHeroSection(document: BuilderDocument): boolean {
  return resolveHeroSectionChildren(document).length > 0;
}
