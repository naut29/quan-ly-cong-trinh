import { supabase } from "@/lib/supabaseClient";

export interface OrgMemberRow {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
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

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

const getProfilesByUserIds = async (userIds: string[]) => {
  if (userIds.length === 0) return new Map<string, UserProfileRow>();
  const client = assertClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (error) {
    return new Map<string, UserProfileRow>();
  }

  return new Map((data ?? []).map((row) => [row.id as string, row as UserProfileRow]));
};

export const listOrgMembers = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("org_members")
    .select("id, org_id, user_id, role, status, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const members = (data ?? []) as OrgMemberRow[];
  const profileMap = await getProfilesByUserIds(members.map((item) => item.user_id));

  return members.map((member) => {
    const profile = profileMap.get(member.user_id);
    return {
      ...member,
      email: profile?.email ?? null,
      full_name: profile?.full_name ?? null,
    } satisfies OrgMemberView;
  });
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

export type AddOrgMemberResult =
  | { ok: true; member: OrgMemberRow }
  | { ok: false; reason: "not_found" | "already_member" };

export const addOrgMemberByEmail = async (
  orgId: string,
  email: string,
  role: string,
  status = "active",
): Promise<AddOrgMemberResult> => {
  const profile = await findUserProfileByEmail(email);
  if (!profile) {
    return { ok: false, reason: "not_found" };
  }

  const result = await addOrgMemberByUserId(orgId, profile.id, role, status);
  if (!result.ok) {
    return result;
  }
  return result;
};

export const addOrgMemberByUserId = async (
  orgId: string,
  userId: string,
  role: string,
  status = "active",
): Promise<AddOrgMemberResult> => {
  const client = assertClient();
  const { data, error } = await client
    .from("org_members")
    .insert({
      org_id: orgId,
      user_id: userId,
      role,
      status,
    })
    .select("id, org_id, user_id, role, status, created_at")
    .single();

  if (error) {
    if (error.code === "23505" || /duplicate/i.test(error.message)) {
      return { ok: false, reason: "already_member" };
    }
    throw error;
  }

  return { ok: true, member: data as OrgMemberRow };
};

export const updateOrgMember = async (
  memberId: string,
  updates: Partial<Pick<OrgMemberRow, "role" | "status">>,
) => {
  const client = assertClient();
  const { data, error } = await client
    .from("org_members")
    .update(updates)
    .eq("id", memberId)
    .select("id, org_id, user_id, role, status, created_at")
    .single();
  if (error) throw error;
  return data as OrgMemberRow;
};

export const removeOrgMember = async (memberId: string) => {
  const client = assertClient();
  const { error } = await client.from("org_members").delete().eq("id", memberId);
  if (error) throw error;
};
