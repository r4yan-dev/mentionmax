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
  "ᶠ": "f", "ᵍ": "g", "ʰ": "h", "ⁱ": "i", "ʲ": "j", "ᵏ": "k",
  "ˡ": "l", "ᵐ": "m", "ⁿ": "n", "ᵒ": "o", "ᵖ": "p", "ʳ": "r",
  "ˢ": "s", "ᵗ": "t", "ᵘ": "u", "ᵛ": "v", "ʷ": "w", "ˣ": "x", "ʸ": "y", "ᶻ": "z",
};

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "₍": "(", "₎": ")", "ₐ": "a", "ₑ": "e", "ₕ": "h", "ᵢ": "i", "ⱼ": "j",
  "ₖ": "k", "ₗ": "l", "ₘ": "m", "ₙ": "n", "ₒ": "o", "ₚ": "p", "ᵣ": "r", "ₛ": "s", "ₜ": "t",
  "ᵤ": "u", "ᵥ": "v", "ₓ": "x",
};

const GREEK: Record<string, string> = {
  "α": "\\alpha", "β": "\\beta", "γ": "\\gamma", "δ": "\\delta", "ε": "\\varepsilon", "ϵ": "\\epsilon",
  "ζ": "\\zeta", "η": "\\eta", "θ": "\\theta", "ϑ": "\\vartheta", "ι": "\\iota", "κ": "\\kappa",
  "λ": "\\lambda", "μ": "\\mu", "ν": "\\nu", "ξ": "\\xi", "ο": "o", "π": "\\pi", "ϖ": "\\varpi",
  "ρ": "\\rho", "ϱ": "\\varrho", "σ": "\\sigma", "ς": "\\varsigma", "τ": "\\tau", "υ": "\\upsilon",
  "φ": "\\varphi", "ϕ": "\\phi", "χ": "\\chi", "ψ": "\\psi", "ω": "\\omega",
  "Γ": "\\Gamma", "Δ": "\\Delta", "Θ": "\\Theta", "Λ": "\\Lambda", "Ξ": "\\Xi", "Π": "\\Pi",
  "Σ": "\\Sigma", "Υ": "\\Upsilon", "Φ": "\\Phi", "Ψ": "\\Psi", "Ω": "\\Omega",
};

const SYMBOLS: Array<[RegExp, string]> = [
  [/≤/g, "\\leq"], [/≥/g, "\\geq"], [/≠/g, "\\neq"], [/≈/g, "\\approx"], [/≃/g, "\\simeq"],
  [/∼/g, "\\sim"], [/±/g, "\\pm"], [/∓/g, "\\mp"], [/∞/g, "\\infty"], [/∈/g, "\\in"], [/∉/g, "\\notin"],
  [/⊂/g, "\\subset"], [/⊆/g, "\\subseteq"], [/⊄/g, "\\not\subset"], [/⊃/g, "\\supset"], [/⊇/g, "\\supseteq"],
  [/∪/g, "\\cup"], [/∩/g, "\\cap"], [/∅/g, "\\varnothing"], [/∀/g, "\\forall"], [/∃/g, "\\exists"], [/∄/g, "\\nexists"],
  [/¬/g, "\\neg"], [/∧/g, "\\land"], [/∨/g, "\\lor"], [/⇒/g, "\\Rightarrow"], [/⇔/g, "\\Leftrightarrow"],
  [/→/g, "\\to"], [/←/g, "\\leftarrow"], [/↔/g, "\\leftrightarrow"], [/↦/g, "\\mapsto"], [/↑/g, "\\uparrow"], [/↓/g, "\\downarrow"],
  [/×/g, "\\times"], [/⋅/g, "\\cdot"], [/·/g, "\\cdot"], [/÷/g, "\\div"], [/√/g, "\\sqrt{}"],
  [/ℝ/g, "\\mathbb{R}"], [/ℤ/g, "\\mathbb{Z}"], [/ℚ/g, "\\mathbb{Q}"], [/ℕ/g, "\\mathbb{N}"], [/ℂ/g, "\\mathbb{C}"],
  [/ℙ/g, "\\mathbb{P}"], [/ℑ/g, "\\Im"], [/ℜ/g, "\\Re"],
  [/∂/g, "\\partial"], [/∇/g, "\\nabla"], [/∑/g, "\\sum"], [/∏/g, "\\prod"], [/∫/g, "\\int"], [/∮/g, "\\oint"],
  [/∝/g, "\\propto"], [/∞/g, "\\infty"], [/π/g, "\\pi"],
];

