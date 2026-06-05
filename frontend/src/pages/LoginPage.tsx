import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/studio/ThemeToggle';
import { StudioToast } from '@/components/ui/StudioToast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ShadButton,
  ShadInput,
} from '@/components/ui/primitives';
import { useStudioToast } from '@/components/ui/use-studio-toast';
import { ApiError, forgotPasswordRequest, loginRequest } from '@/lib/api';
import { isAuthenticated, setAccessToken } from '@/lib/auth-storage';

type AuthMode = 'login' | 'reset';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const { toast, showSuccess, dismiss } = useStudioToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('admin@autohall.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await Promise.all([
        forgotPasswordRequest({ email }),
        new Promise((resolve) => window.setTimeout(resolve, 500)),
      ]);
    } catch {
      // Réponse générique pour éviter l'énumération d'emails.
    } finally {
      showSuccess('Si cet email existe, un lien a été envoyé.');
      setMode('login');
      setLoading(false);
    }
  }

  return (
    <main className="ah-mesh-app relative flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="login-card-premium relative z-1 w-full max-w-md !transform-none">
        <CardHeader className="space-y-2 text-center">
          <p className="ah-section-title">Auto Hall</p>
          <CardTitle className="ah-page-title text-center">
            {mode === 'login' ? 'Landing Studio' : 'Réinitialisation'}
          </CardTitle>
          <CardDescription className="ah-muted text-center">
            {mode === 'login'
              ? 'Accès réservé aux équipes Auto Hall.'
              : 'Saisissez votre email professionnel pour recevoir un lien de récupération.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
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
              <p className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => {
                    setError(null);
                    setMode('reset');
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </p>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleResetSubmit}>
              <ShadInput
                label="Email"
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <ShadButton type="submit" disabled={loading} className="w-full">
                {loading ? 'Envoi…' : 'Envoyer le lien de récupération'}
              </ShadButton>
              <p className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                >
                  Retour à la connexion
                </button>
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="font-medium text-primary hover:underline">
              Retour à l&apos;accueil
            </Link>
          </p>
        </CardContent>
      </Card>

      <StudioToast toast={toast} onDismiss={dismiss} />
    </main>
  );
}
