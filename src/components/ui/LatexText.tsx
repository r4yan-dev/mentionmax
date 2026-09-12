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
  "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9",
  "⁺":"+","⁻":"-","ⁿ":"n","ᵃ":"a","ᵇ":"b","ᶜ":"c","ᵈ":"d","ᵉ":"e","ᶠ":"f","ᵍ":"g",
  "ʰ":"h","ⁱ":"i","ʲ":"j","ᵏ":"k","ˡ":"l","ᵐ":"m","ᵒ":"o","ᵖ":"p","ʳ":"r","ˢ":"s",
  "ᵗ":"t","ᵘ":"u","ᵛ":"v","ʷ":"w","ˣ":"x","ʸ":"y","ᶻ":"z",
};
const SUBS: Record<string, string> = {
  "₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9",
  "₊":"+","₋":"-","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₖ":"k","ₗ":"l","ₘ":"m","ₙ":"n",
  "ₒ":"o","ₚ":"p","ᵣ":"r","ₛ":"s","ₜ":"t","ᵤ":"u","ᵥ":"v","ₓ":"x",
};
const GREEK: Record<string, string> = {
  α:"\\alpha",β:"\\beta",γ:"\\gamma",δ:"\\delta",ε:"\\varepsilon",ϵ:"\\epsilon",ζ:"\\zeta",η:"\\eta",θ:"\\theta",
  ϑ:"\\vartheta",ι:"\\iota",κ:"\\kappa",λ:"\\lambda",μ:"\\mu",ν:"\\nu",ξ:"\\xi",π:"\\pi",ϖ:"\\varpi",
  ρ:"\\rho",ϱ:"\\varrho",σ:"\\sigma",ς:"\\varsigma",τ:"\\tau",υ:"\\upsilon",φ:"\\varphi",ϕ:"\\phi",
  χ:"\\chi",ψ:"\\psi",ω:"\\omega",Γ:"\\Gamma",Δ:"\\Delta",Θ:"\\Theta",Λ:"\\Lambda",Ξ:"\\Xi",Π:"\\Pi",
  Σ:"\\Sigma",Υ:"\\Upsilon",Φ:"\\Phi",Ψ:"\\Psi",Ω:"\\Omega",
};

const KNOWN_FUNCTIONS = new Set(["sin", "cos", "tan", "cot", "arcsin", "arccos", "arctan", "ln", "log", "exp", "lim", "sqrt"]);
const SUPER_CHARS = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ";
const SUB_CHARS = "₀₁₂₃₄₅₆₇₈₉₊₋ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ";

function mapChars(value: string, map: Record<string, string>) {
  return [...value].map((c) => map[c] ?? c).join("");
}

function normalize(value: string) {
  let result = value.replace(/[\u0008\u0009\u000b\u000c\u000d]/g, "").replace(/\u0000/g, "");
  result = result.replace(new RegExp(`([A-Za-z0-9)])([${SUPER_CHARS}]+)`, "g"), (_m, b, p) => `${b}^{${mapChars(p, SUPERS)}}`);
  result = result.replace(new RegExp(`([A-Za-z0-9)])([${SUB_CHARS}]+)`, "g"), (_m, b, s) => `${b}_{${mapChars(s, SUBS)}}`);
  result = result.replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}").replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}");
  result = result.replace(/\b(sin|cos|tan|cot|arcsin|arccos|arctan|ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)");
  const symbols: Array<[RegExp, string]> = [
    [/≤/g,"\\leq"],[/≥/g,"\\geq"],[/≠/g,"\\neq"],[/≈/g,"\\approx"],[/±/g,"\\pm"],[/∞/g,"\\infty"],
    [/∈/g,"\\in"],[/∉/g,"\\notin"],[/∪/g,"\\cup"],[/∩/g,"\\cap"],[/∅/g,"\\varnothing"],[/∀/g,"\\forall"],
    [/∃/g,"\\exists"],[/⇒/g,"\\Rightarrow"],[/⇔/g,"\\Leftrightarrow"],[/→/g,"\\to"],[/←/g,"\\leftarrow"],
    [/↔/g,"\\leftrightarrow"],[/↦/g,"\\mapsto"],[/×/g,"\\times"],[/⋅/g,"\\cdot"],[/·/g,"\\cdot"],[/÷/g,"\\div"],
    [/ℝ/g,"\\mathbb{R}"],[/ℤ/g,"\\mathbb{Z}"],[/ℚ/g,"\\mathbb{Q}"],[/ℕ/g,"\\mathbb{N}"],[/ℂ/g,"\\mathbb{C}"],
    [/∂/g,"\\partial"],[/∇/g,"\\nabla"],[/∑/g,"\\sum"],[/∏/g,"\\prod"],[/∫/g,"\\int"],[/∮/g,"\\oint"],
  ];
  for (const [pattern, replacement] of symbols) result = result.replace(pattern, replacement);
  result = result.replace(/[αβγδεϵζηθϑικλμνξοπϖρϱσςτυφϕχψωΓΔΘΛΞΠΣΥΦΨΩ]/g, (c) => GREEK[c] ?? c);
  return result;
}

