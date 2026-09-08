export async function printResourceAsPdf(element: HTMLElement, title: string) {
  if (!element) throw new Error("Aucune ressource à imprimer.");

  const previousTitle = document.title;
  const safeTitle = title.trim() || "Ressource Menti";
  const marker = `Menti · ${safeTitle}`;
  document.title = marker;
  document.body.classList.add("mentionmax-printing-resource");
  element.classList.add("ai-studio-print-target");

  try {
    await new Promise<void>((resolve) => {
      const finish = () => {
        window.removeEventListener("afterprint", finish);
        resolve();
      };
      window.addEventListener("afterprint", finish, { once: true });
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.print();
          window.setTimeout(finish, 1200);
        });
      });
    });
  } finally {
    element.classList.remove("ai-studio-print-target");
    document.body.classList.remove("mentionmax-printing-resource");
    document.title = previousTitle;
  }
}
