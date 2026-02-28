import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { costsApi } from "@/lib/api/costs";

const Costs: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="costs"
    title="Chi phí"
    description="Chi phí dự án được lưu thật vào cơ sở dữ liệu và tồn tại sau khi reload."
    client={costsApi}
  />
);

export default Costs;
