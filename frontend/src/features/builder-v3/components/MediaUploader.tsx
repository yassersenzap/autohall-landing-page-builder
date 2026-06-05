import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import { Label, ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type MediaUploaderProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
};

export function MediaUploader({
  label = 'Visuel véhicule',
  value,
  onChange,
  className,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const applyFile = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
    },
    [onChange],
  );

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    applyFile(file ?? null);
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-neutral-400">{label}</Label>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
          <img src={value} alt="Aperçu" className="h-32 w-full object-cover" />
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="absolute right-2 top-2 h-7 w-7 border-neutral-600 bg-neutral-950/80 p-0"
            onClick={() => onChange('')}
            aria-label="Supprimer l'image"
          >
            <X className="h-3.5 w-3.5" />
          </ShadButton>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-900',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
            {dragOver ? <Upload className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
          </div>
          <p className="text-xs font-medium text-neutral-300">
            Glissez l&apos;image du véhicule ici
          </p>
          <p className="text-[0.625rem] text-neutral-500">PNG, JPG — aperçu local instantané</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
