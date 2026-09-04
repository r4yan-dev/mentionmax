import { LatexText } from "../../components/ui/LatexText";
import type { LessonBlock, LessonDocument } from "../../types/academic";
import "./lesson-renderer.css";

function renderBlock(block: LessonBlock, index: number) {
  const key = `${block.type}-${index}`;

  if (block.type === "title") return <h1 key={key}>{block.title || block.text}</h1>;
  if (block.type === "page") return <header key={key} className="lesson-page-break"><span>{block.title}</span><p>{block.text}</p></header>;

  // Formula blocks contain raw LaTeX and are always rendered as display math.
  // The explicit delimiters make strings such as `\\frac{a}{b}` render correctly
  // even when the content source does not include $$...$$ itself.
  if (block.type === "formula") {
    const latex = block.latex?.trim() || block.text?.trim() || "";
    return (
      <div key={key} className="lesson-block lesson-formula" role="math" aria-label="Formule">
        <LatexText display>{latex}</LatexText>
      </div>
    );
  }

  if (block.type === "recap") return <section key={key} className="lesson-block lesson-recap"><h2>{block.title || "À retenir"}</h2>{block.items?.map((item) => <p key={item}>• <LatexText>{item}</LatexText></p>)}</section>;
  if (block.type === "warning" || block.type === "common-mistake") return <aside key={key} className="lesson-block lesson-callout lesson-callout--warning"><strong>{block.title || "Attention"}</strong><p>{block.text ? <LatexText>{block.text}</LatexText> : null}</p></aside>;
  if (block.type === "exam-tip") return <aside key={key} className="lesson-block lesson-callout lesson-callout--tip"><strong>{block.title || "Réflexe Bac"}</strong><p>{block.text ? <LatexText>{block.text}</LatexText> : null}</p></aside>;
  if (block.type === "exercise") return <section key={key} className="lesson-block lesson-block--exercise"><span className="lesson-block__eyebrow">EXERCICE INTÉGRÉ</span><h2>{block.title}</h2><p><LatexText>{block.text || ""}</LatexText></p></section>;
  if (block.type === "interactive") return <section key={key} className="lesson-block lesson-block--interactive"><span className="lesson-block__eyebrow">INTERACTIF</span><h2>{block.title}</h2><p><LatexText>{block.text || ""}</LatexText></p></section>;
  if (block.type === "animation") return <section key={key} className="lesson-block lesson-block--animation"><span className="lesson-block__eyebrow">ANIMATION</span><h2>{block.title}</h2><p><LatexText>{block.text || ""}</LatexText></p></section>;
  return <section key={key} className={`lesson-block lesson-block--${block.type}`}><h2>{block.title}</h2>{block.text && <p><LatexText>{block.text}</LatexText></p>}</section>;
}

export default function LessonRenderer({ lesson }: { lesson: LessonDocument }) {
  const pages = lesson.blocks.filter((block) => block.type === "page").length;
  return <article className="lesson-document" lang={lesson.language} data-page-count={pages}>{lesson.blocks.map(renderBlock)}</article>;
}
