import React, { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { isDemoPath } from "@/lib/appMode";
import { useOrgContext } from "@/app/context/useOrgContext";

interface CompanyContextValue {
  companyId: string | null;
  companyName: string | null;
  role: string | null;
  loading: boolean;
  organizations: Array<{ orgId: string; orgName: string | null; role: string | null }>;
  switchCompany: (orgId: string) => void;
  refreshCompanyContext: () => Promise<void>;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentOrgId,
    currentRole,
    currentOrgName,
    organizations,
    loading,
    error,
    switchOrganization,
    reload,
  } = useOrgContext();

  const value = useMemo<CompanyContextValue>(
    () => ({
      companyId: currentOrgId ?? null,
      companyName: currentOrgName,
      role: currentRole ?? null,
      loading,
      organizations,
      switchCompany: switchOrganization,
      refreshCompanyContext: async () => {
        await reload();
      },
      error,
    }),
    [currentOrgId, currentOrgName, currentRole, error, loading, organizations, reload, switchOrganization],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  const location = useLocation();

  if (!context) {
    if (isDemoPath(location.pathname)) {
      return {
        companyId: null,
        companyName: "Demo",
        role: null,
        loading: false,
        organizations: [],
        switchCompany: () => {},
        refreshCompanyContext: async () => {},
        error: null,
      };
    }

    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
