import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const ORG_STORAGE_KEY = "app.current_org_id";

export interface OrgMembershipOption {
  orgId: string;
  role: string | null;
  orgName: string | null;
  createdAt: string | null;
}

const readStoredOrgId = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ORG_STORAGE_KEY);
};

const persistOrgId = (orgId: string | null) => {
  if (typeof window === "undefined") return;
  if (!orgId) {
    window.localStorage.removeItem(ORG_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(ORG_STORAGE_KEY, orgId);
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
      if (!selected) return;

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

    const storedOrgId = readStoredOrgId();
    const nextOrgId =
      (storedOrgId && orgs.some((item) => item.orgId === storedOrgId) && storedOrgId) ||
      (currentOrgId && orgs.some((item) => item.orgId === currentOrgId) && currentOrgId) ||
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
    currentOrgId,
    currentRole,
    currentOrgName: activeOrganization?.orgName ?? null,
    loading,
    error,
    switchOrganization,
    reload,
  };
};
