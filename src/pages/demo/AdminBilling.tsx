import React, { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Download, Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { BillingData } from "@/lib/data/types";
import { formatCurrencyFull, formatDate } from "@/lib/numberFormat";
import { PLAN_LIST, formatPriceVnd, getPlan } from "@/lib/plans/planCatalog";
import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";

const emptyBilling: BillingData = {
  companyName: "",
  currentPlanId: "starter",
  subscriptionStatus: "inactive",
  subscriptionBadge: "Demo",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  membersUsed: 0,
  projectsUsed: 0,
  invoices: [],
  paymentMethods: [],
};

const DemoAdminBilling: React.FC = () => {
  const dataProvider = useDataProvider();
  const [billing, setBilling] = useState<BillingData>(emptyBilling);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    dataProvider
      .getBillingData()
      .then((data) => {
        if (active) {
          setBilling(data);
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
  }, [dataProvider]);

  const currentPlan = useMemo(() => getPlan(billing.currentPlanId), [billing.currentPlanId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Dang tai billing demo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thanh toan & goi dich vu</h1>
          <p className="text-muted-foreground">{billing.companyName}</p>
        </div>
        <Button variant="outline" onClick={showDemoNotSavedToast}>
          <Download className="mr-2 h-4 w-4" />
          Xuat hoa don demo
        </Button>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Goi hien tai</CardTitle>
              <CardDescription>{currentPlan.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {billing.demoLabel && <StatusBadge status="info">{billing.demoLabel}</StatusBadge>}
              <StatusBadge status="success">{billing.subscriptionBadge}</StatusBadge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Ten goi: {billing.currentPlanLabel ?? currentPlan.name}</p>
              <p>Gia: {formatPriceVnd(currentPlan.priceVnd)}</p>
              <p>Trang thai: {billing.subscriptionStatus}</p>
              <p>
                Chu ky: {formatDate(billing.currentPeriodStart)} - {formatDate(billing.currentPeriodEnd)}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Thanh vien
                  </span>
                  <span className="font-medium">
                    {billing.membersUsed} / {currentPlan.capacity.members ?? "Khong gioi han"}
                  </span>
                </div>
                <Progress
                  value={
                    currentPlan.capacity.members
                      ? Math.min(100, (billing.membersUsed / currentPlan.capacity.members) * 100)
                      : 20
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    Du an
                  </span>
                  <span className="font-medium">
                    {billing.projectsUsed} / {currentPlan.capacity.activeProjects ?? "Khong gioi han"}
                  </span>
                </div>
                <Progress
                  value={
                    currentPlan.capacity.activeProjects
                      ? Math.min(100, (billing.projectsUsed / currentPlan.capacity.activeProjects) * 100)
                      : 25
                  }
                  className="h-2"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-medium">Tinh nang bao gom</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {currentPlan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_LIST.map((plan) => {
          const isCurrent = billing.currentPlanId === plan.id;

          return (
            <Card key={plan.id} className={isCurrent ? "border-primary ring-1 ring-primary/40" : ""}>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {plan.badgeLabel && <StatusBadge status="info">{plan.badgeLabel}</StatusBadge>}
                    {isCurrent && <StatusBadge status="success">Demo current</StatusBadge>}
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-3xl font-bold">{formatPriceVnd(plan.priceVnd)}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrent ? "secondary" : "default"}
                  onClick={showDemoNotSavedToast}
                >
                  {isCurrent ? "Dang dung demo" : "Chon trong demo"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lich su hoa don</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ma hoa don</TableHead>
                <TableHead>Ngay</TableHead>
                <TableHead className="text-right">So tien</TableHead>
                <TableHead>Trang thai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                  <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrencyFull(invoice.amount, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={invoice.status === "paid" ? "success" : invoice.status === "pending" ? "warning" : "neutral"}
                    >
                      {invoice.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Phuong thuc thanh toan
            </CardTitle>
            <Button variant="outline" size="sm" onClick={showDemoNotSavedToast}>
              Them method demo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billing.paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-muted text-xs font-bold uppercase">
                    {method.brand ?? "CARD"}
                  </div>
                  <div>
                    <p className="font-medium">**** **** **** {method.last4 ?? "----"}</p>
                    <p className="text-sm text-muted-foreground">
                      Het han: {method.expMonth ?? "--"}/{method.expYear ?? "----"}
                    </p>
                  </div>
                </div>
                <StatusBadge status="success">Demo saved</StatusBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAdminBilling;
