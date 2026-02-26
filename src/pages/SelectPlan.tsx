import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { marketingPlans, type MarketingPlan } from "@/lib/planCatalog";

const SelectPlan: React.FC = () => {
  const navigate = useNavigate();
  const [modalPlan, setModalPlan] = useState<MarketingPlan | null>(null);

  const modalOpen = Boolean(modalPlan);

  const handleSelect = (plan: MarketingPlan) => {
    setModalPlan(plan);
  };

  const handleClose = () => {
    setModalPlan(null);
    navigate("/dashboard", { replace: true });
  };

  const selectedPlanName = useMemo(() => modalPlan?.name ?? "", [modalPlan]);

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Chọn gói dịch vụ</h1>
          <p className="text-muted-foreground">Hệ thống hiện có 3 gói: Starter, Pro, Enterprise.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {marketingPlans.map((plan) => (
            <Card
              key={plan.code}
              className={[
                "transition-all",
                plan.featured ? "relative border-primary/80 bg-primary/5 shadow-xl shadow-primary/10 ring-2 ring-primary/20" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.featuredBadge && (
                    <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      {plan.featuredBadge}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xl font-semibold">{plan.priceLabel}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => handleSelect(plan)}>
                  {plan.ctaLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liên hệ để kích hoạt</DialogTitle>
            <DialogDescription>
              Gói đã chọn: <span className="font-medium">{selectedPlanName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Email : contact@quanlycongtrinh.com</p>
            <p>Điện thoại : 0988097621</p>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Tiếp tục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectPlan;
