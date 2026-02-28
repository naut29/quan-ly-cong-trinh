import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasSupabaseEnv, supabase } from "@/lib/supabaseClient";

const RequireAuth: React.FC<{ children: React.ReactNode; allowInactive?: boolean }> = ({
  children,
  allowInactive = false,
}) => {
  const { isAuthenticated, currentOrgId, loadingSession } = useAuth();
  const [activeLoading, setActiveLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    const client = supabase;

    if (!client || !currentOrgId || !isAuthenticated || loadingSession) {
      setIsActive(true);
      setActiveLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadStatus = async () => {
      setActiveLoading(true);

      const timeoutMs = 8000;
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("rpc_timeout")), timeoutMs),
      );

      try {
        const rpcCall = client
          .rpc("is_org_active", { org_id: currentOrgId })
          .then((result) => result as { data: boolean | null; error: unknown });
        const { data, error } = await Promise.race([rpcCall, timeout]);

        if (!mounted) return;

        if (error) {
          setIsActive(true);
        } else {
          setIsActive(Boolean(data));
        }
      } catch {
        if (!mounted) return;
        setIsActive(true);
      } finally {
        if (!mounted) return;
        setActiveLoading(false);
      }
    };

    void loadStatus();

    return () => {
      mounted = false;
    };
  }, [currentOrgId, isAuthenticated, loadingSession]);

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Missing Supabase env</h2>
          <p className="text-muted-foreground text-sm">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.
          </p>
        </div>
      </div>
    );
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  if (activeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking organization state...</p>
      </div>
    );
  }

  if (!allowInactive && !isActive) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
