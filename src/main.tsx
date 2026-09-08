import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.lang = "fr";

const nativeAlert = window.alert.bind(window);
window.alert = (message?: unknown) => {
  if (typeof message === "string" && message.trim() === "Ressource enregistrée dans ta bibliothèque.") return;
  nativeAlert(message == null ? "" : String(message));
};

const root = document.getElementById("root");
if (!root) throw new Error("MentionMax: #root introuvable.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
