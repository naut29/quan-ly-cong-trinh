import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Grid3X3,
  List,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { DataProject } from "@/lib/data/types";
import { formatCurrency, projectStageLabels, projectStatusLabels } from "@/data/mockData";
import { getProjectPath } from "@/lib/projectRoutes";
import { cn } from "@/lib/utils";
import { exportToExcel, exportToPDF, formatCurrencyForExport } from "@/lib/export-utils";
import { ProjectFormDialog, type ProjectEntry } from "@/components/projects/ProjectFormDialog";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { ProjectsOverviewCharts } from "@/components/projects/ProjectsOverviewCharts";
import { toast } from "@/hooks/use-toast";
import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";

const DemoProjects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dataProvider = useDataProvider();

  const [projects, setProjects] = useState<DataProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | undefined>(undefined);
  const [projectToDelete, setProjectToDelete] = useState<DataProject | null>(null);

  useEffect(() => {
    let active = true;

    dataProvider
      .listProjects()
      .then((items) => {
        if (active) {
          setProjects(items);
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

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch =
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.code.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [projects, search, statusFilter],
  );

  const openCreate = () => {
    setDialogMode("create");
    setSelectedProject(undefined);
    setDialogOpen(true);
  };

  const openEdit = (project: DataProject) => {
    setDialogMode("edit");
    setSelectedProject({
      id: project.id,
      code: project.code,
      name: project.name,
      address: project.address,
      status: project.status,
      stage: project.stage,
      manager: project.manager,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
    });
    setDialogOpen(true);
  };

  const handleExportExcel = () => {
    exportToExcel({
      title: "Danh sach du an demo",
      fileName: "demo-projects",
      columns: [
        { header: "Ma", key: "code", width: 18 },
        { header: "Ten", key: "name", width: 36 },
        { header: "Trang thai", key: "status", width: 16 },
        { header: "Du toan", key: "budget", width: 20 },
        { header: "Tien do", key: "progress", width: 12 },
      ],
      data: filteredProjects.map((project) => ({
        code: project.code,
        name: project.name,
        status: projectStatusLabels[project.status],
        budget: formatCurrencyForExport(project.budget),
        progress: `${project.progress}%`,
      })),
    });

    toast({
      title: "Xuat file demo",
      description: "File duoc tao tu mock fixtures va khong lam thay doi du lieu.",
    });
  };

  const handleExportPdf = () => {
    exportToPDF({
      title: "Danh sach du an demo",
      subtitle: "Mock fixtures for /demo only",
      fileName: "demo-projects",
      columns: [
        { header: "Ma", key: "code", width: 16 },
        { header: "Ten", key: "name", width: 40 },
        { header: "Trang thai", key: "status", width: 18 },
        { header: "Du toan", key: "budget", width: 18 },
      ],
      data: filteredProjects.map((project) => ({
        code: project.code,
        name: project.name,
        status: projectStatusLabels[project.status],
        budget: formatCurrencyForExport(project.budget),
      })),
    });

    toast({
      title: "Xuat file demo",
      description: "PDF duoc tao tu mock fixtures va khong lam thay doi du lieu.",
    });
  };

  const handleSubmitProject = async (data: any) => {
    showDemoNotSavedToast();
    toast({
      title: dialogMode === "create" ? "Demo create only" : "Demo edit only",
      description: `Du lieu "${data.name}" chi dung de minh hoa va khong duoc luu.`,
    });
  };

  const handleDeleteProject = () => {
    if (!projectToDelete) return;

    showDemoNotSavedToast();
    toast({
      title: "Demo delete only",
      description: `Khong xoa that du an "${projectToDelete.name}".`,
    });
    setProjectToDelete(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Dang tai du an demo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Du an</h1>
          <p className="mt-1 text-muted-foreground">{projects.length} du an mock co dinh cho /demo</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Xuat file
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tao demo item
          </Button>
        </div>
      </div>

      {projects.length > 0 && (
        <ProjectsOverviewCharts
          projects={projects.map((project) => ({ ...project, tenantId: "tenant-demo" }))}
        />
      )}

      <div className="filter-bar rounded-xl bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo ten hoac ma du an..."
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="active">Dang thi cong</SelectItem>
            <SelectItem value="paused">Tam dung</SelectItem>
            <SelectItem value="completed">Hoan thanh</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Khong tim thay du an</h3>
          <p className="text-muted-foreground">Thu doi bo loc hoac tu khoa tim kiem.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="kpi-card cursor-pointer"
              onClick={() => navigate(getProjectPath(location.pathname, project.id))}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
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
                    <StatusBadge status="neutral" dot={false}>
                      {projectStageLabels[project.stage]}
                    </StatusBadge>
                  </div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.code}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(getProjectPath(location.pathname, project.id))}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEdit(project)}>Chinh sua demo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setProjectToDelete(project)}>Xoa demo</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Du toan</span>
                  <span className="font-medium">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thuc chi</span>
                  <span className={cn("font-medium", project.actual > project.budget && "text-destructive")}>
                    {formatCurrency(project.actual)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tien do</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {project.alertCount > 0 && (
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{project.alertCount} canh bao</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Du an</th>
                <th>Trang thai</th>
                <th>Du toan</th>
                <th>Tien do</th>
                <th>Canh bao</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.code}</p>
                    </div>
                  </td>
                  <td>
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
                  </td>
                  <td className="font-medium">{formatCurrency(project.budget)}</td>
                  <td>{project.progress}%</td>
                  <td>{project.alertCount}</td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => navigate(getProjectPath(location.pathname, project.id))}>
                      Xem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedProject}
        onSubmit={handleSubmitProject}
      />

      {projectToDelete && (
        <DeleteProjectDialog
          open={Boolean(projectToDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setProjectToDelete(null);
            }
          }}
          projectName={projectToDelete.name}
          projectCode={projectToDelete.code}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
};

export default DemoProjects;
