import { useEffect, useRef, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useBuilderUIStore } from '../store/builder-ui.store';
import { useBuilderV4Store } from '../store/document.store';

// ── Catalog ───────────────────────────────────────────────────────────────────

type PaletteItem = { id: string; label: string; group: string; icon: string; kind?: 'action' };

const ACTION_ITEMS: PaletteItem[] = [
  { id: 'action-add-navbar',      label: 'Ajouter la Navbar',                 group: 'Actions', icon: '☰', kind: 'action' },
  { id: 'action-insert-fiche',    label: 'Injecter le Template Fiche Modèle', group: 'Actions', icon: '⊡', kind: 'action' },
  { id: 'action-change-brand',    label: 'Changer de Marque',                 group: 'Actions', icon: '⬡', kind: 'action' },
  { id: 'action-toggle-mobile',   label: 'Basculer en vue Mobile',            group: 'Actions', icon: '▯', kind: 'action' },
];

const PALETTE_ITEMS: PaletteItem[] = [
  ...ACTION_ITEMS,
  // Templates — full-page starters validated for production
  { id: 'brand-navbar',      label: 'Brand Navbar',                  group: 'Templates', icon: '☰' },
  { id: 'campaign-chery',    label: 'Campagne Gamme Thermique',       group: 'Templates', icon: '⊡' },
  { id: 'hero-form',         label: 'Hero + Formulaire (Classique)',  group: 'Templates', icon: '⊞' },
  // Sections — atomic reusable blocks
  { id: 'section-features',      label: 'Caractéristiques',  group: 'Sections', icon: '◈' },
  { id: 'section-vehicle-cards', label: 'Modèles véhicules', group: 'Sections', icon: '◉' },
  { id: 'section-testimonials',  label: 'Témoignages',       group: 'Sections', icon: '◎' },
  { id: 'section-cta-banner',    label: 'Bandeau CTA',       group: 'Sections', icon: '◆' },
  { id: 'section-faq',           label: 'FAQ',               group: 'Sections', icon: '◇' },
  { id: 'section-gallery',       label: 'Galerie photos',    group: 'Sections', icon: '◰' },
  { id: 'section-footer',        label: 'Footer',            group: 'Sections', icon: '◻' },
  { id: 'lead-form',             label: 'Formulaire lead',   group: 'Sections', icon: '◱' },
  { id: 'stats-banner',          label: 'Statistiques',      group: 'Sections', icon: '◲' },
  // Elements — primitive nodes
  { id: 'heading',   label: 'Titre',         group: 'Éléments', icon: 'H' },
  { id: 'text',      label: 'Paragraphe',    group: 'Éléments', icon: '¶' },
  { id: 'image',     label: 'Image',         group: 'Éléments', icon: '⬜' },
  { id: 'button',    label: 'Bouton',        group: 'Éléments', icon: '▷' },
  { id: 'divider',   label: 'Séparateur',    group: 'Éléments', icon: '─' },
  { id: 'spacer',    label: 'Espace',        group: 'Éléments', icon: '↕' },
];

const GROUP_ORDER = ['Actions', 'Templates', 'Sections', 'Éléments'];

// ── Component ─────────────────────────────────────────────────────────────────

export function CanvasCommandPalette() {
  const { commandPaletteOpen, commandPaletteInsertAfterId, closeCommandPalette } = useBuilderUIStore();
  const insertCanvasBlock = useBuilderV4Store((s) => s.insertCanvasBlock);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);
  const clearSelection = useBuilderV4Store((s) => s.clearSelection);
  const deviceMode = useBuilderV4Store((s) => s.deviceMode);
  const setDeviceMode = useBuilderV4Store((s) => s.setDeviceMode);

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [commandPaletteOpen]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return PALETTE_ITEMS;
    return PALETTE_ITEMS.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q),
    );
  }, [query]);

  const flatItems = useMemo(
    () =>
      GROUP_ORDER.flatMap((g) => filtered.filter((it) => it.group === g)),
    [filtered],
  );

  function handleActivate(item: PaletteItem) {
    if (item.kind === 'action') {
      switch (item.id) {
        case 'action-add-navbar':
          insertCanvasBlock('brand-navbar', commandPaletteInsertAfterId);
          setRightPanelOpen(true);
          break;
        case 'action-insert-fiche':
          // Full multi-section blueprint: Navbar + HeroForm + Specs + Gallery + Footer
          insertCanvasBlock('fiche-modele-officielle', commandPaletteInsertAfterId);
          setRightPanelOpen(true);
          break;
        case 'action-change-brand':
          // Clearing selection surfaces the Page Inspector, where the brand picker lives
          clearSelection();
          setRightPanelOpen(true);
          break;
        case 'action-toggle-mobile':
          setDeviceMode(deviceMode === 'mobile' ? 'desktop' : 'mobile');
          break;
      }
      closeCommandPalette();
      return;
    }

    insertCanvasBlock(item.id, commandPaletteInsertAfterId);
    setRightPanelOpen(true);
    closeCommandPalette();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { closeCommandPalette(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && flatItems[activeIdx]) {
      e.preventDefault();
      handleActivate(flatItems[activeIdx]);
    }
  }

  // Reset activeIdx when filtered list changes
  useEffect(() => { setActiveIdx(0); }, [query]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((g) => ({
        group: g,
        items: filtered.filter((it) => it.group === g),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  // Global ESC handler
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCommandPalette(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, closeCommandPalette]);

  // Listen to CustomEvent('open-command-palette') to open command palette programmatically
  useEffect(() => {
    const handleOpen = () => {
      useBuilderUIStore.getState().openCommandPalette();
    };
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {commandPaletteOpen ? (
        <>
          {/* Backdrop — isolates the palette from the canvas behind it */}
          <motion.div
            className="fixed inset-0 z-200 bg-black/40 backdrop-blur-sm transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={closeCommandPalette}
          />

          {/* Palette card */}
          <motion.div
            className="v4-palette"
            role="dialog"
            aria-label="Insérer un bloc"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Search */}
            <div className="v4-palette__search">
              <Search size={14} className="v4-palette__search-icon" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                className="v4-palette__input"
                placeholder="Rechercher une action ou une section…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              {query ? (
                <button type="button" className="v4-palette__clear" onClick={() => setQuery('')}>
                  ✕
                </button>
              ) : null}
            </div>

            {/* Results */}
            <div className="v4-palette__list" role="listbox">
              {grouped.length === 0 ? (
                <p className="v4-palette__empty">Aucun résultat pour « {query} »</p>
              ) : (
                grouped.map((g) => (
                  <div key={g.group} className="v4-palette__group">
                    <p className="v4-palette__group-label">{g.group}</p>
                    {g.items.map((item) => {
                      const idx = flatItems.indexOf(item);
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          className={`v4-palette__item ${isActive ? 'v4-palette__item--active' : ''}`}
                          onClick={() => handleActivate(item)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          data-testid={`palette-item-${item.id}`}
                        >
                          <span className="v4-palette__item-icon" aria-hidden>{item.icon}</span>
                          <span className="v4-palette__item-label">{item.label}</span>
                          {isActive ? (
                            <span className="v4-palette__item-hint">
                              ↵ {item.kind === 'action' ? 'Exécuter' : 'Insérer'}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="v4-palette__footer">
              <span><kbd>↑↓</kbd> Naviguer</span>
              <span><kbd>↵</kbd> Insérer</span>
              <span><kbd>Esc</kbd> Fermer</span>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