function normalizePowers(value: string): string {
  return value
    .replace(/([A-Za-z0-9)\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (_m, base: string, power: string) => {
      const exponent = [...power].map((c) => SUPERSCRIPTS[c] ?? c).join("");
      return `${base}^{${exponent}}`;
    })
    .replace(/([A-Za-z0-9)\]])([₀₁₂₃₄₅₆₇₈₉₊₋₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (_m, base: string, subscript: string) => {
      const index = [...subscript].map((c) => SUBSCRIPTS[c] ?? c).join("");
      return `${base}_{${index}}`;
    });
}

function normalizeFormula(value: string): string {
  let result = normalizePowers(value);
  for (const [pattern, replacement] of SYMBOLS) result = result.replace(pattern, replacement);
  result = result.replace(/[αβγδεϵζηθϑικλμνξοπϖρϱσςτυφϕχψωΓΔΘΛΞΠΣΥΦΨΩ]/g, (char) => GREEK[char] ?? char);

  return result
    .replace(/\blim\s*\(([^)]*)\)/g, "\\lim_{$1}")
    .replace(/\blim\s+([A-Za-z]+)\s*(?:→|->)\s*([^,.;!?]+)/g, "\\lim_{$1\\to $2}")
    .replace(/\b(sin|cos|tan|cot|arcsin|arccos|arctan)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\b(ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\blog_a\s*\(([^)]*)\)/g, "\\log_a($1)")
    .replace(/√\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/\bsqrt\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/\babs\s*\(([^)]*)\)/g, "\\left|$1\\right|")
    .replace(/\bmod\b/g, "\\bmod")
    .replace(/\b([A-Za-z]+)'\s*\(([^)]*)\)/g, "$1'($2)")
    .replace(/\b([A-Za-z]+)''\s*\(([^)]*)\)/g, "$1''($2)")
    .replace(/\bP\s*\(([^)]*)\)/g, "P($1)")
    .replace(/\bC\s*\(([^,;]+)[,;]\s*([^)]*)\)/g, "C($1,$2)")
    .replace(/\bA\s*\(([^)]*)\)/g, "A($1)")
    .replace(/\bvec(?:\(|\s+)([^)]+)\)?/g, "\\overrightarrow{$1}")
    .replace(/\b([A-Za-z]+)_\{([^}]+)\}/g, "$1_{$2}")
    .replace(/\b([A-Za-z]+)\^\{([^}]+)\}/g, "$1^{$2}");
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
  return `\\(${normalizeFormula(value.trim())}\\)`;
}

function toLatex(text: string): string {
  if (!text) return text;

  const protectedValue = protectLatex(text);
  let source = protectedValue.source;

  // Explicit formula-like calls.
  source = source.replace(/\b(?:lim\s*\([^)]*\)|sin\s*\([^)]*\)|cos\s*\([^)]*\)|tan\s*\([^)]*\)|cot\s*\([^)]*\)|arcsin\s*\([^)]*\)|arccos\s*\([^)]*\)|arctan\s*\([^)]*\)|ln\s*\([^)]*\)|log\s*\([^)]*\)|exp\s*\([^)]*\)|sqrt\s*\([^)]*\)|√\s*\([^)]*\)|abs\s*\([^)]*\)|P\s*\([^)]*\)|A\s*\([^)]*\)|C\s*\([^)]*\))/g, wrapFormula);

  // Common powers and indices, including plain x^2 and Unicode x² / uₙ.
  source = source.replace(/\b[A-Za-z](?:\^[-+]?\d+|\^[A-Za-z0-9]+|\^\{[^}]+\})/g, wrapFormula);
  source = source.replace(/\b[A-Za-z](?:[_][A-Za-z0-9]+|[_]\{[^}]+\})/g, wrapFormula);
  source = source.replace(/\b[A-Za-z][⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ₀₁₂₃₄₅₆₇₈₉₊₋₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+/g, wrapFormula);

  // Standard fractions such as a/b or 1/(x+1), but only when clearly mathematical.
  source = source.replace(/\b([A-Za-z0-9]+)\s*\/\s*\(([A-Za-z0-9+\-*/.^_= ]+)\)/g, (_m, numerator: string, denominator: string) => `\\(\\frac{${numerator}}{${denominator}}\\)`);
  source = source.replace(/\b([A-Za-z0-9]+)\s*\/\s*([A-Za-z0-9]+)/g, (_m, numerator: string, denominator: string) => `\\(\\frac{${numerator}}{${denominator}}\\)`);

  // Relations and sets.
  source = source.replace(/(^|[(:]\s*)([A-Za-z0-9α-ωΑ-Ω][^,.;!?]*?(?:=|<|>|≤|≥|≠|≈|∈|∉|⊂|⊆|⊃|⊇|→|↦|⇒|⇔)[^,.;!?]*)(?=\s*[,.;!?]|$)/g, (_m, prefix: string, formula: string) => `${prefix}${wrapFormula(formula)}`);

  // Integrals / sums / products with a compact expression.
  source = source.replace(/(?:∫|∑|∏|∮)\s*[^,.;!?]+/g, (match) => wrapFormula(match));

  // Differential notation and derivatives.
  source = source.replace(/\bd\s*[A-Za-z]+/g, (match) => wrapFormula(match));
  source = source.replace(/\bd\^2\s*[A-Za-z]+\s*\/\s*d[A-Za-z]+\^2\b/g, (match) => wrapFormula(match));

  source = normalizeFormula(source);
  return restoreLatex(source, protectedValue.tokens);
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
