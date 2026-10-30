import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import type { MediaAsset } from '../../types/assets.types';
import { MediaImage } from '../../media/MediaImage';

type AssetPreviewDialogProps = {
  asset: MediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (asset: MediaAsset) => void;
  canApply: boolean;
};

export function AssetPreviewDialog({
  asset,
  open,
  onOpenChange,
  onApply,
  canApply,
}: AssetPreviewDialogProps) {
  if (!asset) return null;

  const dimensions =
    asset.width && asset.height ? `${asset.width} × ${asset.height}px` : 'Dimensions inconnues';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-zinc-800 bg-zinc-950 text-zinc-100" data-testid="asset-preview-dialog">
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {dimensions}
            {asset.sizeBytes ? ` · ${(asset.sizeBytes / 1024).toFixed(0)} Ko` : null}
          </DialogDescription>
        </DialogHeader>
        <div className="v4-assets-preview__frame">
          <MediaImage
            src={asset.src}
            alt={asset.name}
            variant="preview"
            imgClassName="v4-assets-preview__img"
            testId="asset-preview-media"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-900"
            onClick={() => onApply(asset)}
            disabled={!canApply}
            data-testid="asset-preview-apply"
          >
            Appliquer au node image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
