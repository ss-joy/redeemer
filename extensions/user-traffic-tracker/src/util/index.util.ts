export function detectPageType() {
  const path = window.location.pathname;

  if (path === "/" || path === "") return "home";
  if (path.includes("/products/")) return "product";
  if (path.includes("/collections/")) return "collection";
  if (path.includes("/cart")) return "cart";
  if (path.includes("/checkout")) return "checkout";
  if (path.includes("/account")) return "account";
  if (path.includes("/pages/")) return "page";
  if (path.includes("/blogs/")) return "blog";
  if (path.includes("/search")) return "search";

  return "other";
}

export function getDeviceType(): string {
  const userAgent = navigator.userAgent;

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "tablet";
  }
  if (
    /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
      userAgent,
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getSessionFromStorage(): string {
  const sessionKey = "redeemer_session_id";
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(sessionKey, sessionId);
  }

  return sessionId;
}

export const backendUrl =
  "https://history-struck-tomorrow-fighter.trycloudflare.com";
