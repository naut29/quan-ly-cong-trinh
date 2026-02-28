import type { RolesMatrixPermissionCell } from "@/features/roles/types";

export type RoleBadgeStatus = "info" | "success" | "warning" | "neutral";

export interface RbacModuleDefinition {
  key: string;
  label: string;
  supportsApprove: boolean;
}

export interface RoleLike {
  id: string;
  key: string;
  name: string;
}

export const DEFAULT_ROLE_KEY = "member";

export const RBAC_MODULES: RbacModuleDefinition[] = [
  { key: "dashboard", label: "Dashboard", supportsApprove: false },
  { key: "projects", label: "Du an", supportsApprove: false },
  { key: "wbs", label: "WBS", supportsApprove: false },
  { key: "boq", label: "Du toan", supportsApprove: false },
  { key: "materials", label: "Vat tu", supportsApprove: false },
  { key: "norms", label: "Dinh muc", supportsApprove: false },
  { key: "costs", label: "Chi phi", supportsApprove: false },
  { key: "contracts", label: "Hop dong", supportsApprove: false },
  { key: "payments", label: "Thanh toan", supportsApprove: false },
  { key: "approvals", label: "Phe duyet", supportsApprove: true },
  { key: "progress", label: "Tien do", supportsApprove: false },
  { key: "reports", label: "Bao cao", supportsApprove: false },
];

const LEGACY_ROLE_KEY_MAP: Record<string, string> = {
  owner: "owner",
  company_owner: "owner",
  admin: "admin",
  manager: "manager",
  project_manager: "manager",
  member: "member",
  editor: "member",
  viewer: "viewer",
};

export const normalizeRoleKey = (value: string | null | undefined) => {
  if (!value) {
    return DEFAULT_ROLE_KEY;
  }

  return LEGACY_ROLE_KEY_MAP[value] ?? value;
};

export const findRoleByKey = <TRole extends RoleLike>(
  roles: TRole[],
  roleKey: string,
): TRole | null => {
  const normalizedRoleKey = normalizeRoleKey(roleKey);
  return roles.find((role) => normalizeRoleKey(role.key) === normalizedRoleKey) ?? null;
};

export const getDefaultRole = <TRole extends RoleLike>(roles: TRole[]) => {
  return findRoleByKey(roles, DEFAULT_ROLE_KEY) ?? roles[0] ?? null;
};

export const emptyPermissionCell = (): RolesMatrixPermissionCell => ({
  view: false,
  edit: false,
  approve: false,
});

export const getRoleBadgeStatus = (roleKey: string | null | undefined): RoleBadgeStatus => {
  const normalizedRoleKey = normalizeRoleKey(roleKey);

  if (normalizedRoleKey === "owner") return "info";
  if (normalizedRoleKey === "admin") return "success";
  if (normalizedRoleKey === "manager") return "warning";
  return "neutral";
};
