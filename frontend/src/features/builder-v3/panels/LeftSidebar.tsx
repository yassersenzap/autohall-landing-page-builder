import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { LucideIcon } from 'lucide-react';
import {
  CreditCard,
  GripVertical,
  HelpCircle,
  Images,
  LayoutTemplate,
  ListChecks,
  Megaphone,
  Minus,
  Quote,
  Sparkles,
  Type,
  ImageIcon,
  Video,
} from 'lucide-react';
import { paletteDragId } from '@/features/builder-engine/constants/palette';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
  ShadButton,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type SidebarBlockDef = {
  type: string;
  label: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
};

const GABARIT_BLOCKS: SidebarBlockDef[] = [
  {
    type: 'promo_autohall',
    label: 'Gabarit Acquisition (Split-Screen)',
    description: 'Visuel plein écran + module lead intégré',
    featured: true,
    icon: Sparkles,
  },
  {
    type: 'hero_campaign',
    label: 'Bannière Standard',
    description: 'En-tête campagne — titre, visuel et CTA',
    icon: LayoutTemplate,
  },
  {
    type: 'lead_form',
    label: 'Module Lead Gen',
    description: 'Formulaire de capture conforme Auto Hall',
    icon: ListChecks,
  },
];

const ESSENTIAL_BLOCKS: SidebarBlockDef[] = [
  {
    type: 'rich_text',
    label: 'Section Texte',
    description: 'Titre + paragraphe — layout sécurisé',
    icon: Type,
  },
  {
    type: 'media_only',
    label: 'Section Visuel',
    description: 'Image HD encadrée avec ratio verrouillé',
    icon: ImageIcon,
  },
  {
    type: 'spacer_divider',
    label: 'Séparateur / Espacement',
    description: 'Ligne ou espace entre sections',
    icon: Minus,
  },
  {
    type: 'cta_band',
    label: 'Bandeau CTA',
    description: 'Conversion pleine largeur — titre + bouton',
    icon: Megaphone,
  },
  {
    type: 'video_embed',
    label: 'Section Vidéo',
    description: 'YouTube / Vimeo en cadre 16:9 premium',
    icon: Video,
  },
];

const CONVERSION_BLOCKS: SidebarBlockDef[] = [
  {
    type: 'vehicle_features',
    label: 'Grille Caractéristiques',
    description: 'Specs véhicule en 3 colonnes',
    icon: ListChecks,
  },
  {
    type: 'gallery',
    label: 'Galerie Visuelle',
    description: 'Trio d’images véhicule pleine largeur',
    icon: Images,
  },
  {
    type: 'pricing_trim',
    label: 'Financement / Finitions',
    description: '3 cartes finitions — prix et équipements',
    icon: CreditCard,
  },
  {
    type: 'faq',
    label: 'Questions Fréquentes',
    description: 'Accordéon FAQ — 4 questions par défaut',
    icon: HelpCircle,
  },
  {
    type: 'testimonials',
    label: 'Avis Clients',
    description: 'Témoignages vérifiés — grille 3 cartes',
    icon: Quote,
  },
];

const TOTAL_MODULES =
  GABARIT_BLOCKS.length + ESSENTIAL_BLOCKS.length + CONVERSION_BLOCKS.length;

function DraggableBlockCard({
  type,
  label,
  description,
  featured,
  icon: Icon,
  onAdd,
}: SidebarBlockDef & { onAdd: (blockType: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: paletteDragId(type),
    data: { blockType: type },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-40')}>
      <Card
        className={cn(
          'border-neutral-800 bg-neutral-900/60 text-neutral-100 transition-colors hover:border-neutral-600',
          featured && 'border-blue-600/40 bg-linear-to-br from-blue-950/40 to-neutral-900/60',
        )}
      >
        <CardHeader className="gap-1 p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Icon
                className={cn('h-3.5 w-3.5', featured ? 'text-blue-400' : 'text-neutral-400')}
                aria-hidden
              />
              {label}
            </CardTitle>
            <button
              type="button"
              className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              aria-label={`Glisser ${label}`}
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
          <CardDescription className="text-xs text-neutral-500">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="w-full border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
            onClick={() => onAdd(type)}
          >
            Insérer sur le canvas
          </ShadButton>
        </CardContent>
      </Card>
    </div>
  );
}

function BlockCategoryList({
  blocks,
  onAdd,
}: {
  blocks: SidebarBlockDef[];
  onAdd: (blockType: string) => void;
}) {
  return (
    <div className="space-y-2">
      {blocks.map((block) => (
        <DraggableBlockCard key={block.type} {...block} onAdd={onAdd} />
      ))}
    </div>
  );
}

export function LeftSidebar() {
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);

  return (
    <aside
      className="flex h-full w-[280px] shrink-0 flex-col border-r border-neutral-800 bg-neutral-950"
      data-builder-v3-left-sidebar
    >
      <div className="border-b border-neutral-800 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Catalogue de modules
        </p>
        <p className="mt-0.5 text-sm text-neutral-300">
          Gabarits · essentiels · conversion
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          <Accordion
            type="multiple"
            defaultValue={['gabarits', 'essentials', 'conversion']}
            className="space-y-1"
          >
            <AccordionItem value="gabarits" className="border-none">
              <AccordionTrigger className="rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200 hover:no-underline">
                Gabarits Auto Hall
              </AccordionTrigger>
              <AccordionContent className="pt-1">
                <BlockCategoryList blocks={GABARIT_BLOCKS} onAdd={addBlock} />
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-2 bg-neutral-800" />

            <AccordionItem value="essentials" className="border-none">
              <AccordionTrigger className="rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200 hover:no-underline">
                Éléments Essentiels
              </AccordionTrigger>
              <AccordionContent className="pt-1">
                <BlockCategoryList blocks={ESSENTIAL_BLOCKS} onAdd={addBlock} />
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-2 bg-neutral-800" />

            <AccordionItem value="conversion" className="border-none">
              <AccordionTrigger className="rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200 hover:no-underline">
                Conversion &amp; Réassurance
              </AccordionTrigger>
              <AccordionContent className="pt-1">
                <BlockCategoryList blocks={CONVERSION_BLOCKS} onAdd={addBlock} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <Separator className="bg-neutral-800" />
      <p className="px-4 py-2 text-[0.625rem] text-neutral-600">
        {TOTAL_MODULES} modules · design contraint
      </p>
    </aside>
  );
}
