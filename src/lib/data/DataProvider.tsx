import React, { createContext, useContext } from "react";
import type { AppDataLayer } from "@/lib/data/types";

const DataLayerContext = createContext<AppDataLayer | null>(null);

interface DataLayerProviderProps {
  value: AppDataLayer;
  children: React.ReactNode;
}

export const DataLayerProvider: React.FC<DataLayerProviderProps> = ({ value, children }) => (
  <DataLayerContext.Provider value={value}>{children}</DataLayerContext.Provider>
);

export const useDataProvider = () => {
  const context = useContext(DataLayerContext);

  if (!context) {
    throw new Error("useDataProvider must be used within a data provider");
  }

  return context;
};
