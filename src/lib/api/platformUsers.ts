import { supabase } from "@/lib/supabaseClient";

export interface PlatformUserRecord {
  userId: string;
  email: string | null;
  fullName: string | null;
  companyId: string | null;
  companyName: string | null;
  companyCount: number;
  orgRole: string | null;
  platformRole: "super_admin" | null;
  status: string;
  createdAt: string | null;
}

interface ProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  org_id?: string | null;
  created_at?: string | null;
}

interface OrgMemberRow {
  org_id: string;
  user_id: string;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface OrganizationRow {
  id: string;
  name?: string | null;
}

interface PlatformRoleRow {
  user_id: string;
  role?: string | null;
}

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

export const listPlatformUsers = async (): Promise<PlatformUserRecord[]> => {
  const client = assertClient();

  const [{ data: profileRows, error: profileError }, { data: roleRows, error: roleError }] =
    await Promise.all([
      client
        .from("profiles")
        .select("id, email, full_name, org_id, created_at")
        .order("created_at", { ascending: true }),
      client
        .from("platform_roles")
        .select("user_id, role"),
    ]);

  if (profileError) {
    throw profileError;
  }
  if (roleError) {
    throw roleError;
  }

  const { data: memberRows, error: memberError } = await client
    .from("org_members")
    .select("org_id, user_id, role, status, created_at")
    .order("created_at", { ascending: true });

  if (memberError) {
    throw memberError;
  }

  const allOrgIds = new Set<string>();
  for (const profile of profileRows ?? []) {
    if (profile.org_id) {
      allOrgIds.add(String(profile.org_id));
    }
  }
  for (const member of memberRows ?? []) {
    if (member.org_id) {
      allOrgIds.add(String(member.org_id));
    }
  }

  let organizationRows: OrganizationRow[] = [];
  if (allOrgIds.size > 0) {
    const { data, error } = await client
      .from("organizations")
      .select("id, name")
      .in("id", Array.from(allOrgIds));

    if (error) {
      throw error;
    }

    organizationRows = (data ?? []) as OrganizationRow[];
  }

  const organizationsById = new Map(
    organizationRows.map((row) => [String(row.id), row.name ?? null]),
  );

  const membershipsByUserId = new Map<string, OrgMemberRow[]>();
  for (const member of (memberRows ?? []) as OrgMemberRow[]) {
    const userId = String(member.user_id);
    const existing = membershipsByUserId.get(userId) ?? [];
    existing.push({
      org_id: String(member.org_id),
      user_id: userId,
      role: member.role ?? null,
      status: member.status ?? null,
      created_at: member.created_at ?? null,
    });
    membershipsByUserId.set(userId, existing);
  }

  const platformRolesByUserId = new Map(
    ((roleRows ?? []) as PlatformRoleRow[])
      .filter((row) => row.role === "super_admin")
      .map((row) => [String(row.user_id), "super_admin" as const]),
  );

  const profiles = (profileRows ?? []) as ProfileRow[];
  const records = profiles.map((profile) => {
    const userId = String(profile.id);
    const memberships = membershipsByUserId.get(userId) ?? [];
    const primaryMembership =
      memberships.find((member) => member.org_id === profile.org_id) ?? memberships[0] ?? null;
    const companyId = String(profile.org_id ?? primaryMembership?.org_id ?? "") || null;
    const companyCount = new Set(memberships.map((member) => member.org_id)).size;
    const hasActiveMembership = memberships.some((member) => member.status === "active");
    const status = memberships.length === 0 ? "inactive" : hasActiveMembership ? "active" : "inactive";
    const membershipCreatedAt = memberships[0]?.created_at ?? null;

    return {
      userId,
      email: profile.email ?? null,
      fullName: profile.full_name ?? null,
      companyId,
      companyName: companyId ? organizationsById.get(companyId) ?? null : null,
      companyCount,
      orgRole: primaryMembership?.role ?? null,
      platformRole: platformRolesByUserId.get(userId) ?? null,
      status,
      createdAt: profile.created_at ?? membershipCreatedAt,
    } satisfies PlatformUserRecord;
  });

  return records.sort((left, right) => {
    if (left.platformRole === "super_admin" && right.platformRole !== "super_admin") return -1;
    if (left.platformRole !== "super_admin" && right.platformRole === "super_admin") return 1;
    const leftLabel = (left.fullName ?? left.email ?? left.userId).toLowerCase();
    const rightLabel = (right.fullName ?? right.email ?? right.userId).toLowerCase();
    return leftLabel.localeCompare(rightLabel);
  });
};

export const grantSuperAdmin = async (userId: string) => {
  const client = assertClient();
  const { error } = await client
    .from("platform_roles")
    .upsert(
      {
        user_id: userId,
        role: "super_admin",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    throw error;
  }
};

export const revokeSuperAdmin = async (userId: string) => {
  const client = assertClient();
  const { error } = await client
    .from("platform_roles")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};
