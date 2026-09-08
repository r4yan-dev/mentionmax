import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Bot, CheckCircle2, Clock3, FileText, ScanLine, Sparkles, Upload, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { exams as nationalExams } from "../features/exams/catalog";
import { extractExerciseOCR, type AIExerciseOCRResult } from "../services/ai/aiExerciseOCR";
import { correctExamCopyWithAI, type AICorrectionResult } from "../services/ai/aiCorrector";
import { useAccount } from "../context/AccountContext";
import type { TrackId } from "../types/academic";
import PeopleFeature from "../components/ui/PeopleFeature";
import "./Exams.css";
import "./ExamsFocusLayout.css";

type PublishedTest = {
  id: string;
  title: string;
  description: string | null;
  source_type: "custom" | "national_exam" | "ai_generated";
  duration_minutes: number | null;
  level: string | null;
  section: string | null;
  year: number | null;
  subject: { name: string; short_name: string | null } | null;
};

function testSourceLabel(source: PublishedTest["source_type"]) {
  if (source === "ai_generated") return "Généré par IA";
  if (source === "national_exam") return "Sujet national";
  return "Communauté";
}

function getTrackId(track: "SPC" | "SM", section: "A" | "B" | null | undefined): TrackId {
  if (track === "SPC") return "SP";
  return section === "B" ? "SMB" : "SMA";
}

