import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/force-ai-studio-controls.css";

document.documentElement.lang = "fr";

const nativeAlert = window.alert.bind(window);
window.alert = (message?: unknown) => {
  if (typeof message === "string" && message.trim() === "Ressource enregistrée dans ta bibliothèque.") return;
  nativeAlert(message == null ? "" : String(message));
};

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const saveButton = target.closest<HTMLButtonElement>(".ai-resource-action--save");
  if (!saveButton) return;

  saveButton.dataset.saved = "true";
  const icon = saveButton.querySelector<SVGElement>("svg");
  if (icon) {
    icon.setAttribute("fill", "currentColor");
    icon.setAttribute("stroke-width", "1.7");
  }
}, true);

const root = document.getElementById("root");
if (!root) throw new Error("MentionMax: #root introuvable.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
