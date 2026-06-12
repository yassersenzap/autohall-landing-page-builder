import type { InspectorControlOption } from '../block-registry/inspector-control.types';

export type CollectionItemField =
  | {
      key: string;
      type: 'text' | 'textarea' | 'number' | 'boolean';
      label: string;
      placeholder?: string;
      maxLength?: number;
    }
  | {
      key: string;
      type: 'select';
      label: string;
      options: InspectorControlOption[];
      defaultValue?: string;
    }
  | {
      key: string;
      type: 'url';
      label: string;
      placeholder?: string;
    }
  | {
      key: string;
      type: 'asset';
      label: string;
      assetKey: string;
      urlKey: string;
      altKey?: string;
    }
  | {
      key: string;
      type: 'string-list';
      label: string;
      placeholder?: string;
    };

export type CollectionSchema = {
  blockType: string;
  propKey: string;
  itemLabel: string;
  previewField: string;
  minItems?: number;
  maxItems?: number;
  addItemLabel?: string;
  emptyState?: string;
  reorder?: boolean;
  duplicate?: boolean;
  itemFields: CollectionItemField[];
};
