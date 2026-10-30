import type { BuilderNode, ImageNodeProps } from '../../types/nodes.types';
import type { MediaAsset } from '../../types/assets.types';

const DEFAULT_ASPECT = '1200 / 628';

export function resolveHeroAspectRatio(
  nodes: Record<string, BuilderNode>,
  getAsset: (id: string) => MediaAsset | undefined,
): string {
  const heroImage = Object.values(nodes).find((node) => node.name === 'HeroImage');
  if (!heroImage || heroImage.kind !== 'image') return DEFAULT_ASPECT;

  const props = heroImage.props as ImageNodeProps;
  if (props.assetId) {
    const asset = getAsset(props.assetId);
    if (asset?.width && asset?.height && asset.height > 0) {
      return `${asset.width} / ${asset.height}`;
    }
  }

  return DEFAULT_ASPECT;
}
