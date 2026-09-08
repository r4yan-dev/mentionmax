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
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
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

const SUPERS: Record<string, string> = {
  "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁺":"+","⁻":"-","ⁿ":"n",
  "ᵃ":"a","ᵇ":"b","ᶜ":"c","ᵈ":"d","ᵉ":"e","ᶠ":"f","ᵍ":"g","ʰ":"h","ⁱ":"i","ʲ":"j","ᵏ":"k","ˡ":"l","ᵐ":"m","ᵒ":"o","ᵖ":"p","ʳ":"r","ˢ":"s","ᵗ":"t","ᵘ":"u","ᵛ":"v","ʷ":"w","ˣ":"x","ʸ":"y","ᶻ":"z",
};
const SUBS: Record<string, string> = {"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","₊":"+","₋":"-","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₖ":"k","ₗ":"l","ₘ":"m","ₙ":"n","ₒ":"o","ₚ":"p","ᵣ":"r","ₛ":"s","ₜ":"t","ᵤ":"u","ᵥ":"v","ₓ":"x"};
const GREEK: Record<string, string> = {α:"\\alpha",β:"\\beta",γ:"\\gamma",δ:"\\delta",ε:"\\varepsilon",ϵ:"\\epsilon",ζ:"\\zeta",η:"\\eta",θ:"\\theta",ϑ:"\\vartheta",ι:"\\iota",κ:"\\kappa",λ:"\\lambda",μ:"\\mu",ν:"\\nu",ξ:"\\xi",π:"\\pi",ϖ:"\\varpi",ρ:"\\rho",ϱ:"\\varrho",σ:"\\sigma",ς:"\\varsigma",τ:"\\tau",υ:"\\upsilon",φ:"\\varphi",ϕ:"\\phi",χ:"\\chi",ψ:"\\psi",ω:"\\omega",Γ:"\\Gamma",Δ:"\\Delta",Θ:"\\Theta",Λ:"\\Lambda",Ξ:"\\Xi",Π:"\\Pi",Σ:"\\Sigma",Υ:"\\Upsilon",Φ:"\\Phi",Ψ:"\\Psi",Ω:"\\Omega"};

function mapChars(value: string, map: Record<string,string>) { return [...value].map((c) => map[c] ?? c).join(""); }

function normalize(value: string): string {
  let result = value;
  result = result.replace(/([A-Za-z0-9)\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (_m,b,p) => `${b}^{${mapChars(p,SUPERS)}}`);
  result = result.replace(/([A-Za-z0-9)\]])([₀₁₂₃₄₅₆₇₈₉₊₋ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (_m,b,s) => `${b}_{${mapChars(s,SUBS)}}`);
  result = result.replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}").replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}");
  result = result.replace(/\b(sin|cos|tan|cot|arcsin|arccos|arctan|ln|log|exp)\s*\(([^)]*)\)/g, "\\$1($2)");
  const symbols: Array<[RegExp,string]> = [[/≤/g,"\\leq"],[/≥/g,"\\geq"],[/≠/g,"\\neq"],[/≈/g,"\\approx"],[/±/g,"\\pm"],[/∞/g,"\\infty"],[/∈/g,"\\in"],[/∉/g,"\\notin"],[/∪/g,"\\cup"],[/∩/g,"\\cap"],[/∅/g,"\\varnothing"],[/∀/g,"\\forall"],[/∃/g,"\\exists"],[/⇒/g,"\\Rightarrow"],[/⇔/g,"\\Leftrightarrow"],[/→/g,"\\to"],[/←/g,"\\leftarrow"],[/↔/g,"\\leftrightarrow"],[/↦/g,"\\mapsto"],[/×/g,"\\times"],[/⋅/g,"\\cdot"],[/·/g,"\\cdot"],[/÷/g,"\\div"],[/ℝ/g,"\\mathbb{R}"],[/ℤ/g,"\\mathbb{Z}"],[/ℚ/g,"\\mathbb{Q}"],[/ℕ/g,"\\mathbb{N}"],[/ℂ/g,"\\mathbb{C}"],[/∂/g,"\\partial"],[/∇/g,"\\nabla"],[/∑/g,"\\sum"],[/∏/g,"\\prod"],[/∫/g,"\\int"],[/∮/g,"\\oint"]];
  for (const [pattern,replacement] of symbols) result = result.replace(pattern,replacement);
  result = result.replace(/[αβγδεϵζηθϑικλμνξοπϖρϱσςτυφϕχψωΓΔΘΛΞΠΣΥΦΨΩ]/g,(c)=>GREEK[c] ?? c);
  result = result.replace(/\b([A-Za-z]+)_\{([^}]+)\}/g,"$1_{$2}").replace(/\b([A-Za-z]+)\^\{([^}]+)\}/g,"$1^{$2}");
  return result;
}

