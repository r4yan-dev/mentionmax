import { useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { contentCatalogService } from "../services/content/contentCatalogService";
import { MathText } from "../components/ui/MathText";
import type { SubjectId, TrackId } from "../types/academic";
import type { Flashcard } from "../types/content";
import "./Flashcards.css";

const chapters = (cards: Flashcard[]) => Array.from(new Set(cards.map((card) => card.target.chapter)));
const subjectLabels: Record<SubjectId, string> = {
  maths: "Mathématiques",
  "physique-chimie": "Physique-Chimie",
  svt: "SVT",
  anglais: "Anglais",
  philosophie: "Philosophie",
};
const trackLabels: Record<TrackId, string> = { SP: "SPC", SMA: "SM A", SMB: "SM B" };

export default function Flashcards() {
  const [params] = useSearchParams();
  const trackId = (params.get("track") || "SP") as TrackId;
  const subjectId = (params.get("subject") || "maths") as SubjectId;
  const allCards = useMemo(
    () => contentCatalogService.getBaseFlashcards(trackId, subjectId),
    [trackId, subjectId],
  );
  const chapterList = useMemo(() => chapters(allCards), [allCards]);
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = selectedChapter === "all" ? allCards : allCards.filter((card) => card.target.chapter === selectedChapter);
  const current = cards[index];
  const subjectLabel = subjectLabels[subjectId] ?? "Matière";

  const reset = () => {
    setIndex(0);
    setFlipped(false);
  };

  const previous = () => {
    setIndex((value) => (cards.length ? (value - 1 + cards.length) % cards.length : 0));
    setFlipped(false);
  };

  const next = () => {
    setIndex((value) => (cards.length ? (value + 1) % cards.length : 0));
    setFlipped(false);
  };

  return (
    <main className="flashcards-page container section">
      <div className="flashcards-topbar">
        <Link to={`/subjects/${subjectId}`} className="flashcards-back"><ArrowLeft size={17} /> {subjectLabel}</Link>
        <span className="flashcards-badge">2BAC {trackLabels[trackId]} · FLASHCARDS</span>
      </div>

      <header className="flashcards-header">
        <div>
          <p className="flashcards-eyebrow">Révision active</p>
          <h1>Flashcards de {subjectLabel.toLowerCase()}</h1>
          <p>Réactive les définitions, concepts, méthodes et idées essentielles du programme.</p>
        </div>
        <div className="flashcards-count"><strong>{cards.length}</strong><span>cartes</span></div>
      </header>

      <div className="flashcards-layout">
        <aside className="flashcards-sidebar">
          <button className={selectedChapter === "all" ? "active" : ""} onClick={() => { setSelectedChapter("all"); reset(); }}>Tous les chapitres</button>
          {chapterList.map((chapter) => (
            <button key={chapter} className={selectedChapter === chapter ? "active" : ""} onClick={() => { setSelectedChapter(chapter); reset(); }}>{chapter}</button>
          ))}
        </aside>

        <section className="flashcards-study">
          {current ? (
            <>
              <div className={`flashcard-scene ${flipped ? "is-flipped" : ""}`}>
                <button className="flashcard" onClick={() => setFlipped((value) => !value)} aria-label={flipped ? "Voir la question" : "Voir la réponse"}>
                  <span className="flashcard-face flashcard-front">
                    <span className="flashcard-chapter">{current.target.chapter}</span>
                    <div className="flashcard-content">
                      <span className="flashcard-label">QUESTION</span>
                      <div className="flashcard-text"><MathText>{current.front}</MathText></div>
                    </div>
                    <span className="flashcard-hint">Clique pour retourner</span>
                  </span>
                  <span className="flashcard-face flashcard-back">
                    <span className="flashcard-chapter">{current.target.chapter}</span>
                    <div className="flashcard-content">
                      <span className="flashcard-label">RÉPONSE</span>
                      <div className="flashcard-text"><MathText>{current.back}</MathText></div>
                    </div>
                    <span className="flashcard-hint">Clique pour revenir</span>
                  </span>
                </button>
              </div>

              <div className="flashcards-controls">
                <button onClick={previous} aria-label="Carte précédente"><ChevronLeft size={20} /></button>
                <div className="flashcards-position">{index + 1} / {cards.length}</div>
                <button onClick={next} aria-label="Carte suivante"><ChevronRight size={20} /></button>
              </div>

              <button className="flashcards-reset" onClick={reset}><RotateCcw size={15} /> Recommencer</button>
            </>
          ) : (
            <div className="flashcards-empty">Aucune flashcard disponible pour ce filtre.</div>
          )}
        </section>
      </div>
    </main>
  );
}
