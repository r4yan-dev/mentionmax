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

const SUP_CHARS = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ";
const SUB_CHARS = "₀₁₂₃₄₅₆₇₈₉₊₋ₙₐₑᵢⱼₖₘ";

function unicodeIndex(value: string, map: Record<string, string>) {
  if (!value) return "";
  if (value.startsWith("{") && value.endsWith("}")) return value.slice(1, -1);
  return [...value].map((char) => map[char] ?? char).join("");
}

function normalizeAtom(value: string) {
  return value
    .replace(new RegExp(`([A-Za-z0-9)])([${SUP_CHARS}]+)`, "g"), (_m, base: string, power: string) => `${base}^{${unicodeIndex(power, SUPER)}}`)
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

function normalizeBound(value: string, map: Record<string, string>) {
  return normalizeAtom(unicodeIndex(value.trim(), map));
}

function normalizeIntegralText(text: string): string {
  let source = text;

  // Definite integral with regular or Unicode bounds:
  // ∫_a^b f(x) dx, ∫₀¹ x² dx, ∫{0}^{1} x^2 dx
  source = source.replace(
    /∫\s*(?:_\s*(\{[^}]+\}|[^\s^]+))?\s*(?:\^\s*(\{[^}]+\}|[^\s]+))?\s*([\s\S]*?)\s+d\s*([A-Za-z])(?=$|[.!?;,:])/g,
    (_match, lower: string | undefined, upper: string | undefined, body: string, variable: string) => {
      const bounds = `${lower ? `_{${normalizeBound(lower, SUB)}}` : ""}${upper ? `^{${normalizeBound(upper, SUPER)}}` : ""}`;
      return `\\(\\int${bounds} ${normalizeAtom(body.trim())}\\,d${variable}\\)`;
    },
  );

  // Same notation when the whole card ends immediately after dx/dt/etc.
  source = source.replace(
    /∫\s*(?:_\s*(\{[^}]+\}|[^\s^]+))?\s*(?:\^\s*(\{[^}]+\}|[^\s]+))?\s*([\s\S]*?)\s+d\s*([A-Za-z])$/g,
    (_match, lower: string | undefined, upper: string | undefined, body: string, variable: string) => {
      const bounds = `${lower ? `_{${normalizeBound(lower, SUB)}}` : ""}${upper ? `^{${normalizeBound(upper, SUPER)}}` : ""}`;
      return `\\(\\int${bounds} ${normalizeAtom(body.trim())}\\,d${variable}\\)`;
    },
  );

  // Unicode bound form that may not contain an explicit differential:
  // ∫₀¹ x²
  source = source.replace(
    new RegExp(`∫([${SUB_CHARS}]+)([${SUP_CHARS}]+)\\s+([^.!?;\\n]+)`, "g"),
    (_match, lower: string, upper: string, body: string) =>
      `\\(\\int_{${normalizeBound(lower, SUB)}}^{${normalizeBound(upper, SUPER)}} ${normalizeAtom(body.trim())}\\)`,
  );

  // Indefinite integral: ∫ f(x) dx
  source = source.replace(
    /∫\s+([^.!?;\n]+?)\s+d\s*([A-Za-z])(?=$|[.!?;])/g,
    (_match, body: string, variable: string) => `\\(\\int ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  // Textual French notation: intégrale de a à b de f(x) dx
  source = source.replace(
    /\bintegr(?:ale|al)\s+de\s+([^\s]+)\s+[àa]\s+([^\s]+)\s+(?:de\s+)?(.+?)\s+d\s*([A-Za-z])(?=$|[.!?;])/gi,
    (_match, lower: string, upper: string, body: string, variable: string) =>
      `\\(\\int_{${normalizeAtom(lower)}}^{${normalizeAtom(upper)}} ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  return source;
}

export function MathText({ children, className }: { children: string; className?: string }) {
  return <LatexText className={className}>{normalizeIntegralText(children)}</LatexText>;
}
