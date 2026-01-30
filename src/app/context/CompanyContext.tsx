import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";

interface CompanyContextValue {
  companyId: string | null;
  companyName: string | null;
  role: string | null;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading: sessionLoading } = useSession();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    const loadCompany = async () => {
      if (!profile?.company_id) {
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
        .from("companies")
        .select("id, name")
        .eq("id", profile.company_id)
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
  }, [profile?.company_id]);

  const value = useMemo<CompanyContextValue>(
    () => ({
      companyId: profile?.company_id ?? null,
      companyName,
      role: profile?.role ?? null,
      loading: sessionLoading || loadingCompany,
    }),
    [profile?.company_id, profile?.role, companyName, sessionLoading, loadingCompany]
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
