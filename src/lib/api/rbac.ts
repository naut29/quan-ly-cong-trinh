import type { PermissionMatrix, RolesMatrixRole } from "@/features/roles/types";
import { RBAC_MODULES, emptyPermissionCell } from "@/lib/rbac";
import { supabase } from "@/lib/supabaseClient";

export interface OrgRoleRow {
  id: string;
  org_id: string;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

interface RolePermissionRow {
  role_id: string;
  module_key: string;
  action: "view" | "edit" | "approve";
}

interface RolesMatrixPayload {
  roles: OrgRoleRow[];
  matrix: PermissionMatrix;
}

const MANAGED_MODULE_KEYS = new Set(RBAC_MODULES.map((module) => module.key));

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }

  return supabase;
};

const buildPermissionKey = (row: RolePermissionRow) =>
  `${row.role_id}:${row.module_key}:${row.action}`;

const sortRoles = (roles: OrgRoleRow[]) =>
  [...roles].sort((left, right) => {
    if (left.created_at === right.created_at) {
      return left.name.localeCompare(right.name);
    }

    return left.created_at.localeCompare(right.created_at);
  });

const listRolePermissionRows = async (roleIds: string[]) => {
  if (roleIds.length === 0) {
    return [] as RolePermissionRow[];
  }

  const client = assertClient();
  const { data, error } = await client
    .from("role_permissions")
    .select("role_id, module_key, action")
    .in("role_id", roleIds);

  if (error) {
    throw error;
  }

  return ((data ?? []) as RolePermissionRow[]).filter((row) => MANAGED_MODULE_KEYS.has(row.module_key));
};

const buildMatrix = (roles: OrgRoleRow[], permissionRows: RolePermissionRow[]): PermissionMatrix => {
  const permissionKeys = new Set(permissionRows.map(buildPermissionKey));
  const sortedRoles = sortRoles(roles);

  return RBAC_MODULES.map((module) => ({
    module: module.key,
    label: module.label,
    supportsApprove: module.supportsApprove,
    permissions: Object.fromEntries(
      sortedRoles.map((role) => {
        const cell = emptyPermissionCell();
        if (permissionKeys.has(`${role.id}:${module.key}:view`)) {
          cell.view = true;
        }
        if (permissionKeys.has(`${role.id}:${module.key}:edit`)) {
          cell.edit = true;
        }
        if (module.supportsApprove && permissionKeys.has(`${role.id}:${module.key}:approve`)) {
          cell.approve = true;
        }
        return [role.id, cell];
      }),
    ),
  }));
};

const flattenMatrix = (matrix: PermissionMatrix): RolePermissionRow[] => {
  const nextRows: RolePermissionRow[] = [];

  matrix.forEach((row) => {
    Object.entries(row.permissions).forEach(([roleId, cell]) => {
      if (cell.view) {
        nextRows.push({ role_id: roleId, module_key: row.module, action: "view" });
      }

      if (cell.edit) {
        nextRows.push({ role_id: roleId, module_key: row.module, action: "edit" });
      }

      if (row.supportsApprove && cell.approve) {
        nextRows.push({ role_id: roleId, module_key: row.module, action: "approve" });
      }
    });
  });

  return nextRows;
};

const comparePermissionSets = (leftRows: RolePermissionRow[], rightRows: RolePermissionRow[]) => {
  const leftKeys = new Set(leftRows.map(buildPermissionKey));
  const rightKeys = new Set(rightRows.map(buildPermissionKey));

  if (leftKeys.size !== rightKeys.size) {
    return false;
  }

  for (const key of leftKeys) {
    if (!rightKeys.has(key)) {
      return false;
    }
  }

  return true;
};

export const ensureOrgRbacSeed = async (orgId: string) => {
  const client = assertClient();
  const { error } = await client.rpc("ensure_org_rbac_seed", { p_org_id: orgId });

  if (error) {
    throw error;
  }
};

export const listOrgRoles = async (orgId: string) => {
  const client = assertClient();
  await ensureOrgRbacSeed(orgId);

  const { data, error } = await client
    .from("roles")
    .select("id, org_id, key, name, description, is_system, created_at, updated_at")
    .eq("org_id", orgId);

  if (error) {
    throw error;
  }

  return sortRoles((data ?? []) as OrgRoleRow[]);
};

export const getOrgRolesMatrix = async (orgId: string): Promise<RolesMatrixPayload> => {
  const roles = await listOrgRoles(orgId);
  const permissionRows = await listRolePermissionRows(roles.map((role) => role.id));

  return {
    roles,
    matrix: buildMatrix(roles, permissionRows),
  };
};

export const saveOrgRolesMatrix = async (
  orgId: string,
  nextMatrix: PermissionMatrix,
): Promise<RolesMatrixPayload> => {
  const client = assertClient();
  const roles = await listOrgRoles(orgId);
  const currentRows = await listRolePermissionRows(roles.map((role) => role.id));
  const nextRows = flattenMatrix(nextMatrix);

  const currentKeys = new Set(currentRows.map(buildPermissionKey));
  const nextKeys = new Set(nextRows.map(buildPermissionKey));

  const rowsToAdd = nextRows.filter((row) => !currentKeys.has(buildPermissionKey(row)));
  const rowsToRemove = currentRows.filter((row) => !nextKeys.has(buildPermissionKey(row)));

  if (rowsToAdd.length > 0) {
    const { error } = await client
      .from("role_permissions")
      .upsert(rowsToAdd, { onConflict: "role_id,module_key,action" });

    if (error) {
      throw error;
    }
  }

  if (rowsToRemove.length > 0) {
    await Promise.all(
      rowsToRemove.map(async (row) => {
        const { error } = await client
          .from("role_permissions")
          .delete()
          .match({
            role_id: row.role_id,
            module_key: row.module_key,
            action: row.action,
          });

        if (error) {
          throw error;
        }
      }),
    );
  }

  const persistedRows = await listRolePermissionRows(roles.map((role) => role.id));

  if (!comparePermissionSets(nextRows, persistedRows)) {
    throw new Error("Permission matrix save verification failed after refetch.");
  }

  return {
    roles,
    matrix: buildMatrix(roles, persistedRows),
  };
};

export const toRolesMatrixRoles = (roles: OrgRoleRow[]): RolesMatrixRole[] =>
  roles.map((role) => ({
    id: role.id,
    label: role.name,
  }));
