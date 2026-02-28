import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  CreditCard,
  Download,
  FileText,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/app/context/CompanyContext";
import {
  ensureSubscription,
  getSubscription,
  listInvoices,
  listPaymentMethods,
  savePaymentMethod,
  upsertSubscription,
  type InvoiceRow,
  type PaymentMethodRow,
  type SubscriptionRow,
} from "@/lib/api/billing";
import { getOrganizationStats } from "@/lib/api/company";
import { logActivity } from "@/lib/api/activity";
import { formatCurrencyFull, formatDate } from "@/lib/numberFormat";
import { toast } from "@/hooks/use-toast";
import {
  PLAN_LIST,
  formatPriceVnd,
  getPlan,
  type PlanId,
} from "@/lib/plans/planCatalog";

const mapInvoiceStatus = (status: string) => {
  if (status === "paid") return <StatusBadge status="success">Đã thanh toán</StatusBadge>;
  if (status === "pending") return <StatusBadge status="warning">Chờ thanh toán</StatusBadge>;
  if (status === "overdue") return <StatusBadge status="danger">Quá hạn</StatusBadge>;
  return <StatusBadge status="neutral">{status}</StatusBadge>;
};

const getSubscriptionStatusMeta = (status: string | null | undefined) => {
  switch (status) {
    case "active":
      return { tone: "success" as const, label: "Đang hoạt động" };
    case "inactive":
      return { tone: "warning" as const, label: "Tạm ngưng" };
    case "cancelled":
      return { tone: "warning" as const, label: "Đã hủy" };
    case "expired":
      return { tone: "danger" as const, label: "Hết hạn" };
    default:
      return { tone: "neutral" as const, label: status ?? "-" };
  }
};

