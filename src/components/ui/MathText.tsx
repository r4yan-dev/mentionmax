import { LatexText } from "./LatexText";

const SUPER: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "ⁿ": "n",
};

const SUB: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-", "ₙ": "n",
  "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₘ": "m",
};

const SUPER_CHARS = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ";
const SUB_CHARS = "₀₁₂₃₄₅₆₇₈₉₊₋ₙₐₑᵢⱼₖₘ";

function unicodeIndex(value: string, map: Record<string, string>) {
  if (!value) return "";
  if (value.startsWith("{") && value.endsWith("}")) return value.slice(1, -1);
  return [...value].map((char) => map[char] ?? char).join("");
}

function normalizeAtom(value: string) {
  return value
    .replace(new RegExp(`([A-Za-z0-9)])([${SUPER_CHARS}]+)`, "g"), (_m, base: string, power: string) => `${base}^{${unicodeIndex(power, SUPER)}}`)
    .replace(new RegExp(`([A-Za-z0-9)])([${SUB_CHARS}]+)`, "g"), (_m, base: string, index: string) => `${base}_{${unicodeIndex(index, SUB)}}`)
    .replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/\b(sin|cos|tan|cot)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\b(arcsin|arccos|arctan)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\b(ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/π/g, "\\pi")
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/±/g, "\\pm")
    .replace(/∈/g, "\\in")
    .replace(/∉/g, "\\notin")
    .replace(/∩/g, "\\cap")
    .replace(/∪/g, "\\cup")
    .replace(/∅/g, "\\varnothing")
    .replace(/→/g, "\\to")
    .replace(/↦/g, "\\mapsto")
    .replace(/×/g, "\\times")
    .replace(/·/g, "\\cdot")
    .replace(/ℝ/g, "\\mathbb{R}")
    .replace(/ℤ/g, "\\mathbb{Z}")
    .replace(/ℚ/g, "\\mathbb{Q}")
    .replace(/ℕ/g, "\\mathbb{N}")
    .replace(/ℂ/g, "\\mathbb{C}");
}

function normalizeIntegralText(text: string): string {
  let source = text;

  source = source.replace(
    /∫\s*(?:_\s*(\{[^}]+\}|[^\s^]+))?\s*(?:\^\s*(\{[^}]+\}|[^\s]+))?\s*([\s\S]*?)\s+d\s*([A-Za-z])(?=$|[.!?;,:])/g,
    (_match, lower: string | undefined, upper: string | undefined, body: string, variable: string) => {
      const bounds = `${lower ? `_{${unicodeIndex(lower.trim(), SUB)}}` : ""}${upper ? `^{${unicodeIndex(upper.trim(), SUPER)}}` : ""}`;
      return `\\(\\int${bounds} ${normalizeAtom(body.trim())}\\,d${variable}\\)`;
    },
  );

  source = source.replace(
    /∫([₀₁₂₃₄₅₆₇₈₉₊₋ₙ]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ]+)\s+([^.!?;\n]+)/g,
    (_match, lower: string, upper: string, body: string) =>
      `\\(\\int_{${unicodeIndex(lower, SUB)}}^{${unicodeIndex(upper, SUPER)}} ${normalizeAtom(body.trim())}\\)`,
  );

  source = source.replace(
    /\bintegr(?:ale|al)\s+de\s+([^\s]+)\s+[àa]\s+([^\s]+)\s+(?:de\s+)?(.+?)\s+d\s*([A-Za-z])(?=$|[.!?;])/gi,
    (_match, lower: string, upper: string, body: string, variable: string) =>
      `\\(\\int_{${normalizeAtom(lower)}}^{${normalizeAtom(upper)}} ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  source = source.replace(
    /∫\s+([^.!?;\n]+?)\s+d\s*([A-Za-z])(?=$|[.!?;])/g,
    (_match, body: string, variable: string) => `\\(\\int ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  return source;
}

function escapeLatexText(value: string): string {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function wholeCardAsLatex(text: string): string {
  const normalized = normalizeIntegralText(text);
  const parts: string[] = [];
  let cursor = 0;
  const mathPattern = /\\\(([\s\S]*?)\\\)/g;
  let match: RegExpExecArray | null;

  while ((match = mathPattern.exec(normalized)) !== null) {
    const prose = normalized.slice(cursor, match.index);
    if (prose) parts.push(`\\text{${escapeLatexText(prose)}}`);
    parts.push(match[1]);
    cursor = match.index + match[0].length;
  }

  const remaining = normalized.slice(cursor);
  if (remaining) parts.push(`\\text{${escapeLatexText(remaining)}}`);

  const content = parts.length ? parts.join(" \\quad ") : `\\text{${escapeLatexText(text)}}`;
  return `\\[\\begin{gathered}${content}\\end{gathered}\\]`;
}

export function MathText({ children, className }: { children: string; className?: string }) {
  return <LatexText className={className}>{wholeCardAsLatex(children)}</LatexText>;
}
