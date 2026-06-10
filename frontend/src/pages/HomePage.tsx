import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthEntryNavbar, AuthEntryShell, AuthHeroProductVisual } from '@/components/auth-entry';
import { isAuthenticated } from '@/lib/auth-storage';

const PROCESS = [
  { num: '01', label: 'Concevoir', detail: 'Structurez la page campagne et validez le rendu.' },
  { num: '02', label: 'Publier', detail: 'Préparez un export propre pour l’environnement de diffusion.' },
  { num: '03', label: 'Suivre', detail: 'Reliez chaque soumission à sa campagne et à sa page.' },
] as const;

const PLATFORM = [
  { title: 'Espace sécurisé', description: 'Accès réservé aux équipes autorisées.' },
  { title: 'Publication contrôlée', description: 'Pages autonomes, légères et prêtes à déployer.' },
  { title: 'Traçabilité commerciale', description: 'Soumissions rattachées aux campagnes et pages.' },
] as const;

export default function HomePage() {
  const authenticated = isAuthenticated();
  const reduceMotion = useReducedMotion();
  const loginHref = authenticated ? '/dashboard' : '/login';
  const ctaLabel = authenticated ? 'Ouvrir le studio' : 'Accéder au studio';

  return (
    <AuthEntryShell variant="home">
      <AuthEntryNavbar loginHref={loginHref} ctaLabel={ctaLabel} />

      <section className="auth-entry-hero" aria-labelledby="hero-title">
        <motion.div
          className="auth-entry-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="auth-entry-hero__badge">Auto Hall Landing Studio</span>
          <h1 id="hero-title" className="auth-entry-hero__title">
            De l’idée campagne à la publication, dans un flux maîtrisé.
          </h1>
          <p className="auth-entry-hero__subtitle">
            Un espace sécurisé pour concevoir vos pages, gérer les versions, préparer les exports
            et suivre les signaux commerciaux générés par chaque campagne.
          </p>
          <div className="auth-entry-hero__cta">
            <Link to={loginHref} className="auth-entry-btn auth-entry-btn--primary auth-entry-btn--lg">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="auth-entry-hero__note">Réservé aux équipes autorisées</span>
          </div>
        </motion.div>

        <div className="auth-entry-hero__visual">
          <AuthHeroProductVisual />
        </div>
      </section>

      <div className="auth-entry-sections">
        <section id="flux" className="auth-entry-section">
          <h2 className="auth-entry-section__title">Un flux de production clair</h2>
          <ol className="auth-entry-editorial">
            {PROCESS.map((step) => (
              <li key={step.num} className="auth-entry-editorial__item">
                <span className="auth-entry-editorial__num">{step.num}</span>
                <div>
                  <h3>{step.label}</h3>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="plateforme" className="auth-entry-section">
          <h2 className="auth-entry-section__title">Pensé pour les opérations Auto Hall</h2>
          <ul className="auth-entry-proof-list">
            {PLATFORM.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="acces" className="auth-entry-section auth-entry-section--last">
          <h2 className="auth-entry-section__title">Accès sur invitation</h2>
          <p className="auth-entry-access__text">
            Réservé aux équipes marketing et digitales Auto Hall.
          </p>
          <Link to={loginHref} className="auth-entry-access__cta">
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </section>
      </div>
    </AuthEntryShell>
  );
}
