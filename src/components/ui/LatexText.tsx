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
    inlineMath: [["\\(", "\\)"], ["$", "$"], ["\\[", "\\]"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
  };

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

const SUPERS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-",
  "ⁿ": "n", "ᵃ": "a", "ᵇ": "b", "ᶜ": "c", "ᵈ": "d", "ᵉ": "e",
  "ᶠ": "f", "ᵍ": "g", "ʰ": "h", "ⁱ": "i", "ʲ": "j", "ᵏ": "k",
  "ˡ": "l", "ᵐ": "m", "ᵒ": "o", "ᵖ": "p", "ʳ": "r", "ˢ": "s",
  "ᵗ": "t", "ᵘ": "u", "ᵛ": "v", "ʷ": "w", "ˣ": "x", "ʸ": "y", "ᶻ": "z",
};

const SUBS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₗ": "l",
  "ₘ": "m", "ₙ": "n", "ₒ": "o", "ₚ": "p", "ᵣ": "r", "ₛ": "s",
  "ₜ": "t", "ᵤ": "u", "ᵥ": "v", "ₓ": "x",
};

const GREEK: Record<string, string> = {
  α: "\\alpha", β: "\\beta", γ: "\\gamma", δ: "\\delta", ε: "\\varepsilon",
  ϵ: "\\epsilon", ζ: "\\zeta", η: "\\eta", θ: "\\theta", ϑ: "\\vartheta",
  ι: "\\iota", κ: "\\kappa", λ: "\\lambda", μ: "\\mu", ν: "\\nu",
  ξ: "\\xi", π: "\\pi", ϖ: "\\varpi", ρ: "\\rho", ϱ: "\\varrho",
  σ: "\\sigma", ς: "\\varsigma", τ: "\\tau", υ: "\\upsilon", φ: "\\varphi",
  ϕ: "\\phi", χ: "\\chi", ψ: "\\psi", ω: "\\omega", Γ: "\\Gamma",
  Δ: "\\Delta", Θ: "\\Theta", Λ: "\\Lambda", Ξ: "\\Xi", Π: "\\Pi",
  Σ: "\\Sigma", Υ: "\\Upsilon", Φ: "\\Phi", Ψ: "\\Psi", Ω: "\\Omega",
};

function mapChars(value: string, map: Record<string, string>) {
  return [...value].map((char) => map[char] ?? char).join("");
}

