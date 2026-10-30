import logoSrc from '@/assets/brand/logo-autohall-header.svg';

type AuthBrandProps = {
  className?: string;
  compact?: boolean;
};

/** Official Auto Hall header logo — no duplicated text */
export function AuthBrand({ className = '', compact = false }: AuthBrandProps) {
  return (
    <img
      src={logoSrc}
      alt="Auto Hall"
      className={`auth-entry-logo${compact ? ' auth-entry-logo--compact' : ''}${className ? ` ${className}` : ''}`}
      width={compact ? 128 : 148}
      height={compact ? 38 : 44}
      decoding="async"
      fetchPriority="high"
    />
  );
}
