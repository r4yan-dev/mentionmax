import { BookOpen, FileText, Layers3, PenLine } from "lucide-react";
import type { ReactNode } from "react";
import { LatexText } from "../../components/ui/LatexText";
import type { LessonBlock, LessonDocument } from "../../types/academic";
import "./lesson-renderer.css";
import "./lesson-renderer-fonts.css";
import "./lesson-renderer-grid.css";
import "./lesson-renderer-layout.css";
import "./lesson-renderer-rtl.css";
import "./philosophy-arabic.css";
import "./philosophy-writing.css";

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

function philosopherSticker(title: string) {
  const philosophers = [
    "جون لوك", "شوبنهاور", "كانط", "غوسدورف", "فرويد", "سارتر", "هيغل", "هايدغر",
    "بيرجي", "جيل دولوز", "كريستيفا", "أرسطو", "أفلاطون", "سبينوزا", "روسو", "هوبز",
    "مونتسكيو", "نيتشه", "ديكارت", "باشلار", "غاستون باشلار",
  ];
  return philosophers.find((name) => title.includes(name)) || "فيلسوف";
}

function philosophyNote(title: string) {
  if (title.includes("خطوات") || title.includes("المنهج")) return "خطوات";
  if (title.includes("قيمة") || title.includes("الهوية")) return "مهم";
  if (title.includes("الحرية") || title.includes("الضرورة")) return "فكرة";
  if (title.includes("الصراع") || title.includes("العلاقة")) return "ركّز";
  return "احفظ";
}

function renderArabicConceptCard(heading: LessonBlock, text: LessonBlock, index: number) {
  const headingTitle = heading.title || heading.text || "";
  return (
    <section
      key={`arabic-concept-${index}`}
      className="lesson-block lesson-philosophy-card"
      data-philosopher={philosopherSticker(headingTitle)}
      data-note={philosophyNote(headingTitle)}
      aria-labelledby={`philosophy-card-title-${index}`}
    >
      <h2 id={`philosophy-card-title-${index}`}>{headingTitle}</h2>
      <p><LatexText>{text.text || ""}</LatexText></p>
    </section>
  );
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

function renderPhilosophyWritingGuide() {
  return (
    <aside className="lesson-writing-method" dir="rtl" aria-label="منهجية كتابة جواب الفلسفة">
      <h2>كيف تحوّل الدرس إلى جواب فلسفي متماسك؟</h2>
      <p className="lesson-writing-method__intro">
        في امتحان البكالوريا لا تكفي معرفة موقف الفيلسوف. القيمة الحقيقية للمعرفة تظهر حين توظّفها لبناء جواب متدرج، واضح، ومقنع. اكتب انطلاقا من الإشكال، واجعل كل فقرة تؤدي وظيفة محددة في الإجابة.
      </p>
      <div className="lesson-writing-method__steps">
        <article className="lesson-writing-method__step">
          <span className="lesson-writing-method__number">01</span>
          <h3>المقدمة</h3>
          <p>أطّر المفهوم داخل مجزوئته ومحوره، وحدد التوتر الذي يجعل الموضوع إشكاليا، ثم صغ أسئلة دقيقة تقود القارئ إلى ما ستعالجه في العرض.</p>
        </article>
        <article className="lesson-writing-method__step">
          <span className="lesson-writing-method__number">02</span>
          <h3>التحليل</h3>
          <p>استخرج الأطروحة، واشرح المفاهيم المركزية، ثم بيّن كيف تتساند الأفكار والحجج. لا تكتف بذكر الفيلسوف، بل وضّح وظيفة موقفه داخل الجواب.</p>
        </article>
        <article className="lesson-writing-method__step">
          <span className="lesson-writing-method__number">03</span>
          <h3>المناقشة</h3>
          <p>ضع الموقف في حوار مع تصور يؤيده وآخر يعارضه، وبيّن نقطة القوة والحدود. المناقشة ليست لائحة أسماء، بل انتقال منطقي من موقف إلى آخر.</p>
        </article>
        <article className="lesson-writing-method__step">
          <span className="lesson-writing-method__number">04</span>
          <h3>الخاتمة</h3>
          <p>ركّب ما انتهى إليه التحليل والمناقشة، وأجب عن الإشكال بوضوح. يمكن فتح أفق جديد فقط عندما يكون مرتبطا بالموضوع ولا يتحول إلى سؤال مجاني.</p>
        </article>
      </div>
      <div className="lesson-writing-method__phrases" aria-label="روابط حجاجية مفيدة">
        <span className="lesson-writing-method__phrase">من هذا المنطلق</span>
        <span className="lesson-writing-method__phrase">غير أن</span>
        <span className="lesson-writing-method__phrase">في المقابل</span>
        <span className="lesson-writing-method__phrase">بناء على ذلك</span>
        <span className="lesson-writing-method__phrase">وعليه</span>
        <span className="lesson-writing-method__phrase">وهكذا</span>
      </div>
    </aside>
  );
}

function renderPhilosophyTools() {
  return (
    <aside className="lesson-philosophy-tools" dir="rtl" aria-label="موارد الفلسفة">
      <div className="lesson-philosophy-tools__intro">
        <strong>تابع المراجعة</strong>
        <span>تعلّم الفكرة، ثم استعملها في الكتابة والتدريب.</span>
      </div>
      <div className="lesson-philosophy-tools__links">
        <a href="/flashcards?subject=philosophie"><Layers3 size={15} /> بطاقات المراجعة</a>
        <a href="/exercices?subject=philosophie"><PenLine size={15} /> التمارين</a>
        <a href="/ai-studio/handnotes?subject=philosophie"><FileText size={15} /> ملاحظاتي</a>
        <a href="/lecons/philosophie"><BookOpen size={15} /> كل دروس الفلسفة</a>
      </div>
    </aside>
  );
}

function renderArabicBlocks(blocks: LessonBlock[]) {
  const rendered: ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    const next = blocks[index + 1];

    if (block.type === "heading" && next?.type === "text") {
      rendered.push(renderArabicConceptCard(block, next, index));
      index += 2;
      continue;
    }

    rendered.push(renderBlock(block, index));
    index += 1;
  }

  return rendered;
}

export default function LessonRenderer({ lesson }: { lesson: LessonDocument }) {
  const pages = lesson.blocks.filter((block) => block.type === "page").length;
  const isArabic = lesson.language === "ar";
  const isPhilosophy = lesson.subjectId === "philosophie";
  const isArabicIntro = isArabic && lesson.blocks[0]?.type === "title" && lesson.blocks[1]?.type === "heading" && lesson.blocks[2]?.type === "text";
  const blocks = isArabicIntro ? lesson.blocks.slice(3) : lesson.blocks;

  return (
    <article
      className="lesson-document"
      lang={lesson.language}
      dir={isArabic ? "rtl" : "ltr"}
      data-page-count={pages}
      data-subject={lesson.subjectId}
    >
      {isArabicIntro && renderArabicIntroCard(lesson.blocks)}
      {isPhilosophy && isArabic && renderPhilosophyWritingGuide()}
      {isPhilosophy && isArabic && renderPhilosophyTools()}
      {isArabic ? renderArabicBlocks(blocks) : blocks.map((block, index) => renderBlock(block, index))}
    </article>
  );
}
