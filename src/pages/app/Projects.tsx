import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { useCompany } from "@/app/context/CompanyContext";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/api/activity";
import { hasOrgPermission } from "@/lib/api/rolePermissions";
import {
  createProject,
  deleteProject,
  listProjectsByOrg,
  updateProject,
  type CreateProjectInput,
} from "@/lib/api/projects";
import { getAppBasePath } from "@/lib/appMode";
import { formatCurrencyFull, formatDate } from "@/lib/numberFormat";
import { projectStageLabels, projectStatusLabels } from "@/lib/projectMeta";

type ProjectSummary = Awaited<ReturnType<typeof listProjectsByOrg>>[number];

interface FormState {
  id: string | null;
  name: string;
  code: string;
  address: string;
  status: string;
  stage: string;
  manager: string;
  startDate: string;
  endDate: string;
  budget: string;
}

const DEFAULT_FORM: FormState = {
  id: null,
  name: "",
  code: "",
  address: "",
  status: "active",
  stage: "foundation",
  manager: "",
  startDate: "",
  endDate: "",
  budget: "0",
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const { companyId, companyName } = useCompany();
  const { user } = useSession();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const loadProjects = useCallback(async () => {
    if (!companyId) {
      setProjects([]);
      setLoading(false);
      setError("Chưa có tổ chức.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [rows, permitted] = await Promise.all([
        listProjectsByOrg(companyId),
        hasOrgPermission(companyId, "projects", "edit"),
      ]);
      setProjects(rows);
      setCanEdit(permitted);
    } catch (loadError) {
      setProjects([]);
      setCanEdit(false);
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dự án.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return projects;
    }

    return projects.filter((project) => {
      const haystack = `${project.name} ${project.code} ${project.address}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [projects, search]);

  const summary = useMemo(
    () => ({
      totalBudget: projects.reduce((sum, project) => sum + project.budget, 0),
      activeCount: projects.filter((project) => project.status === "active").length,
      averageProgress:
        projects.length > 0
          ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
          : 0,
    }),
    [projects],
  );

  const resetForm = () => setForm(DEFAULT_FORM);

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (project: ProjectSummary) => {
    setForm({
      id: project.id,
      name: project.name,
      code: project.code,
      address: project.address,
      status: project.status,
      stage: project.stage,
      manager: project.manager,
      startDate: project.startDate ? String(project.startDate).slice(0, 10) : "",
      endDate: project.endDate ? String(project.endDate).slice(0, 10) : "",
      budget: String(project.budget),
    });
    setDialogOpen(true);
  };

  const toPayload = (): CreateProjectInput => {
    const existingProject = form.id ? projects.find((project) => project.id === form.id) : null;

    return {
      name: form.name,
      code: form.code || null,
      address: form.address || null,
      status: form.status,
      stage: form.stage,
      manager: form.manager || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      budget: Number(form.budget),
      actual: existingProject?.actual ?? 0,
      committed: existingProject?.committed ?? 0,
      forecast: existingProject?.forecast ?? Number(form.budget),
      progress: existingProject?.progress ?? 0,
    };
  };

  const handleSave = async () => {
    if (!companyId) {
      return;
    }

    if (!form.name.trim()) {
      toast({ title: "Thiếu tên dự án", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const nextProject = form.id
        ? await updateProject(companyId, form.id, toPayload())
        : await createProject(companyId, toPayload());

      await logActivity({
        orgId: companyId,
        actorUserId: user?.id ?? null,
        module: "projects",
        action: form.id ? "update" : "create",
        description: `${form.id ? "Cập nhật" : "Tạo"} dự án ${nextProject.name}`,
        status: "success",
      });

      toast({
        title: form.id ? "Đã cập nhật dự án" : "Đã tạo dự án",
        description: "Du lieu da duoc ghi that vao Supabase.",
      });

      setDialogOpen(false);
      resetForm();
      await loadProjects();
    } catch (saveError) {
      toast({
        title: "Không thể lưu dự án",
        description: saveError instanceof Error ? saveError.message : "Yeu cau luu that bai.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: ProjectSummary) => {
    if (!companyId) {
      return;
    }

    try {
      await deleteProject(companyId, project.id);
      await logActivity({
        orgId: companyId,
        actorUserId: user?.id ?? null,
        module: "projects",
        action: "delete",
        description: `Xóa dự án ${project.name}`,
        status: "success",
      });
      toast({ title: "Đã xóa dự án" });
      await loadProjects();
    } catch (deleteError) {
      toast({
        title: "Không thể xóa dự án",
        description: deleteError instanceof Error ? deleteError.message : "Xóa dự án thất bại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dự án</h1>
          <p className="mt-1 text-muted-foreground">
            {companyName ?? "Tổ chức hiện tại"} • {projects.length} dự án
          </p>
        </div>
        {canEdit && (
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Tạo dự án
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng dự toán</p>
            <p className="text-2xl font-bold">{formatCurrencyFull(summary.totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dang thi cong</p>
            <p className="text-2xl font-bold">{summary.activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tiến độ trung bình</p>
            <p className="text-2xl font-bold">{summary.averageProgress}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Tìm tên, mã hoặc địa chỉ dự án..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dự án</TableHead>
                <TableHead>Trang thai</TableHead>
                <TableHead>Giai doan</TableHead>
                <TableHead className="text-right">Du toan</TableHead>
                <TableHead className="text-right">Tiến độ</TableHead>
                <TableHead>Khoi tao</TableHead>
                {canEdit && <TableHead className="w-[160px] text-right">Tac vu</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="py-8 text-center text-muted-foreground">
                    Đang tải dự án...
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="py-8 text-center text-muted-foreground">
                    Không có dự án phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => navigate(`${basePath}/projects/${project.id}/overview`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <FolderKanban className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.code}</p>
                          </div>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status === "active" ? "success" : project.status === "paused" ? "warning" : "neutral"}>
                        {projectStatusLabels[project.status] ?? project.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{projectStageLabels[project.stage] ?? project.stage}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyFull(project.budget)}
                    </TableCell>
                    <TableCell className="text-right">{project.progress}%</TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(project)}>
                            Sua
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => void handleDelete(project)}
                          >
                            Xoa
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen);
          if (!nextOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Cập nhật dự án" : "Tạo dự án mới"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên dự án</Label>
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mã dự án</Label>
                <Input value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Quan ly</Label>
                <Input value={form.manager} onChange={(event) => setForm((prev) => ({ ...prev, manager: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dia chi</Label>
              <Input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Trang thai</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="paused">paused</SelectItem>
                    <SelectItem value="completed">completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giai doan</Label>
                <Select value={form.stage} onValueChange={(value) => setForm((prev) => ({ ...prev, stage: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">foundation</SelectItem>
                    <SelectItem value="structure">structure</SelectItem>
                    <SelectItem value="finishing">finishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Bat dau</Label>
                <Input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Ket thuc</Label>
                <Input type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Du toan</Label>
                <Input type="number" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Huy
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Dang luu..." : "Luu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
