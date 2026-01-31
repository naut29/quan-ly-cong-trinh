import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subscription {
  tier: string | null;
  expires_at: string | null;
  max_members: number | null;
  max_projects: number | null;
}

const Billing: React.FC = () => {
  const { orgId, loading: sessionLoading } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [activeStatus, setActiveStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabase;
    if (!client || !orgId) {
      setSubscription(null);
      setActiveStatus(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data } = await client
        .from("org_subscriptions")
        .select("tier, expires_at, max_members, max_projects")
        .eq("org_id", orgId)
        .maybeSingle();

      setSubscription((data ?? null) as Subscription | null);

      const { data: activeData } = await client.rpc("is_org_active", { org_id: orgId });
      setActiveStatus(Boolean(activeData));
      setLoading(false);
    };

    load();
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

  if (sessionLoading || loading) {
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
            <p>Tier: {subscription?.tier ?? "-"}</p>
            <p>
              Hạn sử dụng:{" "}
              {subscription?.expires_at
                ? new Date(subscription.expires_at).toLocaleDateString("vi-VN")
                : "-"}
            </p>
            <p>Trạng thái: {activeStatus === null ? "-" : activeStatus ? "Đang hoạt động" : "Đã hết hạn"}</p>
            <p>Giới hạn thành viên: {subscription?.max_members ?? "Không giới hạn"}</p>
            <p>Giới hạn dự án: {subscription?.max_projects ?? "Không giới hạn"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
