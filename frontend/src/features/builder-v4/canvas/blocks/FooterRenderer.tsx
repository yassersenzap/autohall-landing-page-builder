/**
 * FooterRenderer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Bloc Footer autonome — filigrane "Auto Hall" centré, colonnes de liens,
 * réseaux sociaux et copyright dynamiques.
 */

import type { FooterBlockProps } from '../../lib/pro-blocks';

const FONT = "var(--brand-font, 'Outfit', 'Inter', sans-serif)";

/** lucide-react ne fournit plus les logos de marques — tracés SVG inline (identiques à l'export ZIP). */
const SOCIAL_ICON_PATHS: Record<keyof FooterBlockProps['socialLinks'], string> = {
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  instagram: '',
  linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
  youtube: '',
};

function SocialIconSvg({ platform }: { platform: keyof FooterBlockProps['socialLinks'] }) {
  if (platform === 'instagram') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }
  if (platform === 'youtube') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={SOCIAL_ICON_PATHS[platform]} />
      {platform === 'linkedin' && (
        <>
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </>
      )}
    </svg>
  );
}

const SOCIAL_ICON_MAP: Array<{ key: keyof FooterBlockProps['socialLinks']; label: string }> = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
];

function resolveCopyrightText(template: string): string {
  return template.replace('{year}', String(new Date().getFullYear()));
}

type NavLink = { label: string; href: string; external?: boolean };

const MARQUES_LINKS_COL1: NavLink[] = [
  { label: 'Opel', href: 'https://www.autohall.ma/fr/marque/opel' },
  { label: 'DFSK', href: 'https://www.autohall.ma/fr/marque/dfsk' },
  { label: 'Mitsubishi', href: 'https://www.autohall.ma/fr/marque/mitsubishi' },
  { label: 'Fuso', href: 'https://www.autohall.ma/fr/marque/fuso' },
  { label: 'Foton', href: 'https://www.autohall.ma/fr/marque/foton' },
  { label: 'Jeep', href: 'https://www.autohall.ma/fr/marque/jeep' },
  { label: 'Alfa Romeo', href: 'https://www.autohall.ma/fr/marque/alfa-romeo' },
  { label: 'Ford Trucks', href: 'https://www.autohall.ma/fr/marque/ford-trucks' },
];

const MARQUES_LINKS_COL2: NavLink[] = [
  { label: 'Ford', href: 'https://www.autohall.ma/fr/marque/ford' },
  { label: 'Nissan', href: 'https://www.autohall.ma/fr/marque/nissan' },
  { label: 'Fiat', href: 'https://www.autohall.ma/fr/marque/fiat' },
  { label: 'Chery', href: 'https://www.autohall.ma/fr/marque/chery' },
  { label: 'Seres', href: 'https://www.autohall.ma/fr/marque/seres' },
  { label: 'Gaz', href: 'https://www.autohall.ma/fr/marque/gaz' },
  { label: 'Maserati', href: 'https://www.maserati.com/ma/fr', external: true },
  { label: 'Industriel & Agricole', href: 'https://www.case.ma/', external: true },
];

