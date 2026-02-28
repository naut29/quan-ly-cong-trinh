import { supabase } from "@/lib/supabaseClient";
import type { ProjectFileRecord } from "@/lib/api/uploads";

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }

  return supabase;
};

export const listProjectFiles = async (projectId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("project_files")
    .select("id, org_id, project_id, object_key, filename, size, content_type, created_by, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProjectFileRecord[];
};

export const deleteProjectFileMetadata = async (fileId: string) => {
  const client = assertClient();
  const { error } = await client.from("project_files").delete().eq("id", fileId);

  if (error) {
    throw error;
  }
};
