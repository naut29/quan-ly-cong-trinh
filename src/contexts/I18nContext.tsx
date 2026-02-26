import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

const localeMessages = { vi, en } as const;
const EXPLICIT_LOCALE_STORAGE_KEY = "qct_explicit_locale";
const MAIN_DOMAIN_HOSTS = new Set(["quanlycongtrinh.com", "www.quanlycongtrinh.com"]);

export type Locale = keyof typeof localeMessages;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const isLocale = (value: string | null): value is Locale => value === "vi" || value === "en";

const getDefaultLocale = (): Locale => {
  if (typeof window === "undefined") {
    return "vi";
  }

  const hostname = window.location.hostname.toLowerCase();
  if (MAIN_DOMAIN_HOSTS.has(hostname)) {
    return "vi";
  }

  return "vi";
};

const getNestedText = (source: unknown, key: string): string | undefined => {
  const result = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

  return typeof result === "string" ? result : undefined;
};

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") {
    return "vi";
  }

  const queryLang = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(queryLang)) {
    window.localStorage.setItem(EXPLICIT_LOCALE_STORAGE_KEY, queryLang);
    return queryLang;
  }

  const storedLocale = window.localStorage.getItem(EXPLICIT_LOCALE_STORAGE_KEY);
  if (isLocale(storedLocale)) {
    return storedLocale;
  }

  return getDefaultLocale();
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(EXPLICIT_LOCALE_STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      const localized = getNestedText(localeMessages[locale], key);
      if (localized) {
        return localized;
      }

      return getNestedText(localeMessages.vi, key) ?? key;
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
