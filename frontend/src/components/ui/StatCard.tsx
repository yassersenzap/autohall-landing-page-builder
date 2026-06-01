type StatCardProps = {
  label: string;
  value: string | number;
  highlight?: 'warning' | 'accent';
};

export function StatCard({ label, value, highlight }: StatCardProps) {
  const classes = [
    'ui-stat-card',
    highlight === 'warning' ? 'ui-stat-card--warning' : '',
    highlight === 'accent' ? 'ui-stat-card--accent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      <p className="ui-stat-card__label">{label}</p>
      <p className="ui-stat-card__value">{value}</p>
    </article>
  );
}
