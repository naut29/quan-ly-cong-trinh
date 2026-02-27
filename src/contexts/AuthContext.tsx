import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, users, projects, tenants, rolePermissions, UserRole } from '@/data/mockData';
import { isAppPath, isDemoPath } from '@/lib/appMode';
import { DEMO_USERS, demoGetSession, demoSignIn, demoSignOut } from '@/auth/demoAuth';
import { getSession, onAuthStateChange, signInWithPassword, signOut } from '@/auth/supabaseAuth';
import { hasSupabaseEnv, supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loadingSession: boolean;
  loadingMembership: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAs: (userId: string) => void;
  logout: () => void;
  hasPermission: (module: string, action: 'view' | 'edit' | 'approve') => boolean;
  canAccessProject: (projectId: string) => boolean;
  getUserProjects: () => typeof projects;
  getCurrentTenant: () => typeof tenants[0] | null;
  switchTenant: (tenantId: string) => void;
  currentTenantId: string | null;
  currentOrgId: string | null;
  currentRole: string | null;
  setCurrentOrgId: (orgId: string | null) => void;
  setCurrentRole: (role: string | null) => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDemo = isDemoPath(location.pathname);
  const isApp = isAppPath(location.pathname);
  const [user, setUser] = useState<User | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingMembership, setLoadingMembership] = useState(false);

  const loadMembership = useCallback(async () => {
    setLoadingMembership(true);

    try {
      if (!supabase) {
        setCurrentOrgId(null);
        setCurrentRole(null);
        return;
      }

      const { data, error } = await withTimeout(
        supabase.rpc('get_my_membership'),
        MEMBERSHIP_TIMEOUT_MS,
        'membership_timeout',
      );

      if (error || !Array.isArray(data) || data.length === 0) {
        setCurrentOrgId(null);
        setCurrentRole(null);
        return;
      }

      setCurrentOrgId(data[0]?.org_id ?? null);
      setCurrentRole(data[0]?.role ?? null);
    } catch {
      setCurrentOrgId(null);
      setCurrentRole(null);
    } finally {
      setLoadingMembership(false);
    }
  }, []);

  const mapSupabaseUser = useCallback((email?: string | null) => {
    if (!email) return null;
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) return foundUser;
    const fallbackTenantId = tenants[0]?.id || '';
    return {
      id: `supabase-${email}`,
      email,
      name: email.split('@')[0],
      role: 'company_owner' as UserRole,
      tenantId: fallbackTenantId,
      projectIds: [],
    };
  }, []);

  // Restore session based on mode
  useEffect(() => {
    let isActive = true;

    const initDemoSession = () => {
      const session = demoGetSession();
      if (!session) {
        if (isActive) {
          setUser(null);
          setCurrentTenantId(null);
          setCurrentOrgId(null);
          setCurrentRole(null);
          setLoadingSession(false);
        }
        return;
      }
      const foundUser = DEMO_USERS.find(u => u.id === session.userId) || null;
      if (isActive) {
        setUser(foundUser);
        setCurrentTenantId(foundUser?.tenantId || tenants[0]?.id || null);
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

        setCurrentOrgId(null);
        setCurrentRole(null);
        const mappedUser = mapSupabaseUser(data.session?.user.email);
        setUser(mappedUser);
        setCurrentTenantId(mappedUser?.tenantId || tenants[0]?.id || null);

        if (data.session?.user?.id) {
          await loadMembership();
          return;
        }

        setLoadingMembership(false);
      } catch {
        if (!isActive) return;
        setUser(null);
        setCurrentTenantId(null);
        setCurrentOrgId(null);
        setCurrentRole(null);
        setLoadingMembership(false);
      } finally {
        if (isActive) {
          setLoadingSession(false);
        }
      }
    };

    if (isDemo) {
      initDemoSession();
      return () => {
        isActive = false;
      };
    }

    if (!isApp || !hasSupabaseEnv) {
      if (isActive) {
        setUser(null);
        setCurrentTenantId(null);
        setCurrentOrgId(null);
        setCurrentRole(null);
        setLoadingMembership(false);
        setLoadingSession(false);
      }
      return () => {
        isActive = false;
      };
    }

    void initSupabaseSession();
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      if (!isActive) return;

      setLoadingSession(true);

      try {
        const mappedUser = mapSupabaseUser(session?.user.email);
        setUser(mappedUser);
        setCurrentTenantId(mappedUser?.tenantId || tenants[0]?.id || null);

        if (session?.user?.id) {
          await loadMembership();
          return;
        }

        setCurrentOrgId(null);
        setCurrentRole(null);
        setLoadingMembership(false);
      } catch {
        if (isActive) {
          setUser(null);
          setCurrentTenantId(null);
          setCurrentOrgId(null);
          setCurrentRole(null);
          setLoadingMembership(false);
        }
      } finally {
        if (isActive) {
          setLoadingSession(false);
        }
      }
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [hasSupabaseEnv, isDemo, isApp, loadMembership, mapSupabaseUser]);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    if (isDemo) {
      const foundUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        demoSignIn(foundUser.id);
        setUser(foundUser);
        setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
        return true;
      }
      return false;
    }

    if (!isApp || !hasSupabaseEnv) return false;

    const { data, error } = await signInWithPassword(email, _password);
    if (error || !data.session?.user) return false;
    const mappedUser = mapSupabaseUser(data.session.user.email);
    setUser(mappedUser);
    setCurrentTenantId(mappedUser?.tenantId || tenants[0]?.id || null);
    await loadMembership();
    return true;
  }, [hasSupabaseEnv, isDemo, isApp, mapSupabaseUser, loadMembership]);

  const loginAs = useCallback((userId: string) => {
    if (!isDemo) return;
    const foundUser = DEMO_USERS.find(u => u.id === userId);
    if (foundUser) {
      demoSignIn(foundUser.id);
      setUser(foundUser);
      setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
    }
  }, [isDemo]);

  const logout = useCallback(() => {
    if (isDemo) {
      demoSignOut();
    } else if (isApp && hasSupabaseEnv) {
      signOut();
    }
    setUser(null);
    setCurrentTenantId(null);
    setCurrentOrgId(null);
    setCurrentRole(null);
    setLoadingMembership(false);
  }, [hasSupabaseEnv, isDemo, isApp]);

  const hasPermission = useCallback((module: string, action: 'view' | 'edit' | 'approve'): boolean => {
    if (!user) return false;
    
    const rolePerms = rolePermissions.find(rp => rp.role === user.role);
    if (!rolePerms) return false;
    
    const modulePerm = rolePerms.permissions.find(p => p.module === module);
    if (!modulePerm) return false;
    
    if (action === 'view') return modulePerm.view;
    if (action === 'edit') return modulePerm.edit;
    if (action === 'approve') return modulePerm.approve ?? false;
    return false;
  }, [user]);

  const canAccessProject = useCallback((projectId: string): boolean => {
    if (!user) return false;
    
    // Super admin can access all
    if (user.role === 'super_admin') return true;
    
    // Find the project
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    // Check tenant isolation
    if (project.tenantId !== user.tenantId) return false;
    
    // Company owner can access all company projects
    if (user.role === 'company_owner') return true;
    
    // Others need explicit project assignment
    return user.projectIds.includes(projectId);
  }, [user]);

  const getUserProjects = useCallback(() => {
    if (!user) return [];
    
    // Super admin with tenant context
    if (user.role === 'super_admin') {
      return projects.filter(p => p.tenantId === currentTenantId);
    }
    
    // Company owner sees all company projects
    if (user.role === 'company_owner') {
      return projects.filter(p => p.tenantId === user.tenantId);
    }
    
    // Others see only assigned projects
    return projects.filter(p => 
      p.tenantId === user.tenantId && user.projectIds.includes(p.id)
    );
  }, [user, currentTenantId]);

  const getCurrentTenant = useCallback(() => {
    if (!currentTenantId) return null;
    return tenants.find(t => t.id === currentTenantId) || null;
  }, [currentTenantId]);

  const switchTenant = useCallback((tenantId: string) => {
    if (user?.role === 'super_admin') {
      setCurrentTenantId(tenantId);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loadingSession,
      loadingMembership,
      login,
      loginAs,
      logout,
      hasPermission,
      canAccessProject,
      getUserProjects,
      getCurrentTenant,
      switchTenant,
      currentTenantId,
      currentOrgId,
      currentRole,
      setCurrentOrgId,
      setCurrentRole,
    }}>
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
