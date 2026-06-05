import { asPropString } from '@/features/builder-engine/lib/block-props';
import { resolveVideoEmbedUrl } from '../../lib/video-embed-url';

type VideoEmbedBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function VideoEmbedBlockPreview({ propsJson }: VideoEmbedBlockPreviewProps) {
  const videoUrl = asPropString(propsJson.videoUrl);
  const title = asPropString(propsJson.title) || 'Vidéo campagne';
  const embedUrl = resolveVideoEmbedUrl(videoUrl);

  return (
    <section className="w-full bg-neutral-50 px-6 py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl">
        {title ? (
          <h2
            className="mb-8 text-center text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h2>
        ) : null}
        <div className="aspect-video overflow-hidden rounded-2xl bg-neutral-200 shadow-2xl dark:bg-neutral-800">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-neutral-500">
              Collez une URL YouTube ou Vimeo dans l&apos;inspecteur.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
