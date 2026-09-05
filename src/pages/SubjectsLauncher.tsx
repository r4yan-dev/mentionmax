import { useMemo } from "react";
import { Calculator } from "lucide-react";
import type { SubjectId } from "../types/academic";

const accent: Record<SubjectId, string> = {
  maths: "#0FA3A3",
  "physique-chimie": "#0FA3A3",
  svt: "#7A873A",
  anglais: "#0FA3A3",
  philosophie: "#76213A",
};

const accentSoft: Record<SubjectId, string> = {
  maths: "#DDF5F1",
  "physique-chimie": "#DDF5F1",
  svt: "#EEF4DF",
  anglais: "#DDF5F1",
  philosophie: "#F3E5EA",
};

const note = {
  fontFamily: "Caveat, cursive",
  fontWeight: 700,
  lineHeight: 1,
};

function paperStyle(color: string, soft: string): React.CSSProperties {
  return {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    borderRadius: 15,
    background: `linear-gradient(180deg, ${soft} 0%, #FFFFFF 100%)`,
  };
}

function WidgetArt({ subject }: { subject: SubjectId }) {
  const soft = accentSoft[subject];
  const color = accent[subject];

  if (subject === "maths") {
    return <div style={paperStyle(color, soft)} aria-hidden="true">
      <div style={{ position: "absolute", inset: 20, borderLeft: `1.5px solid ${color}`, borderBottom: `1.5px solid ${color}` }} />
      <div style={{ position: "absolute", left: 52, bottom: 36, width: 138, height: 76, borderTop: "3px solid #073B3A", borderRadius: "60% 55% 0 0", transform: "rotate(-11deg)" }} />
      <div style={{ position: "absolute", left: 18, top: 17, padding: "5px 10px", borderRadius: 8, background: "rgba(15,163,163,.13)", transform: "rotate(-3deg)", ...note, fontSize: 20, color }}>
        f'(x) &gt; 0
      </div>
      <div style={{ position: "absolute", right: 18, top: 20, width: 78, height: 78, borderRadius: "50%", border: `1.5px dashed ${color}`, transform: "rotate(8deg)" }} />
      <div style={{ position: "absolute", right: 42, top: 43, width: 30, height: 30, border: `1px solid ${color}`, transform: "rotate(8deg)" }} />
      <Calculator size={24} color="#7A873A" style={{ position: "absolute", right: 17, bottom: 18 }} />
      <div style={{ position: "absolute", left: 27, bottom: 13, ...note, fontSize: 16, color: "#073B3A", transform: "rotate(-5deg)" }}>variations</div>
      <div style={{ position: "absolute", left: 55, top: 128, width: 33, height: 27, borderLeft: "1px solid #073B3A", borderBottom: "1px solid #073B3A", transform: "skewY(-25deg)" }} />
    </div>;
  }

  if (subject === "physique-chimie") {
    return <div style={paperStyle(color, soft)} aria-hidden="true" />;
  }

  if (subject === "svt") {
    return <div style={paperStyle(color, soft)} aria-hidden="true" />;
  }

  if (subject === "anglais") {
    return <div style={paperStyle(color, soft)} aria-hidden="true" />;
  }

  return <div style={paperStyle(color, soft)} aria-hidden="true" />;
}

export function SubjectsLauncher() {
  const subjects = useMemo<SubjectId[]>(() => ["maths", "physique-chimie", "svt", "anglais", "philosophie"], []);

  return (
    <div className="subject-page-grid">
      {subjects.map((subject, index) => (
        <article key={subject} className={`card subject-large-card subject-card--${subject === "physique-chimie" ? "physics" : subject}`}>
          <div className="subject-large-card__accent-line" />
          <div className="subject-large-card__top">
            <span className="subject-large-card__index">0{index + 1}</span>
            <span className="subject-large-card__open">Ouvrir</span>
          </div>
          <div className="subject-large-card__illustration">
            <WidgetArt subject={subject} />
          </div>
        </article>
      ))}
    </div>
  );
}