function protectLatex(text: string): { source: string; tokens: string[] } {
  const tokens: string[] = [];
  const source = text.replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/g,(match)=>{ const token=`@@MM_LATEX_${tokens.length}@@`; tokens.push(match); return token; });
  return { source, tokens };
}
function restoreLatex(text: string, tokens: string[]): string { return text.replace(/@@MM_LATEX_(\d+)@@/g,(_m,i)=>tokens[Number(i)] ?? _m); }
function wrapFormula(value: string) { return `\\(${normalize(value.trim())}\\)`; }

function preserveSpacesInsideTextMath(value: string) {
  return value.replace(/\\\(([^\\[\\]]+)\\\)/g, (match, body: string) => {
    const trimmed = body.trim();
    const wordCount = (trimmed.match(/[A-Za-zÀ-ÿ]{2,}/g) ?? []).length;
    const looksLikeSentence = wordCount >= 2 && /\s/.test(trimmed) && !/[=<>+*/^_{}]/.test(trimmed) && !/\\[A-Za-z]+/.test(trimmed);
    if (!looksLikeSentence) return match;
    const escaped = trimmed.replace(/([%&#])/g, "\\$1").replace(/\{/g, "\\{").replace(/\}/g, "\\}");
    return `\\(\\text{${escaped}}\\)`;
  });
}

function toLatex(text: string): string {
  if (!text) return text;
  const protectedValue = protectLatex(text);
  let source = protectedValue.source;
  source = source.replace(/\b(?:lim\s*\([^)]*\)|sin\s*\([^)]*\)|cos\s*\([^)]*\)|tan\s*\([^)]*\)|cot\s*\([^)]*\)|arcsin\s*\([^)]*\)|arccos\s*\([^)]*\)|arctan\s*\([^)]*\)|ln\s*\([^)]*\)|log\s*\([^)]*\)|exp\s*\([^)]*\)|sqrt\s*\([^)]*\)|√\s*\([^)]*\)|P\s*\([^)]*\)|A\s*\([^)]*\)|C\s*\([^)]*\))/g,wrapFormula);
  source = source.replace(/\b[A-Za-z](?:\^[-+]?\d+|\^[A-Za-z0-9]+|\^\{[^}]+\}|[_][A-Za-z0-9]+|[_]\{[^}]+\})/g,wrapFormula);
  source = source.replace(/\b[A-Za-z][⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ₀₁₂₃₄₅₆₇₈₉₊₋ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+/g,wrapFormula);
  source = source.replace(/\b([A-Za-z0-9]+)\s*\/\s*\(([A-Za-z0-9+\-*/.^_= ]+)\)/g,(_m,n,d)=>`\\(\\frac{${n}}{${d}}\\)`);
  source = source.replace(/\b([A-Za-z0-9]+)\s*\/\s*([A-Za-z0-9]+)/g,(_m,n,d)=>`\\(\\frac{${n}}{${d}}\\)`);
  source = source.replace(/(^|[(:]\s*)([A-Za-z0-9α-ωΑ-Ω][^,.;!?]*?(?:=|<|>|≤|≥|≠|≈|→|↦)[^,.;!?]*)(?=\s*[,.;!?]|$)/g,(_m,prefix,formula)=>`${prefix}${wrapFormula(formula)}`);
  source = source.replace(/∫\s*[^,.;!?]+/g,(match)=>wrapFormula(match));
  source = normalize(source);
  return preserveSpacesInsideTextMath(restoreLatex(source,protectedValue.tokens));
}

export function LatexText({ children, className, display=false }: { children: string; className?: string; display?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const latex = useMemo(() => display ? `\\[${children.trim()}\\]` : toLatex(children), [children,display]);
  useEffect(() => {
    let cancelled=false;
    const element=ref.current;
    if (!element) return;
    element.textContent=latex;
    if (!latex.includes("\\(") && !latex.includes("\\[")) return;
    void loadMathJax().then(async()=>{ if (!cancelled && window.MathJax?.typesetPromise && ref.current) await window.MathJax.typesetPromise([ref.current]); }).catch(()=>undefined);
    return ()=>{cancelled=true;};
  },[latex]);
  return <span ref={ref} className={className} data-latex-display={display || undefined} style={{ fontSize: display ? "1.08em" : "1em" }} />;
}
