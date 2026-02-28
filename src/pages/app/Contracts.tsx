import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { contractsApi } from "@/lib/api/contracts";

const Contracts: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="contracts"
    title="Hợp đồng"
    description="Hợp đồng /app sử dụng CRUD thật với Supabase."
    client={contractsApi}
  />
);

export default Contracts;
