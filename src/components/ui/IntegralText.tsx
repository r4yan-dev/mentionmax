import { LatexText } from "./LatexText";

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "ₙ": "n", "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₘ": "m",
};

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "ⁿ": "n",
};

function normalizeIndex(value: string, table: Record<string, string>): string {
  if (value.startsWith("{") && value.endsWith("}")) return value.slice(1, -1);
  return [...value].map((char) => table[char] ?? char).join("");
}

function normalizeIntegralBound(value: string): string {
  return normalizeIndex(value, SUBSCRIPTS);
}

function normalizeIntegralExponent(value: string): string {
  return normalizeIndex(value, SUPERSCRIPTS);
}

function normalizeIntegralBody(value: string): string {
  return value
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ]/g, (char) => SUPERSCRIPTS[char] ?? char)
    .replace(/([A-Za-z0-9)])([₀₁₂₃₄₅₆₇₈₉₊₋ₙₐₑᵢⱼₖₘ]+)/g, (_match, base: string, index: string) => `${base}_{${normalizeIntegralBound(index)}}`)
    .replace(/([A-Za-z0-9)])\^([A-Za-z0-9+-]+)/g, (_match, base: string, exponent: string) => `${base}^{${exponent}}`)
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/√\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/\b(sin|cos|tan)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\b(ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/×/g, "\\times")
    .replace(/·/g, "\\cdot")
    .replace(/π/g, "\\pi")
    .replace(/∞/g, "\\infty");
}

function normalizeIntegrals(text: string): string {
  let result = text;

  const bound = "(?:\\{[^}]+\\}|[A-Za-z0-9+\\-]+|[₀₁₂₃₄₅₆₇₈₉₊₋ₙₐₑᵢⱼₖₘ]+)";
  const differential = "d(?:x|t|u|v|y)";

  // ∫_a^b f(x) dx, ∫₀¹ x² dx, ∫_0^1 f(x) dx
  result = result.replace(
    new RegExp(`∫\\s*(?:_(${bound}))?\\s*(?:\\^(${bound}))?\\s*([^,.;!?]*?)(\\s*${differential})\\b`, "g"),
    (_match, lower: string | undefined, upper: string | undefined, body: string, dx: string) => {
      const lowerPart = lower ? `_{${normalizeIntegralBound(lower)}}` : "";
      const upperPart = upper ? `^{${normalizeIntegralExponent(upper)}}` : "";
      return `\\(\\int${lowerPart}${upperPart} ${normalizeIntegralBody(body.trim())}\\,${dx.trim()}\\)`;
    },
  );

  // ∫ f(x) dx without bounds.
  result = result.replace(
    new RegExp(`∫\\s+([^,.;!?]*?)(\\s*${differential})\\b`, "g"),
    (_match, body: string, dx: string) => `\\(\\int ${normalizeIntegralBody(body.trim())}\\,${dx.trim()}\\)`,
  );

  // Explicit bound notation that uses Unicode subscripts/superscripts directly.
  result = result.replace(
    /∫([₀₁₂₃₄₅₆₇₈₉₊₋ₙ]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ]+)\s*([^,.;!?]*)/g,
    (_match, lower: string, upper: string, body: string) => `\\(\\int_{${normalizeIntegralBound(lower)}}^{${normalizeIntegralExponent(upper)}} ${normalizeIntegralBody(body.trim())}\\)`,
  );

  return result;
}

export function IntegralText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return <LatexText className={className}>{normalizeIntegrals(children)}</LatexText>;
}
