export const isDemoPath = (pathname: string) => pathname.startsWith("/demo");

export const isAppPath = (pathname: string) => pathname.startsWith("/app");

export const getAppBasePath = (pathname: string) =>
  isDemoPath(pathname) ? "/demo" : "/app";
