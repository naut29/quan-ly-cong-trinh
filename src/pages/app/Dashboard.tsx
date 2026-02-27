import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useCompany } from '@/app/context/CompanyContext';
import { useSession } from '@/app/session/useSession';
import { getProjectDashboardStats } from '@/lib/api/projects';
import { listActivityLogs, type ActivityLogRow } from '@/lib/api/activity';
import { formatCurrencyCompact, formatDateTime } from '@/lib/numberFormat';
import { projectStatusLabels } from '@/lib/projectMeta';
import { cn } from '@/lib/utils';
import { getAppBasePath } from '@/lib/appMode';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const { companyId, companyName } = useCompany();
  const { user } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<ActivityLogRow[]>([]);
  const [metrics, setMetrics] = useState({
    totalBudget: 0,
    avgProgress: 0,
    activeProjects: 0,
    pausedProjects: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!companyId) {
        if (isMounted) {
          setProjects([]);
          setWarnings([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [projectStats, warnLogs] = await Promise.all([
          getProjectDashboardStats(companyId),
          listActivityLogs({ orgId: companyId, status: 'warn', limit: 5 }),
        ]);

        if (!isMounted) return;

        setProjects(projectStats.projects);
        setWarnings(warnLogs);
        setMetrics({
          totalBudget: projectStats.totalBudget,
          avgProgress: projectStats.avgProgress,
          activeProjects: projectStats.activeProjects,
          pausedProjects: projectStats.pausedProjects,
        });
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err && 'message' in err
              ? String((err as { message?: unknown }).message ?? 'Failed to load dashboard data')
              : 'Failed to load dashboard data';
        setError(message);
        setProjects([]);
        setWarnings([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const userName = useMemo(() => {
    const email = user?.email ?? '';
    if (!email) return 'ban';
    return email.split('@')[0];
  }, [user?.email]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Dang tai du lieu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Xin chao, {userName}!</h1>
          <p className="text-muted-foreground mt-1">{companyName ?? 'To chuc cua ban'}</p>
        </div>
        <Button onClick={() => navigate(`${basePath}/projects`)} className="gap-2">
          <FolderKanban className="h-4 w-4" />
          Xem tat ca du an
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tong du toan"
          value={formatCurrencyCompact(metrics.totalBudget)}
          subtitle={`${projects.length} du an`}
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          title="Tien do trung binh"
          value={`${metrics.avgProgress}%`}
          icon={TrendingUp}
          variant={metrics.avgProgress >= 50 ? 'success' : 'default'}
        />
        <KPICard
          title="Du an dang thi cong"
          value={metrics.activeProjects}
          icon={FolderKanban}
          variant="success"
        />
        <KPICard
          title="Du an tam dung"
          value={metrics.pausedProjects}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Du an cua ban</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(`${basePath}/projects`)}>
              Xem tat ca
            </Button>
          </div>
          <div className="divide-y divide-border">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Chua co du an trong to chuc.</div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`${basePath}/projects/${project.id}/overview`)}
                  className="w-full p-4 hover:bg-muted/50 transition-colors text-left flex items-center gap-4"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      project.status === 'active' && 'bg-success/10',
                      project.status === 'paused' && 'bg-warning/10',
                      (project.status === 'completed' || project.status === 'done') && 'bg-muted',
                    )}
                  >
                    <FolderKanban
                      className={cn(
                        'h-5 w-5',
                        project.status === 'active' && 'text-success',
                        project.status === 'paused' && 'text-warning',
                        (project.status === 'completed' || project.status === 'done') && 'text-muted-foreground',
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{project.name}</p>
                      <StatusBadge
                        status={
                          project.status === 'active'
                            ? 'active'
                            : project.status === 'paused'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {projectStatusLabels[project.status] ?? project.status}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.code}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium">{formatCurrencyCompact(project.budget)}</p>
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Canh bao gan day</h2>
          </div>
          <div className="divide-y divide-border">
            {warnings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Khong co canh bao nao</p>
              </div>
            ) : (
              warnings.map((log) => (
                <div key={log.id} className="p-4">
                  <p className="text-sm font-medium">{log.module}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.description ?? '-'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(log.created_at)}</p>
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
