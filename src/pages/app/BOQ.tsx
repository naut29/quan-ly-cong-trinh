import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { budgetApi } from "@/lib/api/budget";

const BOQ: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="boq"
    title="Dự toán"
    description="Bảng dự toán dự án được đọc và ghi trực tiếp vào Supabase."
    client={budgetApi}
  />
);

export default BOQ;
