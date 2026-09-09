import { useMemo, useState } from "react";
import { ArrowLeft, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
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
const REVIEW_KEY = "mentionmax:flashcards-to-review:v1";

function cardKey(card: Flashcard) {
  const candidate = card as Flashcard & { id?: string };
  return candidate.id ?? `${card.target.chapter}::${card.front}`;
}

function readReviewSet(key: string) {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

function PhilosophyText({ children }: { children: string }) {
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{ direction: "rtl", unicodeBidi: "plaintext", width: "100%" }}
      dangerouslySetInnerHTML={{ __html: children }}
    />
  );
}

function FlashcardText({ subjectId, children }: { subjectId: SubjectId; children: string }) {
  return subjectId === "philosophie" ? <PhilosophyText>{children}</PhilosophyText> : <MathText>{children}</MathText>;
}

export default function Flashcards() {
  const [params] = useSearchParams();
  const trackId = (params.get("track") || "SP") as TrackId;
  const subjectId = (params.get("subject") || "maths") as SubjectId;
  const reviewStorageKey = `${REVIEW_KEY}:${trackId}:${subjectId}`;
  const allCards = useMemo(
    () => contentCatalogService.getBaseFlashcards(trackId, subjectId),
    [trackId, subjectId],
  );
  const chapterList = useMemo(() => chapters(allCards), [allCards]);
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewSet, setReviewSet] = useState<Set<string>>(() => readReviewSet(reviewStorageKey));

  const chapterCards = selectedChapter === "all" ? allCards : allCards.filter((card) => card.target.chapter === selectedChapter);
  const cards = reviewOnly ? chapterCards.filter((card) => reviewSet.has(cardKey(card))) : chapterCards;
  const current = cards[index];
  const subjectLabel = subjectLabels[subjectId] ?? "Matière";

  const reset = () => {
    setIndex(0);
    setFlipped(false);
  };

  const changeFilter = (nextReviewOnly: boolean) => {
    setReviewOnly(nextReviewOnly);
    reset();
  };

  const selectChapter = (chapter: string) => {
    setSelectedChapter(chapter);
    reset();
  };

  const previous = () => {
    setIndex((value) => (cards.length ? (value - 1 + cards.length) % cards.length : 0));
    setFlipped(false);
  };

  const next = () => {
    setIndex((value) => (cards.length ? (value + 1) % cards.length : 0));
    setFlipped(false);
  };

  const toggleReview = () => {
    if (!current || typeof window === "undefined") return;
    const key = cardKey(current);
    setReviewSet((previousSet) => {
      const nextSet = new Set(previousSet);
      if (nextSet.has(key)) nextSet.delete(key);
      else nextSet.add(key);
      window.localStorage.setItem(reviewStorageKey, JSON.stringify([...nextSet]));
      return nextSet;
    });
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
        <div className="flashcards-count"><strong>{cards.length}</strong><span>{reviewOnly ? "à réviser" : "cartes"}</span></div>
      </header>

      <div className="flashcards-layout">
        <aside className="flashcards-sidebar">
          <button className={selectedChapter === "all" && !reviewOnly ? "active" : ""} onClick={() => { setReviewOnly(false); selectChapter("all"); }}>Tous les chapitres</button>
          <button className={reviewOnly ? "active" : ""} onClick={() => changeFilter(true)}><BookmarkCheck size={15} /> À réviser ({reviewSet.size})</button>
          {chapterList.map((chapter) => (
            <button key={chapter} className={!reviewOnly && selectedChapter === chapter ? "active" : ""} onClick={() => { setReviewOnly(false); selectChapter(chapter); }}>{chapter}</button>
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
                      <div className="flashcard-text"><FlashcardText subjectId={subjectId}>{current.front}</FlashcardText></div>
                    </div>
                    <span className="flashcard-hint">Clique pour retourner</span>
                  </span>
                  <span className="flashcard-face flashcard-back">
                    <span className="flashcard-chapter">{current.target.chapter}</span>
                    <div className="flashcard-content">
                      <span className="flashcard-label">RÉPONSE</span>
                      <div className="flashcard-text"><FlashcardText subjectId={subjectId}>{current.back}</FlashcardText></div>
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

              <button className="flashcards-reset" onClick={toggleReview}>
                <BookmarkCheck size={15} /> {reviewSet.has(cardKey(current)) ? "Retirer des cartes à réviser" : "À réviser"}
              </button>
              <button className="flashcards-reset" onClick={reset}><RotateCcw size={15} /> Recommencer</button>
            </>
          ) : (
            <div className="flashcards-empty">{reviewOnly ? "Aucune carte marquée à réviser pour ce filtre." : "Aucune flashcard disponible pour ce filtre."}</div>
          )}
        </section>
      </div>
    </main>
  );
}
