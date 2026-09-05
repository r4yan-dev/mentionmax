import { LatexText } from "../../components/ui/LatexText";
import type { LessonBlock, LessonDocument } from "../../types/academic";
import "./lesson-renderer.css";
import "./lesson-renderer-fonts.css";
import "./lesson-renderer-grid.css";
import "./lesson-renderer-layout.css";
import "./lesson-renderer-rtl.css";

function VisualBlock({ type, title }: { type: "graph" | "diagram"; title?: string }) {
  if (type === "graph") {
    return (
      <div className="lesson-visual" aria-label={title || "Graphique"}>
        <svg viewBox="0 0 620 260" role="img" aria-hidden="true">
          <path className="axis" d="M45 220H580M70 235V28" />
          <path className="accent" d="M92 188 C150 170 180 110 232 104 C280 98 302 166 346 155 C395 143 407 82 458 78 C500 74 520 110 555 48" />
          <path className="curve" d="M92 205 C140 185 172 145 212 139 C260 132 285 188 326 178 C372 167 396 111 445 105 C493 100 520 140 555 73" />
          <path className="accent" d="M70 88H575M70 145H575" opacity=".18" />
          <circle className="point" cx="445" cy="105" r="8" />
        </svg>
      </div>
    );
  }

  return (
    <div className="lesson-visual" aria-label={title || "Schéma"}>
      <svg viewBox="0 0 620 240" role="img" aria-hidden="true">
        <path className="axis" d="M70 120H550" />
        <path className="accent" d="M120 72 C185 72 182 168 250 168 C318 168 310 72 380 72 C447 72 440 168 510 168" />
        <circle className="point" cx="250" cy="168" r="8" />
        <circle className="point" cx="380" cy="72" r="8" />
        <path className="curve" d="M120 120 H250 M380 120 H510" />
      </svg>
    </div>
  );
}

function renderBlock(block: LessonBlock, index: number) {
  const key = `${block.type}-${index}`;

  if (block.type === "title") return <h1 key={key}>{block.title || block.text}</h1>;
  if (block.type === "heading") {
    return (
      <section key={key} className="lesson-section-heading" aria-labelledby={`lesson-heading-${index}`}>
        <h2 id={`lesson-heading-${index}`}>{block.title || block.text}</h2>
      </section>
    );
  }
  if (block.type === "text") return <section key={key} className="lesson-block lesson-block--text"><p><LatexText>{block.text || ""}</LatexText></p></section>;
  if (block.type === "page") return <header key={key} className="lesson-page-break"><span>{block.title}</span><p>{block.text ? <LatexText>{block.text}</LatexText> : null}</p></header>;

  if (block.type === "formula") {
    const latex = block.latex?.trim() || block.text?.trim() || "";
    return (
      <div key={key} className="lesson-formula" role="math" aria-label="Formule">
        <LatexText display>{latex}</LatexText>
      </div>
    );
  }

  if (block.type === "graph" || block.type === "diagram") {
    return (
      <section key={key} className={`lesson-block lesson-block--${block.type}`}>
        {block.title && <h2>{block.title}</h2>}
        {block.text && <p><LatexText>{block.text}</LatexText></p>}
        <VisualBlock type={block.type} title={block.title} />
      </section>
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

function renderArabicIntroCard(blocks: LessonBlock[]) {
  const titleBlock = blocks[0];
  const headingBlock = blocks[1];
  const textBlock = blocks[2];

  return (
    <div className="lesson-intro-card" aria-labelledby="lesson-intro-title">
      <div className="lesson-intro-card__title">
        <h1 id="lesson-intro-title">{titleBlock.title || titleBlock.text}</h1>
      </div>
      {headingBlock?.type === "heading" && <h2>{headingBlock.title || headingBlock.text}</h2>}
      {textBlock?.type === "text" && textBlock.text && <p><LatexText>{textBlock.text}</LatexText></p>}
    </div>
  );
}

export default function LessonRenderer({ lesson }: { lesson: LessonDocument }) {
  const pages = lesson.blocks.filter((block) => block.type === "page").length;
  const isArabic = lesson.language === "ar";
  const isArabicIntro = isArabic && lesson.blocks[0]?.type === "title" && lesson.blocks[1]?.type === "heading" && lesson.blocks[2]?.type === "text";
  const blocks = isArabicIntro ? lesson.blocks.slice(3) : lesson.blocks;

  return (
    <article
      className="lesson-document"
      lang={lesson.language}
      dir={isArabic ? "rtl" : "ltr"}
      data-page-count={pages}
    >
      {isArabicIntro && renderArabicIntroCard(lesson.blocks)}
      {blocks.map((block, index) => renderBlock(block, index + (isArabicIntro ? 3 : 0)))}
    </article>
  );
}
