import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/studio/ThemeToggle';
import { isAuthenticated } from '../lib/auth-storage';

export default function HomePage() {
  const authenticated = isAuthenticated();

  return (
    <main className="public-page">
      <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <h1 className="public-page__title">Auto Hall Landing Page Builder</h1>
      <p className="public-page__subtitle">
        Plateforme interne de conception et publication de landing pages marketing.
      </p>
      <p className="public-page__actions">
        <Link
          to={authenticated ? '/dashboard' : '/login'}
          className="ui-btn ui-btn--primary ui-btn--lg"
        >
          {authenticated ? 'Accéder au studio' : 'Se connecter'}
        </Link>
      </p>
    </main>
  );
}
