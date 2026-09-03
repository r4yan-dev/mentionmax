import { useMemo, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Eye,
  FlaskConical,
  Focus,
  Gauge,
  Layers3,
  LayoutGrid,
  Menu,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import "./DesignLab.css";

type LabSection = "navigation" | "ia" | "components" | "states" | "motion" | "accessibility";
type NavVariant = "sidebar" | "topbar" | "command" | "contextual" | "hybrid";

const navVariants: Array<{ id: NavVariant; name: string; description: string }> = [
  { id: "sidebar", name: "Sidebar", description: "Persistent navigation with clear product areas." },
  { id: "topbar", name: "Top navigation", description: "Lightweight horizontal navigation for a wider canvas." },
  { id: "command", name: "Command center", description: "Minimal global navigation with contextual destinations." },
  { id: "contextual", name: "Contextual", description: "Navigation changes with the student's current academic context." },
  { id: "hybrid", name: "Hybrid", description: "Stable product navigation plus local subject navigation." },
];

const navItems = [
  { label: "Accueil", icon: LayoutGrid },
  { label: "Apprendre", icon: BookOpen },
  { label: "S'entraîner", icon: BrainCircuit },
  { label: "IA", icon: Sparkles },
  { label: "Examens", icon: ClipboardIcon },
  { label: "Focus", icon: Focus },
];

function ClipboardIcon(props: { size?: number }) {
  return <Layers3 {...props} />;
}

const labSections: Array<{ id: LabSection; label: string; icon: typeof Compass }> = [
  { id: "navigation", label: "Navigation", icon: Compass },
  { id: "ia", label: "Information architecture", icon: Layers3 },
  { id: "components", label: "Components", icon: LayoutGrid },
  { id: "states", label: "States", icon: Gauge },
  { id: "motion", label: "Motion", icon: Sparkles },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
];

const hierarchy = [
  ["Accueil", "Continue", "Recommendations", "Weakness", "Activity"],
  ["Apprendre", "Matières", "Chapitres", "Cours", "Fiches"],
  ["S'entraîner", "Exercices", "QCM", "Difficultés", "Personnalisé"],
  ["IA", "Comprendre", "Corriger", "Générer", "Réviser"],
  ["Examens", "Nationaux", "Tests", "Simulations", "Corrections"],
  ["Focus", "Session", "Groupes", "Classement", "Stats"],
];

const componentCatalog = [
  ["Button", "Actions should have clear hierarchy."],
  ["Card", "Contain one decision or one piece of content."],
  ["Search", "Find content without making students navigate blindly."],
  ["Tabs", "Switch between peer views without losing context."],
  ["Progress", "Show where the student is and what remains."],
  ["Badge", "Reward an achievement without overwhelming the UI."],
];

const stateCatalog = [
  ["Loading", "Skeletons preserve structure while content arrives."],
  ["Empty", "Explain why the state is empty and give one useful next action."],
  ["Error", "State the problem plainly and provide recovery."],
  ["Locked", "Explain the requirement rather than hiding the feature."],
  ["Success", "Confirm the result and suggest the next useful step."],
  ["Offline", "Keep essential local actions usable and explain limitations."],
];

export default function DesignLab() {
  const [section, setSection] = useState<LabSection>("navigation");
  const [variant, setVariant] = useState<NavVariant>("hybrid");
  const [mobile, setMobile] = useState(false);
  const activeVariant = useMemo(() => navVariants.find((item) => item.id === variant) ?? navVariants[0], [variant]);

  return (
    <main className="design-lab-page">
      <header className="design-lab-hero">
        <div>
          <span className="section-eyebrow">DESIGN LAB</span>
          <h1>Master the interface, not just the screens.</h1>
          <p>
            A working laboratory for MentionMax information architecture, navigation, components, states, motion and accessibility.
            Use it to compare systems before pushing a design into the product.
          </p>
        </div>
        <div className="design-lab-score">
          <span>Design system maturity</span>
          <strong>01 / 06</strong>
          <small>Build · compare · simplify</small>
        </div>
      </header>

      <nav className="design-lab-tabs" aria-label="Design laboratory sections">
        {labSections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={section === id ? "active" : ""} onClick={() => setSection(id)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {section === "navigation" && (
        <section className="design-lab-stack">
          <div className="design-lab-grid design-lab-grid--intro">
            <section className="design-lab-panel">
              <div className="design-lab-panel__head">
                <div>
                  <span className="section-eyebrow">01 · NAVIGATION</span>
                  <h2>Compare five information architectures</h2>
                </div>
                <button type="button" className="design-lab-mobile-toggle" onClick={() => setMobile((value) => !value)}>
                  <Menu size={15} /> {mobile ? "Desktop preview" : "Mobile preview"}
                </button>
              </div>
              <p className="design-lab-muted">The content stays constant. Only the way a student reaches it changes.</p>
              <div className="design-lab-variant-grid">
                {navVariants.map((item) => (
                  <button key={item.id} type="button" className={`design-lab-variant ${variant === item.id ? "active" : ""}`} onClick={() => setVariant(item.id)}>
                    <strong>{item.name}</strong>
                    <span>{item.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <aside className="design-lab-principles">
              <span className="section-eyebrow">RULE</span>
              <h3>Navigation answers three questions.</h3>
              <div className="design-lab-principle"><Check size={14} /><span>Where am I?</span></div>
              <div className="design-lab-principle"><Check size={14} /><span>What can I do here?</span></div>
              <div className="design-lab-principle"><Check size={14} /><span>Where should I go next?</span></div>
            </aside>
          </div>

          <section className={`design-lab-preview ${mobile ? "is-mobile" : ""}`}>
            <div className="design-lab-preview__top">
              <div>
                <span className="section-eyebrow">LIVE PREVIEW</span>
                <h2>{activeVariant.name}</h2>
              </div>
              <span className="design-lab-preview__path">Accueil / Physique-Chimie / Ondes</span>
            </div>
            <div className={`nav-lab-shell nav-lab-shell--${variant}`}>
              <div className="nav-lab-brand"><span>m</span><strong>MentionMax</strong></div>
              <div className="nav-lab-navigation">
                {navItems.map(({ label, icon: Icon }, index) => (
                  <button key={label} type="button" className={index === 1 ? "active" : ""}>
                    <Icon size={16} />
                    <span>{label}</span>
                    {label === "Apprendre" && <ChevronRight size={13} />}
                  </button>
                ))}
              </div>
              <div className="nav-lab-main">
                <div className="nav-lab-toolbar">
                  <div className="nav-lab-search"><Search size={15} /> Rechercher dans MentionMax</div>
                  <div className="nav-lab-avatar">RA</div>
                </div>
                <div className="nav-lab-context">
                  <span className="design-lab-kicker">PHYSIQUE-CHIMIE</span>
                  <h3>Ondes mécaniques progressives</h3>
                  <p>Comprendre → pratiquer → corriger → réviser</p>
                  <div className="nav-lab-actions"><button type="button">Continuer</button><button type="button" className="ghost">Voir le chapitre</button></div>
                </div>
              </div>
            </div>
          </section>
        </section>
      )}

      {section === "ia" && (
        <section className="design-lab-stack">
          <section className="design-lab-panel">
            <span className="section-eyebrow">02 · INFORMATION ARCHITECTURE</span>
            <h2>Keep the academic hierarchy obvious</h2>
            <p className="design-lab-muted">MentionMax is a learning graph. Every screen should preserve the path between product area, subject, chapter, concept and action.</p>
            <div className="ia-tree">
              {hierarchy.map((branch) => (
                <div className="ia-branch" key={branch[0]}>
                  <strong>{branch[0]}</strong>
                  <div>{branch.slice(1).map((leaf) => <span key={leaf}>{leaf}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}

      {section === "components" && (
        <section className="design-lab-stack">
          <section className="design-lab-panel">
            <span className="section-eyebrow">03 · COMPONENTS</span>
            <h2>A component earns its existence by solving a repeated problem.</h2>
            <div className="design-lab-component-grid">
              {componentCatalog.map(([name, description]) => (
                <article className="design-lab-component" key={name}>
                  <div className="design-lab-component__icon"><LayoutGrid size={17} /></div>
                  <strong>{name}</strong>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}

      {section === "states" && (
        <section className="design-lab-stack">
          <section className="design-lab-panel">
            <span className="section-eyebrow">04 · STATES</span>
            <h2>Design the moments where nothing goes according to plan.</h2>
            <div className="design-lab-state-grid">
              {stateCatalog.map(([name, description], index) => (
                <article className="design-lab-state" key={name}>
                  <div className={`state-indicator state-indicator--${index % 3}`} />
                  <strong>{name}</strong>
                  <p>{description}</p>
                  <button type="button">Preview <ArrowRight size={14} /></button>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}

      {section === "motion" && (
        <section className="design-lab-stack">
          <section className="design-lab-panel">
            <span className="section-eyebrow">05 · MOTION</span>
            <h2>Motion should explain change.</h2>
            <div className="motion-stage">
              <div className="motion-orbit motion-orbit--one"><Sparkles size={17} /></div>
              <div className="motion-orbit motion-orbit--two"><BadgeCheck size={19} /></div>
              <div className="motion-core"><Trophy size={26} /></div>
            </div>
            <div className="motion-rules">
              <span><Clock3 size={14} /> Micro feedback · 120ms</span>
              <span><Gauge size={14} /> Page transition · 240ms</span>
              <span><Sparkles size={14} /> Achievement reveal · 1.8s</span>
            </div>
          </section>
        </section>
      )}

      {section === "accessibility" && (
        <section className="design-lab-stack">
          <section className="design-lab-panel">
            <span className="section-eyebrow">06 · ACCESSIBILITY</span>
            <h2>Make the design usable before making it beautiful.</h2>
            <div className="a11y-checklist">
              <div><Accessibility size={17} /><strong>Keyboard navigation</strong><span>Every interactive control has a visible focus state.</span></div>
              <div><Eye size={17} /><strong>Readable contrast</strong><span>Text, icons and status colors remain distinguishable.</span></div>
              <div><Focus size={17} /><strong>Reduced motion</strong><span>Animations can be reduced without losing context.</span></div>
              <div><Search size={17} /><strong>Findability</strong><span>Search and navigation remain understandable without color alone.</span></div>
              <div><FlaskConical size={17} /><strong>Robust states</strong><span>Loading, error, empty and offline states are intentional.</span></div>
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
