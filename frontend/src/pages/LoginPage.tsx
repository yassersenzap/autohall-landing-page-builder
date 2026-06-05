import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/studio/ThemeToggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ShadButton,
  ShadInput,
} from '@/components/ui/primitives';
import { ApiError, loginRequest } from '@/lib/api';
import { isAuthenticated, setAccessToken } from '@/lib/auth-storage';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

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
    <main className="ah-mesh-app relative flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="login-card-premium relative z-[1] w-full max-w-md !transform-none">
        <CardHeader className="space-y-2 text-center">
          <p className="ah-section-title">Auto Hall</p>
          <CardTitle className="ah-page-title text-center">Landing Studio</CardTitle>
          <CardDescription className="ah-muted text-center">
            Accès réservé aux équipes Auto Hall.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <ShadInput
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <ShadInput
              label="Mot de passe"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <ShadButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Connexion…' : 'Se connecter'}
            </ShadButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="font-medium text-primary hover:underline">
              Retour à l&apos;accueil
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
