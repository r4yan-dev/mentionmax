import { useEffect, useMemo, useRef } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
    };
  }
}

let mathJaxPromise: Promise<void> | null = null;

function loadMathJax(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MathJax?.typesetPromise) return Promise.resolve();
  if (mathJaxPromise) return mathJaxPromise;

  window.MathJax = window.MathJax || {};
  mathJaxPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-mentionmax-mathjax="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("MathJax failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async = true;
    script.dataset.mentionmaxMathjax = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("MathJax failed to load"));
    document.head.appendChild(script);
  });

  return mathJaxPromise;
}

const SUPER: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "ⁿ": "n",
  "ᵃ": "a", "ᵇ": "b", "ᶜ": "c", "ᵈ": "d", "ᵉ": "e", "ᶠ": "f", "ᵍ": "g",
  "ʰ": "h", "ⁱ": "i", "ʲ": "j", "ᵏ": "k", "ˡ": "l", "ᵐ": "m", "ᵒ": "o",
  "ᵖ": "p", "ʳ": "r", "ˢ": "s", "ᵗ": "t", "ᵘ": "u", "ᵛ": "v", "ʷ": "w",
  "ˣ": "x", "ʸ": "y", "ᶻ": "z",
};

const SUB: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-", "ₐ": "a",
  "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₗ": "l", "ₘ": "m", "ₙ": "n",
  "ₒ": "o", "ₚ": "p", "ᵣ": "r", "ₛ": "s", "ₜ": "t", "ᵤ": "u", "ᵥ": "v", "ₓ": "x",
};

const GREEK: Record<string, string> = {
  α: "\\alpha", β: "\\beta", γ: "\\gamma", δ: "\\delta", ε: "\\varepsilon", ϵ: "\\epsilon",
  ζ: "\\zeta", η: "\\eta", θ: "\\theta", ϑ: "\\vartheta", ι: "\\iota", κ: "\\kappa",
  λ: "\\lambda", μ: "\\mu", ν: "\\nu", ξ: "\\xi", π: "\\pi", ρ: "\\rho", σ: "\\sigma",
  ς: "\\varsigma", τ: "\\tau", υ: "\\upsilon", φ: "\\varphi", ϕ: "\\phi", χ: "\\chi",
  ψ: "\\psi", ω: "\\omega", Γ: "\\Gamma", Δ: "\\Delta", Θ: "\\Theta", Λ: "\\Lambda",
  Ξ: "\\Xi", Π: "\\Pi", Σ: "\\Sigma", Υ: "\\Upsilon", Φ: "\\Phi", Ψ: "\\Psi", Ω: "\\Omega",
};

const SUPER_CHARS = Object.keys(SUPER).join("");
const SUB_CHARS = Object.keys(SUB).join("");

function mapChars(value: string, map: Record<string, string>) {
  return [...value].map((char) => map[char] ?? char).join("");
}

function normalize(value: string) {
  let result = value.trim();
  result = result.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");
  result = result.replace(/([A-Za-z0-9]+)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");
  result = result.replace(/\(([^()]+)\)\s*\/\s*([A-Za-z0-9]+)/g, "\\frac{$1}{$2}");
  result = result.replace(new RegExp(`([A-Za-z0-9)\\]])([${SUPER_CHARS}]+)`, "g"), (_m, base, power) => `${base}^{${mapChars(power, SUPER)}}`);
  result = result.replace(new RegExp(`([A-Za-z0-9)\\]])([${SUB_CHARS}]+)`, "g"), (_m, base, sub) => `${base}_{${mapChars(sub, SUB)}}`);
  result = result.replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}");
  result = result.replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}");
  result = result.replace(/\b(sin|cos|tan|cot|arcsin|arccos|arctan|ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)");

  const symbols: Array<[RegExp, string]> = [
    [/≤/g, "\\leq"], [/≥/g, "\\geq"], [/≠/g, "\\neq"], [/≈/g, "\\approx"], [/±/g, "\\pm"],
    [/∞/g, "\\infty"], [/∈/g, "\\in"], [/∉/g, "\\notin"], [/∪/g, "\\cup"], [/∩/g, "\\cap"],
    [/∅/g, "\\varnothing"], [/∀/g, "\\forall"], [/∃/g, "\\exists"], [/⇒/g, "\\Rightarrow"],
    [/⇔/g, "\\Leftrightarrow"], [/→/g, "\\to"], [/←/g, "\\leftarrow"], [/↔/g, "\\leftrightarrow"],
    [/↦/g, "\\mapsto"], [/×/g, "\\times"], [/⋅/g, "\\cdot"], [/·/g, "\\cdot"], [/÷/g, "\\div"],
    [/ℝ/g, "\\mathbb{R}"], [/ℤ/g, "\\mathbb{Z}"], [/ℚ/g, "\\mathbb{Q}"], [/ℕ/g, "\\mathbb{N}"],
    [/ℂ/g, "\\mathbb{C}"], [/∂/g, "\\partial"], [/∇/g, "\\nabla"], [/∑/g, "\\sum"], [/∏/g, "\\prod"],
    [/∫/g, "\\int"], [/∮/g, "\\oint"],
  ];
  for (const [pattern, replacement] of symbols) result = result.replace(pattern, replacement);
  result = result.replace(/[αβγδεϵζηθϑικλμνξοπρσςτυφϕχψωΓΔΘΛΞΠΣΥΦΨΩ]/g, (char) => GREEK[char] ?? char);
  return result;
}

