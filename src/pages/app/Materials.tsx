import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { materialsApi } from "@/lib/api/materials";

const Materials: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="materials"
    title="Vật tư"
    description="Quản lý vật tư bằng dữ liệu thật, không còn fixtures trong /app."
    client={materialsApi}
  />
);

export default Materials;
