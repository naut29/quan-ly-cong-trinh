import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-background px-6 py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">{t("common.brandName")}</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            <span>{t("footer.emailLabel")}: </span>
            <a href="mailto:contact@quanlycongtrinh.com" className="text-primary hover:underline">
              contact@quanlycongtrinh.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
