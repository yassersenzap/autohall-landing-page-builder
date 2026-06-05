import { ArrowRight, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/studio/ThemeToggle';
import { isAuthenticated } from '../lib/auth-storage';

export default function HomePage() {
  const authenticated = isAuthenticated();

  return (
    <main className="ah-mesh-app relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-1 w-full max-w-xl text-center">
        <span className="ah-glass mb-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
            <PenLine className="h-3 w-3" aria-hidden />
          </span>
          Auto Hall · Outil interne
        </span>

        <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)] sm:text-5xl">
          Auto Hall Landing Studio
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-[0.95rem] leading-relaxed text-[var(--color-text-muted)]">
          Concevez, prévisualisez et exportez vos landing pages marketing dans un
          éditeur visuel pensé pour la production.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to={authenticated ? '/dashboard' : '/login'}
            className="ah-btn ah-btn--primary ah-btn--lg"
          >
            {authenticated ? 'Ouvrir le tableau de bord' : 'Se connecter'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}
