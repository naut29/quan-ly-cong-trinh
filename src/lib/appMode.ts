export const isDemoPath = (pathname: string) => pathname.startsWith("/demo");

export const getAppBasePath = (pathname: string) =>
  isDemoPath(pathname) ? "/demo" : "/app";
