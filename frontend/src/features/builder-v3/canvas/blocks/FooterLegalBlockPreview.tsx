import { asPropString } from '@/features/builder-engine/lib/block-props';

type FooterLegalBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FooterLegalBlockPreview({ propsJson }: FooterLegalBlockPreviewProps) {
  const legalText =
    asPropString(propsJson.legalText) ||
    '© Auto Hall — Tous droits réservés. Mentions légales, politique de confidentialité et conditions générales disponibles sur demande en concession.';
  const rawLinks = Array.isArray(propsJson.links) ? propsJson.links : [];
  const links = rawLinks as Array<{ label?: string; href?: string }>;

  return (
    <footer className="relative border-t border-neutral-800 bg-neutral-950 px-6 py-10">
      <div className="relative z-10 mx-auto max-w-7xl space-y-4">
        {links.length > 0 ? (
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {links.map((link, index) => {
              const label = link.label || `Lien ${index + 1}`;
              return (
                <span key={`${label}-${index}`} className="text-xs text-neutral-400 underline-offset-2 hover:underline">
                  {label}
                </span>
              );
            })}
          </nav>
        ) : null}
        <p className="text-xs leading-relaxed text-neutral-400">{legalText}</p>
        <p className="text-[0.625rem] uppercase tracking-wider text-neutral-600">
          Auto Hall · Landing Studio
        </p>
      </div>
    </footer>
  );
}
