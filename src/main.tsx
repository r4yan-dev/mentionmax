import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.lang = "fr";

const root = document.getElementById("root");
if (!root) throw new Error("MentionMax: #root introuvable.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
