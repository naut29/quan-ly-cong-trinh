import { supabase } from "@/lib/supabaseClient";

export interface OrgMemberRow {
  org_id: string;
  user_id: string;
  role: string;
  role_id: string | null;
  role_key: string | null;
  role_name: string | null;
  status: string;
  created_at: string;
  member_key: string;
}

export interface UserProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

export interface OrgMemberView extends OrgMemberRow {
  email: string | null;
  full_name: string | null;
}

export interface ProjectAssignmentRow {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

interface OrgMemberRecord {
  org_id: string;
  user_id: string;
  role?: string | null;
  role_id?: string | null;
  role_key?: string | null;
  role_name?: string | null;
  status: string;
  created_at: string;
}

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

const buildOrgMemberKey = (orgId: string, userId: string) => `${orgId}:${userId}`;

const normalizeOrgMemberRow = (row: OrgMemberRecord): OrgMemberRow => {
  const roleKey = row.role_key ?? row.role ?? null;

  return {
    org_id: row.org_id,
    user_id: row.user_id,
    role: roleKey ?? "",
    role_id: row.role_id ?? null,
    role_key: roleKey,
    role_name: row.role_name ?? null,
    status: row.status,
    created_at: row.created_at,
    member_key: buildOrgMemberKey(row.org_id, row.user_id),
  };
};

export const listOrgMembers = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .rpc("list_org_members", { p_org_id: orgId });

  if (error) throw error;

  return ((data ?? []) as OrgMemberRecord[]).map((row) => ({
    ...normalizeOrgMemberRow(row),
    email: (row as { email?: string | null }).email ?? null,
    full_name: (row as { full_name?: string | null }).full_name ?? null,
  }));
};

export const listProjectAssignmentsForOrg = async (orgId: string) => {
  const client = assertClient();
  let { data: projects, error: projectsError } = await client
    .from("projects")
    .select("id")
    .eq("org_id", orgId);

  if (projectsError) {
    const legacyResult = await client.from("projects").select("id").eq("company_id", orgId);
    projects = legacyResult.data;
    projectsError = legacyResult.error;
  }

  if (projectsError) throw projectsError;

  const projectIds = (projects ?? []).map((project) => String(project.id));
  if (projectIds.length === 0) return [] as ProjectAssignmentRow[];

  const { data, error } = await client
    .from("project_assignments")
    .select("id, project_id, user_id, created_at")
    .in("project_id", projectIds);

  if (error) throw error;
  return (data ?? []) as ProjectAssignmentRow[];
};

export const replaceUserProjectAssignments = async (
  orgId: string,
  userId: string,
  projectIds: string[],
) => {
  const client = assertClient();

  let { data: orgProjects, error: orgProjectsError } = await client
    .from("projects")
    .select("id")
    .eq("org_id", orgId);

  if (orgProjectsError) {
    const legacyResult = await client.from("projects").select("id").eq("company_id", orgId);
    orgProjects = legacyResult.data;
    orgProjectsError = legacyResult.error;
  }

  if (orgProjectsError) throw orgProjectsError;
  const orgProjectIds = (orgProjects ?? []).map((item) => String(item.id));
  if (orgProjectIds.length === 0) return;

  const { error: deleteError } = await client
    .from("project_assignments")
    .delete()
    .eq("user_id", userId)
    .in("project_id", orgProjectIds);
  if (deleteError) throw deleteError;

  const cleanedIds = projectIds.filter((projectId) => orgProjectIds.includes(projectId));
  if (cleanedIds.length === 0) return;

  const rows = cleanedIds.map((projectId) => ({
    project_id: projectId,
    user_id: userId,
  }));

  const { error: insertError } = await client.from("project_assignments").insert(rows);
  if (insertError) throw insertError;
};

export const findUserProfileByEmail = async (email: string) => {
  const client = assertClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as UserProfileRow | null;
};

export const listProfilesByIds = async (userIds: string[]) => {
  const client = assertClient();
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return [] as UserProfileRow[];
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name")
    .in("id", uniqueIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as UserProfileRow[];
};

export type AddOrgMemberResult =
  | { ok: true; member: OrgMemberRow }
  | { ok: false; reason: "not_found" | "already_member" };

export const addOrgMemberByEmail = async (
  orgId: string,
  email: string,
  roleId: string,
  status = "active",
): Promise<AddOrgMemberResult> => {
  const profile = await findUserProfileByEmail(email);
  if (!profile) {
    return { ok: false, reason: "not_found" };
  }

  const result = await addOrgMemberByUserId(orgId, profile.id, roleId, status);
  if (!result.ok) {
    return result;
  }
  return result;
};

export const addOrgMemberByUserId = async (
  orgId: string,
  userId: string,
  roleId: string,
  status = "active",
): Promise<AddOrgMemberResult> => {
  const client = assertClient();
  const { data, error } = await client
    .from("org_members")
    .insert({
      org_id: orgId,
      user_id: userId,
      role_id: roleId,
      status,
    })
    .select("org_id, user_id, role, role_id, status, created_at")
    .single();

  if (error) {
    if (error.code === "23505" || /duplicate/i.test(error.message)) {
      return { ok: false, reason: "already_member" };
    }
    throw error;
  }

  return {
    ok: true,
    member: normalizeOrgMemberRow(data as OrgMemberRecord),
  };
};

export interface UpdateOrgMemberInput {
  roleId?: string;
  status?: string;
}

export const updateOrgMember = async (
  orgId: string,
  userId: string,
  updates: UpdateOrgMemberInput,
) => {
  const client = assertClient();
  const nextUpdate: Record<string, string> = {};

  if (updates.roleId) {
    nextUpdate.role_id = updates.roleId;
  }

  if (updates.status) {
    nextUpdate.status = updates.status;
  }

  const { data, error } = await client
    .from("org_members")
    .update(nextUpdate)
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .select("org_id, user_id, role, role_id, status, created_at")
    .single();
  if (error) throw error;
  return normalizeOrgMemberRow(data as OrgMemberRecord);
};

export const removeOrgMember = async (orgId: string, userId: string) => {
  const client = assertClient();
  const { error } = await client
    .from("org_members")
    .delete()
    .eq("org_id", orgId)
    .eq("user_id", userId);
  if (error) throw error;
};
