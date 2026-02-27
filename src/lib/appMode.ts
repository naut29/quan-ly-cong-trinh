export const isDemoPath = (pathname: string) => pathname.startsWith("/demo");

export const isAppPath = (pathname: string) => pathname.startsWith("/app");

export const getAppBasePath = (pathname: string) =>
  isDemoPath(pathname) ? "/demo" : "/app";

const parseEnvFlag = (value: unknown) => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

export const isDemoModeEnabled = () => {
  const envFlag = parseEnvFlag(import.meta.env.VITE_DEMO_MODE);
  if (import.meta.env.PROD) {
    return envFlag;
  }
  if (typeof import.meta.env.VITE_DEMO_MODE === "string") {
    return envFlag;
  }
  return import.meta.env.DEV;
};
