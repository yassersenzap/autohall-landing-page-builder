import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  backLabel?: string;
  backState?: unknown;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Retour',
  backState,
  actions,
}: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      <div className="ui-page-header__main">
        {backTo ? (
          <Link to={backTo} state={backState} className="ui-page-header__back">
            ← {backLabel}
          </Link>
        ) : null}
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle ? <p className="ui-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </header>
  );
}
