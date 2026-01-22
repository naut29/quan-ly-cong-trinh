import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar,
  Package,
  TrendingDown,
  TrendingUp,
  Wallet,
  Users,
  Filter,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Mail,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

// Mock data for reports
const materialUsageData = [
  { id: 1, code: 'VT001', name: 'Xi măng PCB40', unit: 'Tấn', planned: 150, actual: 168, variance: 18, variancePercent: 12, cost: 2520000000 },
  { id: 2, code: 'VT002', name: 'Thép Ø10', unit: 'Tấn', planned: 80, actual: 75, variance: -5, variancePercent: -6.25, cost: 1125000000 },
  { id: 3, code: 'VT003', name: 'Cát vàng', unit: 'm³', planned: 500, actual: 520, variance: 20, variancePercent: 4, cost: 260000000 },
  { id: 4, code: 'VT004', name: 'Đá 1x2', unit: 'm³', planned: 300, actual: 290, variance: -10, variancePercent: -3.33, cost: 145000000 },
  { id: 5, code: 'VT005', name: 'Gạch xây', unit: 'Viên', planned: 50000, actual: 55000, variance: 5000, variancePercent: 10, cost: 110000000 },
];

const normVarianceData = [
  { id: 1, workItem: 'Đổ bê tông móng', normCode: 'DM-BT-01', planned: 0.25, actual: 0.28, variance: 0.03, unit: 'm³/m²', status: 'over' },
  { id: 2, workItem: 'Xây tường gạch', normCode: 'DM-XT-01', planned: 550, actual: 520, variance: -30, unit: 'viên/m³', status: 'under' },
  { id: 3, workItem: 'Trát tường trong', normCode: 'DM-TT-01', planned: 0.015, actual: 0.018, variance: 0.003, unit: 'm³/m²', status: 'over' },
  { id: 4, workItem: 'Lát gạch nền', normCode: 'DM-LG-01', planned: 1.05, actual: 1.03, variance: -0.02, unit: 'm²/m²', status: 'under' },
  { id: 5, workItem: 'Sơn tường', normCode: 'DM-ST-01', planned: 0.35, actual: 0.38, variance: 0.03, unit: 'kg/m²', status: 'over' },
];

const budgetOverrunData = [
  { id: 1, category: 'Nhân công', budget: 5000000000, actual: 5250000000, variance: 250000000, percent: 5 },
  { id: 2, category: 'Vật tư', budget: 15000000000, actual: 16200000000, variance: 1200000000, percent: 8 },
  { id: 3, category: 'Máy móc', budget: 3000000000, actual: 2850000000, variance: -150000000, percent: -5 },
  { id: 4, category: 'Thầu phụ', budget: 8000000000, actual: 8400000000, variance: 400000000, percent: 5 },
  { id: 5, category: 'Chi phí khác', budget: 2000000000, actual: 2100000000, variance: 100000000, percent: 5 },
];

const cashFlowData = [
  { month: 'T1', inflow: 5000, outflow: 4200, balance: 800 },
  { month: 'T2', inflow: 3500, outflow: 4800, balance: -500 },
  { month: 'T3', inflow: 6200, outflow: 5100, balance: 600 },
  { month: 'T4', inflow: 4800, outflow: 4500, balance: -100 },
  { month: 'T5', inflow: 7500, outflow: 6200, balance: 1200 },
  { month: 'T6', inflow: 5200, outflow: 5800, balance: -600 },
  { month: 'T7', inflow: 8000, outflow: 6500, balance: 900 },
  { month: 'T8', inflow: 6500, outflow: 7200, balance: -200 },
];

const receivablesData = [
  { id: 1, partner: 'Chủ đầu tư ABC', type: 'receivable', amount: 5200000000, dueDate: '2024-02-15', daysOverdue: 10, status: 'overdue' },
  { id: 2, partner: 'Công ty XYZ', type: 'receivable', amount: 3800000000, dueDate: '2024-03-01', daysOverdue: 0, status: 'pending' },
  { id: 3, partner: 'NCC Thép Việt', type: 'payable', amount: 1500000000, dueDate: '2024-02-20', daysOverdue: 5, status: 'overdue' },
  { id: 4, partner: 'NCC Xi măng', type: 'payable', amount: 800000000, dueDate: '2024-02-28', daysOverdue: 0, status: 'pending' },
  { id: 5, partner: 'Thầu phụ Minh Anh', type: 'payable', amount: 2200000000, dueDate: '2024-03-10', daysOverdue: 0, status: 'scheduled' },
];

