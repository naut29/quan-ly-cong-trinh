import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, users, projects, tenants, rolePermissions, UserRole } from '@/data/mockData';
import { isDemoPath } from '@/lib/appMode';
import { DEMO_USERS, demoGetSession, demoSignIn, demoSignOut } from '@/auth/demoAuth';
import { getSession, onAuthStateChange, signInWithPassword, signOut } from '@/auth/supabaseAuth';
import { hasSupabaseEnv, supabase } from '@/lib/supabaseClient';
import {
  getUserOrgMembership,
  invalidateOrgMembershipCache,
  primeOrgMembershipCache,
  readOrgMembershipCache,
} from '@/lib/orgMembership';
import { getUserPlatformRole, isSuperAdminRole, type PlatformRole } from '@/lib/platformRole';
import { clearLastPath } from '@/lib/lastPath';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loadingSession: boolean;
  loadingMembership: boolean;
  membershipError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAs: (userId: string) => void;
  logout: () => void;
  refreshMembership: (options?: { forceRefresh?: boolean }) => Promise<void>;
  hasPermission: (module: string, action: 'view' | 'edit' | 'approve') => boolean;
  canAccessProject: (projectId: string) => boolean;
  getUserProjects: () => typeof projects;
  getCurrentTenant: () => typeof tenants[0] | null;
  switchTenant: (tenantId: string) => void;
  currentTenantId: string | null;
  currentOrgId: string | null;
  currentRole: string | null;
  platformRole: PlatformRole | null;
  isSuperAdmin: boolean;
  setCurrentOrgId: (orgId: string | null) => void;
  setCurrentRole: (role: string | null) => void;
  setOrgMembership: (value: { orgId: string | null; role?: string | null }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_TIMEOUT_MS = 8000;
const MEMBERSHIP_TIMEOUT_MS = 8000;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
};

