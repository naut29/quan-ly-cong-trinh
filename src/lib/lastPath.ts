const LAST_PATH_KEY = "app.last_path";

const EXCLUDED_PATH_PREFIXES = ["/app/login", "/demo/login", "/onboarding"];

const isRunnablePath = (value: string) => {
  if (!value.startsWith("/")) return false;
  return !EXCLUDED_PATH_PREFIXES.some((prefix) => value.startsWith(prefix));
};

export const saveLastPath = (pathname: string, search = "") => {
  if (typeof window === "undefined") return;
  const value = `${pathname}${search}`;
  if (!isRunnablePath(value)) return;
  window.localStorage.setItem(LAST_PATH_KEY, value);
};

export const getLastPath = (fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(LAST_PATH_KEY) ?? "";
  if (!value || !isRunnablePath(value)) {
    return fallback;
  }
  return value;
};

export const clearLastPath = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LAST_PATH_KEY);
};
