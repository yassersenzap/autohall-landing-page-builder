export type InspectorTab = 'content' | 'design' | 'layout' | 'media' | 'advanced';

export type InspectorPropStore = 'content' | 'design' | 'sectionStyle' | 'blockVisual' | 'typography';

export type InspectorControlOption<T extends string = string> = {
  value: T;
  label: string;
};

export type InspectorVisibilityCondition = {
  prop: string;
  store?: InspectorPropStore;
  equals?: string | number | boolean;
  notEquals?: string | number | boolean;
  oneOf?: Array<string | number | boolean>;
};

type InspectorControlBase = {
  key: string;
  propKey: string;
  label: string;
  description?: string;
  tab: InspectorTab;
  group?: string;
  store?: InspectorPropStore;
  defaultValue?: string | number | boolean;
  visibleWhen?: InspectorVisibilityCondition;
  placeholder?: string;
  maxLength?: number;
};

export type InspectorTextControl = InspectorControlBase & { type: 'text' | 'textarea' };
export type InspectorNumberControl = InspectorControlBase & {
  type: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
};
export type InspectorSelectControl = InspectorControlBase & {
  type: 'select' | 'segmented' | 'layout-variant';
  options: InspectorControlOption[];
};
export type InspectorBooleanControl = InspectorControlBase & { type: 'boolean' };
export type InspectorColorControl = InspectorControlBase & { type: 'color' };
export type InspectorBrandControl = InspectorControlBase & { type: 'brand' };
export type InspectorImageControl = InspectorControlBase & {
  type: 'image' | 'asset';
  assetKey: string;
  urlKey: string;
  altKey?: string;
  enableFocalPicker?: boolean;
};
export type InspectorSpacingControl = InspectorControlBase & {
  type: 'spacing';
  options: InspectorControlOption[];
};

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

export type InspectorRepeaterControl = InspectorControlBase & {
  type: 'repeater';
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

export type InspectorControl =
  | InspectorTextControl
  | InspectorNumberControl
  | InspectorSelectControl
  | InspectorBooleanControl
  | InspectorColorControl
  | InspectorBrandControl
  | InspectorImageControl
  | InspectorSpacingControl
  | InspectorRepeaterControl;
