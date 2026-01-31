import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadMembership = useCallback(
    async (client: NonNullable<typeof supabase>, currentUser: User, isActiveRef: () => boolean) => {
      setMembershipLoading(true);
      const { data: membership, error: membershipError } = await client.rpc("get_my_membership");

      if (!isActiveRef()) return;
      if (membershipError || !membership || membership.length === 0) {
        setOrgId(null);
        setOrgRole(null);
      } else {
        setOrgId(membership[0]?.org_id ?? null);
        setOrgRole(membership[0]?.role ?? null);
      }
      setMembershipLoading(false);
    },
    [],
  );

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    if (!client) {
      setUser(null);
      setOrgId(null);
      setOrgRole(null);
      setLoading(false);
      return () => {
        isActive = false;
      };
    }

    const load = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!isActive) return;
      setUser(user ?? null);

      if (!user) {
        setOrgId(null);
        setOrgRole(null);
        setMembershipLoading(false);
        setLoading(false);
        return;
      }

      await loadMembership(client, user, () => isActive);
      setLoading(false);
    };

    load();

    const { data: { subscription } } = client.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [loadMembership]);

  const refreshMembership = async () => {
    const client = supabase;
    if (!client) return null;
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) {
      setOrgId(null);
      setOrgRole(null);
      setMembershipLoading(false);
      return null;
    }
    await loadMembership(client, user, () => true);
    return orgId;
  };

  return { user, orgId, orgRole, loading, membershipLoading, refreshMembership };
};
