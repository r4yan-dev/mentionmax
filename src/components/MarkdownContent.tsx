import { ReactNode, useEffect, useMemo, useState } from "react";
import "./MarkdownContent.css";

type Block = { type: string; content?: string; items?: string[]; ordered?: boolean };

type KaTeX = {
  renderToString: (tex: string, options?: { displayMode?: boolean; throwOnError?: boolean; strict?: boolean }) => string;
};

declare global {
  interface Window {
    katex?: KaTeX;
  }
}

let katexPromise: Promise<KaTeX | null> | null = null;

function loadKaTeX() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.katex) return Promise.resolve(window.katex);
  if (katexPromise) return katexPromise;

  katexPromise = new Promise<KaTeX | null>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-mentionmax-katex="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.katex ?? null), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css";
    css.dataset.mentionmaxKatex = "true";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js";
    script.async = true;
    script.dataset.mentionmaxKatex = "true";
    script.addEventListener("load", () => resolve(window.katex ?? null), { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

  return katexPromise;
}

function MathExpression({ value, display = false }: { value: string; display?: boolean }) {
  const [html, setHtml] = useState<string | null>(null);
  const source = value.trim();

  useEffect(() => {
    let cancelled = false;
    void loadKaTeX().then((katex) => {
      if (cancelled || !katex) return;
      try {
        const rendered = katex.renderToString(source, {
          displayMode: display,
          throwOnError: false,
          strict: false,
        });
        if (!cancelled) setHtml(rendered);
      } catch {
        if (!cancelled) setHtml(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [display, source]);

  if (html) {
    return <span className={display ? "ai-markdown__math ai-markdown__math--block" : "ai-markdown__math"} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <code className={display ? "ai-markdown__math-fallback ai-markdown__math-fallback--block" : "ai-markdown__math-fallback"}>{display ? `$$${source}$$` : `$${source}$`}</code>;
}

type InlinePattern = {
  regex: RegExp;
  render: (match: RegExpMatchArray, key: number) => ReactNode;
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let key = 0;

  const patterns: InlinePattern[] = [
    { regex: /\$\$([\s\S]+?)\$\$/, render: (m, id) => <MathExpression key={id} value={m[1]} /> },
    { regex: /\$([^$\n]+?)\$/, render: (m, id) => <MathExpression key={id} value={m[1]} /> },
    { regex: /`([^`]+)`/, render: (m, id) => <code key={id}>{m[1]}</code> },
    { regex: /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/, render: (m, id) => <img key={id} src={m[2]} alt={m[1]} loading="lazy" /> },
    { regex: /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/, render: (m, id) => <a key={id} href={m[2]} target="_blank" rel="noreferrer">{renderInline(m[1])}</a> },
    { regex: /\*\*([\s\S]+?)\*\*/, render: (m, id) => <strong key={id}>{renderInline(m[1])}</strong> },
    { regex: /__([\s\S]+?)__/, render: (m, id) => <strong key={id}>{renderInline(m[1])}</strong> },
    { regex: /~~([^~\n]+)~~/, render: (m, id) => <del key={id}>{renderInline(m[1])}</del> },
    { regex: /\*([^*\n]+)\*/, render: (m, id) => <em key={id}>{renderInline(m[1])}</em> },
    { regex: /_([^_\n]+)_/, render: (m, id) => <em key={id}>{renderInline(m[1])}</em> },
  ];

  while (rest) {
    let bestIndex = Infinity;
    let bestMatch: RegExpMatchArray | null = null;
    let bestRender: InlinePattern["render"] | null = null;

    for (const pattern of patterns) {
      const match = rest.match(pattern.regex);
      if (match && match.index !== undefined && match.index < bestIndex) {
        bestIndex = match.index;
        bestMatch = match;
        bestRender = pattern.render;
      }
    }

    if (!bestMatch || !bestRender) {
      nodes.push(rest);
      break;
    }

    if (bestIndex > 0) nodes.push(rest.slice(0, bestIndex));
    nodes.push(bestRender(bestMatch, key++));
    rest = rest.slice(bestIndex + bestMatch[0].length);
  }

  return nodes;
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", content: code.join("\n") });
      continue;
    }

    if (/^\s*\$\$\s*$/.test(line)) {
      const math: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i])) {
        math.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "math", content: math.join("\n") });
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      blocks.push({ type: `h${heading[1].length}`, content: heading[2] });
      i += 1;
      continue;
    }

    if (/^\s*(?:\*\s*\*\s*\*|-{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "blockquote", content: quote.join("\n") });
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const items: string[] = [];
      const orderedList = Boolean(ordered);
      while (i < lines.length) {
        const match = orderedList ? lines[i].match(/^\s*\d+[.)]\s+(.+)$/) : lines[i].match(/^\s*[-*+]\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        i += 1;
      }
      blocks.push({ type: "list", items, ordered: orderedList });
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim()) {
      if (/^\s*(#{1,6})\s+/.test(lines[i]) || /^\s*>/.test(lines[i]) || /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(lines[i]) || /^\s*(?:\*\s*\*\s*\*|-{3,}|_{3,})\s*$/.test(lines[i]) || /^\s*```/.test(lines[i]) || /^\s*\$\$\s*$/.test(lines[i])) break;
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", content: paragraph.join("\n") });
  }

  return blocks;
}

export default function MarkdownContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className="ai-markdown">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "hr") return <hr key={key} />;
        if (block.type === "math") return <MathExpression key={key} value={block.content ?? ""} display />;
        if (block.type === "code") return <pre key={key}><code>{block.content}</code></pre>;
        if (block.type === "blockquote") return <blockquote key={key}>{renderInline(block.content ?? "")}</blockquote>;
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return <List key={key}>{(block.items ?? []).map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInline(item)}</li>)}</List>;
        }
        if (/^h[1-6]$/.test(block.type)) {
          const Heading = block.type as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return <Heading key={key}>{renderInline(block.content ?? "")}</Heading>;
        }
        return <p key={key}>{renderInline(block.content ?? "")}</p>;
      })}
    </div>
  );
}
