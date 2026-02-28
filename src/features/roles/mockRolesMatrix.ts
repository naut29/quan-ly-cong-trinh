import { moduleNames, roleLabels, rolePermissions, type UserRole } from "@/data/mockData";

import type {
  PermissionMatrix,
  RolesMatrixPermissionCell,
  RolesMatrixRole,
} from "./types";

const EDITABLE_ROLE_IDS: UserRole[] = [
  "project_manager",
  "qs_controller",
  "warehouse",
  "accountant",
  "viewer",
];

const getPermissionCell = (roleId: UserRole, moduleId: string): RolesMatrixPermissionCell => {
  const roleEntry = rolePermissions.find((item) => item.role === roleId);
  const permission = roleEntry?.permissions.find((item) => item.module === moduleId);

  return {
    view: permission?.view ?? false,
    edit: permission?.edit ?? false,
    approve: permission?.approve ?? false,
  };
};

export const rolesMatrixRoles: RolesMatrixRole[] = EDITABLE_ROLE_IDS.map((roleId) => ({
  id: roleId,
  label: roleLabels[roleId] ?? roleId,
}));

export const createRolesPermissionMatrix = (): PermissionMatrix =>
  Object.entries(moduleNames)
    .filter(([moduleId]) => moduleId !== "admin")
    .map(([moduleId, label]) => ({
      module: moduleId,
      label,
      supportsApprove: moduleId === "approvals",
      permissions: Object.fromEntries(
        EDITABLE_ROLE_IDS.map((roleId) => [roleId, getPermissionCell(roleId, moduleId)]),
      ) as Record<string, RolesMatrixPermissionCell>,
    }));
