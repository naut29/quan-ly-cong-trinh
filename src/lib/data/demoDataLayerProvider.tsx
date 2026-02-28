import React from "react";
import { DataLayerProvider } from "@/lib/data/DataProvider";
import { demoDataProvider } from "@/lib/data/demoDataProvider";

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataLayerProvider value={demoDataProvider}>{children}</DataLayerProvider>
);

export default DemoDataProvider;
