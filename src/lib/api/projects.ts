import { supabase } from "@/lib/supabaseClient";

export interface ProjectRow {
  id: string;
  org_id: string | null;
  name: string;
  code: string | null;
  address: string | null;
  status: string | null;
  stage: string | null;
  budget: number | null;
  actual: number | null;
  committed: number | null;
  forecast: number | null;
  progress: number | null;
  start_date: string | null;
  end_date: string | null;
  alert_count: number | null;
  manager: string | null;
  created_at: string | null;
}

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeProject = (row: Partial<ProjectRow>, orgId: string) => ({
  id: String(row.id ?? ""),
  tenantId: orgId,
  code: row.code ?? row.name ?? "PRJ",
  name: row.name ?? "Untitled",
  address: row.address ?? "",
  status: row.status ?? "active",
  stage: row.stage ?? "foundation",
  budget: toNumber(row.budget, 0),
  actual: toNumber(row.actual, 0),
  committed: toNumber(row.committed, 0),
  forecast: toNumber(row.forecast ?? row.budget, 0),
  progress: Math.max(0, Math.min(100, Math.round(toNumber(row.progress, 0)))),
  startDate: row.start_date ?? row.created_at ?? new Date().toISOString(),
  endDate: row.end_date ?? "",
  alertCount: Math.max(0, Math.round(toNumber(row.alert_count, 0))),
  manager: row.manager ?? "",
});

const listByOrgId = async (orgId: string) => {
  const client = assertClient();
  return client
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
};

const listByCompanyId = async (orgId: string) => {
  const client = assertClient();
  return client
    .from("projects")
    .select("*")
    .eq("company_id", orgId)
    .order("created_at", { ascending: false });
};

export const listProjectsByOrg = async (orgId: string) => {
  if (!orgId) return [];

  const byOrg = await listByOrgId(orgId);
  if (!byOrg.error) {
    return (byOrg.data ?? []).map((row) => normalizeProject(row as ProjectRow, orgId));
  }

  const byCompany = await listByCompanyId(orgId);
  if (byCompany.error) {
    throw byCompany.error;
  }

  return (byCompany.data ?? []).map((row) => normalizeProject(row as ProjectRow, orgId));
};

export const getProjectById = async (orgId: string, projectId: string) => {
  if (!orgId || !projectId) {
    return null;
  }

  const client = assertClient();
  const byOrg = await client
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", projectId)
    .maybeSingle();

  if (!byOrg.error && byOrg.data) {
    return normalizeProject(byOrg.data as ProjectRow, orgId);
  }

  const byCompany = await client
    .from("projects")
    .select("*")
    .eq("company_id", orgId)
    .eq("id", projectId)
    .maybeSingle();

  if (byCompany.error) {
    throw byCompany.error;
  }

  return byCompany.data ? normalizeProject(byCompany.data as ProjectRow, orgId) : null;
};

export interface CreateProjectInput {
  name: string;
  code?: string | null;
  address?: string | null;
  status?: string | null;
  stage?: string | null;
  budget?: number | null;
  actual?: number | null;
  committed?: number | null;
  forecast?: number | null;
  progress?: number | null;
  manager?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const buildPayload = (orgId: string, input: CreateProjectInput) => ({
  org_id: orgId,
  code: input.code ?? null,
  name: input.name,
  address: input.address ?? null,
  status: input.status ?? "active",
  stage: input.stage ?? "foundation",
  budget: input.budget ?? 0,
  actual: input.actual ?? 0,
  committed: input.committed ?? 0,
  forecast: input.forecast ?? input.budget ?? 0,
  progress: input.progress ?? 0,
  manager: input.manager ?? null,
  start_date: input.startDate ?? null,
  end_date: input.endDate ?? null,
});

export const createProject = async (orgId: string, input: CreateProjectInput) => {
  const client = assertClient();
  const payload = buildPayload(orgId, input);

  const byOrg = await client.from("projects").insert(payload).select("*").single();
  if (!byOrg.error) {
    return normalizeProject(byOrg.data as ProjectRow, orgId);
  }

  const legacyPayload = {
    ...payload,
    company_id: orgId,
  };
  delete (legacyPayload as { org_id?: string }).org_id;

  const byCompany = await client.from("projects").insert(legacyPayload).select("*").single();
  if (byCompany.error) {
    throw byCompany.error;
  }
  return normalizeProject(byCompany.data as ProjectRow, orgId);
};

export const updateProject = async (orgId: string, projectId: string, input: CreateProjectInput) => {
  const client = assertClient();
  const payload = buildPayload(orgId, input);

  const byOrg = await client
    .from("projects")
    .update(payload)
    .eq("org_id", orgId)
    .eq("id", projectId)
    .select("*")
    .maybeSingle();

  if (!byOrg.error && byOrg.data) {
    return normalizeProject(byOrg.data as ProjectRow, orgId);
  }

  const legacyPayload = {
    ...payload,
    company_id: orgId,
  };
  delete (legacyPayload as { org_id?: string }).org_id;

  const byCompany = await client
    .from("projects")
    .update(legacyPayload)
    .eq("company_id", orgId)
    .eq("id", projectId)
    .select("*")
    .maybeSingle();

  if (byCompany.error) {
    throw byCompany.error;
  }

  if (!byCompany.data) {
    throw new Error("Project not found");
  }

  return normalizeProject(byCompany.data as ProjectRow, orgId);
};

export const deleteProject = async (orgId: string, projectId: string) => {
  const client = assertClient();
  const byOrg = await client
    .from("projects")
    .delete()
    .eq("org_id", orgId)
    .eq("id", projectId);

  if (!byOrg.error) {
    return;
  }

  const byCompany = await client
    .from("projects")
    .delete()
    .eq("company_id", orgId)
    .eq("id", projectId);

  if (byCompany.error) {
    throw byCompany.error;
  }
};

export const getProjectDashboardStats = async (orgId: string) => {
  const projects = await listProjectsByOrg(orgId);
  const totalBudget = projects.reduce((sum, item) => sum + (item.budget ?? 0), 0);
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, item) => sum + (item.progress ?? 0), 0) / projects.length)
      : 0;
  const activeProjects = projects.filter((item) => item.status === "active").length;
  const pausedProjects = projects.filter((item) => item.status === "paused").length;

  return {
    projects,
    totalBudget,
    avgProgress,
    activeProjects,
    pausedProjects,
  };
};
