export type DesignEngine = 'blocks' | 'grapesjs';

export type DesignProjectPayload = {
  engine: DesignEngine;
  projectJson: Record<string, unknown> | null;
  htmlSnapshot: string | null;
  cssSnapshot: string | null;
  updatedAt: string;
};

export type SaveDesignProjectPayload = {
  projectJson: Record<string, unknown>;
  htmlSnapshot: string;
  cssSnapshot: string;
  engine?: DesignEngine;
};