function cleanSource(text: string) {
  // AI sometimes emits a lone Markdown punctuation line after a formula.
  return text.replace(/(^|\n)\s*\.\s*(?=\n|$)/g, "$1");
}

type Segment = { type: "text" | "math"; value: string };

function addSegment(segments: Segment[], type: Segment["type"], value: string) {
  if (!value) return;
  const previous = segments[segments.length - 1];
  if (previous?.type === type) previous.value += value;
  else segments.push({ type, value });
}

function tokenize(text: string): Segment[] {
  const source = cleanSource(text);
  const segments: Segment[] = [];
  let cursor = 0;

  // Explicit authoring delimiters always win. Only their contents become math.
  const explicit = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g;
  let match: RegExpExecArray | null;
  while ((match = explicit.exec(source)) !== null) {
    addSegment(segments, "text", source.slice(cursor, match.index));
    addSegment(segments, "math", match[1] ?? match[2] ?? match[3] ?? match[4]);
    cursor = match.index + match[0].length;
  }

  const remainder = source.slice(cursor);
  if (remainder) {
    tokenizePlain(remainder, segments);
  }
  return segments;
}

function tokenizePlain(text: string, segments: Segment[]) {
  // Equations stop before French punctuation or a clear language separator.
  // This deliberately handles "f(x)=5 et justifier..." as [math][text].
  const equation = /(^|(?<=[\s(,:;]))([A-Za-z](?:[A-Za-z0-9_]*)(?:\([^()\n]*\))?\s*=\s*(?:[^\n.!?;,]+?))(?=(?:\s+(?:et|ou|donc|car|pour|avec|dans|où|qui|que|justifier|déterminer|montrer|calculer|étudier|vérifier)\b)|[.!?;,\n]|$)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = equation.exec(text)) !== null) {
    const start = match.index + (match[1]?.length ?? 0);
    addSegment(segments, "text", text.slice(cursor, start));
    addSegment(segments, "math", match[2]);
    cursor = start + match[2].length;
  }

  const remaining = text.slice(cursor);
  if (remaining) {
    // Standalone mathematical atoms, powers and common functions.
    const atom = /\b(?:[A-Za-z]\([^()\n]*\)|(?:sin|cos|tan|cot|ln|log|exp)\([^()\n]*\)|[A-Za-z][A-Za-z0-9]*\^[A-Za-z0-9{}+-]+|[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9{}+-]+|[A-Za-z][⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ₀₁₂₃₄₅₆₇₈₉₊₋ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)\b/g;
    let atomCursor = 0;
    let atomMatch: RegExpExecArray | null;
    while ((atomMatch = atom.exec(remaining)) !== null) {
      const value = atomMatch[0];
      if (/^[A-Za-z]+$/.test(value) && !/^(?:sin|cos|tan|cot|ln|log|exp)$/.test(value)) continue;
      addSegment(segments, "text", remaining.slice(atomCursor, atomMatch.index));
      addSegment(segments, "math", value);
      atomCursor = atomMatch.index + value.length;
    }
    addSegment(segments, "text", remaining.slice(atomCursor));
  }
}

function Formula({ value, display }: { value: string; display: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const latex = useMemo(() => display ? `\\[${normalize(value)}\\]` : `\\(${normalize(value)}\\)`, [value, display]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.textContent = latex;
    let cancelled = false;
    void loadMathJax().then(async () => {
      if (!cancelled && window.MathJax?.typesetPromise && ref.current) {
        await window.MathJax.typesetPromise([ref.current]);
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [latex]);

  return <span ref={ref} className="mentionmax-math" data-latex-display={display || undefined} />;
}

export function LatexText({ children, className, display = false }: { children: string; className?: string; display?: boolean }) {
  const segments = useMemo(() => display ? [{ type: "math" as const, value: children }] : tokenize(children), [children, display]);

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap", wordBreak: "normal", overflowWrap: "normal" }}>
      {segments.map((segment, index) =>
        segment.type === "math"
          ? <Formula key={`math-${index}`} value={segment.value} display={display} />
          : <span key={`text-${index}`}>{segment.value}</span>,
      )}
    </span>
  );
}
