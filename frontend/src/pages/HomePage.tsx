import { Link } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth-storage';

export default function HomePage() {
  const authenticated = isAuthenticated();

  return (
    <main className="app">
      <h1 className="app__title">Auto Hall Landing Page Builder</h1>
      <p className="app__subtitle">
        Plateforme interne de génération de landing pages
      </p>
      <p className="app__actions">
        {authenticated ? (
          <Link to="/dashboard">Accéder au tableau de bord</Link>
        ) : (
          <Link to="/login">Se connecter</Link>
        )}
      </p>
    </main>
  );
}
