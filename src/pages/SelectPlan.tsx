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

type Plan = {
  id: "trial" | "basic" | "pro" | "premium";
  name: string;
  price: string;
  description: string;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "trial",
    name: "Trial 14 ngày",
    price: "Miễn phí",
    description: "Trải nghiệm đầy đủ trong 14 ngày.",
    features: ["Không giới hạn cơ bản", "Hỗ trợ khởi tạo"],
  },
  {
    id: "basic",
    name: "Gói 990k",
    price: "990.000đ / tháng",
    description: "Phù hợp với đội nhỏ đang tăng trưởng.",
    features: ["Thành viên linh hoạt", "Quản lý dự án cơ bản"],
  },
  {
    id: "pro",
    name: "Gói 3tr",
    price: "3.000.000đ / tháng",
    description: "Dành cho công ty quy mô vừa.",
    features: ["Mở rộng quyền", "Báo cáo nâng cao"],
  },
  {
    id: "premium",
    name: "Gói 5tr",
    price: "5.000.000đ / tháng",
    description: "Tối ưu cho doanh nghiệp lớn.",
    features: ["Tùy chỉnh theo nhu cầu", "Ưu tiên hỗ trợ"],
  },
];

const SelectPlan: React.FC = () => {
  const navigate = useNavigate();
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);

  const modalOpen = Boolean(modalPlan && modalPlan.id !== "trial");

  const handleSelect = (plan: Plan) => {
    if (plan.id === "trial") {
      navigate("/dashboard", { replace: true });
      return;
    }

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
          <p className="text-muted-foreground">Hoàn tất bước này để bắt đầu sử dụng hệ thống.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{plan.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xl font-semibold">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => handleSelect(plan)}>
                  {plan.id === "trial" ? "Bắt đầu dùng thử" : "Chọn gói này"}
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
            <p>Vui lòng liên hệ admin để kích hoạt gói dịch vụ.</p>
            <p>Email: admin@congty.vn</p>
            <p>Điện thoại: 0901 234 567</p>
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