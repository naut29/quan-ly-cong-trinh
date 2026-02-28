import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { showDemoBlockedToast } from "@/lib/runtime/demoToast";

const DEMO_NETWORK_ERROR = "Demo route cannot call live APIs";

const resolveUrl = (input: RequestInfo | URL) => {
  const rawUrl =
    typeof input === "string" || input instanceof URL
      ? input.toString()
      : input instanceof Request
        ? input.url
        : String(input);

  try {
    return new URL(rawUrl, window.location.origin);
  } catch {
    return null;
  }
};

const shouldBlockRequest = (input: RequestInfo | URL) => {
  const resolvedUrl = resolveUrl(input);
  if (!resolvedUrl) return false;

  if (resolvedUrl.pathname.startsWith("/api/")) {
    return true;
  }

  return resolvedUrl.origin !== window.location.origin;
};

const DemoLegacyProjectLayout: React.FC = () => {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const originalOpen = window.XMLHttpRequest.prototype.open;

    window.fetch = async (input, init) => {
      if (shouldBlockRequest(input)) {
        const error = new Error(DEMO_NETWORK_ERROR);
        showDemoBlockedToast(error.message);
        throw error;
      }

      return originalFetch(input, init);
    };

    window.XMLHttpRequest.prototype.open = function open(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      if (shouldBlockRequest(url)) {
        const error = new Error(DEMO_NETWORK_ERROR);
        showDemoBlockedToast(error.message);
        throw error;
      }

      return originalOpen.call(this, method, url, async ?? true, username, password);
    };

    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest.prototype.open = originalOpen;
    };
  }, []);

  return <Outlet />;
};

export default DemoLegacyProjectLayout;