function sanitizeProtectedMath(value: string) {
  return normalize(value).replace(/\\left\s*/g, "").replace(/\\right\s*/g, "").replace(/\\middle\s*/g, "");
}

function normalizeDollarDelimiters(text: string) {
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, body) => `\\[${body}\\]`)
    .replace(/\$([^$\n]+)\$/g, (_m, body) => `\\(${body}\\)`);
}

function protectLatex(text: string): { source: string; tokens: string[] } {
  const tokens: string[] = [];
  const normalized = normalizeDollarDelimiters(text);
  const source = normalized.replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\)/g, (match) => {
    const token = `@@MM_LATEX_${tokens.length}@@`;
    tokens.push(sanitizeProtectedMath(match));
    return token;
  });
  return { source, tokens };
}

function restoreLatex(text: string, tokens: string[]) {
  return text.replace(/@@MM_LATEX_(\d+)@@/g, (_m, i) => tokens[Number(i)] ?? _m);
}

function consumeMathExpression(text: string, start: number): number {
  let i = start;
  let consumedMathSignal = false;
  let previousWasIdentifier = false;

  while (i < text.length) {
    const c = text[i];
    if (c === "\n" || "." === c || "!" === c || "?" === c || ";" === c || "," === c) break;
    if (/\s/.test(c)) {
      const next = text.slice(i).match(/^\s+/)?.[0] ?? "";
      i += next.length;
      continue;
    }
    if (c === "\\") {
      const command = text.slice(i + 1).match(/^[A-Za-z]+/)?.[0];
      if (!command) break;
      i += command.length + 1;
      consumedMathSignal = true;
      previousWasIdentifier = false;
      continue;
    }
    if (KNOWN_FUNCTIONS.has(text.slice(i).match(/^[A-Za-z]+/)?.[0] ?? "")) {
      const fn = text.slice(i).match(/^[A-Za-z]+/)?.[0] ?? "";
      i += fn.length;
      previousWasIdentifier = true;
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      const word = text.slice(i).match(/^[A-Za-z]+/)?.[0] ?? "";
      if (word.length > 1) break;
      i += 1;
      if (previousWasIdentifier && !/[0-9_{}^]/.test(text[i - 1])) break;
      previousWasIdentifier = true;
      continue;
    }
    if (/[0-9]/.test(c) || /[(){}\[\]_]/.test(c) || SUPER_CHARS.includes(c) || SUB_CHARS.includes(c) || /[+\-*/^=<>≤≥≠≈√∞∈∉×⋅·÷]/.test(c)) {
      if (/[+\-*/^=<>≤≥≠≈√∞∈∉×⋅·÷]/.test(c)) consumedMathSignal = true;
      i += 1;
      previousWasIdentifier = false;
      continue;
    }
    break;
  }
  return consumedMathSignal ? i : start;
}

function wrapAutoDetectedMath(source: string): string {
  const patterns = [
    /\b[A-Za-z]\s*\([^()\n]*\)\s*(?:=|<|>|≤|≥|≠|≈)/g,
    /\b[A-Za-z](?:\s*[_^]\s*(?:\{[^}]+\}|[0-9A-Za-z]+)|[${SUPER_CHARS}${SUB_CHARS}]+)\s*(?:=|<|>|≤|≥|≠|≈)/g,
  ];

  const matches: Array<{ start: number; end: number }> = [];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      const end = consumeMathExpression(source, match.index + match[0].length);
      if (end > match.index + match[0].length) matches.push({ start: match.index, end });
    }
  }
  if (!matches.length) return source;

  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Array<{ start: number; end: number }> = [];
  for (const match of matches) {
    const previous = merged[merged.length - 1];
    if (!previous || match.start >= previous.end) merged.push(match);
    else if (match.end > previous.end) previous.end = match.end;
  }

  let result = "";
  let cursor = 0;
  for (const match of merged) {
    result += source.slice(cursor, match.start);
    result += `\\(${normalize(source.slice(match.start, match.end).trim())}\\)`;
    cursor = match.end;
  }
  return result + source.slice(cursor);
}

function toLatex(text: string) {
  if (!text) return text;
  const protectedValue = protectLatex(text);
  const source = wrapAutoDetectedMath(protectedValue.source);
  return restoreLatex(normalize(source), protectedValue.tokens);
}

export function LatexText({ children, className, display = false }: { children: string; className?: string; display?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const latex = useMemo(
    () => display ? `\\[${sanitizeProtectedMath(children.trim()).replace(/^\\\[|\\\]$/g, "")}\\]` : toLatex(children),
    [children, display],
  );

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
      style={{ fontSize: display ? "1.10em" : "1em", whiteSpace: "pre-wrap" }}
    />
  );
}