function convertFractions(value: string) {
  let result = value;
  for (let i = 0; i < 4; i += 1) {
    const previous = result;
    result = result.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");
    result = result.replace(/([A-Za-z0-9]+)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");
    result = result.replace(/\(([^()]+)\)\s*\/\s*([A-Za-z0-9]+)/g, "\\frac{$1}{$2}");
    if (result === previous) break;
  }
  return result;
}

function normalize(value: string) {
  let result = value.trim();
  result = convertFractions(result);
  result = result.replace(/([A-Za-z0-9)\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (_m, base, power) => `${base}^{${mapChars(power, SUPERS)}}`);
  result = result.replace(/([A-Za-z0-9)\]])([₀₁₂₃₄₅₆₇₈₉₊₋ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (_m, base, sub) => `${base}_{${mapChars(sub, SUBS)}}`);
  result = result.replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}");
  result = result.replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}");
  result = result.replace(/\b(sin|cos|tan|cot|arcsin|arccos|arctan|ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)");
  const symbols: Array<[RegExp, string]> = [
    [/≤/g, "\\leq"], [/≥/g, "\\geq"], [/≠/g, "\\neq"], [/≈/g, "\\approx"],
    [/±/g, "\\pm"], [/∞/g, "\\infty"], [/∈/g, "\\in"], [/∉/g, "\\notin"],
    [/∪/g, "\\cup"], [/∩/g, "\\cap"], [/∅/g, "\\varnothing"], [/∀/g, "\\forall"],
    [/∃/g, "\\exists"], [/⇒/g, "\\Rightarrow"], [/⇔/g, "\\Leftrightarrow"],
    [/→/g, "\\to"], [/←/g, "\\leftarrow"], [/↔/g, "\\leftrightarrow"], [/↦/g, "\\mapsto"],
    [/×/g, "\\times"], [/⋅/g, "\\cdot"], [/·/g, "\\cdot"], [/÷/g, "\\div"],
    [/ℝ/g, "\\mathbb{R}"], [/ℤ/g, "\\mathbb{Z}"], [/ℚ/g, "\\mathbb{Q}"], [/ℕ/g, "\\mathbb{N}"],
    [/ℂ/g, "\\mathbb{C}"], [/∂/g, "\\partial"], [/∇/g, "\\nabla"], [/∑/g, "\\sum"],
    [/∏/g, "\\prod"], [/∫/g, "\\int"], [/∮/g, "\\oint"],
  ];
  for (const [pattern, replacement] of symbols) result = result.replace(pattern, replacement);
  result = result.replace(/[αβγδεϵζηθϑικλμνξοπϖρϱσςτυφϕχψωΓΔΘΛΞΠΣΥΦΨΩ]/g, (char) => GREEK[char] ?? char);
  return result;
}

function wrapFormula(value: string) {
  return `\\(${normalize(value)}\\)`;
}

function isLikelyFormula(value: string) {
  const raw = value.trim();
  if (!raw) return false;
  if (/\\(?:frac|sqrt|int|sum|prod|lim|sin|cos|tan|ln|log|exp|mathbb|mathbf|mathrm|partial|nabla|infty|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|omega|to|mapsto|leq|geq|neq|approx|pm|times|cdot|div)/.test(raw)) return true;
  if (/[=<>≤≥≠≈]/.test(raw)) return true;
  if (/\b(?:f|g|h|u|v|w|F|G)\s*\([^)]*\)/.test(raw)) return true;
  if (/[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/.test(raw)) return true;
  if (/[+*/^]|\b(?:sin|cos|tan|cot|ln|log|exp)\s*\(/.test(raw) && /\d|[A-Za-z]\s*\(/.test(raw)) return true;
  if (/^\s*[A-Za-z](?:\s*[A-Za-z])?\s*\(?[A-Za-z0-9]*\)?\s*$/.test(raw) && raw.length <= 12) return true;
  return false;
}

function protectDelimitedMath(text: string): { source: string; tokens: string[] } {
  const tokens: string[] = [];
  let source = text;

  const protect = (content: string, display: boolean) => {
    const token = `@@MM_LATEX_${tokens.length}@@`;
    if (isLikelyFormula(content)) {
      tokens.push(display ? `\\[${content}\\]` : `\\(${content}\\)`);
    } else {
      // Delimiters around prose are treated as an authoring mistake, not as math.
      tokens.push(content);
    }
    return token;
  };

  source = source.replace(/\\\[([\s\S]*?)\\\]/g, (_match, content) => protect(content, true));
  source = source.replace(/\\\(([\s\S]*?)\\\)/g, (_match, content) => protect(content, false));
  source = source.replace(/\$\$([\s\S]*?)\$\$/g, (_match, content) => protect(content, true));
  source = source.replace(/\$([^$\n]+)\$/g, (_match, content) => protect(content, false));

  return { source, tokens };
}

function restoreTokens(text: string, tokens: string[], prefix: string) {
  const pattern = new RegExp(`${prefix}_(\\d+)@@`, "g");
  return text.replace(pattern, (_m, index) => tokens[Number(index)] ?? _m);
}

function toLatex(text: string) {
  if (!text) return text;
  const protectedValue = protectDelimitedMath(text);
  let source = protectedValue.source;
  const equationTokens: string[] = [];

  // Only the equation itself is math. French words before/after it remain HTML text.
  source = source.replace(/(^|[\s(,:;])([A-Za-z][A-Za-z0-9_]*(?:\([^()\n]*\))?\s*=\s*[^.!?;\n]+?)(?=[.!?;]|$)/gm, (_m, prefix, formula) => {
    const token = `@@MM_EQUATION_${equationTokens.length}@@`;
    equationTokens.push(`${prefix}${wrapFormula(formula)}`);
    return token;
  });

  source = source.replace(/\b(?:lim|sin|cos|tan|cot|arcsin|arccos|arctan|ln|log|exp|sqrt)\s*\([^)]*\)/g, wrapFormula);
  source = source.replace(/\b([A-Za-z0-9]+)\s*\/\s*\(([A-Za-z0-9+\-*/.^_= ]+)\)/g, (_m, numerator, denominator) => wrapFormula(`\\frac{${normalize(numerator)}}{${normalize(denominator)}}`));
  source = source.replace(/\b[A-Za-z](?:\^[-+]?\d+|\^[A-Za-z0-9]+|\^\{[^}]+\}|_[A-Za-z0-9]+|_\{[^}]+\})/g, wrapFormula);
  source = source.replace(/\b[A-Za-z][⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ₀₁₂₃₄₅₆₇₈₉₊₋ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+/g, wrapFormula);

  source = restoreTokens(source, equationTokens, "@@MM_EQUATION");
  return restoreTokens(source, protectedValue.tokens, "@@MM_LATEX");
}

export function LatexText({ children, className, display = false }: { children: string; className?: string; display?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const latex = useMemo(() => display ? `\\[${normalize(children)}\\]` : toLatex(children), [children, display]);

  useEffect(() => {
    let cancelled = false;
    const element = ref.current;
    if (!element) return;
    element.textContent = latex;
    if (!latex.includes("\\(") && !latex.includes("\\[")) return;

    void loadMathJax().then(async () => {
      if (!cancelled && window.MathJax?.typesetPromise && ref.current) {
        await window.MathJax.typesetPromise([ref.current]);
      }
    }).catch(() => undefined);

    return () => { cancelled = true; };
  }, [latex]);

  return (
    <span
      ref={ref}
      className={className}
      data-latex-display={display || undefined}
      style={{ fontSize: display ? "1.10em" : "1em", whiteSpace: "pre-wrap", wordBreak: "normal", overflowWrap: "normal" }}
    />
  );
}
