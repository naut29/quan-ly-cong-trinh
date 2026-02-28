import { isDemoRoute } from "@/lib/runtime/isDemoRoute";
import { showDemoBlockedToast } from "@/lib/runtime/demoToast";

const DEMO_API_ERROR_MESSAGE = "Demo route cannot call app API";

const resolveRequestUrl = (input: RequestInfo | URL): URL | null => {
  const rawUrl =
    typeof input === "string" || input instanceof URL
      ? input.toString()
      : input instanceof Request
        ? input.url
        : String(input);

  try {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    return new URL(rawUrl, baseUrl);
  } catch {
    return null;
  }
};

const shouldBlockDemoRequest = (input: RequestInfo | URL) => {
  const resolvedUrl = resolveRequestUrl(input);
  if (!resolvedUrl) return false;

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : resolvedUrl.origin;

  if (resolvedUrl.pathname.startsWith("/api/")) {
    return true;
  }

  return resolvedUrl.origin !== currentOrigin;
};

export async function appFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (isDemoRoute() && shouldBlockDemoRequest(input)) {
    const error = new Error(DEMO_API_ERROR_MESSAGE);
    showDemoBlockedToast(error.message);
    throw error;
  }

  return fetch(input, init);
}
