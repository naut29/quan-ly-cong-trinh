import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { normsApi } from "@/lib/api/norms";

const Norms: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="norms"
    title="Định mức"
    description="Định mức dự án trong /app chỉ sử dụng dữ liệu Supabase."
    client={normsApi}
  />
);

export default Norms;
