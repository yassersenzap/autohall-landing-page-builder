import {
  HelpCircle,
  ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Megaphone,
  MessageSquareQuote,
  Sparkles,
  AlignLeft,
  Video,
  FileText,
  MousePointerClick
} from 'lucide-react';
import type { ElementBlockId } from '../lib/element-drag';
import { ELEMENT_BLOCK_LABELS, setElementDragData } from '../lib/element-drag';
type BlockId = string;

const BLOCK_ICONS: Record<BlockId, any> = {
  'hero': Sparkles,
  'hero-form': LayoutTemplate,
  'text-block': AlignLeft,
  'image-block': ImageIcon,
  'video-block': Video,
  'button-block': MousePointerClick,
  'form-block': FileText,
  'features-grid': LayoutGrid,
  'gallery-block': ImageIcon,
  'faq-block': HelpCircle,
  'stats-banner': LayoutGrid,
  'cta-banner': Megaphone,
  'footer-block': LayoutTemplate,
  'testimonials-block': MessageSquareQuote,
};

type ElementBlockChipProps = {
  blockId: ElementBlockId;
  primary?: boolean;
  onClick?: () => void;
};

export function ElementBlockChip({ blockId, primary = false, onClick }: ElementBlockChipProps) {
  const label = ELEMENT_BLOCK_LABELS[blockId] ?? blockId;
  const Icon = BLOCK_ICONS[blockId] ?? LayoutTemplate;

  function onDragStart(event: React.DragEvent<HTMLButtonElement>) {
    setElementDragData(event, blockId);
  }

  return (
    <button
      type="button"
      className={[
        'v4-block-card',
        primary ? 'v4-block-card--primary' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      data-testid={`blocks-block-${blockId}`}
      aria-label={label}
    >
      <span className="v4-block-card__icon">
        <Icon size={16} aria-hidden />
      </span>
      <span className="v4-block-card__body">
        <span className="v4-block-card__title">{label}</span>
      </span>
    </button>
  );
}
