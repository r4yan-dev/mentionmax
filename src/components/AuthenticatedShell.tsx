import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, BookOpen, BrainCircuit, ChevronDown, FileText, Home, LogOut, Menu, Search, Sparkles, Target, Trophy, X, type LucideIcon } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { tracks } from "../data/curriculum/tracks";
import "./AuthenticatedShell.css";

const navItems = [
  { to: "/accueil", label: "Accueil", icon: Home },
  { to: "/matieres", label: "Matières", icon: BookOpen },
  { to: "/exercices", label: "Pratique", icon: BrainCircuit },
  { to: "/session", label: "Ma session", icon: Target },
  { to: "/focus", label: "Focus", icon: Sparkles },
  { to: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { to: "/examens", label: "Examens", icon: FileText },
  { to: "/progression", label: "Progression", icon: BarChart3 },
  { to: "/classement", label: "Classement", icon: Trophy },
];

type SearchTarget = [string, string, string, LucideIcon];
const searchTargets: SearchTarget[] = [
  ["Cours", "Explorer les matières et les leçons", "/matieres", BookOpen],
  ["Pratique", "Ouvrir la banque d’exercices", "/exercices", BrainCircuit],
  ["Ma session", "Laisser MentionMax construire ta séance", "/session", Target],
  ["Focus", "Travailler seul ou avec ton groupe", "/focus", Sparkles],
  ["AI Studio", "Créer une fiche, un résumé ou des flashcards", "/ai-studio", Sparkles],
  ["Ma bibliothèque", "Retrouver tes ressources sauvegardées", "/bibliotheque", BookOpen],
  ["Tuteur IA", "Poser une question à MentionMax AI", "/ai-help", Sparkles],
  ["Examens", "Sujets IA, corrections et tests", "/examens", FileText],
  ["Nationaux", "Parcourir les annales officielles", "/exams/nationaux", FileText],
  ["Progression", "Voir tes statistiques et ta maîtrise", "/progression", BarChart3],
  ["Classement", "Voir ton rang et ton XP", "/classement", Trophy],
];
const pageNames: Record<string, string> = { "/accueil": "Accueil", "/subjects": "Matières", "/matieres": "Matières", "/exercices": "Pratique", "/exercises": "Pratique", "/session": "Ma session", "/study-agent": "Ma session", "/focus": "Focus", "/communaute": "Focus", "/community": "Focus", "/examens": "Examens", "/exams": "Examens", "/ai-studio": "AI Studio", "/bibliotheque": "Ma bibliothèque", "/ai-help": "Tuteur IA", "/progression": "Progression", "/points-faibles": "Progression", "/weak-points": "Progression", "/classement": "Classement", "/profil": "Profil", "/preferences": "Préférences" };

export default function AuthenticatedShell() {
  const { signOut } = useAuth();
  const { profile, schoolPreferences } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackLabel = tracks[path].shortLabel;
  const initials = (profile?.display_name ?? "M").trim().slice(0, 1).toUpperCase();
  const pageTitle = pageNames[location.pathname] ?? (location.pathname.startsWith("/exercices/") ? "Pratique" : location.pathname.startsWith("/subjects/") ? "Matières" : location.pathname.startsWith("/exams/") ? "Examens" : location.pathname.startsWith("/focus") ? "Focus" : location.pathname.startsWith("/communaute") || location.pathname.startsWith("/community") ? "Focus" : location.pathname.startsWith("/bibliotheque") ? "Ma bibliothèque" : "MentionMax");
  const searchResults = useMemo<SearchTarget[]>(() => { const needle = query.trim().toLowerCase(); return !needle ? searchTargets : searchTargets.filter(([title, description]) => `${title} ${description}`.toLowerCase().includes(needle)); }, [query]);

  useEffect(() => { function onKeyDown(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); window.setTimeout(() => searchRef.current?.focus(), 0); } if (event.key === "Escape") { setSearchOpen(false); setQuery(""); } } window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  function openSearch() { setSearchOpen(true); window.setTimeout(() => searchRef.current?.focus(), 0); }
  function go(target: string) { setSearchOpen(false); setQuery(""); navigate(target); }
  async function handleSignOut() { await signOut(); navigate("/connexion", { replace: true }); }

  return <div className="app-shell">
    {searchOpen && <button className="shell-search-overlay" aria-label="Fermer la recherche" onClick={() => setSearchOpen(false)} />}
    {mobileOpen && <button className="shell-overlay" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`shell-sidebar ${mobileOpen ? "is-open" : ""}`}>
      <div className="shell-brand-row"><NavLink to="/accueil" className="shell-brand" onClick={() => setMobileOpen(false)}><span className="shell-mark">M</span><span><strong>MentionMax</strong><small>2BAC · Maroc</small></span></NavLink><button className="shell-close" onClick={() => setMobileOpen(false)} aria-label="Fermer"><X size={18}/></button></div>
      <button className="shell-mini-search" type="button" onClick={openSearch}><Search size={15}/><span>Rechercher</span><kbd>⌘K</kbd></button>
      <div className="shell-track"><span>Parcours</span><strong>{trackLabel}</strong><span className="shell-track-dot" /></div>
      <nav className="shell-nav" aria-label="Navigation principale">{navItems.map(({to,label,icon:Icon})=><NavLink key={to} to={to} onClick={()=>setMobileOpen(false)} className={({isActive})=>`shell-nav-link ${isActive || (to === "/exercices" && location.pathname.startsWith("/exercices")) || (to === "/session" && (location.pathname.startsWith("/session") || location.pathname.startsWith("/study-agent"))) || (to === "/focus" && (location.pathname.startsWith("/focus") || location.pathname.startsWith("/communaute") || location.pathname.startsWith("/community"))) || (to === "/examens" && (location.pathname.startsWith("/examens") || location.pathname.startsWith("/exams"))) ? "active" : ""}`}> <Icon size={18} strokeWidth={2}/><span>{label}</span></NavLink>)}</nav>
      <div className="shell-sidebar-bottom"><NavLink to="/ai-help" className="shell-tutor-card" onClick={()=>setMobileOpen(false)}><span className="shell-tutor-icon"><Sparkles size={15}/></span><span><strong>Besoin d’aide ?</strong><small>Ouvrir le tuteur IA</small></span><ChevronDown size={15}/></NavLink><button className="shell-streak" onClick={()=>go("/progression")}><span>🔥</span><div><strong>5 jours</strong><small>Série actuelle</small></div></button><button className="shell-profile" onClick={()=>go("/profil")}><span className="shell-avatar">{initials}</span><span><strong>{profile?.display_name || "Mon profil"}</strong><small>Compte étudiant · {pageTitle}</small></span><ChevronDown size={15}/></button><button className="shell-logout" onClick={handleSignOut}><LogOut size={16}/> Déconnexion</button></div>
    </aside>
    <div className="shell-main"><header className="shell-topbar"><button className="shell-menu" onClick={()=>setMobileOpen(true)} aria-label="Ouvrir le menu"><Menu size={21}/></button><button className="shell-search" type="button" onClick={openSearch}><Search size={17}/><span>Rechercher un chapitre, exercice...</span><kbd>⌘K</kbd></button><div className="shell-topbar-right"><div className="shell-page-title">{pageTitle}</div><div className="shell-path-chip">{trackLabel}</div><NavLink to="/profil" className="shell-top-profile"><span className="shell-avatar">{initials}</span><span>{profile?.display_name || "Mon profil"}</span></NavLink></div></header><div className="shell-content"><Outlet/></div></div>
    {searchOpen && <div className="shell-command" role="dialog" aria-modal="true" aria-label="Recherche MentionMax"><div className="shell-command__panel"><div className="shell-command__top"><Search size={18}/><input ref={searchRef} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher dans MentionMax..."/><kbd>ESC</kbd><button type="button" onClick={()=>setSearchOpen(false)} aria-label="Fermer"><X size={17}/></button></div><div className="shell-command__label">Navigation rapide</div><div className="shell-command__results">{searchResults.length ? searchResults.map(([title,description,to,Icon])=><button type="button" className="shell-result" key={to} onClick={()=>go(to)}><span className="shell-result__icon"><Icon size={16}/></span><span><strong>{title}</strong><small>{description}</small></span><span className="shell-result__shortcut">↵</span></button>) : <div className="shell-command__empty">Aucun résultat.</div>}</div><div className="shell-command__footer"><span>⌘K pour ouvrir</span><span>Entrée ouvrir · Esc fermer</span></div></div></div>}
  </div>;
}
