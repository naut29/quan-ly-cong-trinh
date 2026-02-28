import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { wbsApi } from "@/lib/api/wbs";

const WBS: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="wbs"
    title="Cấu trúc công việc"
    description="Quản lý WBS bằng dữ liệu thật trong Supabase."
    client={wbsApi}
  />
);

export default WBS;
