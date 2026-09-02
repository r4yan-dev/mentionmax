export function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'success' | 'warning' }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={`mm-progress mm-progress--${tone}`} aria-label={`${width}%`}>
      <div className="mm-progress__track">
        <div className="mm-progress__fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
