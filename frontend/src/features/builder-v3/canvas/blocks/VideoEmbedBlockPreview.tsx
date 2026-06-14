import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';
import { resolveVideoEmbedUrl } from '../../lib/video-embed-url';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type VideoEmbedBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function VideoEmbedBlockPreview({ propsJson }: VideoEmbedBlockPreviewProps) {
  const design = normalizeSectionDesign('video_embed', propsJson);
  const { className: sectionClass } = mergeBlockSectionPresentation(
    `lp-block ${buildBlockDesignClasses('lp-video-embed', design)}`,
    'video_embed',
    propsJson,
  );
  const videoUrl = asPropString(propsJson.videoUrl);
  const title = asPropString(propsJson.title);
  const embedUrl = resolveVideoEmbedUrl(videoUrl);

  return (
    <section className={sectionClass}>
      <div className="lp-section">
        {title ? (
          <h2 className="lp-video-embed__title">{title}</h2>
        ) : (
          <CanvasEmptyHint className="lp-video-embed__title">Vidéo</CanvasEmptyHint>
        )}
        <div className="lp-video-embed__frame">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title || 'Vidéo campagne Auto Hall'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="lp-media__placeholder" aria-hidden />
          )}
        </div>
      </div>
    </section>
  );
}
