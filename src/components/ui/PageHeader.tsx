interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <span className="badge-pill">{eyebrow}</span>
        <h1>{title}</h1>
        {description ? <p className="hero__description">{description}</p> : null}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}
