import {
  createRolesPermissionMatrix,
  rolesMatrixRoles,
} from "@/features/roles/mockRolesMatrix";

import type { RolesMatrixRole } from "@/features/roles/types";

export const demoRolesMatrixRoles: RolesMatrixRole[] = rolesMatrixRoles.map((role) => ({
  ...role,
}));

export const createDemoRolesPermissionMatrix = () => createRolesPermissionMatrix();
