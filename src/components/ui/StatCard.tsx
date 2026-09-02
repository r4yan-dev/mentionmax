export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="stat-card card">
      <span className="stat__label">{label}</span>
      <strong className="stat__number">{value}</strong>
      {hint ? <span className="stat-card__hint">{hint}</span> : null}
    </article>
  );
}
