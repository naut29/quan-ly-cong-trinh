import { supabase } from "@/lib/supabaseClient";

export type ActivityStatus = "success" | "warn" | "fail";

export interface ActivityLogRow {
  id: string;
  org_id: string;
  actor_user_id: string | null;
  action: string;
  module: string;
  description: string | null;
  ip: string | null;
  status: ActivityStatus | null;
  created_at: string;
}

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

export interface ListActivityLogsInput {
  orgId: string;
  action?: string;
  module?: string;
  status?: ActivityStatus;
  limit?: number;
}

export const listActivityLogs = async ({
  orgId,
  action,
  module,
  status,
  limit = 100,
}: ListActivityLogsInput) => {
  const client = assertClient();
  let query = client
    .from("activity_logs")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (action) query = query.eq("action", action);
  if (module) query = query.eq("module", module);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ActivityLogRow[];
};

export interface LogActivityInput {
  orgId: string;
  action: string;
  module: string;
  description?: string | null;
  status?: ActivityStatus;
  ip?: string | null;
  actorUserId?: string | null;
}

export const logActivity = async ({
  orgId,
  action,
  module,
  description = null,
  status = "success",
  ip = null,
  actorUserId,
}: LogActivityInput) => {
  if (!orgId) return null;
  const client = assertClient();

  let resolvedActorUserId = actorUserId ?? null;
  if (!resolvedActorUserId) {
    const { data } = await client.auth.getUser();
    resolvedActorUserId = data.user?.id ?? null;
  }

  const payload = {
    org_id: orgId,
    actor_user_id: resolvedActorUserId,
    action,
    module,
    description,
    ip,
    status,
  };

  const { data, error } = await client.from("activity_logs").insert(payload).select("*").single();
  if (error) throw error;
  return data as ActivityLogRow;
};
