import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { showDemoBlockedToast } from "@/lib/runtime/demoToast";
import { isDemoRoute } from "@/lib/runtime/isDemoRoute";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseEnv) {
  throw new Error(
    "Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
  );
}

const rawSupabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_SUPABASE_ERROR_MESSAGE = "Demo route cannot access Supabase";

const throwDemoSupabaseError = (): never => {
  const error = new Error(DEMO_SUPABASE_ERROR_MESSAGE);
  showDemoBlockedToast(error.message);
  throw error;
};

const createThrowingNamespace = () =>
  new Proxy(
    {},
    {
      get() {
        return () => throwDemoSupabaseError();
      },
    },
  );

export const createGuardedSupabaseClient = (): SupabaseClient =>
  new Proxy(rawSupabase, {
    get(target, property, receiver) {
      const key = String(property);

      if (isDemoRoute()) {
        if (key === "from" || key === "rpc" || key === "schema" || key === "channel") {
          return () => throwDemoSupabaseError();
        }

        if (key === "auth" || key === "storage" || key === "functions" || key === "realtime") {
          return createThrowingNamespace();
        }
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  }) as SupabaseClient;

export const supabase: SupabaseClient = createGuardedSupabaseClient();
