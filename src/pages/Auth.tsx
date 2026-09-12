import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import MentionMaxMark from "../assets/brand/mentionmax-mark.svg";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

type Mode = "login" | "signup";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="auth-page"><div className="auth-loading">Chargement...</div></div>;
  if (user) return <Navigate to="/accueil" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setSubmitting(true);
    if (mode === "signup") {
      if (!displayName.trim()) { setError("Entre ton nom."); setSubmitting(false); return; }
      const result = await signUp(email.trim(), password, displayName.trim());
      if (result.error) setError(result.error); else { setMessage("Compte créé. Vérifie ton email si la confirmation est activée."); setMode("login"); }
    } else {
      const result = await signIn(email.trim(), password); if (result.error) setError(result.error);
    }
    setSubmitting(false);
  }

  return <main className="auth-page">
    <aside className="auth-sidebar" aria-label="MentionMax">
      <Link to="/" className="auth-sidebar__brand"><img src={MentionMaxMark} alt="MentionMax" /><span>MentionMax</span></Link>
      <div className="auth-sidebar__content"><span className="auth-sidebar__eyebrow">Préparation 2BAC · Maroc</span><h2>Travaille le cours.<br /><em>Maîtrise le Bac.</em></h2><p>Retrouve tes cours, exercices, IA et annales dans un espace pensé pour ton parcours.</p><div className="auth-sidebar__points"><div><CheckCircle2 size={17} /><span>Ton parcours et ta progression synchronisés</span></div><div><CheckCircle2 size={17} /><span>Maths, PC, SVT, Philo et Anglais</span></div><div><CheckCircle2 size={17} /><span>Une préparation pensée pour le 2BAC</span></div></div></div>
      <div className="auth-sidebar__footer"><span>300 exercices</span><span>Style Bac marocain</span><span>3 parcours</span></div>
    </aside>
    <section className="auth-main"><Link to="/" className="auth-back"><ArrowLeft size={16} /> Retour à l'accueil</Link><div className="auth-card"><div className="auth-mobile-brand"><img src={MentionMaxMark} alt="MentionMax" /><strong>MentionMax</strong></div><div className="auth-heading"><span className="auth-eyebrow"><LockKeyhole size={14} /> Compte étudiant</span><h1>{mode === "login" ? "Connecte-toi." : "Rejoins MentionMax."}</h1><p>{mode === "login" ? "Retrouve ta progression et continue là où tu t'es arrêté." : "Crée ton compte pour sauvegarder ton parcours et ta progression."}</p></div><form className="auth-form" onSubmit={handleSubmit}>{mode === "signup" && <label className="auth-field"><span>Nom</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Ton nom" autoComplete="name" /></label>}<label className="auth-field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ton@email.com" autoComplete="email" required /></label><label className="auth-field"><div><span>Mot de passe</span>{mode === "login" && <span className="auth-field__hint">6 caractères minimum</span>}</div><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required /></label>{error && <div className="auth-error">{error}</div>}{message && <div className="auth-message">{message}</div>}<button type="submit" className="auth-submit" disabled={submitting}>{submitting ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}</button></form><div className="auth-switch"><span>{mode === "login" ? "Pas encore de compte ?" : "Tu as déjà un compte ?"}</span><button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>{mode === "login" ? "Créer un compte" : "Se connecter"}</button></div></div></section>
  </main>;
}
