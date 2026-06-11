import type { ReactNode } from 'react';
import {
  selectActiveBlock,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import { getBuilderPersistPageVersionId } from '@/features/builder-engine/store/builder-document.store';
import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import { ScrollArea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { getBlockPrimaryImageFieldKeys } from '../lib/block-image-field-keys';

export function AssetsPanel() {
  const pageVersionId = getBuilderPersistPageVersionId();
  const { assets, loading, error } = usePageAssets(pageVersionId || null);
  const block = useBuilderDocumentStore(selectActiveBlock);
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  const imageKeys = block ? getBlockPrimaryImageFieldKeys(block.type) : null;
  const canApplyToSelection = Boolean(block && imageKeys);

  function applyAsset(assetId: string) {
    if (!block || !imageKeys) return;
    updateBlockProps(block.id, {
      [imageKeys.assetKey]: assetId,
      [imageKeys.urlKey]: '',
    });
  }

  function PanelMessage({ children }: { children: ReactNode }) {
    return (
      <ScrollArea className="h-full min-h-0" data-testid="studio-assets-panel">
        <div className="px-4 py-6">{children}</div>
      </ScrollArea>
    );
  }

  if (!pageVersionId) {
    return (
      <PanelMessage>
        <p className="text-xs text-neutral-500">Chargement de la page…</p>
      </PanelMessage>
    );
  }

  if (loading) {
    return (
      <PanelMessage>
        <p className="text-xs text-neutral-500">Chargement des médias…</p>
      </PanelMessage>
    );
  }

  if (error) {
    return (
      <PanelMessage>
        <p className="text-sm font-medium text-red-300">Médias indisponibles</p>
        <p className="mt-1 text-xs text-neutral-500">{error}</p>
      </PanelMessage>
    );
  }

  if (assets.length === 0) {
    return (
      <PanelMessage>
        <p className="text-sm font-medium text-neutral-300">Aucun média</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Importez des images via l’inspecteur (onglet Media) d’un bloc sélectionné.
        </p>
      </PanelMessage>
    );
  }

  return (
    <ScrollArea className="h-full min-h-0" data-testid="studio-assets-panel">
      <div className="space-y-3 p-3 pb-6">
        {canApplyToSelection ? (
          <p className="text-xs text-neutral-400">
            Cliquez un média pour l’appliquer au bloc sélectionné (
            <span className="text-neutral-300">{block?.label}</span>).
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            Aperçu en lecture seule. Sélectionnez un bloc avec champ image (hero, média…) pour
            appliquer un asset.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => {
            const src = assetPublicFileUrl(asset.id);
            const isImage = asset.mimeType?.startsWith('image/');
            return (
              <button
                key={asset.id}
                type="button"
                disabled={!canApplyToSelection || !isImage}
                onClick={() => applyAsset(asset.id)}
                className={cn(
                  'group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/80 text-left transition',
                  canApplyToSelection && isImage
                    ? 'hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30'
                    : 'cursor-default opacity-90',
                )}
                data-testid={`studio-asset-${asset.id}`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-950">
                  {isImage ? (
                    <img
                      src={src}
                      alt={asset.originalName ?? 'Asset'}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[0.625rem] text-neutral-600">
                      {asset.mimeType ?? 'fichier'}
                    </div>
                  )}
                </div>
                <p className="truncate px-2 py-1.5 text-[0.625rem] text-neutral-400">
                  {asset.originalName ?? asset.id.slice(0, 8)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
