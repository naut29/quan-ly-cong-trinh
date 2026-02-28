export function isDemoRoute(
  pathname = typeof window !== "undefined" ? window.location.pathname : "",
): boolean {
  return pathname.startsWith("/demo");
}
