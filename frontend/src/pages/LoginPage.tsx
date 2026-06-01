import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/studio/ThemeToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ApiError, loginRequest } from '../lib/api';
import { isAuthenticated, setAccessToken } from '../lib/auth-storage';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('admin@autohall.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginRequest({ email, password });
      setAccessToken(response.data.accessToken);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Connexion impossible. Vérifiez que le backend est démarré.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <section className="auth-card">
        <h1 className="auth-card__title">Connexion</h1>
        <p className="auth-card__subtitle">
          Accès réservé aux utilisateurs Auto Hall.
        </p>

        <form className="ui-form-stack" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <p className="auth-card__footer">
          <Link to="/" className="ui-link">
            Retour à l&apos;accueil
          </Link>
        </p>
      </section>
    </main>
  );
}
