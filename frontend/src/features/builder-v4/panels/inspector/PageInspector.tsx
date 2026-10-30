import { useBuilderV4Store } from '../../store/document.store';
import { isDocumentEmpty } from '../../lib/document-lifecycle';
import { listPageBlocks } from '../../lib/page-builder-ops';
import { getLayerDisplayName } from '../../lib/layer-display';
import { AUTOHALL_BRANDS, getAutoHallBrand } from '@/config/brands';
import { FileText, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';

export function PageInspector() {
  const document = useBuilderV4Store((s) => s.document);
  const updateDocumentMeta = useBuilderV4Store((s) => s.updateDocumentMeta);
  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const blocks = listPageBlocks(document);
  const isEmpty = isDocumentEmpty(document);

  const landingPageType = document.meta?.landingPageType ?? 'brand';
  const selectedBrandId = document.meta?.selectedBrandId ?? '';
  const selectedModelName = document.meta?.selectedModelName ?? '';
  const activeBrand = getAutoHallBrand(selectedBrandId);

  const showOnlyGlobalConfig = !selectedNodeId || isEmpty;

  const handleBrandChange = (value: string) => {
    const brandId = value === 'none' ? null : value;
    updateDocumentMeta({
      selectedBrandId: brandId,
      selectedModelName: null,
      brandTheme: brandId || 'custom',
    });
  };

  const handleTypeChange = (value: string) => {
    updateDocumentMeta({ landingPageType: value as 'brand' | 'model' });
  };

  const handleModelChange = (value: string) => {
    updateDocumentMeta({ selectedModelName: value === 'none' ? null : value });
  };

  return (
    <div className="v4-page-inspector p-5 flex flex-col gap-0" data-testid="page-inspector">
      {/* En-tête Paramètres */}
      <div className="flex flex-col gap-1 pb-5">
        <div className="flex items-center gap-2 text-zinc-100 font-bold text-[11px] tracking-wider uppercase">
          <FileText size={13} className="text-zinc-400" />
          <span>Paramètres de la page</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
          {isEmpty
            ? "Définissez le contexte global avant de commencer à composer."
            : "Configurez l'identité de marque et les variables système globales."}
        </p>
      </div>

      {/* Type de Landing */}
      <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-5 mt-0">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Type de Landing
        </label>
        <Select value={landingPageType} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-9 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-700 w-full transition-all">
            <SelectValue placeholder="Sélectionnez le type" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800">
            <SelectItem value="brand">Landing de Marque (Catalogue)</SelectItem>
            <SelectItem value="model">Landing de Modèle (Direct)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Marque Auto Hall */}
      <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-5 mt-5">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Marque Auto Hall
        </label>
        <Select value={selectedBrandId || 'none'} onValueChange={handleBrandChange}>
          <SelectTrigger className="h-9 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-700 w-full transition-all">
            <SelectValue placeholder="Sélectionnez une marque" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800">
            <SelectItem value="none">Aucune marque</SelectItem>
            {AUTOHALL_BRANDS.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modèle Mis en Avant (si Modèle) */}
      {landingPageType === 'model' && (
        <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-5 mt-5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Modèle mis en avant
          </label>
          <Select
            value={selectedModelName || 'none'}
            onValueChange={handleModelChange}
            disabled={!activeBrand}
          >
            <SelectTrigger className="h-9 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-700 w-full transition-all disabled:opacity-40">
              <SelectValue placeholder={activeBrand ? "Sélectionnez un modèle" : "Sélectionnez une marque d'abord"} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem value="none">Aucun modèle</SelectItem>
              {(activeBrand?.models ?? []).map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Conseils / Aide contextuelle */}
      <div className="border-t border-zinc-800/60 pt-5 mt-5">
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          {landingPageType === 'brand'
            ? "Mode Catalogue : Le formulaire propose automatiquement la liste complète des véhicules de la marque choisie à l'étape 1."
            : "Mode Ciblé : L'étape 1 (choix du modèle) est ignorée. Le formulaire commence directement par les coordonnées pour une conversion maximale."}
        </p>
      </div>

      {/* Sections de la page (si non vide et pas de sélection spécifique) */}
      {!showOnlyGlobalConfig && blocks.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-zinc-800/60 pt-5 mt-5">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
            <LayoutGrid size={12} />
            <span>Structure de la Page ({blocks.length})</span>
          </div>
          <ul className="flex flex-col gap-0 list-none m-0 rounded-lg overflow-hidden border border-zinc-800/50">
            {blocks.map((block) => (
              <li
                key={block.id}
                className="px-3 py-2 text-[11px] text-zinc-300 border-b border-zinc-800/40 last:border-0 truncate font-medium bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors"
              >
                {getLayerDisplayName(block, document.nodes)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
