import React from "react";
import ProjectModuleRecordsPage from "@/components/projects/ProjectModuleRecordsPage";
import { paymentsApi } from "@/lib/api/payments";

const Payments: React.FC = () => (
  <ProjectModuleRecordsPage
    moduleKey="payments"
    title="Thanh toán"
    description="Theo dõi thanh toán bằng dữ liệu thật, không còn mock dossiers."
    client={paymentsApi}
  />
);

export default Payments;
