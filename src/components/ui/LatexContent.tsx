import type { ReactNode } from "react";

const GREEK: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ϵ",
  theta: "θ", lambda: "λ", mu: "μ", pi: "π", rho: "ρ", sigma: "σ", tau: "τ",
  phi: "φ", varphi: "ϕ", chi: "χ", psi: "ψ", omega: "ω", Gamma: "Γ", Delta: "Δ",
  Theta: "Θ", Lambda: "Λ", Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

const SYMBOLS: Record<string, string> = {
  cdot: "·", times: "×", div: "÷", pm: "±", mp: "∓", leq: "≤", geq: "≥", neq: "≠",
  approx: "≈", sim: "∼", equiv: "≡", infty: "∞", to: "→", rightarrow: "→", leftarrow: "←",
  Rightarrow: "⇒", Leftarrow: "⇐", Leftrightarrow: "⇔", partial: "∂", sum: "∑", int: "∫",
  prod: "∏", forall: "∀", exists: "∃", in: "∈", notin: "∉", subset: "⊂", subseteq: "⊆",
  emptyset: "∅", angle: "∠", degree: "°", parallel: "∥", perp: "⊥",
};

function escapeText(value: string) {
  return value.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char] ?? char));
}

function latexToHtml(source: string) {
  let html = escapeText(source);
  html = html.replace(/\\\[([\s\S]*?)\\\]/g, (_m, math) => `<span class="latex-math latex-math--display">${renderMath(math)}</span>`);
  html = html.replace(/\\\(([\s\S]*?)\\\)/g, (_m, math) => `<span class="latex-math">${renderMath(math)}</span>`);
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_m, math) => `<span class="latex-math latex-math--display">${renderMath(math)}</span>`);
  html = html.replace(/\$([^$\n]+)\$/g, (_m, math) => `<span class="latex-math">${renderMath(math)}</span>`);
  html = renderBareLatex(html);
  return html.replace(/\n/g, "<br />");
}

function renderBareLatex(value: string) {
  let html = value;
  html = html.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, numerator, denominator) =>
    `<span class="latex-frac"><span>${renderMath(numerator)}</span><span>${renderMath(denominator)}</span></span>`);
  html = html.replace(/\\sqrt(?:\[([^\]]+)\])?\{([^{}]*)\}/g, (_m, index, body) =>
    `<span class="latex-root">${index ? `<sup>${renderMath(index)}</sup>` : ""}<span>√${renderMath(body)}</span></span>`);
  html = html.replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>");
  html = html.replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
  html = html.replace(/\^([A-Za-z0-9])/g, "<sup>$1</sup>");
  html = html.replace(/_([A-Za-z0-9])/g, "<sub>$1</sub>");
  html = html.replace(/\\([A-Za-z]+|%)/g, (match, name) => {
    if (GREEK[name]) return GREEK[name];
    if (SYMBOLS[name]) return SYMBOLS[name];
    if (name === "%") return "%";
    if (["mathrm", "text", "mathbf", "mathbb", "mathcal", "operatorname"].includes(name)) return "";
    return match;
  });
  html = html.replace(/[{}]/g, "");
  return html;
}

function renderMath(value: string) {
  return renderBareLatex(escapeText(value));
}

export default function LatexContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const text = typeof children === "string" ? children : null;
  if (text == null) return <div className={className}>{children}</div>;
  return <div className={`latex-content ${className}`} dangerouslySetInnerHTML={{ __html: latexToHtml(text) }} />;
}
