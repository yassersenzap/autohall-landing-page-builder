import { create } from 'zustand';

/**
 * Lightweight UI state separate from the document store.
 * Manages the command palette (Framer-style insertion modal).
 */
type BuilderUIState = {
  /** Is the command palette open? */
  commandPaletteOpen: boolean;
  /**
   * The section ID after which the new block will be inserted.
   * null = append to end.
   */
  commandPaletteInsertAfterId: string | null;

  openCommandPalette: (insertAfterId?: string | null) => void;
  closeCommandPalette: () => void;
};

export const useBuilderUIStore = create<BuilderUIState>((set) => ({
  commandPaletteOpen: false,
  commandPaletteInsertAfterId: null,

  openCommandPalette: (insertAfterId = null) =>
    set({ commandPaletteOpen: true, commandPaletteInsertAfterId: insertAfterId }),

  closeCommandPalette: () =>
    set({ commandPaletteOpen: false, commandPaletteInsertAfterId: null }),
}));
