import React from "react";

import AppIntegrationsPage from "@/pages/app/AdminIntegrations";
import { demoAdminIntegrations } from "@/lib/data/demo/fixtures/adminIntegrations";

const DemoAdminIntegrations: React.FC = () => (
  <AppIntegrationsPage mode="demo" initialItems={demoAdminIntegrations} />
);

export default DemoAdminIntegrations;