const normalizeErrorMessage = (error: unknown) => {
  if (!error) return 'membership_lookup_failed';
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'membership_lookup_failed');
  }
  return 'membership_lookup_failed';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDemo = isDemoPath(location.pathname);

  const [user, setUser] = useState<User | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [currentOrgIdState, setCurrentOrgIdState] = useState<string | null>(null);
  const [currentRoleState, setCurrentRoleState] = useState<string | null>(null);
  const [platformRoleState, setPlatformRoleState] = useState<PlatformRole | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const lastUserIdRef = useRef<string | null>(null);

  const mapSupabaseUser = useCallback((userId?: string | null, email?: string | null) => {
    if (!userId) return null;
    if (email) {
      const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) return foundUser;
    }

    const fallbackTenantId = tenants[0]?.id || '';
    const safeEmail = email ?? `${userId}@local.user`;
    const safeName = email?.split('@')[0] ?? 'User';

    return {
      id: userId,
      email: safeEmail,
      name: safeName,
      role: 'company_owner' as UserRole,
      tenantId: fallbackTenantId,
      projectIds: [],
    };
  }, []);

  const applyMembership = useCallback((orgId: string | null, role: string | null) => {
    setCurrentOrgIdState(orgId);
    setCurrentRoleState(orgId ? role : null);
    setMembershipError(null);
  }, []);

  const loadMembership = useCallback(
    async (userId: string, options: { forceRefresh?: boolean } = {}) => {
      const client = supabase;
      const forceRefresh = options.forceRefresh ?? false;

      if (!client) {
        applyMembership(null, null);
        setLoadingMembership(false);
        return;
      }

      const cached = forceRefresh ? null : readOrgMembershipCache(userId);
      if (cached) {
        applyMembership(cached.orgId ?? null, cached.role ?? null);
        setLoadingMembership(false);
        return;
      }

      setLoadingMembership(true);
      setMembershipError(null);

      try {
        const membership = await withTimeout(
          getUserOrgMembership(client, userId, {
            forceRefresh,
            retries: 2,
            retryDelayMs: 500,
          }),
          MEMBERSHIP_TIMEOUT_MS,
          'membership_timeout',
        );

        applyMembership(membership.orgId ?? null, membership.role ?? null);
      } catch (error) {
        setMembershipError(normalizeErrorMessage(error));
      } finally {
        setLoadingMembership(false);
      }
    },
    [applyMembership],
  );

  const refreshMembership = useCallback(
    async (options: { forceRefresh?: boolean } = {}) => {
      if (!authUserId || !supabase) return;
      await loadMembership(authUserId, { forceRefresh: options.forceRefresh ?? true });
    },
    [authUserId, loadMembership],
  );

  const loadPlatformRole = useCallback(async (userId: string) => {
    const client = supabase;
    if (!client) {
      setPlatformRoleState(null);
      return;
    }

    try {
      const role = await withTimeout(
        getUserPlatformRole(client, userId),
        MEMBERSHIP_TIMEOUT_MS,
        'platform_role_timeout',
      );
      setPlatformRoleState(role);
    } catch {
      setPlatformRoleState(null);
    }
  }, []);

  const setOrgMembership = useCallback(
    ({ orgId, role = null }: { orgId: string | null; role?: string | null }) => {
      const normalizedRole = orgId ? role ?? null : null;
      applyMembership(orgId, normalizedRole);

      if (!authUserId) return;
      primeOrgMembershipCache(authUserId, {
        hasOrg: Boolean(orgId),
        orgId: orgId ?? null,
        role: normalizedRole,
      });
    },
    [applyMembership, authUserId],
  );

  const setCurrentOrgId = useCallback(
    (orgId: string | null) => {
      const normalizedRole = orgId ? currentRoleState : null;
      setOrgMembership({ orgId, role: normalizedRole });
    },
    [currentRoleState, setOrgMembership],
  );

  const setCurrentRole = useCallback(
    (role: string | null) => {
      setCurrentRoleState(role);
      if (!authUserId || !currentOrgIdState) return;
      primeOrgMembershipCache(authUserId, {
        hasOrg: true,
        orgId: currentOrgIdState,
        role: role ?? null,
      });
    },
    [authUserId, currentOrgIdState],
  );

  useEffect(() => {
    let isActive = true;

    const setNoAuthState = () => {
      invalidateOrgMembershipCache();
      lastUserIdRef.current = null;
      setUser(null);
      setCurrentTenantId(null);
      setAuthUserId(null);
      setCurrentOrgIdState(null);
      setCurrentRoleState(null);
      setPlatformRoleState(null);
      setMembershipError(null);
      setLoadingMembership(false);
    };

    const syncSupabaseSession = async (session: Awaited<ReturnType<typeof getSession>>['data']['session'] | null) => {
      if (!isActive) return;

      setLoadingSession(true);
      const nextUserId = session?.user?.id ?? null;
      const previousUserId = lastUserIdRef.current;

      if (previousUserId && previousUserId !== nextUserId) {
        invalidateOrgMembershipCache(previousUserId);
      }
      if (!nextUserId) {
        invalidateOrgMembershipCache();
      }

      lastUserIdRef.current = nextUserId;
      setAuthUserId(nextUserId);

      const mappedUser = mapSupabaseUser(nextUserId, session?.user?.email ?? null);
      setUser(mappedUser);
      setCurrentTenantId(mappedUser?.tenantId || tenants[0]?.id || null);

      if (!nextUserId) {
        setCurrentOrgIdState(null);
        setCurrentRoleState(null);
        setPlatformRoleState(null);
        setMembershipError(null);
        setLoadingMembership(false);
        if (isActive) {
          setLoadingSession(false);
        }
        return;
      }

      await Promise.all([loadMembership(nextUserId), loadPlatformRole(nextUserId)]);

      if (isActive) {
        setLoadingSession(false);
      }
    };

    const initDemoSession = () => {
      invalidateOrgMembershipCache();
      setAuthUserId(null);
      setCurrentOrgIdState(null);
      setCurrentRoleState(null);
      setPlatformRoleState(null);
      setMembershipError(null);
      setLoadingMembership(false);

      const session = demoGetSession();
      if (!session) {
        if (isActive) {
          setNoAuthState();
          setLoadingSession(false);
        }
        return;
      }

      const foundUser = DEMO_USERS.find((u) => u.id === session.userId) || null;
      if (isActive) {
        setUser(foundUser);
        setCurrentTenantId(foundUser?.tenantId || tenants[0]?.id || null);
        setPlatformRoleState(foundUser?.role === 'super_admin' ? 'super_admin' : null);
        setLoadingSession(false);
      }
    };

    const initSupabaseSession = async () => {
      if (isActive) {
        setLoadingSession(true);
      }

      try {
        const { data } = await withTimeout(getSession(), SESSION_TIMEOUT_MS, 'session_timeout');
        if (!isActive) return;
        await syncSupabaseSession(data.session ?? null);
      } catch {
        if (!isActive) return;
        setNoAuthState();
        setLoadingSession(false);
      }
    };

    if (isDemo) {
      initDemoSession();
      return () => {
        isActive = false;
      };
    }

    if (!hasSupabaseEnv) {
      if (isActive) {
        setNoAuthState();
        setLoadingSession(false);
      }
      return () => {
        isActive = false;
      };
    }

    void initSupabaseSession();
    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, session) => {
      await syncSupabaseSession(session ?? null);
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [hasSupabaseEnv, isDemo, loadMembership, loadPlatformRole, mapSupabaseUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (isDemo) {
        const foundUser = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
          demoSignIn(foundUser.id);
          setUser(foundUser);
          setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
          setPlatformRoleState(foundUser.role === 'super_admin' ? 'super_admin' : null);
          return true;
        }
        return false;
      }

      if (!hasSupabaseEnv) return false;

      const { data, error } = await signInWithPassword(email, password);
      if (error || !data.session?.user) return false;

      const userId = data.session.user.id;
      const mappedUser = mapSupabaseUser(userId, data.session.user.email ?? null);
      lastUserIdRef.current = userId;
      setAuthUserId(userId);
      setUser(mappedUser);
      setCurrentTenantId(mappedUser?.tenantId || tenants[0]?.id || null);
      await Promise.all([
        loadMembership(userId, { forceRefresh: true }),
        loadPlatformRole(userId),
      ]);
      return true;
    },
    [hasSupabaseEnv, isDemo, loadMembership, loadPlatformRole, mapSupabaseUser],
  );

  const loginAs = useCallback(
    (userId: string) => {
      if (!isDemo) return;
      const foundUser = DEMO_USERS.find((u) => u.id === userId);
      if (foundUser) {
        demoSignIn(foundUser.id);
        setUser(foundUser);
        setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
        setPlatformRoleState(foundUser.role === 'super_admin' ? 'super_admin' : null);
      }
    },
    [isDemo],
  );

  const logout = useCallback(() => {
    if (isDemo) {
      demoSignOut();
    } else if (hasSupabaseEnv) {
      void signOut();
    }

    invalidateOrgMembershipCache();
    clearLastPath();
    lastUserIdRef.current = null;
    setAuthUserId(null);
    setUser(null);
    setCurrentTenantId(null);
    setCurrentOrgIdState(null);
    setCurrentRoleState(null);
    setPlatformRoleState(null);
    setMembershipError(null);
    setLoadingMembership(false);
  }, [hasSupabaseEnv, isDemo]);

  const hasPermission = useCallback(
    (module: string, action: 'view' | 'edit' | 'approve'): boolean => {
      if (!user) return false;

      const rolePerms = rolePermissions.find((rp) => rp.role === user.role);
      if (!rolePerms) return false;

      const modulePerm = rolePerms.permissions.find((p) => p.module === module);
      if (!modulePerm) return false;

      if (action === 'view') return modulePerm.view;
      if (action === 'edit') return modulePerm.edit;
      if (action === 'approve') return modulePerm.approve ?? false;
      return false;
    },
    [user],
  );

  const canAccessProject = useCallback(
    (projectId: string): boolean => {
      if (!user) return false;

      if (user.role === 'super_admin') return true;

      const project = projects.find((p) => p.id === projectId);
      if (!project) return false;

      if (project.tenantId !== user.tenantId) return false;

      if (user.role === 'company_owner') return true;

      return user.projectIds.includes(projectId);
    },
    [user],
  );

  const getUserProjects = useCallback(() => {
    if (!user) return [];

    if (user.role === 'super_admin') {
      return projects.filter((p) => p.tenantId === currentTenantId);
    }

    if (user.role === 'company_owner') {
      return projects.filter((p) => p.tenantId === user.tenantId);
    }

    return projects.filter((p) => p.tenantId === user.tenantId && user.projectIds.includes(p.id));
  }, [user, currentTenantId]);

  const getCurrentTenant = useCallback(() => {
    if (!currentTenantId) return null;
    return tenants.find((t) => t.id === currentTenantId) || null;
  }, [currentTenantId]);

  const switchTenant = useCallback(
    (tenantId: string) => {
      if (user?.role === 'super_admin') {
        setCurrentTenantId(tenantId);
      }
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loadingSession,
        loadingMembership,
        membershipError,
        login,
        loginAs,
        logout,
        refreshMembership,
        hasPermission,
        canAccessProject,
        getUserProjects,
        getCurrentTenant,
        switchTenant,
        currentTenantId,
        currentOrgId: currentOrgIdState,
        currentRole: currentRoleState,
        platformRole: platformRoleState,
        isSuperAdmin: isSuperAdminRole(platformRoleState),
        setCurrentOrgId,
        setCurrentRole,
        setOrgMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
