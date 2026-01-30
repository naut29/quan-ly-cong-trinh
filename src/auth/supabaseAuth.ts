import { type SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthStateChangeCallback = Parameters<SupabaseClient["auth"]["onAuthStateChange"]>[0];

export const signInWithPassword = (email: string, password: string) => {
  if (!supabase) {
    return Promise.resolve({
      data: { session: null, user: null },
      error: { message: "Missing Supabase env" },
    } as any);
  }
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = (email: string, password: string) => {
  if (!supabase) {
    return Promise.resolve({
      data: { user: null, session: null },
      error: { message: "Missing Supabase env" },
    } as any);
  }
  return supabase.auth.signUp({ email, password });
};

export const signOut = () => {
  if (!supabase) {
    return Promise.resolve({ error: { message: "Missing Supabase env" } } as any);
  }
  return supabase.auth.signOut();
};

export const getSession = () => {
  if (!supabase) {
    return Promise.resolve({
      data: { session: null },
      error: { message: "Missing Supabase env" },
    } as any);
  }
  return supabase.auth.getSession();
};

export const onAuthStateChange = (callback: AuthStateChangeCallback) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } } as any;
  }
  return supabase.auth.onAuthStateChange(callback);
};
