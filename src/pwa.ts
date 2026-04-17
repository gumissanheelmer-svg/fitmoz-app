// PWA service worker registration with iframe / preview guard.
// Service workers are skipped inside the Lovable editor preview to avoid
// stale-content and navigation interference issues.

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const host = window.location.hostname;
const isPreviewHost =
  host.includes("id-preview--") ||
  host.includes("lovableproject.com") ||
  host === "localhost" ||
  host === "127.0.0.1";

export async function setupPWA() {
  if (!("serviceWorker" in navigator)) return;

  if (isInIframe || isPreviewHost) {
    // Clean up any previously-registered SW so the preview never serves stale content.
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {
      // ignore
    }
    return;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } catch {
    // virtual module unavailable in some environments — safe to ignore
  }
}
