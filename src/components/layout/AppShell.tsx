import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon } from "../navigation/Icon";
import { useAuth } from "../../context/AuthContext";
import { CommandPalette } from "../command/CommandPalette";
import MentionMaxMark from "../../assets/brand/mentionmax-mark.svg";
import "../../styles/navigation-overrides.css";

const primaryNav = [
  { label: "Accueil", to: "/accueil", icon: "home" as const },
  { label: "Matières", to: "/subjects", icon: "lessons" as const },
  { label: "Exercices", to: "/exercices", icon: "tests" as const },
  { label: "IA", to: "/ai-help", icon: "ai" as const },
  { label: "Examens", to: "/exams", icon: "tests" as const },
  { label: "Focus", to: "/focus", icon: "focus" as const },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const examsArea = location.pathname.startsWith("/exams") || location.pathname.startsWith("/tests");
  const subjectsArea = location.pathname.startsWith("/subjects") || location.pathname.startsWith("/lecons");
  const exercisesArea = location.pathname.startsWith("/exercices") || location.pathname.startsWith("/pratique");
  const aiArea = location.pathname.startsWith("/ai-help") || location.pathname.startsWith("/ai-studio");
  const focusArea = location.pathname.startsWith("/focus");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setProfileOpen(false);
        setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function itemIsActive(to: string, isActive: boolean) {
    if (to === "/exams") return examsArea;
    if (to === "/subjects") return subjectsArea;
    if (to === "/exercices") return exercisesArea;
    if (to === "/ai-help") return aiArea;
    if (to === "/focus") return focusArea;
    return isActive;
  }

  return (
    <div className="dashboard-shell">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <Link to="/accueil" className="sidebar-logo" aria-label="MentionMax">
            <img src={MentionMaxMark} alt="MentionMax" className="sidebar-logo__mark" />
          </Link>
        </div>
        <div className="sidebar-section-label">Apprendre & pratiquer</div>
        <div className="sidebar-nav">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/accueil"}
              className={({ isActive }) => `sidebar-item${itemIsActive(item.to, isActive) ? " active" : ""}`}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-section-label sidebar-section-label--footer">Compte</div>
          <button type="button" className="sidebar-search" onClick={() => setCommandOpen(true)}>
            <Icon name="search" size={18} />
            <span>Recherche</span>
            <kbd>⌘K</kbd>
          </button>
          <Link to="/profil" className="sidebar-secondary-item">
            <Icon name="profile" size={18} />
            <span>Profil</span>
          </Link>
          <Link to="/preferences" className="sidebar-secondary-item">
            <Icon name="settings" size={18} />
            <span>Préférences</span>
          </Link>
        </div>
      </nav>

      <main className="content">
        <header className="topbar">
          <div className="topbar-mobile-brand">
            <Link to="/accueil" className="sidebar-logo">
              <img src={MentionMaxMark} alt="MentionMax" className="sidebar-logo__mark" />
              <span className="sidebar-logo__text">MentionMax</span>
            </Link>
          </div>
          <div className="topbar-context">
            <span className="topbar-context__eyebrow">MentionMax</span>
            <strong>
              {location.pathname.startsWith("/accueil") ? "Accueil" :
                subjectsArea ? "Matières" :
                exercisesArea ? "Exercices" :
                aiArea ? "IA" :
                examsArea ? "Examens" :
                focusArea ? "Focus" : "Espace étudiant"}
            </strong>
          </div>
          <div className="topbar-right">
            <button type="button" className="topbar-search" onClick={() => setCommandOpen(true)}>
              <Icon name="search" size={17} />
              <span>Rechercher</span>
              <kbd>⌘K</kbd>
            </button>
            <div className="streak-chip"><Icon name="flame" size={16} /><span>5 jours</span></div>
            <div className="profile-dropdown">
              <button
                type="button"
                className="profile-chip"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="profile-chip__avatar">
                  {(user?.user_metadata?.display_name || user?.email || "U").slice(0, 2).toUpperCase()}
                </span>
                <span className="profile-chip__name">
                  {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Compte"}
                </span>
                <Icon name="chevron" size={15} />
              </button>
              {profileOpen && (
                <div className="profile-dropdown-menu" role="menu">
                  <Link to="/profil" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>Profil</Link>
                  <Link to="/preferences" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>Paramètres</Link>
                  <button type="button" className="profile-dropdown-item danger" onClick={async () => { setProfileOpen(false); await signOut(); }}>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <section className="content-body"><Outlet /></section>
      </main>

      <nav className="mobile-tabbar">
        {primaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/accueil"}
            className={({ isActive }) => `mobile-tab${itemIsActive(item.to, isActive) ? " active" : ""}`}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
