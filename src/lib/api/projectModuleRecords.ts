import { supabase } from "@/lib/supabaseClient";

export const PROJECT_MODULE_KEYS = [
  "wbs",
  "boq",
  "materials",
  "norms",
  "costs",
  "contracts",
  "payments",
  "approvals",
  "progress",
  "reports",
] as const;

export type ProjectModuleKey = (typeof PROJECT_MODULE_KEYS)[number];

export interface ProjectModuleRecordRow {
  id: string;
  org_id: string;
  project_id: string;
  module_key: ProjectModuleKey;
  name: string;
  code: string | null;
  status: string;
  amount: number;
  progress: number;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertProjectModuleRecordInput {
  name: string;
  code?: string | null;
  status?: string | null;
  amount?: number | null;
  progress?: number | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
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

const normalizeRow = (row: Partial<ProjectModuleRecordRow>): ProjectModuleRecordRow => ({
  id: String(row.id ?? ""),
  org_id: String(row.org_id ?? ""),
  project_id: String(row.project_id ?? ""),
  module_key: (row.module_key ?? "wbs") as ProjectModuleKey,
  name: String(row.name ?? "Untitled"),
  code: row.code ?? null,
  status: row.status ?? "active",
  amount: toNumber(row.amount, 0),
  progress: Math.max(0, Math.min(100, Math.round(toNumber(row.progress, 0)))),
  notes: row.notes ?? null,
  metadata:
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {},
  created_by: row.created_by ?? null,
  created_at: row.created_at ?? new Date(0).toISOString(),
  updated_at: row.updated_at ?? row.created_at ?? new Date(0).toISOString(),
});

const getCurrentUserId = async () => {
  const client = assertClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return user?.id ?? null;
};

const buildPayload = async (
  orgId: string,
  projectId: string,
  moduleKey: ProjectModuleKey,
  input: UpsertProjectModuleRecordInput,
) => ({
  org_id: orgId,
  project_id: projectId,
  module_key: moduleKey,
  name: input.name.trim(),
  code: input.code?.trim() || null,
  status: input.status?.trim() || "active",
  amount: toNumber(input.amount, 0),
  progress: Math.max(0, Math.min(100, Math.round(toNumber(input.progress, 0)))),
  notes: input.notes?.trim() || null,
  metadata: input.metadata ?? {},
  created_by: await getCurrentUserId(),
  updated_at: new Date().toISOString(),
});

export const listProjectModuleRecords = async (
  orgId: string,
  projectId: string,
  moduleKey: ProjectModuleKey,
) => {
  const client = assertClient();
  const { data, error } = await client
    .from("project_module_records")
    .select(
      "id, org_id, project_id, module_key, name, code, status, amount, progress, notes, metadata, created_by, created_at, updated_at",
    )
    .eq("org_id", orgId)
    .eq("project_id", projectId)
    .eq("module_key", moduleKey)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => normalizeRow(row as Partial<ProjectModuleRecordRow>));
};

export const listAllProjectModuleRecords = async (orgId: string, projectId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("project_module_records")
    .select(
      "id, org_id, project_id, module_key, name, code, status, amount, progress, notes, metadata, created_by, created_at, updated_at",
    )
    .eq("org_id", orgId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => normalizeRow(row as Partial<ProjectModuleRecordRow>));
};

export const createProjectModuleRecord = async (
  orgId: string,
  projectId: string,
  moduleKey: ProjectModuleKey,
  input: UpsertProjectModuleRecordInput,
) => {
  const client = assertClient();
  const payload = await buildPayload(orgId, projectId, moduleKey, input);
  const { data, error } = await client
    .from("project_module_records")
    .insert(payload)
    .select(
      "id, org_id, project_id, module_key, name, code, status, amount, progress, notes, metadata, created_by, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return normalizeRow(data as Partial<ProjectModuleRecordRow>);
};

export const updateProjectModuleRecord = async (
  recordId: string,
  input: UpsertProjectModuleRecordInput,
) => {
  const client = assertClient();
  const nextPayload = {
    name: input.name.trim(),
    code: input.code?.trim() || null,
    status: input.status?.trim() || "active",
    amount: toNumber(input.amount, 0),
    progress: Math.max(0, Math.min(100, Math.round(toNumber(input.progress, 0)))),
    notes: input.notes?.trim() || null,
    metadata: input.metadata ?? {},
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("project_module_records")
    .update(nextPayload)
    .eq("id", recordId)
    .select(
      "id, org_id, project_id, module_key, name, code, status, amount, progress, notes, metadata, created_by, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return normalizeRow(data as Partial<ProjectModuleRecordRow>);
};

export const deleteProjectModuleRecord = async (recordId: string) => {
  const client = assertClient();
  const { error } = await client.from("project_module_records").delete().eq("id", recordId);

  if (error) {
    throw error;
  }
};

export const getProjectModuleSummary = async (orgId: string, projectId: string) => {
  const rows = await listAllProjectModuleRecords(orgId, projectId);

  return PROJECT_MODULE_KEYS.map((moduleKey) => {
    const moduleRows = rows.filter((row) => row.module_key === moduleKey);
    const totalAmount = moduleRows.reduce((sum, row) => sum + row.amount, 0);
    const averageProgress =
      moduleRows.length > 0
        ? Math.round(moduleRows.reduce((sum, row) => sum + row.progress, 0) / moduleRows.length)
        : 0;

    return {
      moduleKey,
      count: moduleRows.length,
      totalAmount,
      averageProgress,
      updatedAt: moduleRows[0]?.updated_at ?? null,
    };
  });
};
