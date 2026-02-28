import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/app/context/CompanyContext";
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

const SelectPlan: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useCompany();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    let active = true;

    if (!companyId) {
      setSubscription(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);

    void ensureSubscription(companyId)
      .then((row) => {
        if (active) {
          setSubscription(row);
        }
      })
      .catch(() => {
        if (active) {
          setSubscription(null);
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
  }, [companyId]);

  const handlePlanAction = async (planId: PlanId) => {
    const plan = getPlan(planId);

    if (plan.contactHref) {
      navigate(plan.contactHref);
      return;
    }

    if (!companyId) {
      return;
    }

    setUpdatingPlan(planId);

    try {
      const nextSubscription = await upsertSubscription(companyId, {
        plan_id: planId,
        status: "active",
      });

      await logActivity({
        orgId: companyId,
        module: "billing",
        action: "update",
        description: `Cập nhật gói dịch vụ -> ${plan.name}`,
        status: "success",
      });

      setSubscription(nextSubscription);
      toast({ title: "Đã cập nhật gói (thanh toán sẽ tích hợp sau)" });
      navigate("/app/dashboard", { replace: true });
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
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Chọn gói dịch vụ</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Đang tải gói hiện tại..."
              : `Gói hiện tại: ${getPlan(subscription?.plan_id).name}`}
          </p>
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
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
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
                    <p className="text-xl font-semibold">{formatPriceVnd(plan.priceVnd)}</p>
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

export default SelectPlan;