const AdminBilling: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useCompany();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [stats, setStats] = useState({ membersCount: 0, projectsCount: 0 });

  const [updatingPlan, setUpdatingPlan] = useState<PlanId | null>(null);

  const [newBrand, setNewBrand] = useState("visa");
  const [newLast4, setNewLast4] = useState("");
  const [newExpMonth, setNewExpMonth] = useState("12");
  const [newExpYear, setNewExpYear] = useState(String(new Date().getFullYear() + 1));
  const [savingMethod, setSavingMethod] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const loadData = async () => {
    if (!companyId) {
      setLoading(false);
      setError("Chưa có tổ chức.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [sub, invoiceRows, methodRows, orgStats] = await Promise.all([
        getSubscription(companyId),
        listInvoices(companyId),
        listPaymentMethods(companyId),
        getOrganizationStats(companyId),
      ]);

      const resolvedSubscription = sub ?? (await ensureSubscription(companyId));

      setSubscription(resolvedSubscription);
      setInvoices(invoiceRows);
      setPaymentMethods(methodRows);
      setStats({
        membersCount: orgStats.membersCount,
        projectsCount: orgStats.projectsCount,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message?: unknown }).message ?? "Failed to load billing data")
            : "Failed to load billing data";
      setError(message);
      setSubscription(null);
      setInvoices([]);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [companyId]);

  const currentPlan = useMemo(
    () => getPlan(subscription?.plan_id),
    [subscription?.plan_id],
  );
  const statusMeta = getSubscriptionStatusMeta(subscription?.status);

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
      const next = await upsertSubscription(companyId, {
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

      setSubscription(next);
      toast({ title: "Đã cập nhật gói (thanh toán sẽ tích hợp sau)" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật gói";
      toast({
        title: "Cập nhật gói thất bại",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUpdatingPlan(null);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (!companyId) return;
    if (newLast4.trim().length !== 4) {
      toast({ title: "Last4 không hợp lệ", variant: "destructive" });
      return;
    }

    setSavingMethod(true);
    try {
      await savePaymentMethod(companyId, {
        brand: newBrand.trim().toLowerCase(),
        last4: newLast4.trim(),
        exp_month: Number(newExpMonth),
        exp_year: Number(newExpYear),
      });

      await logActivity({
        orgId: companyId,
        module: "billing",
        action: "create",
        description: `Thêm phương thức thanh toán ${newBrand.toUpperCase()} ****${newLast4}`,
        status: "success",
      });

      toast({ title: "Đã lưu phương thức thanh toán" });
      setPaymentDialogOpen(false);
      setNewLast4("");
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể lưu phương thức thanh toán";
      toast({ title: "Lưu thất bại", description: message, variant: "destructive" });
    } finally {
      setSavingMethod(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Đang tải dữ liệu thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thanh toán & Gói dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý gói dịch vụ và thanh toán của bạn.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Gói hiện tại</CardTitle>
          <CardDescription>{currentPlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Tên gói: {currentPlan.name}</p>
              <p>Giá: {formatPriceVnd(currentPlan.priceVnd)}</p>
              <p>Trạng thái: {statusMeta.label}</p>
              <p>
                Chu kỳ: {formatDate(subscription?.current_period_start)} -{" "}
                {formatDate(subscription?.current_period_end)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Thành viên
                </span>
                <span className="font-medium">
                  {stats.membersCount} / {currentPlan.capacity.members ?? "Không giới hạn"}
                </span>
              </div>
              <Progress
                value={
                  currentPlan.capacity.members
                    ? Math.min(100, (stats.membersCount / currentPlan.capacity.members) * 100)
                    : 20
                }
                className="h-2"
              />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Dự án
                </span>
                <span className="font-medium">
                  {stats.projectsCount} / {currentPlan.capacity.activeProjects ?? "Không giới hạn"}
                </span>
              </div>
              <Progress
                value={
                  currentPlan.capacity.activeProjects
                    ? Math.min(100, (stats.projectsCount / currentPlan.capacity.activeProjects) * 100)
                    : 30
                }
                className="h-2"
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trạng thái thuê bao</span>
                <StatusBadge status={statusMeta.tone}>{statusMeta.label}</StatusBadge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3 font-medium">Tính năng bao gồm</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {currentPlan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Các gói dịch vụ</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_LIST.map((plan) => {
            const isCurrent = subscription?.plan_id === plan.id;
            const isBusy = updatingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={isCurrent ? "border-primary ring-1 ring-primary/40" : ""}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {plan.badgeLabel && (
                        <StatusBadge status="info">{plan.badgeLabel}</StatusBadge>
                      )}
                      {isCurrent && <StatusBadge status="success">Hiện tại</StatusBadge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{formatPriceVnd(plan.priceVnd)}</p>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>- {feature}</li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "secondary" : "default"}
                    className="w-full"
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Lịch sử hóa đơn
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Xuất tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Chưa có hóa đơn trong thanh toán.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                    <TableCell>{formatDate(invoice.issued_at)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyFull(Number(invoice.amount ?? 0), invoice.currency ?? "VND")}
                    </TableCell>
                    <TableCell>{mapInvoiceStatus(invoice.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Phương thức thanh toán
            </CardTitle>
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Thêm phương thức
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm phương thức thanh toán (stub)</DialogTitle>
                  <DialogDescription>
                    Chưa kết nối cổng thanh toán. Form này vẫn lưu để quản lý metadata.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input
                        value={newBrand}
                        onChange={(event) => setNewBrand(event.target.value)}
                        placeholder="visa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last4</Label>
                      <Input
                        value={newLast4}
                        onChange={(event) => setNewLast4(event.target.value)}
                        placeholder="4242"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Exp month</Label>
                      <Input
                        value={newExpMonth}
                        onChange={(event) => setNewExpMonth(event.target.value)}
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exp year</Label>
                      <Input
                        value={newExpYear}
                        onChange={(event) => setNewExpYear(event.target.value)}
                        placeholder="2030"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentDialogOpen(false)}
                    disabled={savingMethod}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSavePaymentMethod} disabled={savingMethod}>
                    {savingMethod ? "Đang lưu..." : "Lưu"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có hình thức thanh toán nào.</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-muted text-xs font-bold uppercase text-foreground">
                      {method.brand ?? "CARD"}
                    </div>
                    <div>
                      <p className="font-medium">**** **** **** {method.last4 ?? "----"}</p>
                      <p className="text-sm text-muted-foreground">
                        Hết hạn: {method.exp_month ?? "--"}/{method.exp_year ?? "----"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="success">Saved</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBilling;
