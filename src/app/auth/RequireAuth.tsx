import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasSupabaseEnv, supabase } from "@/lib/supabaseClient";

const RequireAuth: React.FC<{ children: React.ReactNode; allowInactive?: boolean }> = ({
  children,
  allowInactive = false,
}) => {
  const { isAuthenticated, currentOrgId, loadingSession, loadingMembership } = useAuth();
  const [activeLoading, setActiveLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let isActiveFlag = true;
    const client = supabase;

  if (!client || !currentOrgId || !isAuthenticated || loadingSession || loadingMembership) {
      setIsActive(true);
      setActiveLoading(false);
      return () => {
        isActiveFlag = false;
      };
    }

    const loadStatus = async () => {
      setActiveLoading(true);
      const { data, error } = await client.rpc("is_org_active", { org_id: currentOrgId });
      if (!isActiveFlag) return;
      if (error) {
        setIsActive(true);
      } else {
        setIsActive(Boolean(data));
      }
      setActiveLoading(false);
    };

    loadStatus();

    return () => {
      isActiveFlag = false;
    };
  }, [currentOrgId, isAuthenticated]);

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

  if (loadingSession || loadingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  if (!currentOrgId) {
    return <Navigate to="/onboarding" replace />;
  }

  if (activeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang kiểm tra trạng thái...</p>
      </div>
    );
  }

  if (!allowInactive && !isActive) {
    return <Navigate to="/billing" replace />;
  }


  return <>{children}</>;
};

export default RequireAuth;
