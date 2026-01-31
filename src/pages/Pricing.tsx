import React, { useEffect, useMemo, useState } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "0đ",
    description: "Dành cho đội nhỏ bắt đầu.",
    features: ["3 thành viên", "2 dự án", "Báo cáo cơ bản"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Liên hệ",
    description: "Tối ưu cho công ty đang tăng trưởng.",
    features: ["20 thành viên", "20 dự án", "Hỗ trợ ưu tiên"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Liên hệ",
    description: "Quy mô lớn với nhu cầu tùy chỉnh.",
    features: ["Không giới hạn", "SLA riêng", "Tích hợp sâu"],
  },
];

const Pricing: React.FC = () => {
  const { orgId } = useSession();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client || !orgId) {
      setCurrentTier(null);
      return;
    }

    const load = async () => {
      const { data, error } = await client
        .from("org_subscriptions")
        .select("tier, expires_at, max_members, max_projects")
        .eq("org_id", orgId)
        .maybeSingle();

      if (!error) {
        setCurrentTier(data?.tier ?? null);
      }
    };

    load();
  }, [orgId]);

  const modalOpen = Boolean(modalPlan);

  const activePlanName = useMemo(
    () => plans.find((plan) => plan.id === currentTier)?.name ?? null,
    [currentTier],
  );

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

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Bảng giá</h1>
          <p className="text-muted-foreground">
            {activePlanName ? `Gói hiện tại: ${activePlanName}` : "Chọn gói phù hợp với doanh nghiệp của bạn."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.id;
            return (
              <Card key={plan.id} className={isCurrent ? "border-primary" : undefined}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrent && (
                      <span className="text-xs font-medium text-primary">Hiện tại</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-semibold">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent}
                    onClick={() => !isCurrent && setModalPlan(plan)}
                  >
                    {isCurrent ? "Hiện tại" : "Chọn gói này"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liên hệ để nâng cấp</DialogTitle>
            <DialogDescription>
              Gói đã chọn: <span className="font-medium">{modalPlan?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Vui lòng liên hệ admin để nâng cấp gói dịch vụ.</p>
            <p>Email: admin@congty.vn</p>
            <p>Điện thoại: 0901 234 567</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPlan(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
