import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Material {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number | null;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const { orgId, orgRole, loading: sessionLoading } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [materialSubmitting, setMaterialSubmitting] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [materialUnit, setMaterialUnit] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnitPrice, setMaterialUnitPrice] = useState("");
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const canEditMaterials = useMemo(() => (orgRole ?? "viewer") !== "viewer", [orgRole]);
  const canDeleteMaterials = useMemo(
    () => (orgRole ?? "viewer") === "owner" || (orgRole ?? "viewer") === "admin",
    [orgRole],
  );

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!supabase || !orgId || !id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, created_at")
        .eq("org_id", orgId)
        .eq("id", id)
        .maybeSingle();

      if (!isActive) return;
      if (error) {
        setError(error.message);
        setProject(null);
      } else {
        setProject((data as Project) ?? null);
      }
      setLoading(false);
    };

    if (!sessionLoading) {
      load();
    }

    return () => {
      isActive = false;
    };
  }, [id, orgId, sessionLoading]);

  const loadMaterials = useCallback(async () => {
    if (!supabase || !orgId || !id) {
      setMaterials([]);
      setMaterialsLoading(false);
      return;
    }

    setMaterialsLoading(true);
    setMaterialsError(null);
    const { data, error } = await supabase
      .from("materials")
      .select("id, name, unit, quantity, unit_price, total_price")
      .eq("org_id", orgId)
      .eq("project_id", id)
      .order("name", { ascending: true });

    if (error) {
      setMaterialsError(error.message);
      setMaterials([]);
    } else {
      setMaterials((data ?? []) as Material[]);
    }
    setMaterialsLoading(false);
  }, [id, orgId]);

  useEffect(() => {
    if (sessionLoading) return;
    loadMaterials();
  }, [loadMaterials, sessionLoading]);

  useEffect(() => {
    if (!materialDialogOpen) {
      setMaterialError(null);
      setMaterialSubmitting(false);
      setMaterialName("");
      setMaterialUnit("");
      setMaterialQuantity("");
      setMaterialUnitPrice("");
      setEditingMaterialId(null);
    }
  }, [materialDialogOpen]);

  const openCreateMaterial = () => {
    setEditingMaterialId(null);
    setMaterialDialogOpen(true);
  };

  const openEditMaterial = (material: Material) => {
    setEditingMaterialId(material.id);
    setMaterialName(material.name);
    setMaterialUnit(material.unit);
    setMaterialQuantity(String(material.quantity));
    setMaterialUnitPrice(String(material.unit_price));
    setMaterialDialogOpen(true);
  };

  const handleMaterialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMaterialError(null);

    const trimmedName = materialName.trim();
    const trimmedUnit = materialUnit.trim();
    const quantityValue = Number(materialQuantity);
    const unitPriceValue = Number(materialUnitPrice);

    if (!trimmedName) {
      setMaterialError("Vui lòng nhập tên vật tư.");
      return;
    }

    if (!trimmedUnit) {
      setMaterialError("Vui lòng nhập đơn vị.");
      return;
    }

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setMaterialError("Số lượng không hợp lệ.");
      return;
    }

    if (!Number.isFinite(unitPriceValue) || unitPriceValue < 0) {
      setMaterialError("Đơn giá không hợp lệ.");
      return;
    }

    if (!supabase || !orgId || !id) {
      setMaterialError("Thiếu dữ liệu tổ chức hoặc dự án.");
      return;
    }

    setMaterialSubmitting(true);
    try {
      if (editingMaterialId) {
        const { error: updateError } = await supabase
          .from("materials")
          .update({
            name: trimmedName,
            unit: trimmedUnit,
            quantity: quantityValue,
            unit_price: unitPriceValue,
          })
          .eq("id", editingMaterialId)
          .eq("org_id", orgId)
          .eq("project_id", id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase.from("materials").insert({
          org_id: orgId,
          project_id: id,
          name: trimmedName,
          unit: trimmedUnit,
          quantity: quantityValue,
          unit_price: unitPriceValue,
        });

        if (insertError) {
          throw insertError;
        }
      }

      setMaterialDialogOpen(false);
      loadMaterials();
    } catch (err: any) {
      setMaterialError(err?.message ?? "Không thể lưu vật tư.");
    } finally {
      setMaterialSubmitting(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deleteMaterialId || !supabase || !orgId || !id) {
      setDeleteMaterialId(null);
      return;
    }

    setDeleteSubmitting(true);
    try {
      const { error: deleteError } = await supabase
        .from("materials")
        .delete()
        .eq("id", deleteMaterialId)
        .eq("org_id", orgId)
        .eq("project_id", id);

      if (deleteError) {
        throw deleteError;
      }

      setDeleteMaterialId(null);
      loadMaterials();
    } catch (err) {
      setDeleteMaterialId(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Missing Supabase env</h2>
          <p className="text-muted-foreground text-sm">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.
          </p>
        </div>
      </div>
    );
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {project?.name ?? "Không tìm thấy dự án"}
            </h1>
            <p className="text-sm text-muted-foreground">Chi tiết dự án</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/projects">Quay lại danh sách</Link>
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-destructive">Không thể tải dự án: {error}</p>
            </CardContent>
          </Card>
        ) : !project ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Dự án không tồn tại.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{project.description?.trim() || "Chưa có mô tả."}</p>
              <p className="text-xs">
                Ngày tạo: {new Date(project.created_at).toLocaleDateString("vi-VN")}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Vật tư</CardTitle>
            {canEditMaterials && (
              <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateMaterial}>Thêm vật tư</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingMaterialId ? "Cập nhật vật tư" : "Thêm vật tư"}</DialogTitle>
                    <DialogDescription>Nhập thông tin vật tư cho dự án.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleMaterialSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="materialName">Tên vật tư</Label>
                      <Input
                        id="materialName"
                        value={materialName}
                        onChange={(event) => setMaterialName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="materialUnit">Đơn vị</Label>
                        <Input
                          id="materialUnit"
                          value={materialUnit}
                          onChange={(event) => setMaterialUnit(event.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="materialQuantity">Số lượng</Label>
                        <Input
                          id="materialQuantity"
                          type="number"
                          min="0"
                          step="0.01"
                          value={materialQuantity}
                          onChange={(event) => setMaterialQuantity(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialUnitPrice">Đơn giá</Label>
                      <Input
                        id="materialUnitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={materialUnitPrice}
                        onChange={(event) => setMaterialUnitPrice(event.target.value)}
                        required
                      />
                    </div>
                    {materialError && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {materialError}
                      </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMaterialDialogOpen(false)}
                        disabled={materialSubmitting}
                      >
                        Huỷ
                      </Button>
                      <Button type="submit" disabled={materialSubmitting}>
                        {materialSubmitting ? "Đang lưu..." : "Lưu"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {materialsLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải vật tư...</p>
            ) : materialsError ? (
              <p className="text-sm text-destructive">Không thể tải vật tư: {materialsError}</p>
            ) : materials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có vật tư cho dự án này.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên vật tư</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                    {(canEditMaterials || canDeleteMaterials) && <TableHead className="w-[160px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className="text-right">
                        {Number(material.quantity).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(material.unit_price).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {material.total_price != null
                          ? Number(material.total_price).toLocaleString("vi-VN")
                          : "-"}
                      </TableCell>
                      {(canEditMaterials || canDeleteMaterials) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canEditMaterials && (
                              <Button variant="outline" size="sm" onClick={() => openEditMaterial(material)}>
                                Sửa
                              </Button>
                            )}
                            {canDeleteMaterials && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteMaterialId(material.id)}
                              >
                                Xoá
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteMaterialId} onOpenChange={(open) => !open && setDeleteMaterialId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xoá vật tư này không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSubmitting}>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMaterial} disabled={deleteSubmitting}>
                {deleteSubmitting ? "Đang xoá..." : "Xoá"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProjectDetail;
