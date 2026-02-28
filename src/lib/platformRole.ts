import type { SupabaseClient } from "@supabase/supabase-js";

export type PlatformRole = "super_admin";

interface PlatformRoleRow {
  role?: string | null;
}

const TABLE_NOT_FOUND_CODES = new Set(["42P01", "PGRST205"]);

const getErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object") return "";
  return String((error as { code?: unknown }).code ?? "");
};

const isTableMissingError = (error: unknown) => TABLE_NOT_FOUND_CODES.has(getErrorCode(error));

export const isSuperAdminRole = (role: string | null | undefined): role is PlatformRole =>
  role === "super_admin";

export const getUserPlatformRole = async (
  client: SupabaseClient,
  userId: string,
): Promise<PlatformRole | null> => {
  const { data, error } = await client
    .from("platform_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle<PlatformRoleRow>();

  if (error) {
    if (isTableMissingError(error)) {
      return null;
    }
    throw error;
  }

  return isSuperAdminRole(data?.role) ? data.role : null;
};
