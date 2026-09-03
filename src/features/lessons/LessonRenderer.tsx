import type { LessonBlock, LessonDocument } from "../../types/academic";
import { LatexText } from "../../components/ui/LatexText";
import "./lesson-renderer.css";

function renderBlock(block: LessonBlock, index: number) {
  const key = `${block.type}-${index}`;

  if (block.type === "title") return <h1 key={key}>{block.title || block.text}</h1>;
  if (block.type === "formula") return <div key={key} className="lesson-block lesson-formula"><LatexText>{block.latex || ""}</LatexText></div>;
  if (block.type === "recap") return <section key={key} className="lesson-block lesson-recap"><h2>{block.title || "À retenir"}</h2>{block.items?.map((item) => <p key={item}>• <LatexText>{item}</LatexText></p>)}</section>;
  if (block.type === "warning" || block.type === "common-mistake") return <aside key={key} className="lesson-block lesson-callout lesson-callout--warning"><strong>{block.title || "Attention"}</strong><p>{block.text ? <LatexText>{block.text}</LatexText> : null}</p></aside>;
  if (block.type === "exam-tip") return <aside key={key} className="lesson-block lesson-callout lesson-callout--tip"><strong>{block.title || "Réflexe Bac"}</strong><p>{block.text ? <LatexText>{block.text}</LatexText> : null}</p></aside>;
  return <section key={key} className={`lesson-block lesson-block--${block.type}`}><h2>{block.title}</h2>{block.text && <p><LatexText>{block.text}</LatexText></p>}</section>;
}

export default function LessonRenderer({ lesson }: { lesson: LessonDocument }) {
  return <article className="lesson-document" lang={lesson.language}>{lesson.blocks.map(renderBlock)}</article>;
}
