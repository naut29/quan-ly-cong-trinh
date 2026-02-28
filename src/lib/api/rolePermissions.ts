import { supabase } from "@/lib/supabaseClient";

export type RolePermissionAction = "view" | "edit" | "approve";

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }

  return supabase;
};

const getCurrentUserRoleMembership = async (orgId: string) => {
  const client = assertClient();
  await client.rpc("ensure_org_rbac_seed", { p_org_id: orgId });

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user?.id) {
    return null;
  }

  const { data, error } = await client
    .from("org_members")
    .select("role, role_id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as { role: string | null; role_id: string | null } | null;
};

export const listCurrentUserPermissionRows = async (orgId: string) => {
  const client = assertClient();
  const membership = await getCurrentUserRoleMembership(orgId);

  if (!membership) {
    return [] as Array<{ module_key: string; action: RolePermissionAction }>;
  }

  const roleKey = membership.role ?? "";
  if (roleKey === "owner" || roleKey === "admin") {
    return null;
  }

  if (!membership.role_id) {
    return [] as Array<{ module_key: string; action: RolePermissionAction }>;
  }

  const { data, error } = await client
    .from("role_permissions")
    .select("module_key, action")
    .eq("role_id", membership.role_id);

  if (error) {
    throw error;
  }

  return (data ?? []) as Array<{ module_key: string; action: RolePermissionAction }>;
};

export const hasOrgPermission = async (
  orgId: string,
  moduleKey: string,
  action: RolePermissionAction,
) => {
  const rows = await listCurrentUserPermissionRows(orgId);

  if (rows === null) {
    return true;
  }

  return rows.some((row) => row.module_key === moduleKey && row.action === action);
};
