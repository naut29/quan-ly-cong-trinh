import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export interface UserProfile {
  id: string;
  company_id: string;
  role: string;
}

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberStatus, setMemberStatus] = useState<"invited" | "active" | "disabled" | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadMembership = useCallback(
    async (client: NonNullable<typeof supabase>, currentUser: User, isActiveRef: () => boolean) => {
      setMembershipLoading(true);
      const { data: membership, error: membershipError } = await client
        .from("org_members")
        .select("org_id, role")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isActiveRef()) return;
      if (membershipError) {
        setOrgId(null);
        setOrgRole("viewer");
      } else {
        setOrgId(membership?.org_id ?? null);
        setOrgRole(membership?.role ?? "viewer");
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
      setProfile(null);
      setMemberStatus(null);
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
        setProfile(null);
        setMemberStatus(null);
        setOrgId(null);
        setOrgRole(null);
        setMembershipLoading(false);
        setLoading(false);
        return;
      }

      await loadMembership(client, user, () => isActive);

      const { data: profile, error } = await client
        .from("profiles")
        .select("id, company_id, role")
        .eq("id", user.id)
        .single();

      if (!isActive) return;
      if (error || !profile) {
        setProfile(null);
        setMemberStatus(null);
      } else {
        setProfile(profile as UserProfile);
        const { data: member } = await client
          .from("company_members")
          .select("status")
          .eq("user_id", user.id)
          .eq("company_id", profile.company_id)
          .single();
        setMemberStatus(member?.status ?? null);
      }
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

  return { user, profile, memberStatus, orgId, orgRole, loading, membershipLoading, refreshMembership };
};
