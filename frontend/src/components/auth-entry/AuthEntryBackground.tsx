type AuthEntryBackgroundProps = {
  variant?: 'home' | 'login';
};

/** Minimal stable background — no 3D, no trace noise */
export function AuthEntryBackground({ variant = 'home' }: AuthEntryBackgroundProps) {
  return (
    <div className={`auth-entry-bg auth-entry-bg--${variant}`} aria-hidden>
      <div className="auth-entry-bg__spotlight" />
      <div className="auth-entry-bg__grid" />
    </div>
  );
}
