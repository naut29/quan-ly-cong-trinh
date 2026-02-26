import React, { useMemo, useState } from "react";
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
import { usePlanContext } from "@/hooks/usePlanContext";
import { marketingPlans, type MarketingPlan } from "@/lib/planCatalog";

const Pricing: React.FC = () => {
  const { user, orgId, loading: sessionLoading } = useSession();
  const effectiveOrgId = user ? orgId : null;
  const { context, loading: planLoading } = usePlanContext(effectiveOrgId);
  const [modalPlan, setModalPlan] = useState<MarketingPlan | null>(null);

  const canShowCurrentPlan =
    Boolean(user) &&
    Boolean(effectiveOrgId) &&
    !sessionLoading &&
    !planLoading &&
    Boolean(context.planCode);
  const activePlanCode = canShowCurrentPlan ? context.planCode : null;
  const activePlanName = useMemo(
    () => marketingPlans.find((plan) => plan.code === activePlanCode)?.name ?? null,
    [activePlanCode],
  );

  const modalOpen = Boolean(modalPlan);

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Bảng giá</h1>
          <p className="text-muted-foreground">
            {canShowCurrentPlan && activePlanName
              ? `Gói hiện tại: ${activePlanName}`
              : "3 gói dịch vụ tối ưu cho nhu cầu lưu trữ và băng thông cao."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {marketingPlans.map((plan) => {
            const isCurrent = activePlanCode === plan.code;
            const isFeatured = Boolean(plan.featured);
            return (
              <Card
                key={plan.code}
                className={[
                  "transition-all",
                  isFeatured ? "relative border-primary/80 bg-primary/5 shadow-xl shadow-primary/10 ring-2 ring-primary/20" : "",
                  isCurrent ? "border-primary ring-2 ring-primary/40" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <div className="flex items-center gap-2">
                      {plan.featuredBadge && (
                        <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                          {plan.featuredBadge}
                        </span>
                      )}
                      {isCurrent && <span className="text-xs font-medium text-primary">Hiện tại</span>}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-semibold">{plan.priceLabel}</p>
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
                    disabled={isCurrent}
                    onClick={() => !isCurrent && setModalPlan(plan)}
                  >
                    {isCurrent ? "Hiện tại" : plan.ctaLabel}
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
            <DialogTitle>Liên hệ để kích hoạt gói</DialogTitle>
            <DialogDescription>
              Gói đã chọn: <span className="font-medium">{modalPlan?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Email : contact@quanlycongtrinh.com</p>
            <p>Điện thoại : 0988097621</p>
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
