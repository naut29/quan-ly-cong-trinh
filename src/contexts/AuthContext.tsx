import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, users, projects, tenants, rolePermissions, UserRole } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAs: (userId: string) => void;
  logout: () => void;
  hasPermission: (module: string, action: 'view' | 'edit' | 'approve') => boolean;
  canAccessProject: (projectId: string) => boolean;
  getUserProjects: () => typeof projects;
  getCurrentTenant: () => typeof tenants[0] | null;
  switchTenant: (tenantId: string) => void;
  currentTenantId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('auth_user_id');
    if (savedUserId) {
      const foundUser = users.find(u => u.id === savedUserId);
      if (foundUser) {
        setUser(foundUser);
        setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
      }
    }
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock login - find user by email
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
      localStorage.setItem('auth_user_id', foundUser.id);
      return true;
    }
    return false;
  }, []);

  const loginAs = useCallback((userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setCurrentTenantId(foundUser.tenantId || tenants[0]?.id || null);
      localStorage.setItem('auth_user_id', foundUser.id);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentTenantId(null);
    localStorage.removeItem('auth_user_id');
  }, []);

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
      login,
      loginAs,
      logout,
      hasPermission,
      canAccessProject,
      getUserProjects,
      getCurrentTenant,
      switchTenant,
      currentTenantId,
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
