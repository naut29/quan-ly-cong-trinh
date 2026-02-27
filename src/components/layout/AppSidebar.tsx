import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Building2,
  Package,
  Calculator,
  Wallet,
  FileText,
  CreditCard,
  TrendingUp,
  BarChart3,
  Users,
  Shield,
  Settings,
  Activity,
  Plug,
  Receipt,
  ChevronRight,
  Lock,
  Home,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppBasePath, isDemoPath } from '@/lib/appMode';
import { getProjectPath, isProjectDetailPath, useProjectIdParam } from '@/lib/projectRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  end?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, disabled, end }) => {
  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="sidebar-item opacity-50 cursor-not-allowed">
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
            <Lock className="h-3.5 w-3.5 ml-auto text-sidebar-muted" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Bạn không có quyền truy cập</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn('sidebar-item', isActive && 'sidebar-item-active')
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
};

const AppSidebar: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const projectId = useProjectIdParam();
  const location = useLocation();
  
  const basePath = getAppBasePath(location.pathname);
  const isDemo = isDemoPath(location.pathname);
  const isInProject = isProjectDetailPath(location.pathname) && !!projectId;
  const isAdmin = user?.role === 'company_owner' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const mainNavItems = [
    { to: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Bảng điều khiển', module: 'dashboard' },
    { to: `${basePath}/projects`, icon: FolderKanban, label: 'Dự án', module: 'projects' },
  ];

  const projectNavItems = projectId ? [
    { to: getProjectPath(location.pathname, projectId), icon: Home, label: 'Tổng quan', module: 'projects' },
    { to: getProjectPath(location.pathname, projectId, 'wbs'), icon: Building2, label: 'Cấu trúc công việc', module: 'wbs' },
    { to: getProjectPath(location.pathname, projectId, 'boq'), icon: Calculator, label: 'Dự toán', module: 'boq' },
    { to: getProjectPath(location.pathname, projectId, 'materials'), icon: Package, label: 'Vật tư', module: 'materials' },
    { to: getProjectPath(location.pathname, projectId, 'norms'), icon: Activity, label: 'Định mức', module: 'norms' },
    { to: getProjectPath(location.pathname, projectId, 'costs'), icon: Wallet, label: 'Chi phí', module: 'costs' },
    { to: getProjectPath(location.pathname, projectId, 'contracts'), icon: FileText, label: 'Hợp đồng', module: 'contracts' },
    { to: getProjectPath(location.pathname, projectId, 'payments'), icon: CreditCard, label: 'Thanh toán', module: 'payments' },
    { to: getProjectPath(location.pathname, projectId, 'approvals'), icon: ClipboardCheck, label: 'Phê duyệt', module: 'approvals' },
    { to: getProjectPath(location.pathname, projectId, 'progress'), icon: TrendingUp, label: 'Tiến độ', module: 'progress' },
    { to: getProjectPath(location.pathname, projectId, 'reports'), icon: BarChart3, label: 'Báo cáo', module: 'reports' },
  ] : [];

  const adminNavItems = [
    { to: `${basePath}/admin/company`, icon: Building2, label: 'Công ty', module: 'admin' },
    { to: `${basePath}/admin/users`, icon: Users, label: 'Người dùng', module: 'admin' },
    { to: `${basePath}/admin/roles`, icon: Shield, label: 'Vai trò & Quyền', module: 'admin' },
    { to: `${basePath}/admin/audit-log`, icon: Activity, label: 'Nhật ký hoạt động', module: 'admin' },
    { to: `${basePath}/admin/integrations`, icon: Plug, label: 'Tích hợp', module: 'admin' },
    { to: `${basePath}/admin/billing`, icon: Receipt, label: 'Thanh toán', module: 'admin' },
  ];

  const demoPlatformNavItems = [
    { to: '/demo/company', icon: Building2, label: 'Công ty', module: 'admin' },

    { to: '/demo/users', icon: Users, label: 'Người dùng', module: 'admin' },

    { to: '/demo/billing', icon: Receipt, label: 'Thanh toán', module: 'admin' },

  ];

  const appPlatformNavItems = [
    { to: '/platform/tenants', icon: Building2, label: 'Công ty', module: 'admin' },
    { to: '/platform/users', icon: Users, label: 'Người dùng', module: 'admin' },
    { to: '/platform/billing', icon: Receipt, label: 'Thanh toán', module: 'admin' },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground text-sm">Quản lý Công trình</h1>
            <p className="text-[10px] text-sidebar-muted">Construction Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                disabled={!hasPermission(item.module, 'view')}
              />
            ))}
          </div>

          {/* Project Context Navigation */}
          {isInProject && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                <span>Dự án hiện tại</span>
              </div>
              {projectNavItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  disabled={!hasPermission(item.module, 'view')}
                />
              ))}
            </div>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <Settings className="h-3 w-3" />
                <span>Quản trị</span>
              </div>
              {adminNavItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  disabled={!hasPermission(item.module, 'view')}
                />
              ))}
            </div>
          )}

          {/* Platform Admin Navigation */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Nền tảng</span>
              </div>
              {(isDemo ? demoPlatformNavItems : appPlatformNavItems).map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Version */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-muted text-center">v2.1.0 - Production</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
