export function SectionGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`section-grid ${className}`}>{children}</div>;
}
