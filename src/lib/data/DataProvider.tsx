import React, { createContext, useContext, useMemo } from "react";
import { useCompany } from "@/app/context/CompanyContext";
import { createAppDataProvider } from "@/lib/data/appDataProvider";
import { demoDataProvider } from "@/lib/data/demoDataProvider";
import type { AppDataLayer, DataMode } from "@/lib/data/types";

const DataLayerContext = createContext<AppDataLayer | null>(null);

const DemoDataProviderBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataLayerContext.Provider value={demoDataProvider}>{children}</DataLayerContext.Provider>
);

const AppDataProviderBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { companyId, companyName } = useCompany();
  const value = useMemo(
    () => createAppDataProvider({ orgId: companyId, companyName }),
    [companyId, companyName],
  );

  return <DataLayerContext.Provider value={value}>{children}</DataLayerContext.Provider>;
};

interface DataProviderProps {
  mode: DataMode;
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ mode, children }) => {
  if (mode === "demo") {
    return <DemoDataProviderBoundary>{children}</DemoDataProviderBoundary>;
  }

  return <AppDataProviderBoundary>{children}</AppDataProviderBoundary>;
};

export const useDataProvider = () => {
  const context = useContext(DataLayerContext);

  if (!context) {
    throw new Error("useDataProvider must be used within DataProvider");
  }

  return context;
};
