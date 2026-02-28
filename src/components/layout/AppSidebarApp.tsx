import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Building2,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  Package,
  Plug,
  Receipt,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppBasePath } from '@/lib/appMode';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompany } from '@/app/context/CompanyContext';
import { useSession } from '@/app/session/useSession';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => cn('sidebar-item', isActive && 'sidebar-item-active')}
  >
    <Icon className="h-5 w-5 shrink-0" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const AppSidebarApp: React.FC = () => {
  const { role } = useCompany();
  const { isSuperAdmin } = useSession();
  const { id: projectId } = useParams();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const isInProject = location.pathname.includes('/projects/') && projectId;
  const isAdmin = role === 'owner' || role === 'admin';

  const mainNavItems = [
    { to: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { to: `${basePath}/projects`, icon: FolderKanban, label: 'Dự án' },
  ];

  const projectNavItems = projectId
    ? [
        { to: `${basePath}/projects/${projectId}/overview`, icon: Home, label: 'Tổng quan' },
        { to: `${basePath}/projects/${projectId}/wbs`, icon: Building2, label: 'Cấu trúc công việc' },
        { to: `${basePath}/projects/${projectId}/boq`, icon: Calculator, label: 'Dự toán' },
        { to: `${basePath}/projects/${projectId}/materials`, icon: Package, label: 'Vật tư' },
        { to: `${basePath}/projects/${projectId}/norms`, icon: Activity, label: 'Định mức' },
        { to: `${basePath}/projects/${projectId}/costs`, icon: Wallet, label: 'Chi phí' },
        { to: `${basePath}/projects/${projectId}/contracts`, icon: FileText, label: 'Hợp đồng' },
        { to: `${basePath}/projects/${projectId}/payments`, icon: CreditCard, label: 'Thanh toán' },
        { to: `${basePath}/projects/${projectId}/approvals`, icon: ClipboardCheck, label: 'Phê duyệt' },
        { to: `${basePath}/projects/${projectId}/progress`, icon: TrendingUp, label: 'Tiến độ' },
        { to: `${basePath}/projects/${projectId}/reports`, icon: BarChart3, label: 'Báo cáo' },
      ]
    : [];

  const adminNavItems = [
    { to: `${basePath}/admin/company`, icon: Building2, label: 'Công ty' },
    { to: `${basePath}/admin/users`, icon: Users, label: 'Người dùng' },
    { to: `${basePath}/admin/roles`, icon: Shield, label: 'Vai trò & Quyền' },
    { to: `${basePath}/admin/activity`, icon: Activity, label: 'Nhật ký hoạt động' },
    { to: `${basePath}/admin/integrations`, icon: Plug, label: 'Tích hợp' },
    { to: `${basePath}/admin/billing`, icon: Receipt, label: 'Thanh toán' },
  ];

  const platformNavItems = [
    { to: `${basePath}/platform/tenants`, icon: Building2, label: 'Công ty' },
    { to: `${basePath}/platform/users`, icon: Users, label: 'Người dùng' },
    { to: `${basePath}/platform/billing`, icon: Receipt, label: 'Thanh toán' },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0">
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

      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </div>

          {isInProject && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                <span>Dự án hiện tại</span>
              </div>
              {projectNavItems.map((item) => (
                <SidebarItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <Settings className="h-3 w-3" />
                <span>QUẢN TRỊ</span>
              </div>
              {adminNavItems.map((item) => (
                <SidebarItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </div>
          )}

          {isSuperAdmin && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>NỀN TẢNG</span>
              </div>
              {platformNavItems.map((item) => (
                <SidebarItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </div>
          )}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-muted text-center">v2.1.0 - Production</p>
      </div>
    </aside>
  );
};

export default AppSidebarApp;