function NavLinkList({ links }: { links: NavLink[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="footer-link-custom">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>
        {children}
      </span>
      <span style={{ width: 28, height: 1, background: 'rgba(255, 255, 255, 0.35)', display: 'block' }} />
    </div>
  );
}

export function FooterBlock({ props }: { props: FooterBlockProps }) {
  const bg = props.bgColor ?? '#002C6C';
  const social = props.socialLinks ?? {};
  const legal = props.legalLinks ?? {};

  const showBrands = props.showBrandsColumn !== false;
  const showCareers = props.showCareersColumn !== false;
  const activeCols = 2 + (showBrands ? 1 : 0) + (showCareers ? 1 : 0);
  const spanClass = activeCols === 4 
    ? 'col-span-1 md:col-span-1 lg:col-span-3' 
    : activeCols === 3 
      ? 'col-span-1 md:col-span-1 lg:col-span-4' 
      : 'col-span-1 md:col-span-1 lg:col-span-6';

  const groupTitle = props.groupTitle || 'Groupe Auto Hall';
  const groupLinks: NavLink[] = [
    { label: props.groupLink1Label || 'À propos de nous', href: props.groupLink1Url || 'https://www.autohall.ma/fr/page/a-propos-de-nous' },
    { label: props.groupLink2Label || 'Actualités', href: props.groupLink2Url || 'https://www.autohall.ma/fr/actualites' },
    { label: props.groupLink3Label || 'Réseau', href: props.groupLink3Url || 'https://www.autohall.ma/fr/reseau' },
  ];

  const servicesTitle = props.servicesTitle || 'Nos Services';
  const servicesLinks: NavLink[] = [
    { label: props.servicesLink1Label || 'Vente de véhicules', href: props.servicesLink1Url || 'https://www.autohall.ma/fr/reseau' },
    { label: props.servicesLink2Label || 'Service Après-Vente', href: props.servicesLink2Url || 'https://www.autohall.ma/fr/services/apres-vente' },
    { label: props.servicesLink3Label || 'Pièces de rechange', href: props.servicesLink3Url || 'https://www.autohall.ma/fr/services/pieces-de-rechange' },
  ];

  const careersTitle = props.careersTitle || 'Carrières';
  const careersLinks: NavLink[] = [
    { label: props.careersLink1Label || 'Offres d’emploi', href: props.careersLink1Url || 'https://www.autohall.ma/fr/carrieres' },
    { label: props.careersLink2Label || 'Candidature spontanée', href: props.careersLink2Url || 'https://www.autohall.ma/fr/carrieres/candidature-spontanee' },
    { label: props.careersLink3Label || 'Pourquoi nous rejoindre', href: props.careersLink3Url || 'https://www.autohall.ma/fr/carrieres/pourquoi-nous-rejoindre' },
  ];

  const marquesLinks: NavLink[] = [
    ...MARQUES_LINKS_COL1,
    ...MARQUES_LINKS_COL2,
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-link-custom {
          font-size: 13px;
          color: #f8fafc;
          opacity: 0.9;
          text-decoration: none;
          transition: all 200ms ease;
        }
        .footer-link-custom:hover {
          color: #38bdf8;
          opacity: 1;
        }
        .footer-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transition: all 200ms ease;
        }
        .footer-social-icon:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }
      `}} />
      <footer
        style={{
          width: '100%',
          background: bg,
          color: '#ffffff',
          fontFamily: FONT,
          padding: '64px 5% 0',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-white/90"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            marginBottom: 48,
          }}
        >
          {/* Column 1: Groupe Auto Hall */}
          <div className={spanClass} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ColumnTitle>{groupTitle}</ColumnTitle>
            <NavLinkList links={groupLinks} />
          </div>

          {/* Column 2: Services */}
          <div className={spanClass} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ColumnTitle>{servicesTitle}</ColumnTitle>
            <NavLinkList links={servicesLinks} />
          </div>

          {/* Column 3: Marques (grid compact 2 colonnes interne) */}
          {showBrands && (
            <div className={spanClass} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ColumnTitle>Marques</ColumnTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {marquesLinks.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="footer-link-custom">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Column 4: Carrières + Réseaux sociaux */}
          {showCareers && (
            <div className={spanClass} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ColumnTitle>{careersTitle}</ColumnTitle>
              <NavLinkList links={careersLinks} />

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {SOCIAL_ICON_MAP.map(({ key, label }) => {
                  const url = social[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      aria-label={label}
                    >
                      <SocialIconSvg platform={key} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filigrane "Auto Hall" centré avec opacité douce de 3% */}
        <div
          style={{
            width: '100%',
            minHeight: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 0,
          }}
        >
          <span
            className="text-white/[0.03] select-none text-7xl md:text-9xl font-extrabold tracking-widest text-center"
            style={{
              color: 'rgba(255, 255, 255, 0.03)',
              userSelect: 'none',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {props.watermarkText || 'Auto Hall'}
          </span>
        </div>

        {/* Bottom footer bar */}
        <div
          className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            padding: '24px 0 32px',
            position: 'relative',
            zIndex: 1,
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 12, color: '#cbd5e1', opacity: 0.8 }}>
            {resolveCopyrightText(props.copyrightText || '© {year} Auto Hall. Tous droits réservés.')}
          </span>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {legal.politiqueConfidentialite && (
              <a href={legal.politiqueConfidentialite} target="_blank" rel="noopener noreferrer" className="footer-link-custom">Politique de Confidentialité</a>
            )}
            {legal.conditionsService && (
              <a href={legal.conditionsService} target="_blank" rel="noopener noreferrer" className="footer-link-custom">Conditions de Service</a>
            )}
            {legal.parametresCookies && (
              <a href={legal.parametresCookies} target="_blank" rel="noopener noreferrer" className="footer-link-custom">Paramètres des Cookies</a>
            )}
            {legal.mentionsLegales && (
              <a href={legal.mentionsLegales} target="_blank" rel="noopener noreferrer" className="footer-link-custom">Mentions légales</a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
