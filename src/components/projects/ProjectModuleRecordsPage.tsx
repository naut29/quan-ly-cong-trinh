import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, PencilLine, Plus, Trash2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/api/activity";
import { hasOrgPermission } from "@/lib/api/rolePermissions";
import type {
  ProjectModuleKey,
  ProjectModuleRecordRow,
  UpsertProjectModuleRecordInput,
} from "@/lib/api/projectModuleRecords";
import { useProjectIdParam } from "@/lib/projectRoutes";
import { formatCurrencyFull, formatDateTime } from "@/lib/numberFormat";

interface ProjectModuleClient {
  list: (orgId: string, projectId: string) => Promise<ProjectModuleRecordRow[]>;
  create: (
    orgId: string,
    projectId: string,
    input: UpsertProjectModuleRecordInput,
  ) => Promise<ProjectModuleRecordRow>;
  update: (recordId: string, input: UpsertProjectModuleRecordInput) => Promise<ProjectModuleRecordRow>;
  remove: (recordId: string) => Promise<void>;
}

interface ProjectModuleRecordsPageProps {
  moduleKey: ProjectModuleKey;
  title: string;
  description: string;
  client: ProjectModuleClient;
}

interface FormState {
  name: string;
  code: string;
  status: string;
  amount: string;
  progress: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  code: "",
  status: "active",
  amount: "0",
  progress: "0",
  notes: "",
};

const STATUS_TONE: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  active: "success",
  pending: "warning",
  blocked: "danger",
  completed: "neutral",
};

export const ProjectModuleRecordsPage: React.FC<ProjectModuleRecordsPageProps> = ({
  moduleKey,
  title,
  description,
  client,
}) => {
  const projectId = useProjectIdParam();
  const { companyId } = useCompany();
  const { user } = useSession();

  const [records, setRecords] = useState<ProjectModuleRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProjectModuleRecordRow | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const loadData = useCallback(async () => {
    if (!companyId || !projectId) {
      setRecords([]);
      setLoading(false);
      setError("Chưa xác định dự án hoặc tổ chức.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [rows, permitted] = await Promise.all([
        client.list(companyId, projectId),
        hasOrgPermission(companyId, moduleKey, "edit"),
      ]);

      setRecords(rows);
      setCanEdit(permitted);
    } catch (loadError) {
      setRecords([]);
      setCanEdit(false);
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu module.");
    } finally {
      setLoading(false);
    }
  }, [client, companyId, moduleKey, projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    const totalAmount = records.reduce((sum, row) => sum + row.amount, 0);
    const averageProgress =
      records.length > 0
        ? Math.round(records.reduce((sum, row) => sum + row.progress, 0) / records.length)
        : 0;

    return {
      count: records.length,
      totalAmount,
      averageProgress,
      pending: records.filter((row) => row.status === "pending").length,
    };
  }, [records]);

  const resetForm = () => {
    setEditingRecord(null);
    setForm(DEFAULT_FORM);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (record: ProjectModuleRecordRow) => {
    setEditingRecord(record);
    setForm({
      name: record.name,
      code: record.code ?? "",
      status: record.status,
      amount: String(record.amount),
      progress: String(record.progress),
      notes: record.notes ?? "",
    });
    setDialogOpen(true);
  };

  const toInputPayload = (): UpsertProjectModuleRecordInput => ({
    name: form.name,
    code: form.code || null,
    status: form.status,
    amount: Number(form.amount),
    progress: Number(form.progress),
    notes: form.notes || null,
  });

  const handleSave = async () => {
    if (!companyId || !projectId) {
      return;
    }

    if (!form.name.trim()) {
      toast({ title: "Thiếu tên", description: "Vui lòng nhập tên bản ghi.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editingRecord) {
        await client.update(editingRecord.id, toInputPayload());
      } else {
        await client.create(companyId, projectId, toInputPayload());
      }

      await logActivity({
        orgId: companyId,
        actorUserId: user?.id ?? null,
        module: moduleKey,
        action: editingRecord ? "update" : "create",
        description: `${editingRecord ? "Cap nhat" : "Tao moi"} ban ghi ${title.toLowerCase()}: ${form.name}`,
        status: "success",
      });

      toast({
        title: editingRecord ? "Da cap nhat" : "Da tao moi",
        description: `${title} da duoc ghi vao Supabase.`,
      });

      setDialogOpen(false);
      resetForm();
      await loadData();
    } catch (saveError) {
      toast({
        title: "Không thể lưu dữ liệu",
        description: saveError instanceof Error ? saveError.message : "Yêu cầu lưu thất bại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: ProjectModuleRecordRow) => {
    if (!companyId) {
      return;
    }

    try {
      await client.remove(record.id);
      await logActivity({
        orgId: companyId,
        actorUserId: user?.id ?? null,
        module: moduleKey,
        action: "delete",
        description: `Xoa ban ghi ${title.toLowerCase()}: ${record.name}`,
        status: "success",
      });
      toast({ title: "Da xoa ban ghi" });
      await loadData();
    } catch (deleteError) {
      toast({
        title: "Không thể xóa",
        description: deleteError instanceof Error ? deleteError.message : "Xóa dữ liệu thất bại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        {canEdit && (
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm bản ghi
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng bản ghi</p>
            <p className="text-2xl font-bold">{totals.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng giá trị</p>
            <p className="text-2xl font-bold">{formatCurrencyFull(totals.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tiến độ trung bình</p>
            <p className="text-2xl font-bold">{totals.averageProgress}%</p>
            <Progress value={totals.averageProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Đang chờ xử lý</p>
            <p className="text-2xl font-bold">{totals.pending}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead className="text-right">Tiến độ</TableHead>
                <TableHead>Cập nhật</TableHead>
                {canEdit && <TableHead className="w-[120px] text-right">Tác vụ</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="py-8 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="py-8 text-center text-muted-foreground">
                    Chưa có bản ghi nào trong module này.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.name}</p>
                        {record.notes && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">{record.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{record.code ?? "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={STATUS_TONE[record.status] ?? "neutral"}>
                        {record.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyFull(record.amount)}
                    </TableCell>
                    <TableCell className="text-right">{record.progress}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(record.updated_at)}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => void handleDelete(record)}
                          >
                            <Trash2 className="h-4 w-4" />
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
            <DialogTitle className="flex items-center gap-2">
              <PencilLine className="h-4 w-4" />
              {editingRecord ? "Cập nhật bản ghi" : "Thêm bản ghi"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên</Label>
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mã</Label>
                <Input value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="blocked">blocked</SelectItem>
                    <SelectItem value="completed">completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tiến độ (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(event) => setForm((prev) => ({ ...prev, progress: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectModuleRecordsPage;
