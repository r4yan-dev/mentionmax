type ExportableWindow = Window & typeof globalThis & {
  html2canvas?: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  jspdf?: { jsPDF: new (options?: Record<string, unknown>) => PdfDocument };
};

type PdfDocument = {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  addImage: (data: string, type: string, x: number, y: number, width: number, height: number) => void;
  addPage: () => void;
  save: (filename: string) => void;
};

let loader: Promise<void> | null = null;

function loadScript(src: string, globalName: "html2canvas" | "jspdf") {
  const w = window as ExportableWindow;
  if (w[globalName]) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-mentionmax-export="${globalName}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Export library failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.mentionmaxExport = globalName;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Export library failed to load"));
    document.head.appendChild(script);
  });
}

async function loadExportLibraries() {
  if (loader) return loader;
  loader = Promise.all([
    loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", "html2canvas"),
    loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js", "jspdf"),
  ]).then(() => undefined);
  return loader;
}

function safeFileName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "ressource-menti";
}

async function renderResource(element: HTMLElement) {
  await loadExportLibraries();
  const w = window as ExportableWindow;
  if (!w.html2canvas) throw new Error("Le moteur d'export image n'est pas disponible.");
  return w.html2canvas(element, {
    backgroundColor: "#fffdf7",
    scale: Math.min(2.5, Math.max(1.5, window.devicePixelRatio || 1.5)),
    useCORS: true,
    logging: false,
    windowWidth: Math.max(element.scrollWidth, document.documentElement.clientWidth),
  });
}

export async function downloadResourcePng(element: HTMLElement, title: string) {
  const canvas = await renderResource(element);
  const link = document.createElement("a");
  link.download = `${safeFileName(title)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function downloadResourcePdf(element: HTMLElement, title: string) {
  const canvas = await renderResource(element);
  await loadExportLibraries();
  const w = window as ExportableWindow;
  const JsPdf = w.jspdf?.jsPDF;
  if (!JsPdf) throw new Error("Le moteur PDF n'est pas disponible.");

  const pdf = new JsPdf({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const pagePixelHeight = Math.max(1, Math.floor((canvas.width * (pageHeight - margin * 2)) / usableWidth));

  let offset = 0;
  let pageIndex = 0;
  while (offset < canvas.height) {
    const sliceHeight = Math.min(pagePixelHeight, canvas.height - offset);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeight;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Impossible de préparer le PDF.");
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    const imageHeight = (slice.height * usableWidth) / slice.width;
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/jpeg", 0.96), "JPEG", margin, margin, usableWidth, Math.min(pageHeight - margin * 2, imageHeight));
    offset += sliceHeight;
    pageIndex += 1;
  }

  pdf.save(`${safeFileName(title)}.pdf`);
}
