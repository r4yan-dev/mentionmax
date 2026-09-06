import { useState } from "react";
import { ArrowRight, Bot, FileText, Lightbulb, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MarkdownContent from "../components/MarkdownContent";
import { aiService } from "../services/ai";
import "./AIHelp.css";

type Message = { role: "user" | "assistant"; text: string };

const quickActions = [
  { label: "Explique une notion", task: "explain" as const },
  { label: "Corrige mon raisonnement", task: "correct" as const },
  { label: "Crée un exercice", task: "generate" as const },
  { label: "Personnalise ma révision", task: "personalize" as const },
];

export default function AIHelp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(text = input, task: (typeof quickActions)[number]["task"] = "explain") {
    const prompt = text.trim();
    if (!prompt || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    setMessages((current) => [...current, { role: "user", text: prompt }]);
    try {
      const response = await aiService.run<string>({ task, input: prompt, context: { product: "MentionMax", level: "2BAC" } });
      setMessages((current) => [...current, { role: "assistant", text: response.data }]);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError instanceof Error ? requestError.message : "Le tuteur IA est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ai-page">
      <header className="ai-page__header">
        <div><span className="ai-eyebrow"><Sparkles size={14} /> MentionMax AI</span><h1>Un assistant qui connaît ton travail.</h1><p>Explique une notion, construis un exercice, corrige une méthode ou prépare une session ciblée.</p></div>
        <Link to="/ai-studio/handnotes" className="ai-secondary"><FileText size={16} /> Ouvrir mes notes <ArrowRight size={15} /></Link>
      </header>

      <section className="ai-workspace">
        <div className="ai-chat">
          <div className="ai-chat__bar"><div className="ai-avatar"><Bot size={18} /></div><div><strong>MentionMax AI</strong><span>Assistant pédagogique · Gemini 3.6 Flash</span></div><span className="ai-status"><i /> Connecté</span></div>
          <div className="ai-chat__body">
            {messages.length === 0 ? <div className="ai-empty"><div className="ai-empty__icon"><Sparkles size={25} /></div><h2>Que veux-tu travailler ?</h2><p>Le tuteur passe par une fonction Supabase sécurisée qui appelle Gemini sans exposer la clé dans le navigateur.</p><div className="ai-quick">{quickActions.map((action) => <button key={action.label} onClick={() => void ask(action.label, action.task)}><Lightbulb size={15} />{action.label}</button>)}</div></div> : <div className="ai-messages">{messages.map((message, index) => <div className={`ai-message ai-message--${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "assistant" ? "M" : "Toi"}</span><div className="ai-message__content"><MarkdownContent content={message.text} /></div></div>)}</div>}
            {busy && <div className="ai-typing"><i /><i /><i /> MentionMax réfléchit…</div>}
            {error && <div className="ai-error">{error}</div>}
          </div>
          <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); void ask(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pose ta question..." aria-label="Question à MentionMax AI" /><button type="submit" disabled={!input.trim() || busy}><Send size={17} /></button></form>
        </div>
        <aside className="ai-side"><div className="ai-side-card"><span className="ai-eyebrow">Contexte</span><h2>2BAC · ton parcours</h2><p>Le tuteur reçoit déjà le niveau et le contexte produit. Le parcours, la matière, le chapitre et l’exercice pourront être ajoutés au contexte de chaque session.</p></div><div className="ai-side-card"><span className="ai-eyebrow">AI Studio</span><h2>Transformer tes notes.</h2><p>Les notes restent un espace séparé du chat pour pouvoir brancher plus tard résumé, fiches, flashcards et quiz.</p><Link to="/ai-studio/handnotes">Accéder aux notes <ArrowRight size={14} /></Link></div></aside>
      </section>
    </main>
  );
}
