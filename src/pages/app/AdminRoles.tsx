import React, { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import RolesMatrix from "@/features/roles/RolesMatrix";
import {
  createRolesPermissionMatrix,
  rolesMatrixRoles,
} from "@/features/roles/mockRolesMatrix";

const AdminRoles: React.FC = () => {
  const { getCurrentTenant } = useAuth();
  const tenant = getCurrentTenant();
  const [initialMatrix] = useState(createRolesPermissionMatrix);

  return (
    <RolesMatrix
      roles={rolesMatrixRoles}
      matrix={initialMatrix}
      mode="app"
      description={`Cau hinh quyen truy cap cho tung vai tro trong ${tenant?.name ?? "workspace nay"}`}
      onSave={async () => {}}
    />
  );
};

export default AdminRoles;
