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

function trashSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h8l1-13M10 11v6m4-6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function decorateLibraryDeleteButtons() {
  if (libraryDecorating) return;
  libraryDecorating = true;
  try {
    const drawerItems = Array.from(document.querySelectorAll<HTMLButtonElement>(".ai-library-drawer .ai-library-item"));
    drawerItems.forEach((item, index) => {
      if (item.querySelector(":scope > .ai-library-delete")) return;
      const record = libraryItems[index];
      if (!record) return;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "ai-library-delete";
      deleteButton.dataset.libraryId = record.id;
      deleteButton.setAttribute("aria-label", `Supprimer ${record.title}`);
      deleteButton.title = "Supprimer";
      deleteButton.innerHTML = trashSvg();
      item.appendChild(deleteButton);
    });
  } finally {
    libraryDecorating = false;
  }
}

async function refreshLibraryDeleteTargets() {
  try {
    libraryItems = (await listPersonalLibrary()).map((item) => ({
      id: item.id,
      title: item.title,
      resource_type: item.resource_type,
    }));
    decorateLibraryDeleteButtons();
  } catch {
    libraryItems = [];
  }
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const saveButton = target.closest<HTMLButtonElement>(".ai-resource-action--save");
  if (saveButton) {
    saveButton.dataset.saved = "true";
    const icon = saveButton.querySelector<SVGElement>("svg");
    if (icon) {
      icon.setAttribute("fill", "currentColor");
      icon.setAttribute("stroke-width", "1.7");
    }
    return;
  }

  const libraryButton = target.closest<HTMLButtonElement>(".ai-studio-library-button");
  if (libraryButton) {
    window.setTimeout(() => void refreshLibraryDeleteTargets(), 60);
    return;
  }

  const deleteButton = target.closest<HTMLButtonElement>(".ai-library-delete");
  if (!deleteButton) return;
  event.preventDefault();
  event.stopPropagation();

  const id = deleteButton.dataset.libraryId;
  if (!id) return;
  deleteButton.disabled = true;

  void deletePersonalLibraryItem(id)
    .then(() => {
      const item = deleteButton.closest(".ai-library-item");
      item?.remove();
      window.setTimeout(() => window.location.reload(), 120);
    })
    .catch((error) => {
      nativeAlert(error instanceof Error ? error.message : "Impossible de supprimer cette ressource.");
      deleteButton.disabled = false;
    });
}, true);

const libraryObserver = new MutationObserver(() => decorateLibraryDeleteButtons());
libraryObserver.observe(document.documentElement, { subtree: true, childList: true });

const root = document.getElementById("root");
if (!root) throw new Error("MentionMax: #root introuvable.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
