import React, { useMemo } from "react";
import { useCompany } from "@/app/context/CompanyContext";
import { createAppDataProvider } from "@/lib/data/appDataProvider";
import { DataLayerProvider } from "@/lib/data/DataProvider";

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { companyId, companyName } = useCompany();
  const value = useMemo(
    () => createAppDataProvider({ orgId: companyId, companyName }),
    [companyId, companyName],
  );

  return <DataLayerProvider value={value}>{children}</DataLayerProvider>;
};

export default AppDataProvider;
