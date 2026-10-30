import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudioTheme } from '@/context/StudioThemeContext';
import { AuthBrand } from './AuthBrand';

type AuthEntryNavbarProps = {
  loginHref?: string;
  ctaLabel?: string;
};

export function AuthEntryNavbar({ loginHref = '/login', ctaLabel = 'Accéder au studio' }: AuthEntryNavbarProps) {
  const { mode, toggleMode } = useStudioTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`auth-entry-nav${scrolled ? ' auth-entry-nav--scrolled' : ''}`}>
      <div className="auth-entry-nav__inner">
        <Link to="/" className="auth-entry-nav__brand" aria-label="Auto Hall Landing Studio">
          <AuthBrand />
        </Link>

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
        </div>
      </div>
    </header>
  );
}
