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
  Home,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppBasePath } from '@/lib/appMode';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompany } from '@/app/context/CompanyContext';

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
    className={({ isActive }) =>
      cn('sidebar-item', isActive && 'sidebar-item-active')
    }
  >
    <Icon className="h-5 w-5 shrink-0" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const AppSidebarApp: React.FC = () => {
  const { role } = useCompany();
  const { id: projectId } = useParams();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const isInProject = location.pathname.includes('/projects/') && projectId;
  const isAdmin = role === 'owner' || role === 'admin';

  const mainNavItems = [
    { to: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Báº£ng Ä‘iá»u khiá»ƒn' },
    { to: `${basePath}/projects`, icon: FolderKanban, label: 'Dá»± Ã¡n' },
  ];

  const projectNavItems = projectId ? [
    { to: `${basePath}/projects/${projectId}/overview`, icon: Home, label: 'Tá»•ng quan' },
    { to: `${basePath}/projects/${projectId}/wbs`, icon: Building2, label: 'Cáº¥u trÃºc cÃ´ng viá»‡c' },
    { to: `${basePath}/projects/${projectId}/boq`, icon: Calculator, label: 'Dá»± toÃ¡n' },
    { to: `${basePath}/projects/${projectId}/materials`, icon: Package, label: 'Váº­t tÆ°' },
    { to: `${basePath}/projects/${projectId}/norms`, icon: Activity, label: 'Äá»‹nh má»©c' },
    { to: `${basePath}/projects/${projectId}/costs`, icon: Wallet, label: 'Chi phÃ­' },
    { to: `${basePath}/projects/${projectId}/contracts`, icon: FileText, label: 'Há»£p Ä‘á»“ng' },
    { to: `${basePath}/projects/${projectId}/payments`, icon: CreditCard, label: 'Thanh toÃ¡n' },
    { to: `${basePath}/projects/${projectId}/approvals`, icon: ClipboardCheck, label: 'PhÃª duyá»‡t' },
    { to: `${basePath}/projects/${projectId}/progress`, icon: TrendingUp, label: 'Tiáº¿n Ä‘á»™' },
    { to: `${basePath}/projects/${projectId}/reports`, icon: BarChart3, label: 'BÃ¡o cÃ¡o' },
  ] : [];

  const adminNavItems = [
    { to: `${basePath}/admin/company`, icon: Building2, label: 'CÃ´ng ty' },
    { to: `${basePath}/admin/users`, icon: Users, label: 'NgÆ°á»i dÃ¹ng' },
    { to: `${basePath}/admin/roles`, icon: Shield, label: 'Vai trÃ² & Quyá»n' },
    { to: `${basePath}/admin/audit-log`, icon: Activity, label: 'Nháº­t kÃ½ hoáº¡t Ä‘á»™ng' },
    { to: `${basePath}/admin/integrations`, icon: Plug, label: 'TÃ­ch há»£p' },
    { to: `${basePath}/admin/billing`, icon: Receipt, label: 'Thanh toÃ¡n' },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground text-sm">Quáº£n lÃ½ CÃ´ng trÃ¬nh</h1>
            <p className="text-[10px] text-sidebar-muted">Construction Control</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </div>

          {isInProject && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                <span>Dá»± Ã¡n hiá»‡n táº¡i</span>
              </div>
              {projectNavItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="space-y-1">
              <div className="sidebar-section flex items-center gap-2">
                <Settings className="h-3 w-3" />
                <span>Quáº£n trá»‹</span>
              </div>
              {adminNavItems.map((item) => (
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

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-muted text-center">v2.1.0 - Production</p>
      </div>
    </aside>
  );
};

export default AppSidebarApp;
