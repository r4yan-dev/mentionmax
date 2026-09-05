import { ArrowRight, Atom, Brain, Calculator, BookOpen, Dna, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath, pathLabels, type UserPath } from "../data/curriculum/secondBac";
import { useAccount } from "../context/AccountContext";
import PathSwitcher from "../components/curriculum/PathSwitcher";

const slugs: Record<string, string> = {
  maths: "maths",
  "physique-chimie": "physique-chimie",
  svt: "svt",
  anglais: "anglais",
  philosophie: "philosophie",
};

type SubjectId = keyof typeof slugs;

const descriptions: Record<SubjectId, string> = {
  maths: "Fonctions, analyse, probabilités et méthodes du Bac.",
  "physique-chimie": "Ondes, mécanique, électricité, énergie et chimie.",
  svt: "Génétique, immunologie, géologie et sciences du vivant.",
  philosophie: "Notions, problématiques, dissertations et argumentation.",
  anglais: "Vocabulary, grammar, communication et writing.",
};

const meta: Record<SubjectId, string> = {
  maths: "Cours · Exercices · Révision",
  "physique-chimie": "Cours · Exercices · Révision",
  svt: "Cours · Exercices · Révision",
  philosophie: "Notions · Dissertations · Révision",
  anglais: "Lessons · Exercises · Revision",
};

const accent: Record<SubjectId, string> = {
  maths: "#0FA3A3",
  "physique-chimie": "#0FA3A3",
  svt: "#7A873A",
  philosophie: "#76213A",
  anglais: "#0FA3A3",
};

const accentSoft: Record<SubjectId, string> = {
  maths: "#DDF5F1",
  "physique-chimie": "#E7F4F2",
  svt: "#EEF3DF",
  philosophie: "#F3E5E9",
  anglais: "#EEE9F0",
};

function paperStyle(accentColor: string, soft: string): React.CSSProperties {
  return {
    position: "relative",
    height: 168,
    minHeight: 168,
    overflow: "hidden",
    borderRadius: 15,
    border: "1px solid rgba(7,59,58,.10)",
    background: `linear-gradient(145deg, #FFFFFF 0%, ${soft} 100%)`,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
  };
}

const note: React.CSSProperties = {
  fontFamily: "Caveat, cursive",
  fontWeight: 600,
};

