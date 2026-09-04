import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, BrainCircuit, ChevronDown, FileText, Home, LogOut, Menu, Search, Sparkles, Trophy, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { tracks } from "../data/curriculum/tracks";
import "./AuthenticatedShell.css";

const navItems = [
  { to: "/accueil", label: "Accueil", icon: Home },
  { to: "/matieres", label: "Matières", icon: BookOpen },
  { to: "/exercices", label: "Pratique", icon: BrainCircuit },
  { to: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { to: "/examens", label: "Examens", icon: FileText },
  { to: "/progression", label: "Progression", icon: BarChart3 },
  { to: "/classement", label: "Classement", icon: Trophy },
];

export default function AuthenticatedShell() {
  const { signOut } = useAuth();
  const { profile, schoolPreferences } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackLabel = tracks[path].shortLabel;
  const initials = (profile?.display_name ?? "M").trim().slice(0, 1).toUpperCase();

  async function handleSignOut() {
    await signOut();
    navigate("/connexion", { replace: true });
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="shell-overlay" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`shell-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="shell-brand-row">
          <NavLink to="/accueil" className="shell-brand" onClick={() => setMobileOpen(false)}>
            <span className="shell-mark">M</span>
            <span><strong>MentionMax</strong><small>2BAC · Maroc</small></span>
          </NavLink>
          <button className="shell-close" onClick={() => setMobileOpen(false)} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="shell-track"><span>Parcours</span><strong>{trackLabel}</strong><span className="shell-track-dot" /></div>
        <nav className="shell-nav" aria-label="Navigation principale">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `shell-nav-link ${isActive || (to === "/exercices" && location.pathname.startsWith("/exercices")) ? "active" : ""}`}>
              <Icon size={18} strokeWidth={2} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="shell-sidebar-bottom">
          <div className="shell-streak"><span>🔥</span><div><strong>5 jours</strong><small>Série actuelle</small></div></div>
          <button className="shell-profile" onClick={() => navigate("/profil")}>
            <span className="shell-avatar">{initials}</span>
            <span><strong>{profile?.display_name || "Mon profil"}</strong><small>Compte étudiant</small></span>
            <ChevronDown size={15} />
          </button>
          <button className="shell-logout" onClick={handleSignOut}><LogOut size={16} /> Déconnexion</button>
        </div>
      </aside>
      <div className="shell-main">
        <header className="shell-topbar">
          <button className="shell-menu" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu"><Menu size={21} /></button>
          <div className="shell-search"><Search size={17} /><input placeholder="Rechercher un chapitre, exercice..." aria-label="Rechercher" /></div>
          <div className="shell-topbar-right"><div className="shell-path-chip">{trackLabel}</div><NavLink to="/profil" className="shell-top-profile"><span className="shell-avatar">{initials}</span><span>{profile?.display_name || "Mon profil"}</span></NavLink></div>
        </header>
        <div className="shell-content"><Outlet /></div>
      </div>
    </div>
  );
}
