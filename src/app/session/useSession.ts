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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!isActive) return;
      setUser(user ?? null);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, company_id, role")
        .eq("id", user.id)
        .single();

      if (!isActive) return;
      if (error) {
        setProfile(null);
      } else {
        setProfile(profile as UserProfile);
      }
      setLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
};
