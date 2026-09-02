import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
const ROOT_ID = "root";
const STARTUP_MARK = "[MentionMax]";

type StartupPhase =
  | "created"
  | "validated"
  | "mounted"
  | "failed"
  | "ready";

type StartupState = {
  phase: StartupPhase;
  startedAt: number;
  completedAt?: number;
  rootFound: boolean;
  strictMode: boolean;
};

const startup: StartupState = {
  phase: "created",
  startedAt: performance.now(),
  rootFound: false,
  strictMode: true,
};

function now() {
  return performance.now();
}

function log(message: string, ...payload: unknown[]) {
  console.info(`${STARTUP_MARK} ${message}`, ...payload);
}

function warn(message: string, ...payload: unknown[]) {
  console.warn(`${STARTUP_MARK} ${message}`, ...payload);
}

function fail(message: string, error?: unknown): never {
  startup.phase = "failed";
  console.error(`${STARTUP_MARK} ${message}`, error);
  throw error instanceof Error ? error : new Error(message);
}

function getRootElement() {
  const root = document.getElementById(ROOT_ID);
  if (!root) {
    return fail(`Root element #${ROOT_ID} was not found.`);
  }
  startup.rootFound = true;
  startup.phase = "validated";
  return root;
}

function validateEnvironment() {
  if (typeof window === "undefined") {
    return fail("MentionMax requires a browser environment.");
  }
  if (typeof document === "undefined") {
    return fail("MentionMax requires document APIs.");
  }
  if (!window.requestAnimationFrame) {
    warn("requestAnimationFrame is unavailable; the browser is unusually ancient.");
  }
  if (!window.localStorage) {
    warn("localStorage is unavailable; persistence will be limited.");
  }
}

function prepareDocument() {
  document.documentElement.lang = "fr";
  document.documentElement.dataset.app = "mentionmax";
  document.body.dataset.appReady = "false";
  document.body.style.margin = "0";
}

function markReady() {
  startup.phase = "ready";
  startup.completedAt = now();
  document.body.dataset.appReady = "true";
  const duration = Math.round(startup.completedAt - startup.startedAt);
  log(`Application ready in ${duration}ms.`);
}

function registerGlobalDiagnostics() {
  window.addEventListener("error", (event) => {
    console.error(`${STARTUP_MARK} Runtime error`, event.error ?? event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    console.error(`${STARTUP_MARK} Unhandled promise rejection`, event.reason);
  });
}

function registerReducedMotionHint() {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.documentElement.dataset.reducedMotion = media.matches ? "true" : "false";
  const listener = (event: MediaQueryListEvent) => {
    document.documentElement.dataset.reducedMotion = event.matches ? "true" : "false";
  };
  media.addEventListener?.("change", listener);
}

function registerViewportMetadata() {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) return;
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
  document.head.appendChild(meta);
}

function mount() {
  validateEnvironment();
  prepareDocument();
  registerGlobalDiagnostics();
  registerReducedMotionHint();
  registerViewportMetadata();
  const rootElement = getRootElement();
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  startup.phase = "mounted";
  queueMicrotask(markReady);
  return root;
}

mount();
