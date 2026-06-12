import type { InspectorRepeaterControl } from '../block-registry/inspector-control.types';
import { getCollectionSchemasForBlock } from './collection-schemas';

function schemaToRepeaterControl(schema: ReturnType<typeof getCollectionSchemasForBlock>[number]): InspectorRepeaterControl {
  return {
    key: `${schema.blockType}-${schema.propKey}-repeater`,
    propKey: schema.propKey,
    type: 'repeater',
    label: schema.itemLabel,
    tab: schema.propKey === 'images' ? 'media' : 'content',
    group: schema.propKey === 'images' ? 'Galerie' : 'Éléments',
    itemLabel: schema.itemLabel,
    previewField: schema.previewField,
    minItems: schema.minItems,
    maxItems: schema.maxItems,
    addItemLabel: schema.addItemLabel,
    emptyState: schema.emptyState,
    reorder: schema.reorder ?? true,
    duplicate: schema.duplicate ?? true,
    itemFields: schema.itemFields,
  };
}

export function getCollectionRepeaterControlsForBlock(
  blockType: string,
): InspectorRepeaterControl[] {
  return getCollectionSchemasForBlock(blockType).map(schemaToRepeaterControl);
}
