import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";

export type UploadEnv = {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export type UploadContext = {
  request: Request;
  env: UploadEnv;
};

type SupabaseAdminClient = ReturnType<typeof createClient>;

export const UPLOAD_URL_EXPIRES_SECONDS = 900;
export const DOWNLOAD_URL_EXPIRES_SECONDS = 600;

const ALLOWED_ORIGINS = new Set(["https://quanlycongtrinh.com", "http://localhost:8080"]);
const MAX_FILENAME_LENGTH = 140;

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const asTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const toCorsHeaders = (request: Request) => {
  const origin = asTrimmedString(request.headers.get("origin"));
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

export const jsonResponse = (
  request: Request,
  status: number,
  body: Record<string, unknown>,
  extraHeaders?: HeadersInit,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...toCorsHeaders(request),
      ...extraHeaders,
    },
  });

export const optionsResponse = (request: Request) =>
  new Response(null, {
    status: 204,
    headers: {
      ...toCorsHeaders(request),
      "Cache-Control": "public, max-age=86400",
    },
  });

export const toErrorResponse = (request: Request, error: unknown) => {
  if (error instanceof HttpError) {
    return jsonResponse(request, error.status, { ok: false, error: error.message });
  }

  const fallback = error instanceof Error ? error.message : "Internal server error";
  console.error("Uploads API failed:", error);
  return jsonResponse(request, 500, { ok: false, error: fallback || "Internal server error" });
};

const requiredEnv = (env: UploadEnv, key: keyof UploadEnv) => {
  const value = asTrimmedString(env[key]);
  if (!value) {
    throw new HttpError(500, `Missing ${key}`);
  }
  return value;
};

const createSupabaseAdmin = (env: UploadEnv): SupabaseAdminClient =>
  createClient(requiredEnv(env, "SUPABASE_URL"), requiredEnv(env, "SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

const createR2Client = (env: UploadEnv) =>
  new S3Client({
    region: "auto",
    endpoint: `https://${requiredEnv(env, "R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: requiredEnv(env, "R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv(env, "R2_SECRET_ACCESS_KEY"),
    },
  });

const parseBearerToken = (request: Request) => {
  const authHeader = asTrimmedString(request.headers.get("authorization"));
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match?.[1]) {
    throw new HttpError(401, "Missing or invalid Authorization Bearer token");
  }
  return match[1].trim();
};

export const parseJsonBody = async (request: Request) => {
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new HttpError(400, "Invalid JSON body");
    }
    return payload as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(400, "Invalid JSON body");
  }
};

export const readRequiredString = (
  payload: Record<string, unknown>,
  key: string,
  options?: { maxLength?: number },
) => {
  const value = asTrimmedString(payload[key]);
  if (!value) {
    throw new HttpError(400, `Missing ${key}`);
  }
  const maxLength = options?.maxLength ?? 500;
  if (value.length > maxLength) {
    throw new HttpError(400, `${key} is too long`);
  }
  return value;
};

export const readRequiredSize = (payload: Record<string, unknown>, key: string) => {
  const raw = payload[key];
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new HttpError(400, `Invalid ${key}`);
  }
  return Math.floor(value);
};

export const sanitizeFilename = (filename: string) => {
  const cleaned = filename
    .trim()
    .replace(/[\\/]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FILENAME_LENGTH);

  if (!cleaned || cleaned === "." || cleaned === "..") {
    return "file";
  }
  return cleaned;
};

export const buildObjectKey = (orgId: string, projectId: string, originalFilename: string) => {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFilename(originalFilename);
  return `org/${orgId}/project/${projectId}/${yyyy}/${mm}/${crypto.randomUUID()}-${safeName}`;
};

export const assertObjectKeyBelongsToProject = (orgId: string, projectId: string, objectKey: string) => {
  const expectedPrefix = `org/${orgId}/project/${projectId}/`;
  if (!objectKey.startsWith(expectedPrefix)) {
    throw new HttpError(400, "Invalid objectKey for this project");
  }
};

export const getAuthUser = async (env: UploadEnv, request: Request) => {
  const accessToken = parseBearerToken(request);
  const admin = createSupabaseAdmin(env);
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user?.id) {
    throw new HttpError(401, "Unauthorized");
  }
  return { userId: data.user.id, admin };
};

export const assertProjectMembership = async (
  admin: SupabaseAdminClient,
  userId: string,
  projectId: string,
) => {
  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id, org_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    throw new HttpError(500, projectError.message);
  }
  if (!project?.id) {
    throw new HttpError(404, "Project not found");
  }

  const orgId = asTrimmedString(project.org_id);
  if (!orgId) {
    throw new HttpError(400, "Project is missing org_id");
  }

  const { data: member, error: memberError } = await admin
    .from("org_members")
    .select("user_id")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) {
    throw new HttpError(500, memberError.message);
  }
  if (!member?.user_id) {
    throw new HttpError(403, "Forbidden");
  }

  return { orgId };
};

export const createUploadUrl = async (
  env: UploadEnv,
  objectKey: string,
  contentType: string,
  size: number,
) => {
  const bucket = requiredEnv(env, "R2_BUCKET_NAME");
  const client = createR2Client(env);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: size,
  });

  return getSignedUrl(client, command, { expiresIn: UPLOAD_URL_EXPIRES_SECONDS });
};

export const createDownloadUrl = async (env: UploadEnv, objectKey: string) => {
  const bucket = requiredEnv(env, "R2_BUCKET_NAME");
  const client = createR2Client(env);
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });
  return getSignedUrl(client, command, { expiresIn: DOWNLOAD_URL_EXPIRES_SECONDS });
};
