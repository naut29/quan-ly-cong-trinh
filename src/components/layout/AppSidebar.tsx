import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const { id: projectId } = useParams();
  const location = useLocation();
  
  const isInProject = location.pathname.includes('/projects/') && projectId;
  const isAdmin = user?.role === 'company_owner' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const mainNavItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển', module: 'dashboard' },
    { to: '/app/projects', icon: FolderKanban, label: 'Dự án', module: 'projects' },
  ];

  const projectNavItems = projectId ? [
    { to: `/app/projects/${projectId}/overview`, icon: Home, label: 'Tổng quan', module: 'projects' },
    { to: `/app/projects/${projectId}/wbs`, icon: Building2, label: 'Cấu trúc công việc', module: 'wbs' },
    { to: `/app/projects/${projectId}/boq`, icon: Calculator, label: 'Dự toán', module: 'boq' },
    { to: `/app/projects/${projectId}/materials`, icon: Package, label: 'Vật tư', module: 'materials' },
    { to: `/app/projects/${projectId}/norms`, icon: Activity, label: 'Định mức', module: 'norms' },
    { to: `/app/projects/${projectId}/costs`, icon: Wallet, label: 'Chi phí', module: 'costs' },
    { to: `/app/projects/${projectId}/contracts`, icon: FileText, label: 'Hợp đồng', module: 'contracts' },
    { to: `/app/projects/${projectId}/payments`, icon: CreditCard, label: 'Thanh toán', module: 'payments' },
    { to: `/app/projects/${projectId}/progress`, icon: TrendingUp, label: 'Tiến độ', module: 'progress' },
    { to: `/app/projects/${projectId}/reports`, icon: BarChart3, label: 'Báo cáo', module: 'reports' },
  ] : [];

  const adminNavItems = [
    { to: '/app/admin/company', icon: Building2, label: 'Công ty', module: 'admin' },
    { to: '/app/admin/users', icon: Users, label: 'Người dùng', module: 'admin' },
    { to: '/app/admin/roles', icon: Shield, label: 'Vai trò & Quyền', module: 'admin' },
    { to: '/app/admin/audit-log', icon: Activity, label: 'Nhật ký hoạt động', module: 'admin' },
    { to: '/app/admin/integrations', icon: Plug, label: 'Tích hợp', module: 'admin' },
    { to: '/app/admin/billing', icon: Receipt, label: 'Thanh toán', module: 'admin' },
  ];

  const platformNavItems = [
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
              {platformNavItems.map((item) => (
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
