type PdfJs = {
  jsPDF: new (options?: Record<string, unknown>) => {
    setFillColor: (r: number, g: number, b: number) => void;
    setDrawColor: (r: number, g: number, b: number) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    setFont: (font: string, style?: string) => void;
    setFontSize: (size: number) => void;
    roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style: string) => void;
    rect: (x: number, y: number, w: number, h: number, style: string) => void;
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    text: (text: string | string[], x: number, y: number, options?: Record<string, unknown>) => void;
    splitTextToSize: (text: string, size: number) => string[];
    addImage: (data: string, type: string, x: number, y: number, w: number, h: number) => void;
    addPage: () => void;
    internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
    save: (filename: string) => void;
  };
};

type MathJaxWindow = Window & typeof globalThis & {
  MathJax?: {
    tex2svgPromise?: (tex: string, options?: Record<string, unknown>) => Promise<Element>;
  };
};

let loader: Promise<void> | null = null;

function loadScript(src: string, marker: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-mentionmax-structured-export="${marker}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Export library failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.mentionmaxStructuredExport = marker;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Export library failed to load"));
    document.head.appendChild(script);
  });
}

async function loadLibraries() {
  if (loader) return loader;
  loader = Promise.all([
    loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js", "jspdf"),
    loadScript("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js", "mathjax-svg"),
  ]).then(() => undefined);
  return loader;
}

function safeFileName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "ressource-menti";
}

function stripMath(value: string) {
  return value.replace(/\\\[([\s\S]*?)\\\]/g, " $1 ").replace(/\\\(([\s\S]*?)\\\)/g, " $1 ").replace(/\s+/g, " ").trim();
}

function extractMath(value: string) {
  const matches: string[] = [];
  value.replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g, (_m, display, inline) => {
    matches.push(String(display ?? inline).trim());
    return "";
  });
  return matches;
}

function sanitizeMath(tex: string) {
  return tex.replace(/\\left\s*/g, "").replace(/\\right\s*/g, "").replace(/\\middle\s*/g, "").replace(/\$\$/g, "\\$\\$");
}

