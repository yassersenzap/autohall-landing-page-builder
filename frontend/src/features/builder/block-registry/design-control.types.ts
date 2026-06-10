/** Primitive control kinds exposed in the builder properties panel. */
export type DesignControlType =
  | 'select'
  | 'toggle'
  | 'slider'
  | 'color'
  | 'segmented';

export type DesignControlOption<T extends string = string> = {
  value: T;
  label: string;
};

/**
 * Declarative design control for premium blocks.
 * Values are stored under block props `design` and mirrored at export time.
 */
export type DesignControl<T extends string = string> = {
  key: string;
  label: string;
  type: DesignControlType;
  options?: DesignControlOption<T>[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: T | number | boolean;
  description?: string;
};

export type DesignControlMap = Record<string, DesignControl>;
