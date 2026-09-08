import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { deletePersonalLibraryItem, listPersonalLibrary } from "./lib/personalLibrary";
import "./index.css";
import "./styles/force-ai-studio-controls.css";

document.documentElement.lang = "fr";

const nativeAlert = window.alert.bind(window);
window.alert = (message?: unknown) => {
  if (typeof message === "string" && message.trim() === "Ressource enregistrée dans ta bibliothèque.") return;
  nativeAlert(message == null ? "" : String(message));
};

let libraryItems: Array<{ id: string; title: string; resource_type: string }> = [];
let libraryDecorating = false;

function decorateLibraryDeleteTargets() {
  if (libraryDecorating) return;
  libraryDecorating = true;
  try {
    const drawerItems = Array.from(document.querySelectorAll<HTMLButtonElement>(".ai-library-drawer .ai-library-item"));
    drawerItems.forEach((item, index) => {
      const record = libraryItems[index];
      if (!record) return;
      item.dataset.libraryId = record.id;
      item.dataset.libraryDeleteZone = "true";
      item.setAttribute("aria-label", `${record.title}. Cliquer à droite pour supprimer.`);
    });
  } finally {
    libraryDecorating = false;
  }
}

async function refreshLibraryTargets() {
  try {
    libraryItems = (await listPersonalLibrary()).map((item) => ({
      id: item.id,
      title: item.title,
      resource_type: item.resource_type,
    }));
    decorateLibraryDeleteTargets();
  } catch {
    libraryItems = [];
  }
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const saveButton = target.closest<HTMLButtonElement>(".ai-resource-action--save");
  if (saveButton) {
    const saved = saveButton.dataset.saved === "true";
    saveButton.dataset.saved = String(!saved);
    const icon = saveButton.querySelector<SVGElement>("svg");
    if (icon) {
      icon.setAttribute("fill", saved ? "none" : "currentColor");
      icon.setAttribute("stroke-width", "1.7");
    }
    return;
  }

  const libraryButton = target.closest<HTMLButtonElement>(".ai-studio-library-button");
  if (libraryButton) {
    window.setTimeout(() => void refreshLibraryTargets(), 60);
    return;
  }

  const item = target.closest<HTMLButtonElement>(".ai-library-item");
  if (!item?.dataset.libraryId) return;

  const rect = item.getBoundingClientRect();
  const deleteZoneWidth = Math.min(56, rect.width * 0.28);
  if (event.clientX < rect.right - deleteZoneWidth) return;

  event.preventDefault();
  event.stopPropagation();

  const id = item.dataset.libraryId;
  item.disabled = true;
  item.dataset.deleting = "true";

  void deletePersonalLibraryItem(id)
    .then(() => {
      item.style.height = `${item.offsetHeight}px`;
      item.style.overflow = "hidden";
      item.style.transition = "opacity .16s ease, transform .16s ease, height .18s ease, margin .18s ease, padding .18s ease";
      requestAnimationFrame(() => {
        item.style.opacity = "0";
        item.style.transform = "translateX(10px)";
        item.style.height = "0px";
        item.style.margin = "0";
        item.style.paddingTop = "0";
        item.style.paddingBottom = "0";
        item.style.borderWidth = "0";
      });
      window.setTimeout(() => {
        item.remove();
        libraryItems = libraryItems.filter((entry) => entry.id !== id);
        decorateLibraryDeleteTargets();
      }, 190);
    })
    .catch((error) => {
      nativeAlert(error instanceof Error ? error.message : "Impossible de supprimer cette ressource.");
      item.disabled = false;
      delete item.dataset.deleting;
    });
}, true);

const libraryObserver = new MutationObserver(() => decorateLibraryDeleteTargets());
libraryObserver.observe(document.documentElement, { subtree: true, childList: true });

const root = document.getElementById("root");
if (!root) throw new Error("MentionMax: #root introuvable.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
