import {
  BadgeCheck,
  Car,
  CircleHelp,
  FileText,
  FormInput,
  Image,
  LayoutTemplate,
  Megaphone,
  MousePointerClick,
  Quote,
  Shield,
  Sparkles,
  Star,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { EditorBlockType } from '../types/editor.types';

const BLOCK_ICON_MAP: Record<EditorBlockType, LucideIcon> = {
  hero: Car,
  trust_bar: Shield,
  text: FileText,
  image: Image,
  button: MousePointerClick,
  lead_form: FormInput,
  benefits: BadgeCheck,
  offer_highlights: Star,
  features: Sparkles,
  financing: Megaphone,
  after_sales: Wrench,
  testimonials: Quote,
  faq: CircleHelp,
  final_cta: LayoutTemplate,
  footer_legal: FileText,
};

export function BlockTypeIcon({
  type,
  className,
}: {
  type: EditorBlockType | string;
  className?: string;
}) {
  const Icon = BLOCK_ICON_MAP[type as EditorBlockType] ?? LayoutTemplate;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
