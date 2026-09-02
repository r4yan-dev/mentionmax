import { useEffect, useMemo } from "react";

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

function toLatex(text: string): string {
  return text
    .replace(/(\\d+(?:[.,]\\d+)?)(?:×|x|\\s*[×x]\\s*)(10)([⁻⁺]?)(\\d+)/g, (_match, coefficient: string, _ten: string, sign: string, exponent: string) => {
      const normalizedCoefficient = coefficient.replace(",", ".");
      const signedExponent = `${sign === "⁻" ? "-" : sign === "⁺" ? "+" : ""}${exponent}`;
      return `\\(${normalizedCoefficient}\\times10^{${signedExponent}}\\)`;
    })
    .replace(/10⁻([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_match, exponent: string) => `\\(10^{-${exponent.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => String("⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)))}}\\)`)
    .replace(/([A-Za-zΔΩμ]+)·m/g, "\\($1\\,\\mathrm{m}\\)");
}

export function LatexText({ children, className }: { children: string; className?: string }) {
  const latex = useMemo(() => toLatex(children), [children]);

  useEffect(() => {
    let cancelled = false;
    void loadMathJax()
      .then(async () => {
        if (!cancelled && window.MathJax?.typesetPromise) {
          await window.MathJax.typesetPromise();
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [latex]);

  return <span className={className}>{latex}</span>;
}
