import type { Data } from '@puckeditor/core';
import { getBlockLibraryEntry } from '../creative-engine/block-library';
import { getSectionLibraryEntry } from '../creative-engine/section-library';
import { ensurePuckIds } from './ensure-puck-ids';

type PuckNode = { type: string; props: Record<string, unknown> };

function findSectionIndex(content: PuckNode[], sectionId?: string): number {
  if (!sectionId) return content.length;
  const idx = content.findIndex(
    (node) => node.type === 'Section' && node.props?.id === sectionId,
  );
  return idx >= 0 ? idx + 1 : content.length;
}

export function insertSectionsIntoDocument(
  document: Data,
  sectionNodes: unknown[],
  afterSectionId?: string,
): Data {
  const content = [...((document.content ?? []) as PuckNode[])];
  const insertAt = findSectionIndex(content, afterSectionId);
  const stamped =
    ensurePuckIds({ root: document.root ?? { props: {} }, content: sectionNodes as PuckNode[] })
      .content ?? [];
  content.splice(insertAt, 0, ...stamped);
  return { ...document, content };
}

export function insertBlockIntoDocument(document: Data, blockId: string): Data | null {
  const entry = getBlockLibraryEntry(blockId);
  if (!entry) return null;

  const block: PuckNode = {
    type: entry.componentType,
    props: { ...entry.defaultProps },
  };

  const content = [...((document.content ?? []) as PuckNode[])];
  const lastSection = [...content].reverse().find((n) => n.type === 'Section');

  if (lastSection) {
    const sectionIdx = content.indexOf(lastSection);
    const items = Array.isArray(lastSection.props.items) ? [...lastSection.props.items] : [];
    const stamped = ensurePuckIds({
      root: document.root ?? { props: {} },
      content: [block],
    }).content?.[0];
    if (stamped) items.push(stamped);
    content[sectionIdx] = {
      ...lastSection,
      props: { ...lastSection.props, items },
    };
    return { ...document, content };
  }

  const sectionEntry = getSectionLibraryEntry('text-image-section');
  const fallbackSection = sectionEntry?.build() ?? [
    {
      type: 'Section',
      props: {
        backgroundTone: 'light',
        spacingPreset: 'normal',
        items: [block],
      },
    },
  ];
  return insertSectionsIntoDocument(document, fallbackSection);
}

export function insertSectionByLibraryId(document: Data, sectionLibraryId: string): Data | null {
  const entry = getSectionLibraryEntry(sectionLibraryId);
  if (!entry) return null;
  return insertSectionsIntoDocument(document, entry.build());
}
