import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    if (!client) {
      setUser(null);
      setProfile(null);
      setMemberStatus(null);
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
        setLoading(false);
        return;
      }

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
  }, []);

  return { user, profile, memberStatus, loading };
};
