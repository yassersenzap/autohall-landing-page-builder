import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Select({
  label,
  hint,
  error,
  className = '',
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="ui-field" htmlFor={selectId}>
      <span className="ui-field__label">{label}</span>
      <select
        id={selectId}
        className={['ui-select', error ? 'ui-input--error' : '', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </select>
      {hint && !error ? <span className="ui-field__hint">{hint}</span> : null}
      {error ? <span className="ui-field__error">{error}</span> : null}
    </label>
  );
}
