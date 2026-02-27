import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  CreditCard,
  Download,
  FileText,
  Receipt,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompany } from '@/app/context/CompanyContext';
import {
  getSubscription,
  listInvoices,
  listPaymentMethods,
  savePaymentMethod,
  upsertSubscription,
  type InvoiceRow,
  type PaymentMethodRow,
  type SubscriptionRow,
} from '@/lib/api/billing';
import { getOrganizationStats } from '@/lib/api/company';
import { logActivity } from '@/lib/api/activity';
import { formatCurrencyFull, formatDate } from '@/lib/numberFormat';
import { toast } from '@/hooks/use-toast';

const planCatalog = [
  {
    code: 'starter',
    name: 'Starter',
    price: 990000,
    users: 10,
    projects: 10,
    storage: 30,
    features: ['10 thành viên', '10 dự án đang hoạt động', '30GB lưu trữ', 'Hỗ trợ email'],
  },
  {
    code: 'pro',
    name: 'Pro',
    price: 3000000,
    users: 50,
    projects: 50,
    storage: 300,
    features: ['50 thành viên', '50 dự án đang hoạt động', '300GB lưu trữ', 'Hỗ trợ ưu tiên'],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    price: 5000000,
    users: null,
    projects: null,
    storage: 500,
    features: ['Không giới hạn thành viên', 'Không giới hạn dự án', '500GB+ lưu trữ', 'SLA support'],
  },
];

const mapInvoiceStatus = (status: string) => {
  if (status === 'paid') return <StatusBadge status="success">Đã thanh toán</StatusBadge>;
  if (status === 'pending') return <StatusBadge status="warning">Chờ thanh toán</StatusBadge>;
  if (status === 'overdue') return <StatusBadge status="danger">Quá hạn</StatusBadge>;
  return <StatusBadge status="neutral">{status}</StatusBadge>;
};