const budgetChartData = [
  { name: 'Nhân công', budget: 5000, actual: 5250 },
  { name: 'Vật tư', budget: 15000, actual: 16200 },
  { name: 'Máy móc', budget: 3000, actual: 2850 },
  { name: 'Thầu phụ', budget: 8000, actual: 8400 },
  { name: 'Khác', budget: 2000, actual: 2100 },
];

const categoryDistribution = [
  { name: 'Vật tư', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Nhân công', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Thầu phụ', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Máy móc', value: 7, color: 'hsl(var(--chart-4))' },
  { name: 'Khác', value: 3, color: 'hsl(var(--chart-5))' },
];

const Reports: React.FC = () => {
  const { id: projectId } = useParams();
  const [activeTab, setActiveTab] = useState('materials');
  const [dateRange, setDateRange] = useState('month');

  // Calculate totals
  const totalMaterialVariance = materialUsageData.reduce((sum, m) => sum + (m.variance > 0 ? m.cost * (m.variancePercent / 100) : 0), 0);
  const overNormCount = normVarianceData.filter(n => n.status === 'over').length;
  const totalBudgetOverrun = budgetOverrunData.reduce((sum, b) => sum + (b.variance > 0 ? b.variance : 0), 0);
  const totalReceivables = receivablesData.filter(r => r.type === 'receivable').reduce((sum, r) => sum + r.amount, 0);
  const totalPayables = receivablesData.filter(r => r.type === 'payable').reduce((sum, r) => sum + r.amount, 0);
  const overdueReceivables = receivablesData.filter(r => r.status === 'overdue' && r.type === 'receivable').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
          <p className="text-muted-foreground">Các mẫu báo cáo và phân tích dự án</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Mail className="h-4 w-4" />
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="materials" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Vật tư</span>
          </TabsTrigger>
          <TabsTrigger value="norms" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Định mức</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ngân sách</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Dòng tiền</span>
          </TabsTrigger>
          <TabsTrigger value="receivables" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Công nợ</span>
          </TabsTrigger>
        </TabsList>

        {/* Materials Report */}
        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Tổng vật tư sử dụng"
              value={formatCurrency(4160000000)}
              icon={Package}
              subtitle="Trong kỳ báo cáo"
            />
            <KPICard
              title="Chênh lệch vượt"
              value={formatCurrency(totalMaterialVariance)}
              icon={TrendingUp}
              variant="destructive"
              change={8.5}
              changeLabel="so với định mức"
            />
            <KPICard
              title="Số loại vật tư vượt"
              value="3/5"
              icon={Package}
              variant="warning"
              subtitle="Cần kiểm tra"
            />
            <KPICard
              title="Tồn kho hiện tại"
              value={formatCurrency(850000000)}
              icon={Package}
              subtitle="Giá trị"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Báo cáo sử dụng vật tư
              </CardTitle>
              <CardDescription>So sánh kế hoạch và thực tế sử dụng vật tư</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã VT</TableHead>
                    <TableHead>Tên vật tư</TableHead>
                    <TableHead>ĐVT</TableHead>
                    <TableHead className="text-right">Kế hoạch</TableHead>
                    <TableHead className="text-right">Thực tế</TableHead>
                    <TableHead className="text-right">Chênh lệch</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right">Giá trị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialUsageData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{item.planned.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.actual.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.variance > 0 ? 'text-destructive' : 'text-success'}>
                          {item.variance > 0 ? '+' : ''}{item.variance.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={item.variancePercent > 5 ? 'danger' : item.variancePercent > 0 ? 'warning' : 'success'}>
                          {item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Norms Variance Report */}
        <TabsContent value="norms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Tổng hạng mục"
              value="42"
              icon={FileText}
              subtitle="Đã kiểm tra định mức"
            />
            <KPICard
              title="Vượt định mức"
              value={`${overNormCount}/5`}
              icon={TrendingUp}
              variant="destructive"
              subtitle="Hạng mục cần xem xét"
            />
            <KPICard
              title="Tiết kiệm"
              value={`${normVarianceData.filter(n => n.status === 'under').length}`}
              icon={TrendingDown}
              variant="success"
              subtitle="Hạng mục dưới định mức"
            />
            <KPICard
              title="Chi phí phát sinh"
              value={formatCurrency(320000000)}
              icon={Wallet}
              variant="warning"
              subtitle="Do vượt định mức"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Báo cáo chênh lệch định mức
              </CardTitle>
              <CardDescription>So sánh định mức kế hoạch và thực tế thi công</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã định mức</TableHead>
                    <TableHead>Hạng mục công việc</TableHead>
                    <TableHead>ĐVT</TableHead>
                    <TableHead className="text-right">Định mức KH</TableHead>
                    <TableHead className="text-right">Thực tế</TableHead>
                    <TableHead className="text-right">Chênh lệch</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {normVarianceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.normCode}</TableCell>
                      <TableCell>{item.workItem}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{item.planned}</TableCell>
                      <TableCell className="text-right">{item.actual}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.status === 'over' ? 'text-destructive' : 'text-success'}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status === 'over' ? 'danger' : 'success'}>
                          {item.status === 'over' ? 'Vượt ĐM' : 'Tiết kiệm'}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Overrun Report */}
        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Tổng ngân sách"
              value={formatCurrency(33000000000)}
              icon={Wallet}
              subtitle="Dự toán ban đầu"
            />
            <KPICard
              title="Chi phí thực tế"
              value={formatCurrency(34800000000)}
              icon={TrendingUp}
              variant="warning"
              subtitle="Đã chi"
            />
            <KPICard
              title="Vượt ngân sách"
              value={formatCurrency(totalBudgetOverrun)}
              icon={TrendingUp}
              variant="destructive"
              change={5.45}
              changeLabel="so với dự toán"
            />
            <KPICard
              title="Dự báo hoàn thành"
              value={formatCurrency(36500000000)}
              icon={BarChart3}
              variant="warning"
              subtitle="Ước tính"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>So sánh ngân sách theo hạng mục</CardTitle>
                <CardDescription>Đơn vị: triệu đồng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value * 1000000)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="budget" name="Dự toán" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="actual" name="Thực tế" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân bổ chi phí</CardTitle>
                <CardDescription>Theo danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết vượt ngân sách</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hạng mục</TableHead>
                    <TableHead className="text-right">Dự toán</TableHead>
                    <TableHead className="text-right">Thực tế</TableHead>
                    <TableHead className="text-right">Chênh lệch</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead>Tiến độ chi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetOverrunData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.budget)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.actual)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.variance > 0 ? 'text-destructive' : 'text-success'}>
                          {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={item.percent > 5 ? 'danger' : item.percent > 0 ? 'warning' : 'success'}>
                          {item.percent > 0 ? '+' : ''}{item.percent}%
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(item.actual / item.budget) * 100} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground">
                            {((item.actual / item.budget) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Report */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Tổng thu"
              value={formatCurrency(46700000000)}
              icon={ArrowUpRight}
              variant="success"
              subtitle="Trong kỳ"
            />
            <KPICard
              title="Tổng chi"
              value={formatCurrency(44300000000)}
              icon={ArrowDownRight}
              variant="warning"
              subtitle="Trong kỳ"
            />
            <KPICard
              title="Số dư hiện tại"
              value={formatCurrency(2400000000)}
              icon={Wallet}
              variant="success"
              subtitle="Còn lại"
            />
            <KPICard
              title="Dự báo thiếu hụt"
              value={formatCurrency(800000000)}
              icon={Clock}
              variant="destructive"
              subtitle="Tháng tới"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ dòng tiền</CardTitle>
              <CardDescription>Thu - Chi theo tháng (đơn vị: triệu đồng)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value * 1000000)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="inflow" 
                      name="Thu" 
                      stroke="hsl(var(--chart-1))" 
                      fillOpacity={1}
                      fill="url(#colorInflow)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outflow" 
                      name="Chi" 
                      stroke="hsl(var(--chart-2))" 
                      fillOpacity={1}
                      fill="url(#colorOutflow)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      name="Số dư" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <ArrowUpRight className="h-5 w-5" />
                  Dự kiến thu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Thanh toán đợt 5 - CĐT ABC', amount: 3500000000, date: '25/02/2024' },
                  { label: 'Thanh toán đợt 3 - CĐT XYZ', amount: 2200000000, date: '01/03/2024' },
                  { label: 'Tạm ứng dự án mới', amount: 5000000000, date: '15/03/2024' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="font-semibold text-success">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ArrowDownRight className="h-5 w-5" />
                  Dự kiến chi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Thanh toán NCC Thép', amount: 1500000000, date: '20/02/2024' },
                  { label: 'Lương công nhân T2', amount: 2800000000, date: '28/02/2024' },
                  { label: 'Thanh toán thầu phụ', amount: 2200000000, date: '05/03/2024' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="font-semibold text-destructive">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Receivables/Payables Report */}
        <TabsContent value="receivables" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Phải thu"
              value={formatCurrency(totalReceivables)}
              icon={ArrowUpRight}
              variant="primary"
              subtitle="Tổng công nợ"
            />
            <KPICard
              title="Quá hạn thu"
              value={formatCurrency(overdueReceivables)}
              icon={Clock}
              variant="destructive"
              subtitle="Cần thu hồi"
            />
            <KPICard
              title="Phải trả"
              value={formatCurrency(totalPayables)}
              icon={ArrowDownRight}
              variant="warning"
              subtitle="Tổng công nợ"
            />
            <KPICard
              title="Số dư ròng"
              value={formatCurrency(totalReceivables - totalPayables)}
              icon={Wallet}
              variant="success"
              subtitle="Phải thu - Phải trả"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-info" />
                  Công nợ phải thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Đối tác</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Hạn thanh toán</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivablesData.filter(r => r.type === 'receivable').map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.partner}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={
                            item.status === 'overdue' ? 'danger' : 
                            item.status === 'pending' ? 'warning' : 'info'
                          }>
                            {item.status === 'overdue' ? `Quá hạn ${item.daysOverdue} ngày` : 
                             item.status === 'pending' ? 'Chờ thanh toán' : 'Đã lên lịch'}
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
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-warning" />
                  Công nợ phải trả
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Đối tác</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Hạn thanh toán</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivablesData.filter(r => r.type === 'payable').map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.partner}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={
                            item.status === 'overdue' ? 'danger' : 
                            item.status === 'pending' ? 'warning' : 'info'
                          }>
                            {item.status === 'overdue' ? `Quá hạn ${item.daysOverdue} ngày` : 
                             item.status === 'pending' ? 'Chờ thanh toán' : 'Đã lên lịch'}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán công nợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '15/02/2024', partner: 'Chủ đầu tư ABC', type: 'Thu', amount: 2500000000, status: 'completed' },
                  { date: '10/02/2024', partner: 'NCC Xi măng Hà Tiên', type: 'Chi', amount: 450000000, status: 'completed' },
                  { date: '05/02/2024', partner: 'Thầu phụ Minh Anh', type: 'Chi', amount: 1200000000, status: 'completed' },
                  { date: '01/02/2024', partner: 'Công ty XYZ', type: 'Thu', amount: 1800000000, status: 'completed' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${item.type === 'Thu' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {item.type === 'Thu' ? 
                          <ArrowUpRight className="h-4 w-4 text-success" /> : 
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{item.partner}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${item.type === 'Thu' ? 'text-success' : 'text-destructive'}`}>
                        {item.type === 'Thu' ? '+' : '-'}{formatCurrency(item.amount)}
                      </p>
                      <StatusBadge status="success">Hoàn thành</StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
