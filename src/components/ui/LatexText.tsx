import { useEffect, useMemo, useRef } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
      startup?: { promise?: Promise<void> };
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

const superscriptMap: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-",
  "⁽": "(", "⁾": ")",
};

const subscriptMap: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "₍": "(", "₎": ")",
};

function replaceUnicodePowers(text: string): string {
  return text.replace(/([A-Za-z0-9)\\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, (_match, base: string, power: string) => {
    const exponent = [...power].map((char) => superscriptMap[char] ?? char).join("");
    return `${base}^{${exponent}}`;
  });
}

function replaceUnicodeIndices(text: string): string {
  return text.replace(/([A-Za-z])([₀₁₂₃₄₅₆₇₈₉₊₋]+)/g, (_match, base: string, index: string) => {
    const subscript = [...index].map((char) => subscriptMap[char] ?? char).join("");
    return `${base}_{${subscript}}`;
  });
}

function escapeTexText(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([{}])/g, "\\$1")
    .replace(/#/g, "\\#")
    .replace(/%/g, "\\%");
}

function normalizeSymbols(text: string): string {
  return text
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/∞/g, "\\infty")
    .replace(/±/g, "\\pm")
    .replace(/∈/g, "\\in")
    .replace(/∉/g, "\\notin")
    .replace(/⊂/g, "\\subset")
    .replace(/⊆/g, "\\subseteq")
    .replace(/∪/g, "\\cup")
    .replace(/∩/g, "\\cap")
    .replace(/∅/g, "\\varnothing")
    .replace(/ℝ/g, "\\mathbb{R}")
    .replace(/ℤ/g, "\\mathbb{Z}")
    .replace(/ℚ/g, "\\mathbb{Q}")
    .replace(/ℕ/g, "\\mathbb{N}")
    .replace(/ℂ/g, "\\mathbb{C}")
    .replace(/×/g, "\\times")
    .replace(/·/g, "\\cdot")
    .replace(/→/g, "\\to")
    .replace(/↦/g, "\\mapsto")
    .replace(/π/g, "\\pi")
    .replace(/α/g, "\\alpha")
    .replace(/β/g, "\\beta")
    .replace(/γ/g, "\\gamma")
    .replace(/δ/g, "\\delta")
    .replace(/ε/g, "\\varepsilon")
    .replace(/λ/g, "\\lambda")
    .replace(/μ/g, "\\mu")
    .replace(/σ/g, "\\sigma")
    .replace(/τ/g, "\\tau")
    .replace(/φ/g, "\\varphi")
    .replace(/ω/g, "\\omega")
    .replace(/Σ/g, "\\Sigma")
    .replace(/Δ/g, "\\Delta")
    .replace(/Ω/g, "\\Omega");
}

function protectExplicitLatex(text: string): { text: string; tokens: string[] } {
  const tokens: string[] = [];
  const protectedText = text.replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$/g, (match) => {
    const id = `@@LATEX_${tokens.length}@@`;
    tokens.push(match);
    return id;
  });
  return { text: protectedText, tokens };
}

function restoreExplicitLatex(text: string, tokens: string[]): string {
  return text.replace(/@@LATEX_(\d+)@@/g, (_match, index: string) => tokens[Number(index)] ?? _match);
}

function convertMathChunk(chunk: string): string {
  let value = chunk.trim();
  if (!value) return chunk;

  value = replaceUnicodePowers(value);
  value = replaceUnicodeIndices(value);
  value = normalizeSymbols(value);

  value = value
    .replace(/\blim\s*\(([^)]*)\)/g, "\\lim_{$1}")
    .replace(/\blim\s*([A-Za-z][^\s,;!?]*)/g, "\\lim_{$1}")
    .replace(/\b(sin|cos|tan)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\b(ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)")
    .replace(/\bsqrt\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/\b([A-Za-z])\/([A-Za-z0-9]+)/g, "\\frac{$1}{$2}")
    .replace(/\b([A-Za-z0-9]+)\/([A-Za-z0-9]+)\b/g, "\\frac{$1}{$2}")
    .replace(/\b([A-Za-z]+)'\(([A-Za-z0-9]+)\)/g, "$1'($2)")
    .replace(/\b([A-Za-z]+)_\{([^}]+)\}/g, "$1_{$2}")
    .replace(/\b([A-Za-z]+)\^\{([^}]+)\}/g, "$1^{$2}");

  return `\\(${value}\\)`;
}

function looksMathematical(value: string): boolean {
  return /(?:\\b(?:lim|sin|cos|tan|ln|log|exp)\\b|[=<>≤≥≠≈]|\d\s*[\/^]|[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]|[∞ℝℤℚℕℂπ]|[∫√∑∏]|[A-Za-z]_\{|[A-Za-z]\^\{|[A-Za-z]'\(|\bP\([^)]*\)|\bC\([^)]*\)|\bdeg\s+[A-Za-z]|\\(?:leq|geq|neq|in|times|cdot|to)\b)/.test(value);
}

function toLatex(text: string): string {
  if (!text) return text;
  if (/\\\(|\\\[|\$\$/.test(text)) return text;

  const protectedValue = protectExplicitLatex(text);
  let source = protectedValue.text;
  source = replaceUnicodePowers(source);
  source = replaceUnicodeIndices(source);

  const chunks = source.split(/(?<=[.!?;:,])\s+|\s{2,}/g);
  let output = chunks.map((chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed) return chunk;

    if (looksMathematical(trimmed)) {
      const pieces = trimmed.match(/(?:[^=<>≤≥≠≈]*[=<>≤≥≠≈][^.!?;,]*|\\b(?:lim|sin|cos|tan|ln|log|exp)[^.!?;,]*|[^.!?;,]*[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉∞ℝℤℚℕℂπ√∫∑∏][^.!?;,]*|[^.!?;,]*\\bP\([^)]*\)[^.!?;,]*|[^.!?;,]*\\bC\([^)]*\)[^.!?;,]*)/g);
      if (pieces?.length) {
        let remainder = trimmed;
        for (const piece of pieces) {
          const start = remainder.indexOf(piece);
          if (start < 0) continue;
          const before = remainder.slice(0, start);
          const after = remainder.slice(start + piece.length);
          output = output;
          remainder = after;
          source;
          void before;
        }
      }
      return convertMathChunk(trimmed);
    }

    return trimmed;
  }).join(" ");

  output = restoreExplicitLatex(output, protectedValue.tokens);
  return output;
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