function WidgetArt({ subject }: { subject: SubjectId }) {
  const soft = accentSoft[subject];
  const color = accent[subject];

  if (subject === "maths") {
    return <div style={paperStyle(color, soft)} aria-hidden="true">
      <div style={{ position: "absolute", inset: 20, borderLeft: `1.5px solid ${color}`, borderBottom: `1.5px solid ${color}` }} />
      <div style={{ position: "absolute", left: 52, bottom: 36, width: 138, height: 76, borderTop: "3px solid #073B3A", borderRadius: "60% 55% 0 0", transform: "rotate(-11deg)" }} />
      <div style={{ position: "absolute", left: 18, top: 17, padding: "5px 10px", borderRadius: 8, background: "rgba(15,163,163,.13)", transform: "rotate(-3deg)", ...note, fontSize: 20, color }}>
        f'(x) > 0
      </div>
      <div style={{ position: "absolute", right: 18, top: 20, width: 78, height: 78, borderRadius: "50%", border: `1.5px dashed ${color}`, transform: "rotate(8deg)" }} />
      <div style={{ position: "absolute", right: 42, top: 43, width: 30, height: 30, border: `1px solid ${color}`, transform: "rotate(8deg)" }} />
      <Calculator size={24} color="#7A873A" style={{ position: "absolute", right: 17, bottom: 18 }} />
      <div style={{ position: "absolute", left: 27, bottom: 13, ...note, fontSize: 16, color: "#073B3A", transform: "rotate(-5deg)" }}>variations</div>
      <div style={{ position: "absolute", left: 55, top: 128, width: 33, height: 27, borderLeft: "1px solid #073B3A", borderBottom: "1px solid #073B3A", transform: "skewY(-25deg)" }} />
    </div>;
  }

  if (subject === "physique-chimie") {
    return <div style={paperStyle(color, soft)} aria-hidden="true">
      <div style={{ position: "absolute", left: 16, top: 30, right: 16, height: 40 }}>
        <svg viewBox="0 0 280 40" width="100%" height="100%" preserveAspectRatio="none"><path d="M0 20 C20 -3 40 43 60 20 S100 -3 120 20 S160 43 180 20 S220 -3 240 20 S260 43 280 20" fill="none" stroke="#073B3A" strokeWidth="2.3" strokeLinecap="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 22, bottom: 24, width: 156, height: 40, display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, height: 2, background: "#073B3A" }} />
        <div style={{ width: 28, height: 22, border: `2px solid ${color}`, borderRadius: 5 }} />
        <div style={{ flex: 1, height: 2, background: "#073B3A" }} />
      </div>
      <div style={{ position: "absolute", right: 22, top: 19, width: 66, height: 54, display: "grid", placeItems: "center" }}>
        <Atom size={38} color={color} strokeWidth={1.7} />
      </div>
      <div style={{ position: "absolute", left: 22, top: 91, padding: "5px 10px", borderRadius: 8, background: "rgba(122,135,58,.14)", ...note, fontSize: 18, color: "#0FA3A3", transform: "rotate(-3deg)" }}>U = R × I</div>
      <div style={{ position: "absolute", right: 30, bottom: 18, ...note, fontSize: 17, color: "#073B3A", transform: "rotate(4deg)" }}>→ F</div>
    </div>;
  }

  if (subject === "svt") {
    return <div style={paperStyle(color, soft)} aria-hidden="true">
      <Dna size={72} color="#7A873A" strokeWidth={1.55} style={{ position: "absolute", left: 28, top: 22 }} />
      <div style={{ position: "absolute", left: 33, top: 90, ...note, fontSize: 19, color: "#7A873A", transform: "rotate(-4deg)" }}>ADN</div>
      <div style={{ position: "absolute", left: 140, top: 35, width: 76, height: 76, borderRadius: "50%", border: "1.6px solid #073B3A" }}>
        <div style={{ position: "absolute", left: 25, top: 25, width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #7A873A", background: "rgba(221,245,241,.6)" }} />
        <div style={{ position: "absolute", left: 11, top: 18, width: 10, height: 8, borderRadius: "50%", border: "1px solid #0FA3A3" }} />
      </div>
      <Brain size={28} color="#0FA3A3" style={{ position: "absolute", right: 23, top: 26 }} />
      <div style={{ position: "absolute", right: 18, bottom: 27, width: 72, height: 52 }}>
        {[0,1,2,3].map((i) => <div key={i} style={{ height: 7, marginBottom: 4, background: i % 2 ? "rgba(15,163,163,.22)" : "rgba(122,135,58,.22)", borderRadius: 3 }} />)}
      </div>
      <div style={{ position: "absolute", left: 140, bottom: 22, ...note, fontSize: 15, color: "#0FA3A3", transform: "rotate(3deg)" }}>cellule</div>
    </div>;
  }

  if (subject === "philosophie") {
    return <div style={paperStyle(color, soft)} aria-hidden="true">
      <div style={{ position: "absolute", left: 20, top: 27, padding: "7px 10px", borderRadius: 12, border: `1px solid ${color}`, color, fontSize: 10, fontWeight: 850 }}>THÈSE</div>
      <div style={{ position: "absolute", left: 95, top: 67, padding: "7px 11px", borderRadius: 12, border: "1px solid #073B3A", color: "#073B3A", fontSize: 10, fontWeight: 850 }}>ARGUMENT</div>
      <div style={{ position: "absolute", left: 22, bottom: 27, padding: "7px 10px", borderRadius: 12, border: "1px solid #0FA3A3", color: "#0FA3A3", fontSize: 10, fontWeight: 850 }}>OBJECTION</div>
      <ArrowRight size={18} color="#073B3A" style={{ position: "absolute", left: 67, top: 50 }} />
      <ArrowRight size={18} color="#073B3A" style={{ position: "absolute", left: 89, bottom: 48, transform: "rotate(155deg)" }} />
      <BookOpen size={42} color={color} strokeWidth={1.5} style={{ position: "absolute", right: 34, top: 30 }} />
      <div style={{ position: "absolute", right: 24, bottom: 28, ...note, fontSize: 29, color, transform: "rotate(7deg)" }}>?</div>
      <div style={{ position: "absolute", right: 22, top: 92, ...note, fontSize: 15, color, transform: "rotate(-4deg)" }}>problématiser</div>
    </div>;
  }

  return <div style={paperStyle(color, soft)} aria-hidden="true">
    <div style={{ position: "absolute", left: 18, top: 25, width: 92, height: 54, border: "1px solid #0FA3A3", borderRadius: 8, transform: "rotate(-4deg)", background: "rgba(255,255,255,.6)" }} />
    <div style={{ position: "absolute", left: 31, top: 41, padding: "4px 8px", background: "rgba(15,163,163,.13)", borderRadius: 7, ...note, fontSize: 19, color: "#073B3A", transform: "rotate(-4deg)" }}>achieve</div>
    <div style={{ position: "absolute", left: 42, top: 89, padding: "4px 8px", background: "rgba(118,33,58,.09)", borderRadius: 7, ...note, fontSize: 16, color: "#76213A", transform: "rotate(2deg)" }}>however</div>
    <Languages size={35} color="#0FA3A3" style={{ position: "absolute", right: 40, top: 27 }} />
    <div style={{ position: "absolute", right: 20, top: 73, width: 100, height: 54, border: "1px solid #073B3A", borderRadius: 10, background: "rgba(255,255,255,.55)", padding: 10 }}>
      <div style={{ width: "75%", height: 4, borderRadius: 4, background: "#DDF5F1", marginBottom: 7 }} />
      <div style={{ width: "92%", height: 4, borderRadius: 4, background: "#DDF5F1", marginBottom: 7 }} />
      <div style={{ width: "58%", height: 4, borderRadius: 4, background: "#E9D7DF" }} />
    </div>
    <div style={{ position: "absolute", left: 19, bottom: 17, ...note, fontSize: 15, color: "#7A873A", transform: "rotate(-5deg)" }}>grammar ✓</div>
  </div>;
}

export default function SubjectsLauncher() {
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackSubjects = getTrackSubjects(path) as Array<{ id: SubjectId; name: string }>;

  return <main className="section container" style={{ paddingBottom: 52 }}>
    <div className="subject-path-banner">
      <div className="subject-path-banner__title">
        <div><strong>{pathLabels[path]}</strong><span>Ton parcours détermine les matières disponibles.</span></div>
      </div>
      <PathSwitcher />
    </div>

    <PageHeader
      eyebrow="Tes matières"
      title={<>Choisis ta <span className="accent-word">matière.</span></>}
      description="Choisis une matière pour retrouver ses cours, exercices et fiches de révision."
    />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18, marginTop: 26 }}>
      {trackSubjects.map((subject, index) => {
        const id = subject.id;
        const color = accent[id];
        return <Link
          key={id}
          to={`/subjects/${slugs[id]}`}
          aria-label={`Ouvrir ${subject.name}`}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
            textDecoration: "none",
            color: "inherit",
            background: "#F8FCFB",
            border: "1px solid rgba(7,59,58,.11)",
            borderRadius: 20,
            padding: 14,
            boxShadow: "0 8px 24px rgba(7,59,58,.045)",
            transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
          }}
          className="subject-widget-link"
        >
          <div style={{ position: "absolute", top: 0, left: 20, width: 48, height: 5, borderRadius: "0 0 6px 6px", background: color, opacity: .82 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 4px 10px" }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: ".12em", color: "#8B9A98" }}>{String(index + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 9, fontWeight: 850, color, textTransform: "uppercase", letterSpacing: ".07em" }}>Ouvrir ↗</span>
          </div>
          <WidgetArt subject={id} />
          <div style={{ padding: "14px 4px 2px" }}>
            <h2 style={{ margin: 0, fontFamily: "Fraunces, Georgia, serif", fontSize: 23, fontWeight: 500, letterSpacing: "-.02em", color: "#073B3A" }}>{subject.name}</h2>
            <p style={{ margin: "7px 0 0", minHeight: 38, fontSize: 12.5, lineHeight: 1.45, fontWeight: 500, color: "#557572" }}>{descriptions[id]}</p>
          </div>
          <div style={{ marginTop: 13, padding: "12px 4px 2px", borderTop: "1px dashed rgba(7,59,58,.14)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, color }}>
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{meta[id]}</span>
            <span style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: accentSoft[id], border: `1.5px solid ${color}`, flex: "0 0 auto" }}><ArrowRight size={15} color={color} /></span>
          </div>
        </Link>;
      })}
    </div>

    <style>{`
      .subject-widget-link:hover,
      .subject-widget-link:focus-visible { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(7,59,58,.11) !important; border-color: rgba(15,163,163,.35) !important; outline: none; }
      .subject-widget-link:focus-visible { box-shadow: 0 0 0 3px rgba(15,163,163,.18), 0 18px 36px rgba(7,59,58,.11) !important; }
      @media (max-width: 1100px) { .subject-widget-link { min-width: 0; } }
      @media (max-width: 900px) { .subjects-widget-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 640px) { .subjects-widget-grid { grid-template-columns: 1fr; } }
    `}</style>
  </main>;
}
