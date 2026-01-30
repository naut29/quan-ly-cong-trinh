import { supabase } from "@/lib/supabaseClient";

export const callFunction = async <T = unknown>(name: string, body: unknown) => {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    throw error;
  }
  return data as T;
};
