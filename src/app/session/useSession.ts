import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useSession = () => {
  const {
    user,
    currentOrgId,
    currentRole,
    loadingSession,
    loadingMembership,
    refreshMembership,
  } = useAuth();

  const refresh = useCallback(async () => {
    await refreshMembership({ forceRefresh: true });
    return currentOrgId;
  }, [currentOrgId, refreshMembership]);

  return {
    user,
    orgId: currentOrgId,
    orgRole: currentRole,
    loading: loadingSession,
    membershipLoading: loadingMembership,
    refreshMembership: refresh,
  };
};
