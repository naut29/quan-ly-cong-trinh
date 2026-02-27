import type { SupabaseClient } from "@supabase/supabase-js";

export interface OrgMembershipLookupResult {
  hasOrg: boolean;
  orgId: string | null;
  role: string | null;
}

interface OrgMembersRow {
  org_id?: string | null;
  role?: string | null;
}

interface ProfileRow {
  org_id?: string | null;
}

interface LookupOptions {
  forceRefresh?: boolean;
  retries?: number;
  retryDelayMs?: number;
}

const EMPTY_MEMBERSHIP: OrgMembershipLookupResult = {
  hasOrg: false,
  orgId: null,
  role: null,
};

const TABLE_NOT_FOUND_CODES = new Set(["42P01", "PGRST205"]);
const COLUMN_NOT_FOUND_CODES = new Set(["42703", "PGRST204"]);

let cachedMembership: { userId: string; data: OrgMembershipLookupResult } | null = null;
let inflightLookup: Promise<OrgMembershipLookupResult> | null = null;
let inflightUserId: string | null = null;

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const normalizeMessage = (error: unknown) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return "";
};

const getErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object") return "";
  return String((error as { code?: unknown }).code ?? "");
};

const isTableMissingError = (error: unknown) => TABLE_NOT_FOUND_CODES.has(getErrorCode(error));

const isColumnMissingError = (error: unknown) => COLUMN_NOT_FOUND_CODES.has(getErrorCode(error));

const isTransientError = (error: unknown) => {
  const message = normalizeMessage(error).toLowerCase();
  if (!message) return false;
  return (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("abort")
  );
};

const toMembershipResult = (orgId?: string | null, role?: string | null): OrgMembershipLookupResult => {
  if (!orgId) {
    return { ...EMPTY_MEMBERSHIP };
  }
  return {
    hasOrg: true,
    orgId,
    role: role ?? null,
  };
};

const queryProfilesOrg = async (
  client: SupabaseClient,
  userId: string,
): Promise<OrgMembershipLookupResult> => {
  const { data, error } = await client
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    if (isTableMissingError(error) || isColumnMissingError(error)) {
      return { ...EMPTY_MEMBERSHIP };
    }
    throw error;
  }

  return toMembershipResult(data?.org_id ?? null, null);
};

const queryMembershipOnce = async (
  client: SupabaseClient,
  userId: string,
): Promise<OrgMembershipLookupResult> => {
  const { data, error } = await client
    .from("org_members")
    .select("org_id, role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    if (isTableMissingError(error)) {
      return queryProfilesOrg(client, userId);
    }
    throw error;
  }

  const row = (Array.isArray(data) ? (data[0] as OrgMembersRow | undefined) : undefined) ?? null;
  if (row?.org_id) {
    return toMembershipResult(row.org_id, row.role ?? null);
  }

  return queryProfilesOrg(client, userId);
};

const executeLookup = async (
  client: SupabaseClient,
  userId: string,
  retries: number,
  retryDelayMs: number,
): Promise<OrgMembershipLookupResult> => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await queryMembershipOnce(client, userId);
    } catch (error) {
      const canRetry = attempt < retries && isTransientError(error);
      if (!canRetry) {
        throw error;
      }
      attempt += 1;
      await wait(retryDelayMs * attempt);
    }
  }

  return { ...EMPTY_MEMBERSHIP };
};

export const readOrgMembershipCache = (userId: string): OrgMembershipLookupResult | null => {
  if (!cachedMembership || cachedMembership.userId !== userId) {
    return null;
  }
  return { ...cachedMembership.data };
};

export const primeOrgMembershipCache = (userId: string, data: OrgMembershipLookupResult) => {
  cachedMembership = { userId, data: { ...data } };
};

export const invalidateOrgMembershipCache = (userId?: string | null) => {
  if (!userId || cachedMembership?.userId === userId) {
    cachedMembership = null;
  }
  if (!userId || inflightUserId === userId) {
    inflightLookup = null;
    inflightUserId = null;
  }
};

export const getUserOrgMembership = async (
  client: SupabaseClient,
  userId: string,
  options: LookupOptions = {},
): Promise<OrgMembershipLookupResult> => {
  const forceRefresh = options.forceRefresh ?? false;
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 400;

  if (!forceRefresh) {
    const cached = readOrgMembershipCache(userId);
    if (cached) return cached;
  }

  if (!forceRefresh && inflightLookup && inflightUserId === userId) {
    return inflightLookup;
  }

  const lookupPromise = executeLookup(client, userId, retries, retryDelayMs);
  inflightLookup = lookupPromise;
  inflightUserId = userId;

  try {
    const result = await lookupPromise;
    primeOrgMembershipCache(userId, result);
    return { ...result };
  } finally {
    if (inflightLookup === lookupPromise) {
      inflightLookup = null;
      inflightUserId = null;
    }
  }
};
