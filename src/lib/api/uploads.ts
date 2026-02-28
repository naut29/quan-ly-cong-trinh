import { supabase } from "@/lib/supabaseClient";
import { appFetch } from "@/lib/runtime/appFetch";

export interface ProjectFileRecord {
  id: string;
  org_id: string;
  project_id: string;
  object_key: string;
  filename: string;
  size: number;
  content_type: string;
  created_by: string;
  created_at: string;
}

interface CreateUploadInput {
  project_id: string;
  filename: string;
  content_type: string;
  size: number;
}

interface CompleteUploadInput extends CreateUploadInput {
  objectKey: string;
}

interface CreateUploadResponse {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
}

const readErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload?.error === "string" && payload.error.trim()) {
      return payload.error.trim();
    }
  } catch {
    // noop
  }
  return `${response.status} ${response.statusText}`.trim();
};

const getAccessToken = async () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Unauthorized");
  }
  return data.session.access_token;
};

const authorizedFetch = async (url: string, init: RequestInit = {}) => {
  const accessToken = await getAccessToken();
  const response = await appFetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
};

export const createUpload = async (input: CreateUploadInput): Promise<CreateUploadResponse> => {
  const response = await authorizedFetch("/api/uploads/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as {
    uploadUrl?: string;
    objectKey?: string;
    expiresIn?: number;
  };

  if (!payload.uploadUrl || !payload.objectKey || typeof payload.expiresIn !== "number") {
    throw new Error("Invalid upload create response");
  }

  return {
    uploadUrl: payload.uploadUrl,
    objectKey: payload.objectKey,
    expiresIn: payload.expiresIn,
  };
};

export const completeUpload = async (input: CompleteUploadInput): Promise<ProjectFileRecord> => {
  const response = await authorizedFetch("/api/uploads/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as { record?: ProjectFileRecord };
  if (!payload.record?.id) {
    throw new Error("Invalid upload complete response");
  }
  return payload.record;
};

export const getDownloadUrl = async (fileId: string): Promise<string> => {
  const response = await authorizedFetch(`/api/uploads/download?file_id=${encodeURIComponent(fileId)}`);
  const payload = (await response.json()) as { downloadUrl?: string };
  if (!payload.downloadUrl) {
    throw new Error("Invalid download response");
  }
  return payload.downloadUrl;
};
