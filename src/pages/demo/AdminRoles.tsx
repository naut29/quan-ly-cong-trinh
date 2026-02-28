import React, { useState } from "react";

import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";
import RolesMatrix from "@/features/roles/RolesMatrix";
import { demoCompanyData } from "@/lib/data/demo/fixtures/company";
import {
  createDemoRolesPermissionMatrix,
  demoRolesMatrixRoles,
} from "@/lib/data/demo/fixtures/rolesMatrix";

const DemoAdminRoles: React.FC = () => {
  const [initialMatrix] = useState(createDemoRolesPermissionMatrix);

  return (
    <RolesMatrix
      roles={demoRolesMatrixRoles}
      matrix={initialMatrix}
      mode="demo"
      description={`Cau hinh quyen truy cap cho tung vai tro trong ${demoCompanyData.name}`}
      onSave={async () => {
        showDemoNotSavedToast();
      }}
    />
  );
};

export default DemoAdminRoles;
