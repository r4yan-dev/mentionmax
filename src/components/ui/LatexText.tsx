import { useEffect, useMemo, useRef } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
      tex?: { inlineMath?: string[][]; displayMath?: string[][] };
    };
  }
}

let mathJaxPromise: Promise<void> | null = null;

function loadMathJax(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MathJax?.typesetPromise) return Promise.resolve();
  if (mathJaxPromise) return mathJaxPromise;

  window.MathJax = window.MathJax || {};
  window.MathJax.tex = {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
  };

  mathJaxPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mentionmax-mathjax="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("MathJax failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.dataset.mentionmaxMathjax = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("MathJax failed to load"));
    document.head.appendChild(script);
  });

  return mathJaxPromise;
}

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-",
  "ⁿ": "n", "ᵃ": "a", "ᵇ": "b", "ᶜ": "c", "ᵈ": "d", "ᵉ": "e",
  "ᵏ": "k", "ᵐ": "m", "ᵖ": "p", "ʳ": "r", "ˣ": "x",
};

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "ₙ": "n", "ₐ": "a", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₘ": "m",
};

const SYMBOLS: Array<[RegExp, string]> = [
  [/≤/g, "\\leq"], [/≥/g, "\\geq"], [/≠/g, "\\neq"], [/≈/g, "\\approx"],
  [/±/g, "\\pm"], [/∞/g, "\\infty"], [/∈/g, "\\in"], [/∉/g, "\\notin"],
  [/∪/g, "\\cup"], [/∩/g, "\\cap"], [/∅/g, "\\varnothing"],
  [/ℝ/g, "\\mathbb{R}"], [/ℤ/g, "\\mathbb{Z}"], [/ℚ/g, "\\mathbb{Q}"],
  [/ℕ/g, "\\mathbb{N}"], [/ℂ/g, "\\mathbb{C}"], [/×/g, "\\times"],
  [/·/g, "\\cdot"], [/→/g, "\\to"], [/↦/g, "\\mapsto"], [/π/g, "\\pi"],
  [/α/g, "\\alpha"], [/β/g, "\\beta"], [/γ/g, "\\gamma"], [/δ/g, "\\delta"],
  [/ε/g, "\\varepsilon"], [/λ/g, "\\lambda"], [/μ/g, "\\mu"], [/σ/g, "\\sigma"],
  [/τ/g, "\\tau"], [/φ/g, "\\varphi"], [/ω/g, "\\omega"],
  [/Δ/g, "\\Delta"], [/Ω/g, "\\Omega"],
];

function normalizePowers(value: string): string {
  return value
    .replace(/([A-Za-z0-9)\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᵏᵐᵖʳˣ]+)/g, (_m, base: string, power: string) => {
      const exponent = [...power].map((c) => SUPERSCRIPTS[c] ?? c).join("");
      return `${base}^{${exponent}}`;
    })
    .replace(/([A-Za-z])([₀₁₂₃₄₅₆₇₈₉ₙₐᵢⱼₖₘ]+)/g, (_m, base: string, subscript: string) => {
      const index = [...subscript].map((c) => SUBSCRIPTS[c] ?? c).join("");
      return `${base}_{${index}}`;
    });
}

function normalizeFormula(value: string): string {
  let result = normalizePowers(value);
  for (const [pattern, replacement] of SYMBOLS) result = result.replace(pattern, replacement);

  result = result
    .replace(/\blim\s*\(([^)]*)\)/g, "\\lim_{$1}")
    .replace(/\b(sin|cos|tan)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\b(ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/√\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/\bsqrt\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/\bC\s*\(([^,]+),\s*([^\)]+)\)/g, "C($1,$2)")
    .replace(/\b([A-Za-z]+)'\(([^)]*)\)/g, "$1'($2)")
    .replace(/\b([A-Za-z]+)_\{([^}]+)\}/g, "$1_{$2}")
    .replace(/\b([A-Za-z]+)\^\{([^}]+)\}/g, "$1^{$2}");

  return result;
}

