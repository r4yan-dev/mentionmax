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
  const libraryButton = target.closest<HTMLButtonElement>(".ai-studio-library-button");
  if (!libraryButton) return;

  event.preventDefault();
  event.stopPropagation();
  window.history.pushState({}, "", "/bibliotheque");
  window.dispatchEvent(new PopStateEvent("popstate"));
}, true);

const root = document.getElementById("root");
if (!root) throw new Error("MentionMax: #root introuvable.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
