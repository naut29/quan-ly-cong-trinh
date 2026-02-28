import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useCompany } from "@/app/context/CompanyContext";
import RolesMatrix from "@/features/roles/RolesMatrix";
import type { PermissionMatrix } from "@/features/roles/types";
import { toast } from "@/hooks/use-toast";
import {
  getOrgRolesMatrix,
  saveOrgRolesMatrix,
  toRolesMatrixRoles,
  type OrgRoleRow,
} from "@/lib/api/rbac";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }

  return fallback;
};

const AdminRoles: React.FC = () => {
  const { companyId, companyName } = useCompany();
  const [searchParams] = useSearchParams();

  const [roles, setRoles] = useState<OrgRoleRow[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrix>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const focusedRoleId = searchParams.get("role");

  const loadRolesMatrix = useCallback(async () => {
    if (!companyId) {
      setRoles([]);
      setMatrix([]);
      setLoading(false);
      setError("Chưa có tổ chức.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await getOrgRolesMatrix(companyId);
      setRoles(payload.roles);
      setMatrix(payload.matrix);
    } catch (loadError) {
      setRoles([]);
      setMatrix([]);
      setError(getErrorMessage(loadError, "Không thể tải vai trò và ma trận quyền."));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadRolesMatrix();
  }, [loadRolesMatrix]);

  const matrixRoles = useMemo(() => toRolesMatrixRoles(roles), [roles]);

  const handleSave = useCallback(
    async (nextMatrix: PermissionMatrix) => {
      if (!companyId) {
        throw new Error("Chưa có tổ chức.");
      }

      try {
        const payload = await saveOrgRolesMatrix(companyId, nextMatrix);
        setRoles(payload.roles);
        setMatrix(payload.matrix);
        setError(null);
        toast({
          title: "Đã lưu ma trận quyền",
          description: "Dữ liệu đã được refetch và xác nhận khớp với DB.",
        });
      } catch (saveError) {
        const message = getErrorMessage(saveError, "Không thể lưu ma trận quyền.");
        setError(message);
        toast({
          title: "Lưu thay đổi thất bại",
          description: message,
          variant: "destructive",
        });
        throw saveError;
      }
    },
    [companyId],
  );

  if (loading && matrix.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Đang tải vai trò và quyền...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <RolesMatrix
        roles={matrixRoles}
        matrix={matrix}
        mode="app"
        focusedRoleId={focusedRoleId}
        description={`Cấu hình quyền truy cập cho từng vai trò trong ${companyName ?? "tổ chức này"}.`}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminRoles;
