/**
 * Auto Hall SAV starter — inserts a single, unified "Campagne Flash Promo"
 * section (blockType 'tactical-flash-campaign').
 *
 * This used to build a fragmented node-tree (a separate "Bandeau Auto Hall"
 * section + a standalone HeroFormSection with an inner multi-step form node),
 * which broke the schema-driven inspector: neither 'sav-navbar' nor
 * 'hero-form' are registered pro-block types, so selecting either node fell
 * back to the generic inspector and lost the Contenu/Design/Routage tabs.
 *
 * It now reuses the exact same schema/inspector as every other
 * 'tactical-flash-campaign' instance (see TacticalFlashCampaignBlock /
 * TacticalFlashCampaignInspector) — a single section, no separate banner node.
 */
import type { BuilderDocument } from '../types/nodes.types';
import { createNode } from './node-factory';
import { DEFAULT_TACTICAL_FLASH_CAMPAIGN, AUTOHALL_OFFICIAL_CITIES } from './pro-blocks';

export const AUTOHALL_SAV_STARTER_BLOCK_ID = 'autohall-sav-starter';

export function insertAutoHallSavStarterBlock(
  document: BuilderDocument,
): { document: BuilderDocument; nodeId: string } {
  const { nodes, rootId } = document;
  const root = nodes[rootId];
  if (!root) return { document, nodeId: '' };

  const section = createNode({
    kind: 'section',
    name: 'tactical-flash-campaign',
    parentId: rootId,
    props: {
      ...DEFAULT_TACTICAL_FLASH_CAMPAIGN,
      label: 'Campagne Flash Promo',
      badgeText: 'Offre Exclusive SAV',
      headline: "Profitez de nos offres exceptionnelles sur l'entretien de votre véhicule",
      description: 'Auto Hall et ses filiales s’attachent à fournir aux clients un modèle de services à la hauteur de leurs attentes et s’engagent quotidiennement à l’amélioration de leurs prestations.',
      formTitle: 'Demande de rappel rapide',
      btnSubmitLabel: 'ENVOYER VOTRE DEMANDE',
      colorBgSection: '#b1dbd8',
      formBgColor: '#00364b',
      villesList: [...AUTOHALL_OFFICIAL_CITIES],
      promoImageUrl: null,
      promoImageAlt: 'Visuel véhicule SAV',
    },
    layout: { width: '100%' },
  });

  const nextNodes = {
    ...nodes,
    [section.id]: section,
    [rootId]: { ...root, children: [...root.children, section.id] },
  };

  return {
    document: {
      ...document,
      nodes: nextNodes,
      meta: { ...document.meta, templateId: 'page' },
    },
    nodeId: section.id,
  };
}
