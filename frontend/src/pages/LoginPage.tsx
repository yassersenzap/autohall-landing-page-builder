import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthEntryNavbar, AuthEntryShell, AuthLoginPanel } from '@/components/auth-entry';
import { StudioToast } from '@/components/ui/StudioToast';
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
    <AuthEntryShell variant="login">
      <AuthEntryNavbar showNavLinks={false} />

      <AuthLoginPanel
        centered
        mode={mode}
        email={email}
        password={password}
        error={error}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLoginSubmit={handleLoginSubmit}
        onResetSubmit={handleResetSubmit}
        onForgotPassword={() => {
          setError(null);
          setMode('reset');
        }}
        onBackToLogin={() => {
          setError(null);
          setMode('login');
        }}
      />

      <StudioToast toast={toast} onDismiss={dismiss} />
    </AuthEntryShell>
  );
}
