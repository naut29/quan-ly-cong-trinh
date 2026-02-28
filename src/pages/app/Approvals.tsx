import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { approvalsApi } from "@/lib/api/approvals";

const Approvals: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="approvals"
    title="Phê duyệt"
    description="Danh sách phê duyệt của dự án được đồng bộ với Supabase."
    client={approvalsApi}
  />
);

export default Approvals;