async function mathToPng(tex: string, scale = 1) {
  const w = window as MathJaxWindow;
  if (!w.MathJax?.tex2svgPromise) return null;
  const wrapper = await w.MathJax.tex2svgPromise(sanitizeMath(tex), { display: true });
  const svg = wrapper.querySelector("svg");
  if (!svg) return null;
  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svg);
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Formula rasterization failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    const width = Math.max(80, Math.ceil((image.width || 160) * scale));
    const height = Math.max(30, Math.ceil((image.height || 50) * scale));
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return { data: canvas.toDataURL("image/png"), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function titleFor(result: Record<string, unknown>, fallback: string) {
  return typeof result.title === "string" && result.title.trim() ? result.title : fallback;
}

function collectBlocks(result: Record<string, unknown>) {
  const blocks: Array<{ heading?: string; body?: string; formulas?: string[]; kind?: string }> = [];
  if (typeof result.intro === "string") blocks.push({ heading: "Introduction", body: result.intro });
  if (Array.isArray(result.prerequisites)) blocks.push({ heading: "Prérequis", body: result.prerequisites.map(String).join("\n• ") });
  if (Array.isArray(result.learningObjectives)) blocks.push({ heading: "Objectifs", body: result.learningObjectives.map(String).join("\n• ") });
  if (Array.isArray(result.sections)) {
    (result.sections as Record<string, unknown>[]).forEach((section, index) => {
      const heading = typeof section.title === "string" ? section.title : `Partie ${index + 1}`;
      const bodyParts = [typeof section.explanation === "string" ? section.explanation : "", typeof section.intuition === "string" ? `Intuition: ${section.intuition}` : ""].filter(Boolean);
      const formulas = Array.isArray(section.formulas) ? section.formulas.map(String) : [];
      if (bodyParts.length || formulas.length) blocks.push({ heading, body: bodyParts.join("\n\n"), formulas, kind: "section" });
      for (const key of ["keyConcepts", "definitions", "derivations", "examples", "commonMistakes", "examFocusPoints"]) {
        if (!Array.isArray(section[key]) || section[key].length === 0) continue;
        blocks.push({ heading: key, body: section[key].map((entry) => typeof entry === "string" ? entry : JSON.stringify(entry)).join("\n• ") });
      }
    });
  }
  if (typeof result.summary === "string") blocks.push({ heading: "L'essentiel", body: result.summary, formulas: Array.isArray(result.formulas) ? result.formulas.map(String) : [] });
  if (Array.isArray(result.keyPoints)) blocks.push({ heading: "Points clés", body: result.keyPoints.map(String).join("\n• ") });
  if (Array.isArray(result.cards)) {
    (result.cards as Record<string, unknown>[]).forEach((card, index) => blocks.push({ heading: `Flashcard ${index + 1}`, body: `Question: ${String(card.question ?? "")}\nRéponse: ${String(card.answer ?? "")}` }));
  }
  if (Array.isArray(result.questions)) {
    (result.questions as Record<string, unknown>[]).forEach((question, index) => blocks.push({ heading: `Question ${index + 1}`, body: `${String(question.question ?? "")}\n${Array.isArray(question.choices) ? question.choices.map((choice, i) => `${String.fromCharCode(65 + i)}. ${String(choice)}`).join("\n") : ""}`, formulas: typeof question.explanation === "string" ? [question.explanation] : [] }));
  }
  if (Array.isArray(result.mustRemember)) blocks.push({ heading: "À retenir absolument", body: result.mustRemember.map(String).join("\n• ") });
  return blocks;
}

export async function downloadStructuredResourcePdf(result: Record<string, unknown>, fallbackTitle: string) {
  await loadLibraries();
  const pdfGlobal = window as Window & typeof globalThis & { jspdf?: PdfJs };
  const JsPdf = pdfGlobal.jspdf?.jsPDF;
  if (!JsPdf) throw new Error("Le moteur PDF n'est pas disponible.");
  const pdf = new JsPdf({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 13;
  const width = pageWidth - margin * 2;
  let y = margin;

  const newPageIfNeeded = (required = 24) => {
    if (y + required <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  };
  const drawBox = (height: number, fill: [number, number, number]) => {
    pdf.setFillColor(...fill);
    pdf.setDrawColor(190, 212, 207);
    pdf.roundedRect(margin, y - 4, width, height, 4, 4, "FD");
  };
  const writeWrapped = (text: string, fontSize: number, color: [number, number, number], indent = 0) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(stripMath(text), width - indent);
    pdf.text(lines, margin + indent, y);
    y += lines.length * (fontSize * 0.42) + 3;
  };

  const title = titleFor(result, fallbackTitle);
  pdf.setFillColor(237, 248, 245);
  pdf.roundedRect(margin, y, width, 25, 5, 5, "F");
  pdf.setTextColor(7, 59, 58);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text(title, margin + 6, y + 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(15, 163, 163);
  pdf.text("MENTI · RESSOURCE DE RÉVISION", margin + 6, y + 18);
  y += 34;

  const blocks = collectBlocks(result);
  for (const block of blocks) {
    const body = block.body?.trim() ?? "";
    const formulas = block.formulas ?? [];
    const lines = body ? pdf.splitTextToSize(stripMath(body), width - 12) : [];
    const estimated = 14 + lines.length * 6 + formulas.length * 18;
    newPageIfNeeded(Math.min(65, estimated));
    drawBox(Math.max(22, Math.min(90, estimated)), block.kind === "section" ? [255, 253, 247] : [248, 252, 250]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(block.kind === "section" ? 14 : 11);
    pdf.setTextColor(7, 59, 58);
    pdf.text(block.heading ?? "", margin + 6, y + 5);
    y += 12;
    if (body) writeWrapped(body, 10.5, [35, 59, 57], 4);
    const allMath = [...extractMath(body), ...formulas.flatMap(extractMath), ...formulas.filter((formula) => !/[\\()[\]{}]/.test(formula) || formula.includes("\\"))];
    for (const formula of allMath.slice(0, 8)) {
      newPageIfNeeded(24);
      const rendered = await mathToPng(formula, 1.7);
      if (rendered) {
        const maxW = width - 18;
        const ratio = rendered.width / rendered.height;
        const imageW = Math.min(maxW, Math.max(24, rendered.width / 16));
        const imageH = imageW / ratio;
        pdf.addImage(rendered.data, "PNG", margin + 9, y - 1, imageW, Math.min(18, imageH));
        y += Math.min(18, imageH) + 5;
      } else {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.text(formula, margin + 8, y);
        y += 5;
      }
    }
    y += 6;
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(115, 133, 130);
  pdf.text("Généré par Menti AI Studio", margin, pageHeight - 7);
  pdf.save(`${safeFileName(title)}.pdf`);
}
