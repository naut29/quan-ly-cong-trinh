import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { reportsApi } from "@/lib/api/reports";

const Reports: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="reports"
    title="Báo cáo"
    description="Báo cáo công trình được lưu bằng dữ liệu thật, không còn sample data."
    client={reportsApi}
  />
);

export default Reports;
