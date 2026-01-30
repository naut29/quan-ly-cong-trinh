import { supabase } from "@/lib/supabaseClient";

export const callFunction = async <T = unknown>(name: string, body: unknown) => {
  const client = supabase;
  if (!client) {
    throw new Error("Missing Supabase env");
  }
  const { data, error } = await client.functions.invoke<T>(name, { body });
  if (error) {
    throw error;
  }
  return data as T;
};
