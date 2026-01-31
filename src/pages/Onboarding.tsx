import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasSupabaseEnv, supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { orgId, membershipLoading, refreshMembership } = useSession();
  const { setCurrentOrgId, setCurrentRole } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedSlug = useMemo(() => toSlug(companyName), [companyName]);

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    if (!client) {
      setLoading(false);
      return () => {
        isActive = false;
      };
    }

    const load = async () => {
      setLoading(true);
      const { data: userData } = await client.auth.getUser();
      if (!isActive) return;

      const user = userData.user;
      if (!user) {
        navigate("/app/login", { replace: true });
        return;
      }

      if (!isActive) return;
      if (membershipLoading) {
        setLoading(true);
        return;
      }
      if (orgId) {
        navigate("/app/dashboard", { replace: true });
        return;
      }

      setLoading(false);
    };

    load();

    return () => {
      isActive = false;
    };
  }, [navigate, orgId, membershipLoading]);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Vui lòng nhập tên công ty.");
      return;
    }

    if (!supabase) {
      setError("Thiếu cấu hình Supabase.");
      return;
    }

    const slug = suggestedSlug;
    if (!slug) {
      setError("Không thể tạo slug từ tên công ty.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: orgData, error: rpcError } = await supabase.rpc("create_organization_with_owner", {
        p_name: companyName.trim(),
        p_slug: slug,
      });

      if (rpcError) {
        throw rpcError;
      }

      const orgId =
        (orgData as { id?: string } | null)?.id ??
        (Array.isArray(orgData) ? (orgData[0] as { id?: string } | undefined)?.id : undefined);

      if (!orgId) {
        throw new Error("Không lấy được thông tin tổ chức.");
      }

      const { error: subscriptionError } = await supabase.rpc("ensure_org_subscription", {
        p_org_id: orgId,
      });

      if (subscriptionError) {
        throw subscriptionError;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? "";

      let resolvedRole: string | null = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data: membership, error } = await supabase.rpc("get_my_membership_for_org", {
          p_org_id: orgId,
        });

        if (error) {
          console.warn("Membership confirmation failed", {
            message: error.message,
            details: error.details,
            code: error.code,
          });
        }

        if (membership && membership.length > 0) {
          resolvedRole = membership[0]?.role ?? null;
          break;
        }

        await wait(300);
      }

      if (!resolvedRole) {
        throw new Error(`Không thể xác nhận thành viên tổ chức. Org ID: ${orgId}`);
      }

      setCurrentOrgId(orgId);
      setCurrentRole(resolvedRole);
      await refreshMembership();
      navigate("/app/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Missing Supabase env</h2>
          <p className="text-muted-foreground text-sm">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tạo công ty</CardTitle>
          <CardDescription>
            Nhập tên công ty để bắt đầu sử dụng ứng dụng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Tên công ty</Label>
              <Input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Ví dụ: Công ty ABC"
              />
              {companyName && (
                <p className="text-xs text-muted-foreground">
                  Slug: <span className="font-mono">{suggestedSlug}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo công ty"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
