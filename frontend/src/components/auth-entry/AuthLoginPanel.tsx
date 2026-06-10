import { motion, useReducedMotion } from 'framer-motion';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthBrand } from './AuthBrand';

type AuthLoginPanelProps = {
  centered?: boolean;
  mode: 'login' | 'reset';
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResetSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
  onBackToLogin: () => void;
};

export function AuthLoginPanel({
  centered = false,
  mode,
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onLoginSubmit,
  onResetSubmit,
  onForgotPassword,
  onBackToLogin,
}: AuthLoginPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`auth-entry-login${centered ? ' auth-entry-login--centered' : ''}`}>
      <motion.div
        className="auth-entry-login-card"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="auth-entry-login-card__brand" aria-label="Auto Hall Landing Studio">
          <AuthBrand compact />
        </Link>

        <h1 className="auth-entry-login-card__title">
          {mode === 'login' ? 'Connexion sécurisée' : 'Réinitialisation'}
        </h1>
        <p className="auth-entry-login-card__subtitle">
          {mode === 'login'
            ? 'Accès réservé aux équipes Auto Hall.'
            : 'Saisissez votre email professionnel pour recevoir un lien de récupération.'}
        </p>

        {mode === 'login' ? (
          <form onSubmit={onLoginSubmit}>
            <div className="auth-entry-field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
              />
            </div>
            <div className="auth-entry-field">
              <label htmlFor="auth-password">Mot de passe</label>
              <input
                id="auth-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
                minLength={8}
              />
            </div>
            {error ? <p className="auth-entry-login-card__error">{error}</p> : null}
            <button
              type="submit"
              className="auth-entry-btn auth-entry-btn--primary auth-entry-login-card__submit"
              disabled={loading}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
            <button
              type="button"
              className="auth-entry-login-card__link"
              onClick={onForgotPassword}
            >
              Mot de passe oublié ?
            </button>
          </form>
        ) : (
          <form onSubmit={onResetSubmit}>
            <div className="auth-entry-field">
              <label htmlFor="auth-reset-email">Email</label>
              <input
                id="auth-reset-email"
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
              />
            </div>
            {error ? <p className="auth-entry-login-card__error">{error}</p> : null}
            <button
              type="submit"
              className="auth-entry-btn auth-entry-btn--primary auth-entry-login-card__submit"
              disabled={loading}
            >
              {loading ? 'Envoi…' : 'Envoyer le lien de récupération'}
            </button>
            <button
              type="button"
              className="auth-entry-login-card__link"
              onClick={onBackToLogin}
            >
              Retour à la connexion
            </button>
          </form>
        )}

        <p className="auth-entry-login-card__footer">
          <Link to="/">Retour à l&apos;accueil</Link>
        </p>
      </motion.div>
    </div>
  );
}
