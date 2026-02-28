import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/api/activity";
import {
  ensureSubscription,
  upsertSubscription,
  type SubscriptionRow,
} from "@/lib/api/billing";
import {
  PLAN_LIST,
  formatPriceVnd,
  getPlan,
  type PlanId,
} from "@/lib/plans/planCatalog";

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    orgId,
    orgRole,
    loading: sessionLoading,
    membershipLoading,
  } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    let active = true;

    if (!user || !orgId) {
      setSubscription(null);
      setSubscriptionLoading(false);
      return () => {
        active = false;
      };
    }

    setSubscriptionLoading(true);

    void ensureSubscription(orgId)
      .then((nextSubscription) => {
        if (active) {
          setSubscription(nextSubscription);
        }
      })
      .catch(() => {
        if (active) {
          setSubscription(null);
        }
      })
      .finally(() => {
        if (active) {
          setSubscriptionLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [orgId, user]);

  const isAdmin = orgRole === "owner" || orgRole === "admin";
  const currentPlan = useMemo(
    () => (subscription ? getPlan(subscription.plan_id) : null),
    [subscription],
  );

  const subtitle = useMemo(() => {
    if (sessionLoading || membershipLoading || subscriptionLoading) {
      return "Đang tải gói hiện tại...";
    }

    if (!user) {
      return "Chưa đăng nhập";
    }

    if (!orgId) {
      return "Chưa có tổ chức";
    }

    if (currentPlan) {
      return `Gói hiện tại: ${currentPlan.name}`;
    }

    return "Chưa xác định gói dịch vụ";
  }, [currentPlan, membershipLoading, orgId, sessionLoading, subscriptionLoading, user]);

  const handlePlanAction = async (planId: PlanId) => {
    const plan = getPlan(planId);

    if (plan.contactHref) {
      navigate(plan.contactHref);
      return;
    }

    if (!user) {
      navigate("/app/login");
      return;
    }

    if (!orgId) {
      navigate("/onboarding");
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Chỉ owner/admin mới có thể đổi gói",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPlan(planId);

    try {
      const nextSubscription = await upsertSubscription(orgId, {
        plan_id: planId,
        status: "active",
      });

      await logActivity({
        orgId,
        module: "billing",
        action: "update",
        description: `Cập nhật gói dịch vụ -> ${plan.name}`,
        status: "success",
      });

      setSubscription(nextSubscription);
      toast({ title: "Đã cập nhật gói (thanh toán sẽ tích hợp sau)" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật gói";
      toast({
        title: "Cập nhật gói thất bại",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Bảng giá</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_LIST.map((plan) => {
            const isCurrent = subscription?.plan_id === plan.id;
            const isBusy = updatingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={[
                  "transition-all",
                  plan.badgeLabel
                    ? "relative border-primary/80 bg-primary/5 shadow-xl shadow-primary/10 ring-2 ring-primary/20"
                    : "",
                  isCurrent ? "border-primary ring-2 ring-primary/40" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{plan.name}</span>
                    <div className="flex items-center gap-2">
                      {plan.badgeLabel && (
                        <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold tracking-wide text-primary-foreground">
                          {plan.badgeLabel}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs font-medium text-primary">Hiện tại</span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-semibold">{formatPriceVnd(plan.priceVnd)}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>- {feature}</li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || isBusy}
                    onClick={() => void handlePlanAction(plan.id)}
                  >
                    {isCurrent ? "Hiện tại" : isBusy ? "Đang cập nhật..." : plan.ctaLabel}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
