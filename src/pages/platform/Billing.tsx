import React, { useState } from 'react';
import { 
  Receipt, 
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/data/mockData';
import { getPlan } from '@/lib/plans/planCatalog';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Mock revenue data
const revenueData = [
  { month: 'T1', revenue: 25000000, newMrr: getPlan('enterprise').priceVnd, churn: getPlan('starter').priceVnd },
  { month: 'T2', revenue: 28000000, newMrr: getPlan('enterprise').priceVnd + getPlan('starter').priceVnd, churn: getPlan('starter').priceVnd },
  { month: 'T3', revenue: 32000000, newMrr: getPlan('enterprise').priceVnd + (getPlan('starter').priceVnd * 2), churn: getPlan('starter').priceVnd * 2 },
  { month: 'T4', revenue: 35000000, newMrr: getPlan('enterprise').priceVnd, churn: 0 },
  { month: 'T5', revenue: 38000000, newMrr: getPlan('enterprise').priceVnd + getPlan('starter').priceVnd, churn: getPlan('starter').priceVnd },
  { month: 'T6', revenue: 42000000, newMrr: getPlan('enterprise').priceVnd + getPlan('starter').priceVnd + getPlan('pro').priceVnd, churn: getPlan('starter').priceVnd * 2 },
];

const planDistribution = [
  { name: getPlan('starter').name, count: 15, revenue: getPlan('starter').priceVnd * 15 },
  { name: getPlan('pro').name, count: 25, revenue: getPlan('pro').priceVnd * 25 },
  { name: getPlan('enterprise').name, count: 10, revenue: getPlan('enterprise').priceVnd * 10 },
];

const recentTransactions = [
  {
    id: 'TXN-001',
    tenant: 'Công ty Xây dựng ABC',
    plan: getPlan('enterprise').name,
    amount: getPlan('enterprise').priceVnd,
    status: 'completed',
    date: '15/03/2024',
  },
  {
    id: 'TXN-002',
    tenant: 'Công ty TNHH Đầu tư XYZ',
    plan: getPlan('pro').name,
    amount: getPlan('pro').priceVnd,
    status: 'completed',
    date: '14/03/2024',
  },
  {
    id: 'TXN-003',
    tenant: 'Tập đoàn Xây dựng Miền Nam',
    plan: getPlan('enterprise').name,
    amount: getPlan('enterprise').priceVnd,
    status: 'pending',
    date: '13/03/2024',
  },
  {
    id: 'TXN-004',
    tenant: 'Công ty CP Xây dựng Đông Á',
    plan: getPlan('starter').name,
    amount: getPlan('starter').priceVnd,
    status: 'completed',
    date: '12/03/2024',
  },
  {
    id: 'TXN-005',
    tenant: 'Công ty TNHH Kiến trúc Xanh',
    plan: getPlan('pro').name,
    amount: getPlan('pro').priceVnd,
    status: 'failed',
    date: '11/03/2024',
  },
];

const PlatformBilling: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState('month');

  const totalMRR = planDistribution.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalTenants = 50;
  const avgRevenuePerTenant = totalMRR / totalTenants;
  const churnRate = 2.5;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <StatusBadge status="success">Hoàn thành</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Chờ xử lý</StatusBadge>;
      case 'failed':
        return <StatusBadge status="danger">Thất bại</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doanh thu Nền tảng</h1>
          <p className="text-muted-foreground">Theo dõi doanh thu và thanh toán trên toàn nền tảng</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kỳ báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMRR)}</p>
                <div className="flex items-center gap-1 text-success text-sm mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Công ty trả phí</p>
                <p className="text-2xl font-bold">{totalTenants}</p>
                <div className="flex items-center gap-1 text-success text-sm mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+5</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ARPU</p>
                <p className="text-2xl font-bold">{formatCurrency(avgRevenuePerTenant)}</p>
                <div className="flex items-center gap-1 text-success text-sm mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+3.2%</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{churnRate}%</p>
                <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                  <ArrowDownRight className="h-3 w-3" />
                  <span>-0.5%</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New MRR vs Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="newMrr" fill="hsl(var(--success))" name="New MRR" />
                  <Bar dataKey="churn" fill="hsl(var(--destructive))" name="Churn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố theo Gói dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{plan.name}</h4>
                  <StatusBadge status="neutral">{plan.count} công ty</StatusBadge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(plan.revenue)}</p>
                <p className="text-sm text-muted-foreground">
                  {((plan.revenue / totalMRR) * 100).toFixed(1)}% tổng MRR
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Giao dịch gần đây
            </CardTitle>
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã giao dịch</TableHead>
                <TableHead>Công ty</TableHead>
                <TableHead>Gói dịch vụ</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">{txn.id}</TableCell>
                  <TableCell>{txn.tenant}</TableCell>
                  <TableCell>
                    <StatusBadge status="neutral">{txn.plan}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                  <TableCell>{getStatusBadge(txn.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformBilling;
