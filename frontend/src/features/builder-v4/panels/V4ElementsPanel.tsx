/**
 * V4ElementsPanel — 10 blocks premium prêts à l'emploi.
 * Chaque block insère du contenu déjà rempli dans le canvas.
 * Aucun élément atomique (bouton seul, titre seul, séparateur...).
 */
import {
  AlignLeft,
  ImageIcon,
  Images,
  Quote,
  Grid3x3,
  BarChart3,
  Megaphone,
  HelpCircle,
  ClipboardList,
  Rows3,
  Columns2,
} from 'lucide-react';
import { useBuilderV4Store } from '../store/document.store';
import { setElementDragData } from '../lib/element-drag';

// ── 10 blocks premium — dans l'ordre d'une landing page type ─────────────────

type BlockDef = {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
};

const BLOCKS: BlockDef[] = [

  {
    id: 'text-block',
    label: 'Rich Text',
    desc: 'Eyebrow, titre, corps, CTA — section typographie complète',
    icon: AlignLeft,
    color: '#3b82f6',
  },
  {
    id: 'image-content',
    label: 'Image + Contenu',
    desc: 'Split layout — image gauche/droite + texte + avantages + CTA',
    icon: Columns2,
    color: '#0ea5e9',
  },
  {
    id: 'image-block',
    label: 'Image',
    desc: 'Photo pleine largeur — crop, object-fit, radius, shadow',
    icon: ImageIcon,
    color: '#10b981',
  },
  {
    id: 'gallery-block',
    label: 'Galerie',
    desc: 'Grille d\'images — grid, masonry, colonnes, radius',
    icon: Images,
    color: '#06b6d4',
  },
  {
    id: 'features-grid',
    label: 'Features',
    desc: 'Grille de cartes avantages — icône, titre, description',
    icon: Grid3x3,
    color: '#8b5cf6',
  },
  {
    id: 'stats-banner',
    label: 'Statistiques',
    desc: 'Bandeau chiffres clés — valeur, label, fond sombre',
    icon: BarChart3,
    color: '#f59e0b',
  },
  {
    id: 'testimonials-block',
    label: 'Témoignages',
    desc: 'Avis clients — avatar, note étoiles, grid ou slider',
    icon: Quote,
    color: '#a855f7',
  },
  {
    id: 'faq-block',
    label: 'FAQ',
    desc: 'Accordéon questions-réponses — titre, sous-titre',
    icon: HelpCircle,
    color: '#14b8a6',
  },
  {
    id: 'cta-banner',
    label: 'CTA Banner',
    desc: 'Appel à l\'action — titre, sous-titre, bouton, fond',
    icon: Megaphone,
    color: '#e85d04',
  },
  {
    id: 'form-block',
    label: 'Formulaire',
    desc: 'Lead form multi-étapes — validation, succès, leads',
    icon: ClipboardList,
    color: '#e85d04',
  },
  {
    id: 'footer-block',
    label: 'Footer',
    desc: 'Pied de page — colonnes, liens, réseaux, copyright',
    icon: Rows3,
    color: '#374151',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function V4ElementsPanel() {
  const insertCanvasBlock = useBuilderV4Store((s) => s.insertCanvasBlock);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);

  function handleInsert(id: string) {
    insertCanvasBlock(id);
    setRightPanelOpen(true);
  }

  return (
    <div className="v4-el-panel" data-testid="elements-panel">
      <div className="v4-el-panel__head">
        <p className="v4-el-panel__title">Blocks</p>
        <p className="v4-el-panel__sub">Cliquez ou glissez pour ajouter</p>
      </div>

      <div className="v4-el-panel__list">
        {BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <button
              key={block.id}
              type="button"
              className="v4-el-item"
              draggable
              onDragStart={(e) => setElementDragData(e, block.id)}
              onClick={() => handleInsert(block.id)}
              data-testid={`block-${block.id}`}
              title={`Ajouter ${block.label}`}
            >
              <span
                className="v4-el-item__icon"
                style={{
                  background: `${block.color}1a`,
                  color: block.color,
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="v4-el-item__body">
                <span className="v4-el-item__name">{block.label}</span>
                <span className="v4-el-item__desc">{block.desc}</span>
              </span>
              <span className="v4-el-item__drag" aria-hidden title="Glisser">⠿</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