function looksLikeMath(value: string): boolean {
  return /(?:[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]|∞|ℝ|ℤ|ℚ|ℕ|ℂ|π|α|β|γ|δ|ε|λ|μ|σ|τ|φ|ω|Δ|Ω|[=<>≤≥≠≈]|→|↦|∫|√|∩|∪|\^|_|\\b(?:lim|sin|cos|tan|ln|log|exp)\\b|\\bP\s*\(|\\bC\s*\(|\\b(?:deg|f'|g'|h')\b)/.test(value);
}

function protectLatex(text: string): { source: string; tokens: string[] } {
  const tokens: string[] = [];
  const source = text.replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$/g, (match) => {
    const token = `@@MM_LATEX_${tokens.length}@@`;
    tokens.push(match);
    return token;
  });
  return { source, tokens };
}

function restoreLatex(text: string, tokens: string[]): string {
  return text.replace(/@@MM_LATEX_(\d+)@@/g, (_m, index: string) => tokens[Number(index)] ?? _m);
}

function wrapFormula(value: string): string {
  const formula = normalizeFormula(value.trim());
  return `\\(${formula}\\)`;
}

function toLatex(text: string): string {
  if (!text) return text;
  if (/\\\(|\\\[|\$\$/.test(text)) return text;

  const protectedValue = protectLatex(text);
  let source = protectedValue.source;

  // Highest-confidence standalone formulas first.
  source = source.replace(/\b(?:lim\s*\([^)]*\)|sin\s*\([^)]*\)|cos\s*\([^)]*\)|tan\s*\([^)]*\)|ln\s*\([^)]*\)|log\s*\([^)]*\)|exp\s*\([^)]*\)|√\s*\([^)]*\)|sqrt\s*\([^)]*\)|P\s*\([^)]*\)|C\s*\([^)]*\))/g, wrapFormula);

  // Function notation, derivatives, powers and indexed quantities.
  source = source.replace(/\b(?:[fgh])'\([A-Za-z0-9]+\)/g, wrapFormula);
  source = source.replace(/\b[A-Za-z]+\^\{[^}]+\}/g, wrapFormula);
  source = source.replace(/\b[A-Za-z]+_[A-Za-z0-9]+/g, wrapFormula);
  source = source.replace(/\b[A-Za-z][⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ⁿ]+/g, wrapFormula);

  // Expressions with a clear relation/operator, bounded by normal punctuation.
  source = source.replace(/(^|[(:]\s*)([A-Za-z0-9][^,.;!?]*?(?:=|<|>|≤|≥|≠|≈|→|↦)[^,.;!?]*)(?=\s*[,.;!?]|$)/g, (_m, prefix: string, formula: string) => `${prefix}${wrapFormula(formula)}`);

  // Limits/integrals written with Unicode notation.
  source = source.replace(/∫\s*[^,.;!?]+/g, (match) => wrapFormula(match));

  source = normalizeFormula(source);
  source = restoreLatex(source, protectedValue.tokens);
  return source;
}

export function LatexText({
  children,
  className,
  display = false,
}: {
  children: string;
  className?: string;
  display?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const source = display ? children.trim() : children;
  const latex = useMemo(() => (display ? `\\[${source}\\]` : toLatex(source)), [display, source]);

  useEffect(() => {
    let cancelled = false;
    const element = ref.current;
    if (!element) return;

    element.textContent = latex;
    if (!latex.includes("\\(") && !latex.includes("\\[") && !latex.includes("$$") && !latex.includes("$")) return;

    void loadMathJax()
      .then(async () => {
        if (cancelled || !window.MathJax?.typesetPromise || !ref.current) return;
        await window.MathJax.typesetPromise([ref.current]);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [latex]);

  return <span ref={ref} className={className} data-latex-display={display || undefined} />;
}