export default function Exams() {
  const { schoolPreferences } = useAccount();
  const [tests, setTests] = useState<PublishedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceText, setSourceText] = useState("");
  const [query, setQuery] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrResult, setOcrResult] = useState<AIExerciseOCRResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [correctionBusy, setCorrectionBusy] = useState(false);
  const [correctionResult, setCorrectionResult] = useState<AICorrectionResult | null>(null);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("tests")
        .select("id,title,description,source_type,duration_minutes,level,section,year,subject:subjects(name,short_name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12);
      if (!cancelled) {
        setTests((data ?? []) as unknown as PublishedTest[]);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter((test) =>
      `${test.title} ${test.description ?? ""} ${test.subject?.name ?? ""} ${test.year ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, tests]);

  async function handleOCRFile(file?: File) {
    if (!file) return;
    setOcrError(null);
    setOcrResult(null);
    setCorrectionError(null);
    setCorrectionResult(null);
    setOcrBusy(true);
    try {
      const result = await extractExerciseOCR(file);
      setOcrResult(result);
    } catch (error) {
      setOcrError(error instanceof Error ? error.message : "Le scanner IA est indisponible.");
    } finally {
      setOcrBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleExamCorrection() {
    if (!ocrResult) return;
    setCorrectionBusy(true);
    setCorrectionError(null);
    try {
      const trackId = schoolPreferences ? getTrackId(schoolPreferences.track, schoolPreferences.section) : "SP";
      const result = await correctExamCopyWithAI({ trackId, ocr: ocrResult });
      setCorrectionResult(result);
    } catch (error) {
      setCorrectionError(error instanceof Error ? error.message : "Le correcteur IA est indisponible.");
    } finally {
      setCorrectionBusy(false);
    }
  }

  return (
    <main className="app-page exams-page exams-ai-page">
      <header className="exams-page__header exams-ai-page__header">
        <div className="exams-page__heading">
          <span className="section-eyebrow">EXAMENS & CORRIGÉS</span>
          <h1>Travaille les examens avec l'IA.</h1>
          <p>Génère un vrai sujet depuis ton cours, ou fais corriger ton travail par MentionMax. Les sujets PDF classiques restent dans l'espace Tests.</p>
        </div>
        <div className="exam-mode-switch" role="tablist" aria-label="Mode des examens">
          <Link className="exam-mode-switch__item active" to="/exams" role="tab" aria-selected="true"><Sparkles size={15} /> IA & Correction</Link>
          <Link className="exam-mode-switch__item" to="/tests" role="tab" aria-selected="false"><FileText size={15} /> Tests classiques</Link>
        </div>
      </header>

      <PeopleFeature variant="books" compact title="Passe du cours à la copie." text="Génère un sujet, fais-le dans les conditions du Bac, puis utilise la correction pour comprendre où tu perds des points." action={<Link to="/tests" className="btn btn-primary"><FileText size={15} /> Voir les tests</Link>} />

      <section className="exams-ai-workspace">
        <article className="exams-ai-generator">
          <div className="exams-ai-generator__head">
            <div>
              <span className="exams-kicker">GÉNÉRATEUR D'EXAMEN</span>
              <h2>Transforme ton cours en véritable sujet.</h2>
              <p>Colle le texte extrait de tes notes ou d'un document. Le contenu devient la matière première du générateur.</p>
            </div>
            <span className="exams-ai-icon"><Wand2 size={24} /></span>
          </div>
          <textarea className="exams-generator-input" value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="Colle ici le texte de ton cours, d'un chapitre ou d'un sujet..." rows={9} aria-label="Texte source pour le générateur d'examen" />
          <div className="exams-ai-generator__footer">
            <span>{sourceText.trim().length} caractères</span>
            <button className="btn btn-primary" type="button" disabled={!sourceText.trim()}><Sparkles size={16} /> Générer l'examen</button>
          </div>
        </article>

        <article className="exams-ai-corrector">
          <div>
            <span className="exams-kicker">SCANNER + CORRECTEUR IA</span>
            <h2>Scanne. Comprends. Corrige.</h2>
            <p>Le scanner #6 transcrit ta copie. Le correcteur #5 lit ensuite le raisonnement, estime les points gagnés et perdus, puis construit une correction et un plan de progression.</p>
          </div>
          <div className="exams-corrector-visual">
            <div className="exams-corrector-ring"><ScanLine size={34} /></div>
            <div className="exams-corrector-brain"><Bot size={30} /></div>
            <span className="exams-corrector-line exams-corrector-line--one" />
            <span className="exams-corrector-line exams-corrector-line--two" />
          </div>
          <div className="exams-corrector-actions">
            <input ref={fileInputRef} className="exams-file-input" type="file" accept="image/*,application/pdf" onChange={(event) => void handleOCRFile(event.target.files?.[0])} />
            <button type="button" className="btn btn-primary" disabled={ocrBusy || correctionBusy} onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> {ocrBusy ? "Analyse en cours..." : "Scanner la copie"}
            </button>
            <span>PDF, image ou copie scannée · 15 Mo max</span>
          </div>
          {ocrError && <div className="exams-ocr-error">{ocrError}</div>}
          {correctionError && <div className="exams-ocr-error">{correctionError}</div>}
        </article>
      </section>

      {ocrResult && (
        <section className="exams-ocr-result card">
          <div className="exams-ocr-result__header">
            <div>
              <span className="section-eyebrow">TRANSCRIPTION IA</span>
              <h2>Copie détectée</h2>
              <p>{ocrResult.documentType === "exam_copy" ? "Copie d'examen" : ocrResult.documentType === "exercise" ? "Exercice" : "Document"}{ocrResult.confidence != null ? ` · confiance ${(ocrResult.confidence * 100).toFixed(0)} %` : ""}</p>
            </div>
            <span className="exams-ocr-badge"><CheckCircle2 size={15} /> OCR terminé</span>
          </div>
          <div className="exams-ocr-result__body">
            <pre className="exams-ocr-transcription">{ocrResult.text}</pre>
            {ocrResult.segments.length > 0 && (
              <div className="exams-ocr-segments">
                {ocrResult.segments.map((segment, index) => (
                  <article key={`${segment.label}-${index}`} className="exams-ocr-segment">
                    <div className="exams-ocr-segment__meta"><strong>{segment.label || `Bloc ${index + 1}`}</strong><span>{segment.kind === "student_answer" ? "Réponse" : segment.kind === "printed_question" ? "Question" : "Annotation"}</span></div>
                    <div>{segment.text}</div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="exams-ocr-result__footer">
            <span>Étape 1/2 terminée. La transcription est prête pour le correcteur #5.</span>
            <button className="btn btn-primary" type="button" disabled={correctionBusy} onClick={() => void handleExamCorrection()}>
              <Sparkles size={15} /> {correctionBusy ? "Correction en cours..." : "Corriger ma copie"}
            </button>
          </div>
        </section>
      )}

      {correctionResult && (
        <section className="exams-correction-result card">
          <div className="exams-correction-result__header">
            <div>
              <span className="section-eyebrow">CORRECTION IA · ÉTAPE 2/2</span>
              <h2>Voilà où tu as gagné et perdu des points.</h2>
              <p>{correctionResult.summary}</p>
            </div>
            <div className="exams-correction-score" aria-label={`Note ${correctionResult.score ?? "non disponible"} sur 20`}>
              <strong>{correctionResult.score ?? "—"}</strong><span>/20</span>
            </div>
          </div>

          <div className="exams-correction-verdict">
            <span className={`exams-verdict exams-verdict--${correctionResult.verdict}`}>
              {correctionResult.verdict === "correct" ? "Très bon travail" : correctionResult.verdict === "mostly_correct" ? "Globalement correct" : correctionResult.verdict === "partially_correct" ? "Partiellement maîtrisé" : "À reprendre"}
            </span>
            <span className="exams-correction-note">Note estimée par le correcteur IA, pas un barème officiel.</span>
          </div>

          <div className="exams-correction-columns">
            <div className="exams-correction-block exams-correction-block--strengths">
              <div className="exams-correction-block__title"><span>+</span><h3>Points gagnés</h3></div>
              {correctionResult.strengths.length ? correctionResult.strengths.map((item, index) => <div className="exams-correction-point" key={`strength-${index}`}>{item}</div>) : <div className="exams-correction-empty">Aucun point positif suffisamment identifiable dans la copie.</div>}
            </div>
            <div className="exams-correction-block exams-correction-block--errors">
              <div className="exams-correction-block__title"><span>−</span><h3>Points perdus</h3></div>
              {correctionResult.errors.length ? correctionResult.errors.map((error, index) => (
                <article className="exams-correction-error" key={`${error.location}-${index}`}>
                  <strong>{error.location}</strong>
                  <div><span>Attendu</span>{error.expected}</div>
                  <div><span>Dans ta copie</span>{error.observed}</div>
                  <div><span>À faire</span>{error.fix}</div>
                </article>
              )) : <div className="exams-correction-empty">Aucune erreur importante détectée.</div>}
            </div>
          </div>

          <div className="exams-correction-solution">
            <div><span className="section-eyebrow">CORRECTION RECONSTRUITE</span><h3>La méthode attendue</h3></div>
            <div className="exams-correction-solution__text">{correctionResult.correctedSolution}</div>
          </div>

          <div className="exams-correction-next">
            <div><span className="section-eyebrow">PLAN DE PROGRESSION</span><h3>Le prochain travail à faire</h3></div>
            <p>{correctionResult.nextStep}</p>
          </div>
        </section>
      )}

      <section className="exams-ai-library card">
        <div className="exams-ai-library__header">
          <div><span className="section-eyebrow">IA TESTS & COMMUNAUTÉ</span><h2 className="section-title">Tes tests en notes & communauté</h2></div>
          <div className="exams-library__search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un test..." aria-label="Rechercher un test" /></div>
        </div>
        {loading ? (
          <div className="exams-test-grid">{[0, 1, 2].map((item) => <div className="exams-skeleton" key={item} />)}</div>
        ) : filteredTests.length ? (
          <div className="exams-test-grid">{filteredTests.map((test) => (
            <article className="exams-test-card exams-test-card--ai" key={test.id}>
              <div className="exams-test-card__meta"><span>{testSourceLabel(test.source_type)}</span>{test.year && <span>{test.year}</span>}</div>
              <h3>{test.title}</h3><p>{test.description || "Un test structuré pour ta préparation au Bac."}</p>
              <div className="exams-test-card__footer"><span>{test.duration_minutes ? <><Clock3 size={14} /> {test.duration_minutes} min</> : "Temps libre"}</span><span>{test.subject?.short_name || test.subject?.name || "Général"}</span></div>
            </article>
          ))}</div>
        ) : (
          <div className="exams-ai-empty"><div className="exams-empty__icon"><Bot size={19} /></div><div><h3>Commence avec ton premier test.</h3><p>Les tests publiés depuis Supabase apparaîtront ici.</p></div></div>
        )}
      </section>

      <section className="exams-national-strip">
        <div><span className="section-eyebrow">BANQUE OFFICIELLE</span><h2>Les vrais examens nationaux restent à portée de clic.</h2><p>{nationalExams.length} sujets disponibles par matière et par année.</p></div>
        <Link className="btn btn-secondary" to="/exams/nationaux">Parcourir les nationaux <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
