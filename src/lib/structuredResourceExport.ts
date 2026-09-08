import { printResourceAsPdf } from "./printResourcePdf";

export async function downloadStructuredResourcePdf(result: Record<string, unknown>, fallbackTitle: string) {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(".ai-studio-v2__output .generator-handwritten-resource, .ai-studio-v2 .generator-handwritten-resource, .generator-handwritten-resource"));
  const target = candidates.find((element) => element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0) ?? candidates[0];
  if (!target) throw new Error("Impossible de trouver la ressource manuscrite à exporter.");

  const title = typeof result.title === "string" && result.title.trim() ? result.title : fallbackTitle;
  await printResourceAsPdf(target, title);
}
