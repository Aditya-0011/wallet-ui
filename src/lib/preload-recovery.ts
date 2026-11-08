import { readStorage, writeStorage } from "@/lib/storage";

const RELOAD_KEY = "vite-preload-reloaded-at";
const RELOAD_COOLDOWN_MS = 10_000;

export function registerPreloadRecovery() {
  window.addEventListener("vite:preloadError", (event) => {
    const last = Number(readStorage("sessionStorage", RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    if (!writeStorage("sessionStorage", RELOAD_KEY, String(Date.now()))) return;
    event.preventDefault();
    window.location.reload();
  });
}
