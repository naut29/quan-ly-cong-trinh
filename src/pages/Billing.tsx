import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { usePlanContext } from "@/hooks/usePlanContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatLimit = (value: number | null, unit = "") => {
  if (value === null) return "Không giới hạn";
  return `${value}${unit}`;
};

const Billing: React.FC = () => {
  const { orgId, orgRole, loading: sessionLoading } = useSession();
  const { context, loading: planLoading } = usePlanContext(orgId);
  const [activeStatus, setActiveStatus] = useState<boolean | null>(null);
  const isAdmin = orgRole === "owner" || orgRole === "admin";

  useEffect(() => {
    const client = supabase;
    if (!client || !orgId) {
      setActiveStatus(null);
      return;
    }

    client
      .rpc("is_org_active", { org_id: orgId })
      .then(({ data }) => {
        setActiveStatus(Boolean(data));
      })
      .catch(() => {
        setActiveStatus(null);
      });
  }, [orgId]);

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

  if (sessionLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground">Thông tin gói dịch vụ hiện tại.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Quay lại Dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gói hiện tại</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Plan: {context.planName ?? "-"}</p>
            <p>Mã gói: {context.planCode ?? "-"}</p>
            <p>Trạng thái: {activeStatus === null ? "-" : activeStatus ? "Đang hoạt động" : "Đã hết hạn"}</p>

            <p>Thành viên tối đa: {formatLimit(context.limits.max_members)}</p>
            <p>Dự án đang hoạt động tối đa: {formatLimit(context.limits.max_active_projects)}</p>
            <p>Lưu trữ tối đa: {formatLimit(context.limits.max_storage_mb, " MB")}</p>
            <p>Upload mỗi ngày: {formatLimit(context.limits.max_upload_mb_per_day, " MB")}</p>
            <p>Kích thước tệp tối đa: {formatLimit(context.limits.max_file_mb, " MB")}</p>
            <p>Băng thông tải xuống/tháng: {formatLimit(context.limits.max_download_gb_per_month, " GB")}</p>
            <p>Xuất dữ liệu/ngày: {formatLimit(context.limits.export_per_day)}</p>
            <p>Phê duyệt: {context.limits.approval_enabled}</p>
            <p>Hỗ trợ: {context.limits.support}</p>

            {!activeStatus && activeStatus !== null && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <p>Tài khoản đã hết hạn. Vui lòng liên hệ để gia hạn.</p>
                {isAdmin ? (
                  <div className="mt-2 text-destructive">
                    <p>Email : contact@quanlycongtrinh.com</p>
                    <p>Điện thoại : 0988097621</p>
                  </div>
                ) : (
                  <p className="mt-2">Liên hệ quản trị viên công ty</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
