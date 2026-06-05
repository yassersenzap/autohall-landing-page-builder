import {
  Fuel,
  Gauge,
  Settings2,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { asPropString } from '@/features/builder-engine/lib/block-props';

type FeatureItem = {
  title?: string;
  description?: string;
  icon?: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
  fuel: Fuel,
  gauge: Gauge,
  settings: Settings2,
  shield: Shield,
  zap: Zap,
};

type VehicleFeaturesBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function resolveIcon(name?: string): LucideIcon {
  if (!name) return Settings2;
  return ICON_MAP[name.toLowerCase()] ?? Settings2;
}

export function VehicleFeaturesBlockPreview({ propsJson }: VehicleFeaturesBlockPreviewProps) {
  const heading = asPropString(propsJson.heading) || 'Caractéristiques clés';
  const subtitle = asPropString(propsJson.subtitle);
  const rawItems = Array.isArray(propsJson.items) ? propsJson.items : [];
  const items = (rawItems as FeatureItem[]).slice(0, 6);

  return (
    <section className="relative bg-white px-6 py-16 sm:px-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {heading}
          </h2>
          {subtitle ? <p className="mt-2 text-sm text-neutral-600">{subtitle}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const title = item.title || `Caractéristique ${index + 1}`;
            const description = item.description || '';
            return (
              <article
                key={`${title}-${index}`}
                className="group rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: 'var(--primary, var(--lp-primary, #b91c1c))' }}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3
                  className="text-base font-semibold text-neutral-900"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {title}
                </h3>
                {description ? (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{description}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
