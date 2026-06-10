import type { ReactNode } from 'react';
import { AuthEntryBackground } from './AuthEntryBackground';
import '@/styles/auth-entry.css';

type AuthEntryShellProps = {
  children: ReactNode;
  variant?: 'home' | 'login';
};

export function AuthEntryShell({ children, variant = 'home' }: AuthEntryShellProps) {
  return (
    <div
      className={`auth-entry-shell auth-entry-shell--${variant}`}
      data-auth-entry
    >
      <AuthEntryBackground variant={variant} />
      <div className="auth-entry-shell__content">{children}</div>
    </div>
  );
}
