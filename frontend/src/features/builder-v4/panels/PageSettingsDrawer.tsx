import { Search, Code2, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/shadcn/drawer';
import { useBuilderV4Store } from '../store/document.store';

type PageSettingsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldLabel = 'text-[10px] font-bold text-zinc-500 uppercase tracking-wider';
const fieldInput =
  'bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-xs text-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all duration-150 w-full outline-none';

export function PageSettingsDrawer({ open, onOpenChange }: PageSettingsDrawerProps) {
  const seoTitle = useBuilderV4Store((s) => s.document.meta?.seoTitle ?? '');
  const seoDescription = useBuilderV4Store((s) => s.document.meta?.seoDescription ?? '');
  const headScripts = useBuilderV4Store((s) => s.document.meta?.headScripts ?? '');
  const updateDocumentMeta = useBuilderV4Store((s) => s.updateDocumentMeta);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false} direction="right">
      <DrawerContent className="v4-inspector-drawer" data-testid="page-settings-drawer">
        <DrawerHeader className="relative pr-12">
          <DrawerTitle>Configuration de la page</DrawerTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1.5 hover:bg-zinc-800 rounded-lg cursor-pointer focus:outline-none"
            title="Fermer le panneau"
            aria-label="Fermer le panneau"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
          <DrawerDescription className="sr-only">
            Référencement (SEO) et scripts personnalisés injectés dans le head de la page publiée.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-5 flex flex-col gap-0">
          <div className="flex flex-col gap-1 pb-5">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-[11px] tracking-wider uppercase">
              <Search size={13} className="text-zinc-400" />
              <span>SEO</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
              Titre et description affichés sur Google et lors du partage sur les réseaux sociaux.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-5">
            <label className={fieldLabel}>Meta Titre</label>
            <input
              type="text"
              className={`${fieldInput} h-9`}
              value={seoTitle}
              placeholder="Titre de la page (par défaut : titre du document)"
              onChange={(e) => updateDocumentMeta({ seoTitle: e.target.value })}
              data-testid="page-settings-seo-title"
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-5 mt-5">
            <label className={fieldLabel}>Meta Description</label>
            <textarea
              className={fieldInput}
              style={{ height: 80, padding: '8px 12px', resize: 'vertical' }}
              value={seoDescription}
              placeholder="Résumé de la page (155-160 caractères recommandés)"
              onChange={(e) => updateDocumentMeta({ seoDescription: e.target.value })}
              data-testid="page-settings-seo-description"
            />
          </div>

          <div className="flex flex-col gap-1 pb-5 pt-8 border-t border-zinc-800/60 mt-5">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-[11px] tracking-wider uppercase">
              <Code2 size={13} className="text-zinc-400" />
              <span>Scripts</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
              Balises &lt;script&gt; personnalisées (Google Tag Manager, Meta Pixel...) injectées telles
              quelles dans le &lt;head&gt; de la page publiée.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>Scripts d'en-tête</label>
            <textarea
              className={`${fieldInput} font-mono text-[11px] text-emerald-400`}
              style={{ height: 160, padding: '8px 12px', resize: 'vertical' }}
              value={headScripts}
              placeholder={'<script>\n  // Google Tag Manager, Meta Pixel...\n</script>'}
              onChange={(e) => updateDocumentMeta({ headScripts: e.target.value })}
              data-testid="page-settings-head-scripts"
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
