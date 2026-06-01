import type { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="ui-field" htmlFor={inputId}>
      <span className="ui-field__label">{label}</span>
      <input
        id={inputId}
        className={['ui-input', error ? 'ui-input--error' : '', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hint && !error ? <span className="ui-field__hint">{hint}</span> : null}
      {error ? <span className="ui-field__error">{error}</span> : null}
    </label>
  );
}
