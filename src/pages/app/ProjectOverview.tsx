import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  FileText,
  FolderKanban,
  MapPin,
  Package,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useCompany } from "@/app/context/CompanyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import UploadWidget from "@/components/projects/UploadWidget";
import { listActivityLogs } from "@/lib/api/activity";
import { getProjectModuleSummary } from "@/lib/api/projectModuleRecords";
import { getProjectById } from "@/lib/api/projects";
import { getAppBasePath } from "@/lib/appMode";
import { formatCurrencyFull, formatDate, formatDateTime } from "@/lib/numberFormat";
import { projectStageLabels, projectStatusLabels } from "@/lib/projectMeta";
import { useProjectIdParam } from "@/lib/projectRoutes";

const MODULE_LABELS: Record<string, string> = {
  wbs: "Cấu trúc công việc",
  boq: "Dự toán",
  materials: "Vật tư",
  norms: "Định mức",
  costs: "Chi phí",
  contracts: "Hợp đồng",
  payments: "Thanh toán",
  approvals: "Phê duyệt",
  progress: "Tiến độ",
  reports: "Báo cáo",
};

const QUICK_LINKS = [
  { key: "wbs", label: "Cấu trúc công việc", icon: FolderKanban },
  { key: "boq", label: "Dự toán", icon: FileText },
  { key: "materials", label: "Vật tư", icon: Package },
  { key: "costs", label: "Chi phí", icon: Wallet },
  { key: "progress", label: "Tiến độ", icon: TrendingUp },
  { key: "reports", label: "Báo cáo", icon: BarChart3 },
];

const ProjectOverview: React.FC = () => {
  const projectId = useProjectIdParam();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const { companyId } = useCompany();

  const [project, setProject] = useState<Awaited<ReturnType<typeof getProjectById>>>(null);
  const [moduleSummary, setModuleSummary] = useState<Awaited<ReturnType<typeof getProjectModuleSummary>>>([]);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof listActivityLogs>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!companyId || !projectId) {
        if (isActive) {
          setProject(null);
          setModuleSummary([]);
          setActivity([]);
          setLoading(false);
          setError("Chưa xác định dự án hoặc tổ chức.");
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [projectRow, summaryRows, activityRows] = await Promise.all([
          getProjectById(companyId, projectId),
          getProjectModuleSummary(companyId, projectId),
          listActivityLogs({ orgId: companyId, limit: 8 }),
        ]);

        if (!isActive) {
          return;
        }

        setProject(projectRow);
        setModuleSummary(summaryRows);
        setActivity(activityRows);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setProject(null);
        setModuleSummary([]);
        setActivity([]);
        setError(loadError instanceof Error ? loadError.message : "Không thể tải tổng quan dự án.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [companyId, projectId]);

  const summaryTotals = useMemo(
    () => ({
      totalRecords: moduleSummary.reduce((sum, row) => sum + row.count, 0),
      totalAmount: moduleSummary.reduce((sum, row) => sum + row.totalAmount, 0),
    }),
    [moduleSummary],
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Đang tải tổng quan dự án...</p>
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

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy dự án.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={project.status === "active" ? "success" : project.status === "paused" ? "warning" : "neutral"}>
              {projectStatusLabels[project.status] ?? project.status}
            </StatusBadge>
            <StatusBadge status="neutral" dot={false}>
              {projectStageLabels[project.stage] ?? project.stage}
            </StatusBadge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="mt-1 text-muted-foreground">{project.code}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Du toan</p>
            <p className="text-2xl font-bold">{formatCurrencyFull(project.budget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Thuc chi</p>
            <p className="text-2xl font-bold">{formatCurrencyFull(project.actual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tong ban ghi module</p>
            <p className="text-2xl font-bold">{summaryTotals.totalRecords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tiến độ</p>
            <p className="text-2xl font-bold">{project.progress}%</p>
            <Progress value={project.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin dự án</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{project.address || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{project.manager || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(project.startDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span>{formatCurrencyFull(summaryTotals.totalAmount)} tong gia tri module</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoat dong gan day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co hoat dong nao.</p>
            ) : (
              activity.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{item.module}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description ?? item.action}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {moduleSummary.map((item) => (
          <Link key={item.moduleKey} to={`${basePath}/projects/${projectId}/${item.moduleKey}`} className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium">{MODULE_LABELS[item.moduleKey] ?? item.moduleKey}</p>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">{formatCurrencyFull(item.totalAmount)}</p>
                <Progress value={item.averageProgress} className="h-2" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <UploadWidget projectId={projectId} />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.key}
            to={`${basePath}/projects/${projectId}/${item.key}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <item.icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectOverview;
