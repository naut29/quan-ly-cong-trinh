import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  FileText,
  FolderKanban,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { DashboardData } from "@/lib/data/types";
import { formatCurrency, projectStatusLabels } from "@/data/mockData";
import { getAppBasePath } from "@/lib/appMode";
import { getProjectPath } from "@/lib/projectRoutes";
import { cn } from "@/lib/utils";

const emptyDashboard: DashboardData = {
  companyName: "",
  summary: {
    totalBudget: 0,
    totalActual: 0,
    totalCommitted: 0,
    averageProgress: 0,
    activeProjects: 0,
    pausedProjects: 0,
    totalAlerts: 0,
  },
  projects: [],
  alerts: [],
};

const DemoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const dataProvider = useDataProvider();
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    dataProvider
      .getDashboardData()
      .then((next) => {
        if (active) {
          setData(next);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataProvider]);

  const basePath = getAppBasePath(location.pathname);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Dang tai dashboard demo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Xin chao, {user?.name?.split(" ").slice(-1)[0] ?? "Demo"}!
          </h1>
          <p className="mt-1 text-muted-foreground">{data.companyName}</p>
        </div>
        <Button onClick={() => navigate(`${basePath}/projects`)} className="gap-2">
          <FolderKanban className="h-4 w-4" />
          Xem du an demo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tong du toan"
          value={formatCurrency(data.summary.totalBudget)}
          subtitle={`${data.projects.length} du an mau`}
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          title="Thuc chi"
          value={formatCurrency(data.summary.totalActual)}
          subtitle="So lieu mock co dinh"
          icon={TrendingUp}
        />
        <KPICard
          title="Cam ket"
          value={formatCurrency(data.summary.totalCommitted)}
          subtitle="Gia tri hop dong"
          icon={FileText}
        />
        <KPICard
          title="Tien do trung binh"
          value={`${data.summary.averageProgress}%`}
          subtitle="Khong doi trong demo"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="kpi-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
            <FolderKanban className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{data.summary.activeProjects}</p>
            <p className="text-sm text-muted-foreground">Dang thi cong</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{data.summary.pausedProjects}</p>
            <p className="text-sm text-muted-foreground">Tam dung</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{data.summary.totalAlerts}</p>
            <p className="text-sm text-muted-foreground">Canh bao mau</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-semibold text-foreground">4 du an demo co dinh</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(`${basePath}/projects`)}>
              Xem tat ca
            </Button>
          </div>
          <div className="divide-y divide-border">
            {data.projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(getProjectPath(location.pathname, project.id))}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    project.status === "active" && "bg-success/10",
                    project.status === "paused" && "bg-warning/10",
                    project.status === "completed" && "bg-muted",
                  )}
                >
                  <FolderKanban
                    className={cn(
                      "h-5 w-5",
                      project.status === "active" && "text-success",
                      project.status === "paused" && "text-warning",
                      project.status === "completed" && "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate font-medium">{project.name}</p>
                    <StatusBadge
                      status={
                        project.status === "active"
                          ? "active"
                          : project.status === "paused"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {projectStatusLabels[project.status]}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.code}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">{formatCurrency(project.budget)}</p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                </div>
                {project.alertCount > 0 && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <span className="text-xs font-medium text-destructive">{project.alertCount}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-foreground">Canh bao gan day</h2>
          </div>
          <div className="divide-y divide-border">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      alert.type === "error" && "bg-destructive/10",
                      alert.type === "warning" && "bg-warning/10",
                      alert.type === "info" && "bg-info/10",
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4",
                        alert.type === "error" && "text-destructive",
                        alert.type === "warning" && "text-warning",
                        alert.type === "info" && "text-info",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{alert.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
