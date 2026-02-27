import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { isDemoPath } from "@/lib/appMode";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyContextValue {
  companyId: string | null;
  companyName: string | null;
  role: string | null;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentOrgId, currentRole, loadingSession, loadingMembership } = useAuth();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    const loadCompany = async () => {
      if (!currentOrgId) {
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
        .eq("id", currentOrgId)
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
  }, [currentOrgId]);

  const value = useMemo<CompanyContextValue>(
    () => ({
      companyId: currentOrgId ?? null,
      companyName,
      role: currentRole ?? null,
      loading: loadingSession || loadingMembership || loadingCompany,
    }),
    [currentOrgId, currentRole, companyName, loadingSession, loadingMembership, loadingCompany]
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
