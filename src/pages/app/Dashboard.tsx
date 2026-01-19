import React from 'react';
import { 
  FolderKanban, 
  Wallet, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  FileText,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, alerts, projectStatusLabels, projectStageLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, getUserProjects, getCurrentTenant } = useAuth();
  const projects = getUserProjects();
  const tenant = getCurrentTenant();

  // Calculate summary KPIs
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalActual = projects.reduce((sum, p) => sum + p.actual, 0);
  const totalCommitted = projects.reduce((sum, p) => sum + p.committed, 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;
  const totalAlerts = projects.reduce((sum, p) => sum + p.alertCount, 0);

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pausedProjects = projects.filter(p => p.status === 'paused').length;

  // Get project alerts
  const projectAlerts = alerts.filter(a => 
    projects.some(p => p.id === a.projectId)
  ).slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Xin chào, {user?.name?.split(' ').slice(-1)[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {tenant?.name || 'Nền tảng quản lý công trình'}
          </p>
        </div>
        <Button onClick={() => navigate('/app/projects')} className="gap-2">
          <FolderKanban className="h-4 w-4" />
          Xem tất cả dự án
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard
          title="Tổng dự toán"
          value={formatCurrency(totalBudget)}
          subtitle={`${projects.length} dự án`}
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          title="Thực chi"
          value={formatCurrency(totalActual)}
          change={Math.round((totalActual / totalBudget) * 100 - 100)}
          changeLabel="so với dự toán"
          icon={TrendingUp}
        />
        <KPICard
          title="Cam kết"
          value={formatCurrency(totalCommitted)}
          subtitle="Giá trị hợp đồng"
          icon={FileText}
        />
        <KPICard
          title="Tiến độ trung bình"
          value={`${avgProgress}%`}
          change={5}
          changeLabel="so với tuần trước"
          icon={TrendingUp}
          variant={avgProgress >= 50 ? 'success' : 'default'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <FolderKanban className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{activeProjects}</p>
            <p className="text-sm text-muted-foreground">Dự án đang thi công</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{pausedProjects}</p>
            <p className="text-sm text-muted-foreground">Dự án tạm dừng</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{totalAlerts}</p>
            <p className="text-sm text-muted-foreground">Cảnh báo cần xử lý</p>
          </div>
        </div>
      </div>

      {/* Projects Grid & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Dự án của bạn</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/projects')}>
              Xem tất cả
            </Button>
          </div>
          <div className="divide-y divide-border">
            {projects.slice(0, 5).map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/app/projects/${project.id}/overview`)}
                className="w-full p-4 hover:bg-muted/50 transition-colors text-left flex items-center gap-4"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  project.status === 'active' && "bg-success/10",
                  project.status === 'paused' && "bg-warning/10",
                  project.status === 'completed' && "bg-muted",
                )}>
                  <FolderKanban className={cn(
                    "h-5 w-5",
                    project.status === 'active' && "text-success",
                    project.status === 'paused' && "text-warning",
                    project.status === 'completed' && "text-muted-foreground",
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{project.name}</p>
                    <StatusBadge 
                      status={project.status === 'active' ? 'active' : project.status === 'paused' ? 'warning' : 'neutral'}
                    >
                      {projectStatusLabels[project.status]}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.code}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium">{formatCurrency(project.budget)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                </div>
                {project.alertCount > 0 && (
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-destructive">{project.alertCount}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Cảnh báo gần đây</h2>
          </div>
          <div className="divide-y divide-border">
            {projectAlerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không có cảnh báo nào</p>
              </div>
            ) : (
              projectAlerts.map((alert) => (
                <div key={alert.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      alert.type === 'error' && "bg-destructive/10",
                      alert.type === 'warning' && "bg-warning/10",
                      alert.type === 'info' && "bg-info/10",
                    )}>
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        alert.type === 'error' && "text-destructive",
                        alert.type === 'warning' && "text-warning",
                        alert.type === 'info' && "text-info",
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.createdAt}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
