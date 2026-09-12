import { LatexText } from "./LatexText";

function containsArabic(text: string) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

/**
 * Shared renderer for generated mathematical content.
 *
 * Important: this component must never turn an entire French/Arabic sentence
 * into LaTeX. LatexText tokenizes the content into normal HTML text nodes and
 * isolated MathJax nodes, so prose and formulas can stay on the same visual
 * line without forcing the browser to create separate LaTeX paragraphs.
 */
export function MathText({ children, className }: { children: string; className?: string }) {
  const isArabic = containsArabic(children);

  return (
    <span
      className={className}
      dir={isArabic ? "rtl" : "ltr"}
      lang={isArabic ? "ar" : undefined}
      style={{ direction: isArabic ? "rtl" : "ltr", unicodeBidi: "plaintext" }}
    >
      <LatexText>{children}</LatexText>
    </span>
  );
}
