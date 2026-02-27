import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { isDemoPath } from "@/lib/appMode";

interface CompanyContextValue {
  companyId: string | null;
  companyName: string | null;
  role: string | null;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orgId, orgRole, loading: sessionLoading } = useSession();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    const loadCompany = async () => {
      if (!orgId) {
        setCompanyName(null);
        setLoadingCompany(false);
        return;
      }

      if (!client) {
        setCompanyName(null);
        setLoadingCompany(false);
        return;
      }

      setLoadingCompany(true);
      const { data, error } = await client
        .from("organizations")
        .select("id, name")
        .eq("id", orgId)
        .single();

      if (!isActive) return;
      if (error) {
        setCompanyName(null);
      } else {
        setCompanyName(data?.name ?? null);
      }
      setLoadingCompany(false);
    };

    loadCompany();

    return () => {
      isActive = false;
    };
  }, [orgId]);

  const value = useMemo<CompanyContextValue>(
    () => ({
      companyId: orgId ?? null,
      companyName,
      role: orgRole ?? null,
      loading: sessionLoading || loadingCompany,
    }),
    [orgId, orgRole, companyName, sessionLoading, loadingCompany]
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
      };
    }

    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
