import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudioTheme } from '@/context/StudioThemeContext';
import { AuthBrand } from './AuthBrand';
import { AuthMegaMenu } from './AuthMegaMenu';

const NAV_ITEMS = [
  { label: 'Flux', href: '#flux' },
  { label: 'Plateforme', href: '#plateforme' },
  { label: 'Accès', href: '#acces' },
] as const;

type AuthEntryNavbarProps = {
  loginHref?: string;
  ctaLabel?: string;
  showNavLinks?: boolean;
};

export function AuthEntryNavbar({
  loginHref = '/login',
  ctaLabel = 'Accéder au studio',
  showNavLinks = true,
}: AuthEntryNavbarProps) {
  const { mode, toggleMode } = useStudioTheme();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const produitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!megaOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (produitRef.current && !produitRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMegaOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [megaOpen]);

  return (
    <>
      <header className={`auth-entry-nav${scrolled ? ' auth-entry-nav--scrolled' : ''}`}>
        <div className="auth-entry-nav__inner">
          <Link to="/" className="auth-entry-nav__brand" aria-label="Auto Hall Landing Studio">
            <AuthBrand />
          </Link>

          {showNavLinks ? (
            <nav className="auth-entry-nav__links" aria-label="Navigation principale">
              <div ref={produitRef} className="auth-entry-nav__produit">
                <button
                  type="button"
                  className={`auth-entry-nav__link${megaOpen ? ' auth-entry-nav__link--active' : ''}`}
                  aria-expanded={megaOpen}
                  aria-haspopup="menu"
                  onClick={() => setMegaOpen((open) => !open)}
                >
                  Produit
                  <ChevronDown
                    className="auth-entry-nav__chevron"
                    style={{ transform: megaOpen ? 'rotate(180deg)' : undefined }}
                    aria-hidden
                  />
                </button>
                <AnimatePresence>
                  {megaOpen ? (
                    <AuthMegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
                  ) : null}
                </AnimatePresence>
              </div>
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} className="auth-entry-nav__link">
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          <div className="auth-entry-nav__actions">
            <button
              type="button"
              className="auth-entry-theme-toggle"
              onClick={toggleMode}
              aria-label={mode === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
            >
              {mode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link to={loginHref} className="auth-entry-btn auth-entry-btn--primary">
              {ctaLabel}
            </Link>
            {showNavLinks ? (
              <button
                type="button"
                className="auth-entry-nav__menu-btn"
                aria-label="Menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && showNavLinks ? (
          <motion.div
            className="auth-entry-drawer"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="auth-entry-drawer__panel"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="auth-entry-drawer__head">
                <span>Menu</span>
                <button type="button" className="auth-entry-nav__menu-btn" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="auth-entry-drawer__links">
                <a href="#flux" className="auth-entry-nav__link" onClick={() => setMobileOpen(false)}>
                  Flux
                </a>
                <a href="#plateforme" className="auth-entry-nav__link" onClick={() => setMobileOpen(false)}>
                  Plateforme
                </a>
                <a href="#acces" className="auth-entry-nav__link" onClick={() => setMobileOpen(false)}>
                  Accès
                </a>
                <Link to={loginHref} className="auth-entry-btn auth-entry-btn--primary" onClick={() => setMobileOpen(false)}>
                  {ctaLabel}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
