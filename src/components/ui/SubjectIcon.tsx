export type SubjectType = 'math' | 'physics' | 'svt' | 'french' | 'philosophy' | 'english';

const icons: Record<SubjectType, string> = {
  math: 'M', physics: 'P', svt: 'S', french: 'F', philosophy: 'Φ', english: 'E',
};

export function SubjectIcon({ type, label }: { type: SubjectType; label?: string }) {
  return (
    <span className={`subject-icon-chip subject-icon-chip--${type}`} aria-label={label ?? type}>
      {icons[type]}
    </span>
  );
}
