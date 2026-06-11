import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, ImageIcon, Layers, MousePointerClick } from 'lucide-react';
import {
  selectActiveBlock,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import { getBuilderPersistPageVersionId } from '@/features/builder-engine/store/builder-document.store';
import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import type { PageAsset } from '@/lib/page-assets-api';
import { Label, ScrollArea, ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import {
  buildImageFieldPatch,
  collectUsedAssetIdsOnBlock,
  getApplicableImageFieldsForBlock,
  getBlockMediaProfile,
} from '../lib/block-media-fields';

function formatMimeShort(mimeType?: string): string {
  if (!mimeType) return '';
  if (mimeType.startsWith('image/')) {
    const sub = mimeType.split('/')[1]?.toUpperCase() ?? '';
    return sub === 'JPEG' ? 'JPG' : sub;
  }
  return mimeType.split('/')[1]?.slice(0, 4).toUpperCase() ?? '';
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} o`;
  return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} Ko`;
}

function formatMetaLine(asset: PageAsset): string {
  const parts = [formatMimeShort(asset.mimeType), formatFileSize(asset.fileSize)].filter(Boolean);
  return parts.join(' · ');
}

export function AssetsPanel() {
  const pageVersionId = getBuilderPersistPageVersionId();
  const { assets, loading, error } = usePageAssets(pageVersionId || null);
  const block = useBuilderDocumentStore(selectActiveBlock);
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  const applicableFields = useMemo(
    () => (block ? getApplicableImageFieldsForBlock(block) : []),
    [block],
  );
  const profile = block ? getBlockMediaProfile(block.type) : null;
  const canApplyToSelection = applicableFields.length > 0;

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [targetFieldId, setTargetFieldId] = useState<string>('');
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || applicableFields.length === 0) {
      setTargetFieldId('');
      return;
    }
    const primary =
      applicableFields.find((field) => field.id === profile.primaryFieldId) ??
      applicableFields[0];
    setTargetFieldId(primary?.id ?? '');
  }, [block?.id, block?.type, profile, applicableFields]);

  useEffect(() => {
    setApplyMessage(null);
  }, [block?.id, selectedAssetId, targetFieldId]);

  const usedAssetIds = useMemo(
    () => (block ? collectUsedAssetIdsOnBlock(block) : new Set<string>()),
    [block],
  );

  const targetField = applicableFields.find((field) => field.id === targetFieldId);
  const selectedAsset = assets.find((item) => item.id === selectedAssetId) ?? null;

  const applyDisabledReason = useMemo(() => {
    if (!block) {
      return 'Sélectionnez un bloc sur le canevas pour appliquer un visuel.';
    }
    if (!canApplyToSelection || !targetField) {
      return 'Le bloc sélectionné n’a pas de champ image compatible.';
    }
    if (!selectedAssetId) {
      return 'Choisissez un visuel dans la bibliothèque ci-dessous.';
    }
    const asset = assets.find((item) => item.id === selectedAssetId);
    if (asset && !asset.mimeType?.startsWith('image/')) {
      return 'Seules les images peuvent être appliquées aux champs visuels.';
    }
    return null;
  }, [block, canApplyToSelection, targetField, selectedAssetId, assets]);

  const canApply = applyDisabledReason === null;

  function applySelectedAsset() {
    setApplyMessage(null);
    if (!canApply || !block || !targetField || !selectedAssetId) {
      setApplyMessage(applyDisabledReason ?? 'Impossible d’appliquer ce visuel.');
      return;
    }

    updateBlockProps(block.id, buildImageFieldPatch(targetField, selectedAssetId));
    setApplyMessage(`Visuel appliqué à « ${targetField.label} ».`);
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
        <div
          className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-800/90 bg-linear-to-b from-neutral-900/40 to-neutral-950/20 px-5 py-10 text-center"
          data-testid="studio-assets-empty"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 shadow-inner">
            <ImageIcon className="h-5 w-5" aria-hidden />
          </div>
          <div className="max-w-[220px] space-y-1">
            <p className="text-sm font-medium text-neutral-200">Bibliothèque vide</p>
            <p className="text-xs leading-relaxed text-neutral-500">
              Importez un visuel depuis l’onglet Media de l’inspecteur ou glissez une image sur le
              canevas.
            </p>
          </div>
        </div>
      </PanelMessage>
    );
  }

  return (
    <ScrollArea className="h-full min-h-0" data-testid="studio-assets-panel">
      <div className="flex flex-col gap-4 p-3 pb-6">
        <header className="space-y-0.5 px-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-medium text-neutral-200">Bibliothèque</h3>
            <span className="text-[0.6875rem] tabular-nums text-neutral-500">
              {assets.length} fichier{assets.length > 1 ? 's' : ''}
            </span>
          </div>
          {block ? (
            <p className="text-xs text-neutral-500" data-testid="assets-selected-block">
              Bloc actif : <span className="text-neutral-300">{block.label}</span>
            </p>
          ) : (
            <p className="text-xs text-neutral-500" data-testid="assets-selected-block">
              Aucun bloc sélectionné
            </p>
          )}
        </header>

        <div
          className="space-y-3 rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-3 shadow-sm"
          data-testid="assets-apply-dock"
        >
          {canApplyToSelection && block && targetField ? (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="assets-target-field"
                  className="text-[0.6875rem] font-medium uppercase tracking-wide text-neutral-500"
                >
                  Champ cible
                </Label>
                <select
                  id="assets-target-field"
                  value={targetFieldId}
                  onChange={(e) => setTargetFieldId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 text-sm font-medium text-neutral-100 outline-none ring-0 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                  data-testid="assets-target-field"
                >
                  {applicableFields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5" data-testid="assets-selected-preview">
                <Label className="text-[0.6875rem] font-medium uppercase tracking-wide text-neutral-500">
                  Visuel sélectionné
                </Label>
                {selectedAsset ? (
                  <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900/80 p-2">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-950">
                      {selectedAsset.mimeType?.startsWith('image/') ? (
                        <img
                          src={assetPublicFileUrl(selectedAsset.id)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-600">
                          <Layers className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-neutral-200">
                        {selectedAsset.originalName ?? selectedAsset.id.slice(0, 8)}
                      </p>
                      <p className="text-[0.6875rem] text-neutral-500">
                        {formatMetaLine(selectedAsset)}
                      </p>
                    </div>
                    <Check className="h-4 w-4 shrink-0 text-blue-400" aria-hidden />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-800 bg-neutral-900/30 px-3 py-2.5 text-xs text-neutral-500">
                    <MousePointerClick className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Cliquez un visuel dans la grille
                  </div>
                )}
              </div>

              <ShadButton
                type="button"
                size="sm"
                className="h-9 w-full text-sm font-medium"
                disabled={!canApply}
                onClick={applySelectedAsset}
                data-testid="assets-apply-button"
              >
                Appliquer au bloc
              </ShadButton>

              {!canApply && applyDisabledReason ? (
                <p
                  className="text-xs leading-relaxed text-neutral-500"
                  data-testid="assets-apply-disabled-reason"
                >
                  {applyDisabledReason}
                </p>
              ) : null}
            </>
          ) : (
            <div
              className="space-y-2 rounded-lg border border-dashed border-neutral-800 bg-neutral-900/30 px-3 py-3"
              data-testid="assets-no-compatible-block"
            >
              <p className="text-xs font-medium text-neutral-400">Application indisponible</p>
              <p
                className="text-xs leading-relaxed text-neutral-500"
                data-testid="assets-apply-disabled-reason"
              >
                {applyDisabledReason ??
                  'Sélectionnez un bloc avec champ image (hero, média, promo…) pour appliquer un visuel.'}
              </p>
            </div>
          )}

          {applyMessage ? (
            <p
              className={cn(
                'rounded-md px-2 py-1.5 text-xs',
                applyMessage.startsWith('Visuel appliqué')
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-amber-500/10 text-amber-200',
              )}
              data-testid="assets-apply-feedback"
            >
              {applyMessage}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2.5" data-testid="studio-assets-grid">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              selected={selectedAssetId === asset.id}
              inUse={usedAssetIds.has(asset.id)}
              onSelect={() => setSelectedAssetId(asset.id)}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function AssetCard({
  asset,
  selected,
  inUse,
  onSelect,
}: {
  asset: PageAsset;
  selected: boolean;
  inUse: boolean;
  onSelect: () => void;
}) {
  const isImage = asset.mimeType?.startsWith('image/');
  const src = assetPublicFileUrl(asset.id);
  const meta = formatMetaLine(asset);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative overflow-hidden rounded-xl border text-left transition-all duration-150',
        selected
          ? 'border-blue-400/70 bg-blue-500/5 shadow-[0_0_0_1px_rgba(96,165,250,0.25)]'
          : 'border-neutral-800/90 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-900/80',
      )}
      data-testid={`studio-asset-${asset.id}`}
      data-selected={selected ? 'true' : 'false'}
    >
      {inUse ? (
        <span
          className="absolute right-2 top-2 z-10 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_0_2px_rgba(9,9,11,0.9)]"
          title="Utilisé sur le bloc sélectionné"
          data-testid={`studio-asset-in-use-${asset.id}`}
        />
      ) : null}

      <div className="aspect-square overflow-hidden bg-neutral-950">
        {isImage ? (
          <img
            src={src}
            alt={asset.originalName ?? 'Asset'}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-neutral-900/80 text-neutral-500">
            <Layers className="h-5 w-5" aria-hidden />
            <span className="text-[0.625rem] font-medium">{formatMimeShort(asset.mimeType)}</span>
          </div>
        )}
      </div>

      <div className="space-y-0.5 border-t border-neutral-800/80 px-2.5 py-2">
        <p
          className="truncate text-xs font-medium text-neutral-300"
          title={asset.originalName}
        >
          {asset.originalName ?? asset.id.slice(0, 8)}
        </p>
        {meta ? <p className="truncate text-[0.625rem] text-neutral-600">{meta}</p> : null}
      </div>
    </button>
  );
}
