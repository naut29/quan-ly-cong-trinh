import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const ORG_STORAGE_KEY = "app.current_org_id";
const LEGACY_ORG_STORAGE_KEYS = ["selectedOrg", "orgId", "activeOrg"] as const;

export interface OrgMembershipOption {
  orgId: string;
  role: string | null;
  orgName: string | null;
  createdAt: string | null;
}

const readOrgIdCandidate = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of ["orgId", "org_id", "id", "value"]) {
    const nextValue = readOrgIdCandidate(record[key]);
    if (nextValue) {
      return nextValue;
    }
  }

  for (const key of ["selectedOrg", "activeOrg", "organization", "org"]) {
    const nextValue = readOrgIdCandidate(record[key]);
    if (nextValue) {
      return nextValue;
    }
  }

  return null;
};

const extractStoredOrgId = (rawValue: string | null) => {
  if (!rawValue) return null;

  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return trimmed;
  }

  try {
    return readOrgIdCandidate(JSON.parse(trimmed));
  } catch {
    return null;
  }
};

const clearStoredOrgKeys = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ORG_STORAGE_KEY);
  LEGACY_ORG_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
};

const readStoredOrgIds = () => {
  if (typeof window === "undefined") return [];

  const candidates: string[] = [];
  const pushCandidate = (value: string | null) => {
    if (!value || candidates.includes(value)) {
      return;
    }
    candidates.push(value);
  };

  pushCandidate(extractStoredOrgId(window.localStorage.getItem(ORG_STORAGE_KEY)));

  for (const key of LEGACY_ORG_STORAGE_KEYS) {
    pushCandidate(extractStoredOrgId(window.localStorage.getItem(key)));
  }

  return candidates;
};

const persistOrgId = (orgId: string | null) => {
  if (typeof window === "undefined") return;
  if (!orgId) {
    clearStoredOrgKeys();
    return;
  }

  window.localStorage.setItem(ORG_STORAGE_KEY, orgId);
  LEGACY_ORG_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
};

export const useOrgContext = () => {
  const { user, currentOrgId, currentRole, setOrgMembership } = useAuth();
  const [organizations, setOrganizations] = useState<OrgMembershipOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectOrg = useCallback(
    (orgId: string | null, orgs: OrgMembershipOption[]) => {
      if (!orgId) {
        setOrgMembership({ orgId: null, role: null });
        persistOrgId(null);
        return;
      }

      const selected = orgs.find((item) => item.orgId === orgId);
      if (!selected) {
        const fallbackOrg = orgs[0] ?? null;
        if (!fallbackOrg) {
          setOrgMembership({ orgId: null, role: null });
          persistOrgId(null);
          return;
        }

        persistOrgId(fallbackOrg.orgId);
        setOrgMembership({
          orgId: fallbackOrg.orgId,
          role: fallbackOrg.role ?? null,
        });
        return;
      }

      persistOrgId(orgId);
      setOrgMembership({
        orgId,
        role: selected.role ?? null,
      });
    },
    [setOrgMembership],
  );

  const reload = useCallback(async () => {
    if (!user?.id || !supabase) {
      setOrganizations([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("org_members")
      .select("org_id, role, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      setOrganizations([]);
      setLoading(false);
      setError(error.message);
      return;
    }

    const baseRows = (data ?? []).map((row) => ({
      orgId: String(row.org_id),
      role: row.role ?? null,
      createdAt: row.created_at ?? null,
    }));

    const orgIds = baseRows.map((row) => row.orgId);
    let nameMap = new Map<string, string | null>();
    if (orgIds.length > 0) {
      const { data: organizationRows } = await supabase
        .from("organizations")
        .select("id, name")
        .in("id", orgIds);

      nameMap = new Map(
        (organizationRows ?? []).map((row) => [String(row.id), (row.name as string | null) ?? null]),
      );
    }

    const orgs = baseRows.map((row) => ({
      ...row,
      orgName: nameMap.get(row.orgId) ?? null,
    }));

    setOrganizations(orgs);

    if (orgs.length === 0) {
      setOrgMembership({ orgId: null, role: null });
      persistOrgId(null);
      setLoading(false);
      return;
    }

    const storedOrgIds = readStoredOrgIds();
    const matchingStoredOrgId =
      storedOrgIds.find((candidateOrgId) => orgs.some((item) => item.orgId === candidateOrgId)) ?? null;
    const currentOrgExists = currentOrgId ? orgs.some((item) => item.orgId === currentOrgId) : false;

    if (storedOrgIds.length > 0 && !matchingStoredOrgId) {
      persistOrgId(null);
    }

    const nextOrgId =
      matchingStoredOrgId ||
      (currentOrgExists ? currentOrgId : null) ||
      orgs[0].orgId;

    selectOrg(nextOrgId, orgs);
    setLoading(false);
  }, [currentOrgId, selectOrg, setOrgMembership, user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const activeOrganization = useMemo(() => {
    if (!currentOrgId) return null;
    return organizations.find((item) => item.orgId === currentOrgId) ?? null;
  }, [currentOrgId, organizations]);

  const switchOrganization = useCallback(
    (orgId: string) => {
      selectOrg(orgId, organizations);
    },
    [organizations, selectOrg],
  );

  return {
    organizations,
    org: activeOrganization,
    orgId: currentOrgId ?? null,
    currentOrgId,
    currentRole,
    currentOrgName: activeOrganization?.orgName ?? null,
    currentOrganization: activeOrganization,
    loading,
    error,
    switchOrganization,
    reload,
  };
};
