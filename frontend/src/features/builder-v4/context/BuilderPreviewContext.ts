// V4 Builder Preview Context Types

/**
 * Placeholder type for builder lead context value used in preview rendering.
 * This can be expanded with actual shape when needed.
 */
export type BuilderLeadContextValue = {
  interactive?: boolean;
  submitLead?: (values: Record<string, unknown>) => Promise<{ ok: boolean; message?: string }>;
};
