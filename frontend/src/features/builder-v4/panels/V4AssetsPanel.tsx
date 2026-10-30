import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/shadcn/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/shadcn/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { selectLibraryAssets, useAssetsStore } from '../store/assets.store';
import { useBuilderV4Store } from '../store/document.store';
import { AssetUploadDropzone } from './assets/AssetUploadDropzone';
import { AssetVirtualGrid } from './assets/AssetVirtualGrid';
import { AssetPreviewDialog } from './assets/AssetPreviewDialog';
import type { MediaAsset } from '../types/assets.types';

export function V4AssetsPanel() {
  const searchQuery = useAssetsStore((s) => s.searchQuery);
  const setSearchQuery = useAssetsStore((s) => s.setSearchQuery);
  const previewAssetId = useAssetsStore((s) => s.previewAssetId);
  const setPreviewAssetId = useAssetsStore((s) => s.setPreviewAssetId);
  const applyAssetToSelectedImage = useAssetsStore((s) => s.applyAssetToSelectedImage);
  const applyAssetToNode = useAssetsStore((s) => s.applyAssetToNode);
  const removeAsset = useAssetsStore((s) => s.removeAsset);
  const getAsset = useAssetsStore((s) => s.getAsset);
  const libraryAssets = useAssetsStore(useShallow(selectLibraryAssets));
  const activeTab = useAssetsStore((s) => s.activeTab);
  const setActiveTab = useAssetsStore((s) => s.setActiveTab);

  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const selectedNode = useBuilderV4Store((s) =>
    s.selectedNodeId ? s.getNode(s.selectedNodeId) : undefined,
  );
  const canApplyToImage = selectedNode?.kind === 'image';

  const previewAsset = previewAssetId ? (getAsset(previewAssetId) ?? null) : null;

  const commandResults = useMemo(() => libraryAssets.slice(0, 8), [libraryAssets]);

  function handleApply(asset: MediaAsset) {
    const applied = applyAssetToSelectedImage(asset.id);
    if (applied) {
      toast.success(`« ${asset.name} » appliqué au node image`);
      return;
    }
    if (selectedNodeId) {
      applyAssetToNode(selectedNodeId, asset.id);
      toast.success(`« ${asset.name} » appliqué`);
      return;
    }
    toast.message('Sélectionnez un node HeroImage pour appliquer l\'asset');
  }

  function handleSelect(asset: MediaAsset) {
    handleApply(asset);
  }

  function handlePreview(asset: MediaAsset) {
    setPreviewAssetId(asset.id);
  }

  return (
    <div className="v4-panel v4-assets-panel" data-testid="assets-panel">
      <div className="v4-assets-panel__search">
        <div className="v4-assets-search">
          <Search className="v4-assets-search__icon" aria-hidden />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un asset…"
            className="v4-assets-search__input"
            data-testid="assets-search-input"
          />
        </div>
        {searchQuery.trim() ? (
          <Command className="v4-assets-command mt-2 rounded-lg border border-zinc-800 bg-zinc-950">
            <CommandList className="max-h-40">
              <CommandEmpty>Aucun résultat</CommandEmpty>
              <CommandGroup heading="Résultats">
                {commandResults.map((asset) => (
                  <CommandItem
                    key={asset.id}
                    value={asset.name}
                    onSelect={() => handleSelect(asset)}
                    data-testid={`assets-search-item-${asset.id}`}
                  >
                    <img src={asset.src} alt="" className="v4-assets-command__thumb" />
                    <span>{asset.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'library' | 'upload')} className="v4-assets-panel__tabs">
        <TabsList className="v4-assets-panel__tablist">
          <TabsTrigger value="library" className="v4-assets-panel__tab" data-testid="assets-tab-library">
            Bibliothèque
          </TabsTrigger>
          <TabsTrigger value="upload" className="v4-assets-panel__tab" data-testid="assets-tab-upload">
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="v4-assets-panel__content">
          <AssetVirtualGrid
            assets={libraryAssets}
            emptyMessage="Aucune image importée. Utilisez l'onglet Upload."
            onSelect={handleSelect}
            onPreview={handlePreview}
            onRemove={(asset) => removeAsset(asset.id)}
          />
        </TabsContent>

        <TabsContent value="upload" className="v4-assets-panel__content v4-assets-panel__content--upload">
          <AssetUploadDropzone />
          {libraryAssets.length > 0 ? (
            <AssetVirtualGrid
              assets={libraryAssets}
              onSelect={handleSelect}
              onPreview={handlePreview}
              onRemove={(asset) => removeAsset(asset.id)}
            />
          ) : null}
        </TabsContent>
      </Tabs>

      <AssetPreviewDialog
        asset={previewAsset}
        open={Boolean(previewAsset)}
        onOpenChange={(open) => {
          if (!open) setPreviewAssetId(null);
        }}
        onApply={handleApply}
        canApply={canApplyToImage}
      />
    </div>
  );
}
