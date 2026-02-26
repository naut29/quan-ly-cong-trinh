import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Locale, useI18n } from "@/contexts/I18nContext";

const localeOptions: Locale[] = ["vi", "en"];

const Header: React.FC = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">{t("common.brandName")}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.pricing")}
          </Link>
          <Link
            to="/demo/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.demo")}
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div
            aria-label={t("common.localeLabel")}
            className="hidden items-center gap-1 rounded-full border border-border p-1 sm:flex"
          >
            {localeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLocale(option)}
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                  locale === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`common.locales.${option}`)}
              </button>
            ))}
          </div>
          <Link to="/app/login">
            <Button variant="ghost">{t("header.login")}</Button>
          </Link>
          <Link to="/pricing">
            <Button>{t("header.viewPricing")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
