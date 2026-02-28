import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { progressApi } from "@/lib/api/progress";

const Progress: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="progress"
    title="Tiến độ"
    description="Tiến độ dự án /app được cập nhật thật và refetch từ Supabase."
    client={progressApi}
  />
);

export default Progress;