const AdminBilling: React.FC = () => {
  const { companyId } = useCompany();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [stats, setStats] = useState({ membersCount: 0, projectsCount: 0 });

  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  const [newBrand, setNewBrand] = useState('visa');
  const [newLast4, setNewLast4] = useState('');
  const [newExpMonth, setNewExpMonth] = useState('12');
  const [newExpYear, setNewExpYear] = useState(String(new Date().getFullYear() + 1));
  const [savingMethod, setSavingMethod] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const loadData = async () => {
    if (!companyId) {
      setLoading(false);
      setError('Chưa có tổ chức.');
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

      setSubscription(sub);
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
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message ?? 'Failed to load billing data')
            : 'Failed to load billing data';
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
    () => planCatalog.find((plan) => plan.code === (subscription?.plan ?? 'starter')) ?? planCatalog[0],
    [subscription?.plan],
  );

  const handleChangePlan = async (planCode: string) => {
    if (!companyId) return;
    setUpdatingPlan(planCode);

    try {
      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const next = await upsertSubscription(companyId, {
        plan: planCode,
        status: 'active',
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
      });

      await logActivity({
        orgId: companyId,
        module: 'billing',
        action: 'update',
        description: `Cập nhật gói dịch vụ -> ${planCode}`,
        status: 'success',
      });

      setSubscription(next);
      toast({ title: 'Cập nhật gói dịch vụ thành công' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật gói';
      toast({ title: 'Cập nhật gói thất bại', description: message, variant: 'destructive' });
    } finally {
      setUpdatingPlan(null);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (!companyId) return;
    if (newLast4.trim().length !== 4) {
      toast({ title: 'Last4 không hợp lệ', variant: 'destructive' });
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
        module: 'billing',
        action: 'create',
        description: `Thêm phương thức thanh toán ${newBrand.toUpperCase()} ****${newLast4}`,
        status: 'success',
      });

      toast({ title: 'Đã lưu phương thức thanh toán' });
      setPaymentDialogOpen(false);
      setNewLast4('');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu phương thức thanh toán';
      toast({ title: 'Lưu thất bại', description: message, variant: 'destructive' });
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
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thanh toán & Gói dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý gói dịch vụ và thanh toán của bạn </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Goi hien tai: {currentPlan.name}</CardTitle>
              <CardDescription>
                Chu ky: {formatDate(subscription?.current_period_start)} - {formatDate(subscription?.current_period_end)}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{formatCurrencyFull(currentPlan.price)}</p>
              <p className="text-sm text-muted-foreground">/thang</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Người dùng
                </span>
                <span className="font-medium">
                  {stats.membersCount} / {currentPlan.users ?? 'Không giới hạn'}
                </span>
              </div>
              <Progress
                value={currentPlan.users ? Math.min(100, (stats.membersCount / currentPlan.users) * 100) : 20}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Dự án
                </span>
                <span className="font-medium">
                  {stats.projectsCount} / {currentPlan.projects ?? 'Không giới hạn'}
                </span>
              </div>
              <Progress
                value={currentPlan.projects ? Math.min(100, (stats.projectsCount / currentPlan.projects) * 100) : 30}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Trang thai
                </span>
                <StatusBadge status={subscription?.status === 'active' ? 'success' : 'warning'}>
                  {subscription?.status ?? 'unknown'}
                </StatusBadge>
              </div>
              <Progress value={subscription?.status === 'active' ? 100 : 40} className="h-2" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Tính năng bao gồm:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {currentPlan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success shrink-0" />
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
          {planCatalog.map((plan) => (
            <Card key={plan.code} className={plan.code === currentPlan.code ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.code === currentPlan.code && <StatusBadge status="success">Hien tai</StatusBadge>}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatCurrencyFull(plan.price)}</span>
                  <span className="text-muted-foreground">/thang</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p>{plan.users ? `${plan.users} người dùng` : 'Người dùng không giới hạn'}</p>
                  <p>{plan.projects ? `${plan.projects} dự án` : 'Dự án không giới hạn'}</p>
                  <p>{plan.storage} GB lưu trữ</p>
                </div>
                <Button
                  variant={plan.code === currentPlan.code ? 'secondary' : 'default'}
                  className="w-full"
                  disabled={plan.code === currentPlan.code || updatingPlan === plan.code}
                  onClick={() => handleChangePlan(plan.code)}
                >
                  {plan.code === currentPlan.code
                    ? 'Goi hien tai'
                    : updatingPlan === plan.code
                      ? 'Đang cập nhật...'
                      : 'Chọn gói này'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Lich su hoa don
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Xuất tất cả
            </Button>
          </div>
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
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Chưa có hóa đơn trong thanh toán.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                    <TableCell>{formatDate(invoice.issued_at)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyFull(Number(invoice.amount ?? 0), invoice.currency ?? 'VND')}
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
                <Button variant="outline" size="sm">Thêm phương thức</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm phương thức thanh toán (stub)</DialogTitle>
                  <DialogDescription>
                    Chưa kết nối hình thức thanh toán nào. Form này vẫn lưu vào để quản lý metadata.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="visa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last4</Label>
                      <Input value={newLast4} onChange={(e) => setNewLast4(e.target.value)} placeholder="4242" maxLength={4} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Exp month</Label>
                      <Input value={newExpMonth} onChange={(e) => setNewExpMonth(e.target.value)} placeholder="12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Exp year</Label>
                      <Input value={newExpYear} onChange={(e) => setNewExpYear(e.target.value)} placeholder="2030" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={savingMethod}>
                    Huy
                  </Button>
                  <Button onClick={handleSavePaymentMethod} disabled={savingMethod}>
                    {savingMethod ? 'Đang lưu...' : 'Lưu'}
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
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-foreground font-bold text-xs uppercase">
                      {method.brand ?? 'CARD'}
                    </div>
                    <div>
                      <p className="font-medium">**** **** **** {method.last4 ?? '----'}</p>
                      <p className="text-sm text-muted-foreground">
                        Het han: {method.exp_month ?? '--'}/{method.exp_year ?? '----'}
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
