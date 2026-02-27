import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import RequireAuth from "@/app/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { saveLastPath } from "@/lib/lastPath";

const MembershipFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="max-w-md text-center space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Checking organization access</h2>
      <p className="text-sm text-muted-foreground">
        Temporary network issue while validating your organization membership.
      </p>
      <button
        type="button"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  </div>
);

const RequireOrg: React.FC<{ children: React.ReactNode; allowInactive?: boolean }> = ({
  children,
  allowInactive = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, currentOrgId, loadingSession, loadingMembership, membershipError, refreshMembership } =
    useAuth();

  useEffect(() => {
    if (!isAuthenticated || !currentOrgId) return;
    saveLastPath(location.pathname, location.search);
  }, [currentOrgId, isAuthenticated, location.pathname, location.search]);

  if (loadingSession || loadingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking organization membership...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/app/login?next=${next}`} replace />;
  }

  if (membershipError) {
    return <MembershipFallback onRetry={() => void refreshMembership({ forceRefresh: true })} />;
  }

  if (!currentOrgId) {
    return <Navigate to="/onboarding" replace />;
  }

  return <RequireAuth allowInactive={allowInactive}>{children}</RequireAuth>;
};

export default RequireOrg;
