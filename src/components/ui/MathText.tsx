import { LatexText } from "./LatexText";

const SUPER: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-",
  "ⁿ": "n", "ᵃ": "a", "ᵇ": "b", "ᶦ": "i", "ʲ": "j", "ᵏ": "k",
};

const SUB: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "ₙ": "n", "ᵢ": "i", "ⱼ": "j", "ₖ": "k",
};

function unicodeIndex(value: string, map: Record<string, string>) {
  return [...value].map((char) => map[char] ?? char).join("");
}

function normalizeAtom(value: string) {
  return value
    .replace(/([A-Za-z0-9)])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶦʲᵏ]+)/g, (_m, base: string, power: string) => `${base}^{${unicodeIndex(power, SUPER)}}`)
    .replace(/([A-Za-z0-9)])([₀₁₂₃₄₅₆₇₈₉₊₋ₙᵢⱼₖ]+)/g, (_m, base: string, index: string) => `${base}_{${unicodeIndex(index, SUB)}}`)
    .replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/π/g, "\\pi")
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/×/g, "\\times")
    .replace(/·/g, "\\cdot")
    .replace(/→/g, "\\to")
    .replace(/ℝ/g, "\\mathbb{R}")
    .replace(/ℤ/g, "\\mathbb{Z}")
    .replace(/ℚ/g, "\\mathbb{Q}")
    .replace(/ℕ/g, "\\mathbb{N}")
    .replace(/ℂ/g, "\\mathbb{C}");
}

function parseIntegral(text: string): string {
  let source = text;

  // Definite integrals: ∫_a^b f(x) dx, ∫ₐᵇ ..., ∫₀¹ ...
  source = source.replace(
    /∫(?:_([^\s^]+)|([₀₁₂₃₄₅₆₇₈₉]+))?(?:\^([^\s]+)|([⁰¹²³⁴⁵⁶⁷⁸⁹]+))?\s*([^.!?;\n]*?)\s*d\s*([A-Za-z])(?=$|[.!?;\n])/g,
    (_m, lowerA: string | undefined, lowerU: string | undefined, upperA: string | undefined, upperU: string | undefined, body: string, variable: string) => {
      const lower = lowerA ?? (lowerU ? unicodeIndex(lowerU, SUB) : "");
      const upper = upperA ?? (upperU ? unicodeIndex(upperU, SUPER) : "");
      const bounds = lower || upper ? `_{${normalizeAtom(lower)}}${upper ? `^{${normalizeAtom(upper)}}` : ""}` : "";
      return `\\(\\int${bounds} ${normalizeAtom(body.trim())}\\,d${variable}\\)`;
    },
  );

  // Underscore / caret written with regular characters: ∫_a^b ... dx
  source = source.replace(
    /∫_\s*([^\s^]+)\s*\^\s*([^\s]+)\s+([^.!?;\n]*?)\s+d\s*([A-Za-z])(?=$|[.!?;\n])/g,
    (_m, lower: string, upper: string, body: string, variable: string) =>
      `\\(\\int_{${normalizeAtom(lower)}}^{${normalizeAtom(upper)}} ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  // Indefinite integrals: ∫ f(x) dx
  source = source.replace(
    /∫\s*([^.!?;\n]*?)\s+d\s*([A-Za-z])(?=$|[.!?;\n])/g,
    (_m, body: string, variable: string) => `\\(\\int ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  // Common text form: integral de a à b de f(x) dx
  source = source.replace(
    /integr(?:ale|al)\s+de\s+([^\s]+)\s+[àa]\s+([^\s]+)\s+(?:de\s+)?(.+?)\s+d([A-Za-z])(?=$|[.!?;])/gi,
    (_m, lower: string, upper: string, body: string, variable: string) =>
      `\\(\\int_{${normalizeAtom(lower)}}^{${normalizeAtom(upper)}} ${normalizeAtom(body.trim())}\\,d${variable}\\)`,
  );

  return source;
}

export function MathText({ children, className }: { children: string; className?: string }) {
  return <LatexText className={className}>{parseIntegral(children)}</LatexText>;
}
