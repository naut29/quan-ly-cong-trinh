import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Download, 
  Check, 
  Calendar,
  Users,
  HardDrive,
  Zap,
  ArrowUpRight,
  FileText,
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
import { formatCurrency } from '@/data/mockData';

// Mock billing data
const currentPlan = {
  name: 'Enterprise',
  price: 4990000,
  period: 'tháng',
  users: 50,
  storage: 100,
  projects: -1, // unlimited
  features: [
    'Quản lý dự án không giới hạn',
    'Người dùng tối đa 50',
    'Lưu trữ 100GB',
    'Báo cáo nâng cao',
    'API access',
    'Hỗ trợ 24/7',
    'Sao lưu tự động',
    'SSO / SAML',
  ],
};

const usage = {
  users: { current: 24, limit: 50 },
  storage: { current: 45.5, limit: 100 },
  projects: { current: 12, limit: -1 },
};

const invoices = [
  {
    id: 'INV-2024-003',
    date: '01/03/2024',
    amount: 4990000,
    status: 'paid',
    description: 'Gói Enterprise - Tháng 3/2024',
  },
  {
    id: 'INV-2024-002',
    date: '01/02/2024',
    amount: 4990000,
    status: 'paid',
    description: 'Gói Enterprise - Tháng 2/2024',
  },
  {
    id: 'INV-2024-001',
    date: '01/01/2024',
    amount: 4990000,
    status: 'paid',
    description: 'Gói Enterprise - Tháng 1/2024',
  },
  {
    id: 'INV-2023-012',
    date: '01/12/2023',
    amount: 2990000,
    status: 'paid',
    description: 'Gói Professional - Tháng 12/2023',
  },
];

const plans = [
  {
    name: 'Starter',
    price: 990000,
    users: 5,
    storage: 10,
    projects: 3,
    popular: false,
  },
  {
    name: 'Professional',
    price: 2990000,
    users: 20,
    storage: 50,
    projects: 10,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 4990000,
    users: 50,
    storage: 100,
    projects: -1,
    popular: false,
  },
];

const AdminBilling: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <StatusBadge status="success">Đã thanh toán</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Chờ thanh toán</StatusBadge>;
      case 'overdue':
        return <StatusBadge status="danger">Quá hạn</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thanh toán & Gói dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý gói dịch vụ và thanh toán của bạn</p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Gói hiện tại: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                Gia hạn tiếp theo: 01/04/2024
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(currentPlan.price)}
              </p>
              <p className="text-sm text-muted-foreground">/{currentPlan.period}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Người dùng
                </span>
                <span className="font-medium">
                  {usage.users.current} / {usage.users.limit}
                </span>
              </div>
              <Progress value={(usage.users.current / usage.users.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  Lưu trữ
                </span>
                <span className="font-medium">
                  {usage.storage.current} GB / {usage.storage.limit} GB
                </span>
              </div>
              <Progress value={(usage.storage.current / usage.storage.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Dự án
                </span>
                <span className="font-medium">
                  {usage.projects.current} / Không giới hạn
                </span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h4 className="font-medium mb-3">Tính năng bao gồm:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Nâng cấp gói
            </Button>
            <Button variant="outline">
              Quản lý thanh toán
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Comparison */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Các gói dịch vụ</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.name === currentPlan.name ? 'border-primary' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && (
                    <StatusBadge status="info">Phổ biến</StatusBadge>
                  )}
                  {plan.name === currentPlan.name && (
                    <StatusBadge status="success">Hiện tại</StatusBadge>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/tháng</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.users} người dùng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.storage} GB lưu trữ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {plan.projects === -1 ? 'Dự án không giới hạn' : `${plan.projects} dự án`}
                    </span>
                  </div>
                </div>
                <Button
                  variant={plan.name === currentPlan.name ? 'secondary' : 'default'}
                  className="w-full"
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? 'Gói hiện tại' : 'Chọn gói này'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Lịch sử hóa đơn
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
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
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Phương thức thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white font-bold text-xs">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Hết hạn: 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Cập nhật
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBilling;
