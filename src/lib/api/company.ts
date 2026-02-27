import { supabase } from "@/lib/supabaseClient";

export interface OrganizationRow {
  id: string;
  name: string;
  tax_code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  representative_name: string | null;
  representative_title: string | null;
  description: string | null;
  plan: string | null;
  created_at: string | null;
}

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

export const getOrganization = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("organizations")
    .select(
      "id, name, tax_code, address, phone, email, website, representative_name, representative_title, description, plan, created_at",
    )
    .eq("id", orgId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as OrganizationRow | null;
};

export interface UpdateOrganizationInput {
  name?: string;
  tax_code?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  representative_name?: string | null;
  representative_title?: string | null;
  description?: string | null;
  plan?: string | null;
}

export const updateOrganization = async (orgId: string, input: UpdateOrganizationInput) => {
  const client = assertClient();
  const { data, error } = await client
    .from("organizations")
    .update(input)
    .eq("id", orgId)
    .select(
      "id, name, tax_code, address, phone, email, website, representative_name, representative_title, description, plan, created_at",
    )
    .single();
  if (error) throw error;
  return data as OrganizationRow;
};

const countRows = async (table: string, column: string, value: string, extraFilter?: [string, string]) => {
  const client = assertClient();
  let query = client.from(table).select("id", { count: "exact", head: true }).eq(column, value);
  if (extraFilter) {
    query = query.eq(extraFilter[0], extraFilter[1]);
  }
  const { count, error } = await query;
  if (error) {
    return 0;
  }
  return count ?? 0;
};

export const getOrganizationStats = async (orgId: string) => {
  const [membersCount, projectsCountPrimary] = await Promise.all([
    countRows("org_members", "org_id", orgId, ["status", "active"]),
    countRows("projects", "org_id", orgId),
  ]);

  const projectsCount =
    projectsCountPrimary > 0 ? projectsCountPrimary : await countRows("projects", "company_id", orgId);

  let plan = "starter";
  try {
    const org = await getOrganization(orgId);
    plan = org?.plan ?? plan;
  } catch {
    // fallback to default
  }

  return {
    membersCount,
    projectsCount,
    plan,
  };
};
