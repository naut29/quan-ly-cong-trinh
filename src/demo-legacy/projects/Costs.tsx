import React, { useState } from 'react';
import { useProjectIdParam } from '@/lib/projectRoutes';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronRight,
  Calendar,
  Building2,
  User,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CostFormDialog, CostEntry } from '@/components/costs/CostFormDialog';
import { CostImportDialog, ImportedCostEntry } from '@/components/costs/CostImportDialog';
import CostExportDialog from '@/components/costs/CostExportDialog';
import { toast } from '@/hooks/use-toast';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

// Cost categories
const costCategories = [
  { id: 'all', name: 'Tất cả', icon: Wallet },
  { id: 'labor', name: 'Nhân công', icon: User },
  { id: 'material', name: 'Vật tư', icon: Building2 },
  { id: 'equipment', name: 'Máy móc', icon: Building2 },
  { id: 'subcontractor', name: 'Thầu phụ', icon: FileText },
  { id: 'other', name: 'Chi phí khác', icon: Wallet },
];

// Mock KPI data
const mockCostKPIs = {
  totalBudget: 156000000000,
  totalActual: 128000000000,
  totalCommitted: 148000000000,
  totalForecast: 158000000000,
  burnRate: 8500000000,
  costVariance: -2000000000,
};

// Mock cost entries
const mockCostEntries = [
  {
    id: 'cost-001',
    date: '2024-03-15',
    code: 'NC-001',
    description: 'Tiền lương công nhân tháng 3/2024',
    category: 'labor',
    vendor: 'Nội bộ',
    boqItem: 'WBS-01.02',
    budget: 250000000,
    actual: 265000000,
    committed: 265000000,
    status: 'paid',
    createdBy: 'Lê Thị Hương',
  },
  {
    id: 'cost-002',
    date: '2024-03-14',
    code: 'VT-015',
    description: 'Thép phi 16 - Block A',
    category: 'material',
    vendor: 'NCC Thép Việt',
    boqItem: 'WBS-02.03',
    budget: 1200000000,
    actual: 1350000000,
    committed: 1350000000,
    status: 'paid',
    createdBy: 'Phạm Văn Đức',
  },
  {
    id: 'cost-003',
    date: '2024-03-13',
    code: 'MM-005',
    description: 'Thuê cẩu tháp tháng 3/2024',
    category: 'equipment',
    vendor: 'Công ty Cẩu Sài Gòn',
    boqItem: 'WBS-01.01',
    budget: 180000000,
    actual: 175000000,
    committed: 180000000,
    status: 'pending',
    createdBy: 'Nguyễn Thị Mai',
  },
  {
    id: 'cost-004',
    date: '2024-03-12',
    code: 'TP-008',
    description: 'Công tác hoàn thiện Block B',
    category: 'subcontractor',
    vendor: 'Thầu phụ Minh Anh',
    boqItem: 'WBS-03.01',
    budget: 850000000,
    actual: 0,
    committed: 850000000,
    status: 'committed',
    createdBy: 'Trần Minh Quân',
  },
  {
    id: 'cost-005',
    date: '2024-03-11',
    code: 'VT-016',
    description: 'Xi măng PCB40 - Tầng 5',
    category: 'material',
    vendor: 'Xi măng Hà Tiên',
    boqItem: 'WBS-02.04',
    budget: 450000000,
    actual: 438000000,
    committed: 450000000,
    status: 'paid',
    createdBy: 'Phạm Văn Đức',
  },
  {
    id: 'cost-006',
    date: '2024-03-10',
    code: 'NC-002',
    description: 'Phụ cấp làm thêm giờ',
    category: 'labor',
    vendor: 'Nội bộ',
    boqItem: 'WBS-01.02',
    budget: 50000000,
    actual: 62000000,
    committed: 62000000,
    status: 'paid',
    createdBy: 'Lê Thị Hương',
  },
  {
    id: 'cost-007',
    date: '2024-03-09',
    code: 'KH-003',
    description: 'Phí bảo hiểm công trình',
    category: 'other',
    vendor: 'Bảo Việt',
    boqItem: 'WBS-00.01',
    budget: 120000000,
    actual: 120000000,
    committed: 120000000,
    status: 'paid',
    createdBy: 'Võ Văn Tài',
  },
  {
    id: 'cost-008',
    date: '2024-03-08',
    code: 'TP-009',
    description: 'Lắp đặt hệ thống điện',
    category: 'subcontractor',
    vendor: 'Điện lực Miền Nam',
    boqItem: 'WBS-04.02',
    budget: 680000000,
    actual: 340000000,
    committed: 680000000,
    status: 'in_progress',
    createdBy: 'Trần Minh Quân',
  },
];

// Budget vs Actual by category
const budgetVsActualData = [
  { name: 'Nhân công', budget: 5000, actual: 5250, variance: 250 },
  { name: 'Vật tư', budget: 15000, actual: 16200, variance: 1200 },
  { name: 'Máy móc', budget: 3000, actual: 2850, variance: -150 },
  { name: 'Thầu phụ', budget: 8000, actual: 8400, variance: 400 },
  { name: 'Khác', budget: 2000, actual: 2100, variance: 100 },
];

// Cost trend data (monthly)
const costTrendData = [
  { month: 'T1', planned: 12000, actual: 11500 },
  { month: 'T2', planned: 14000, actual: 14800 },
  { month: 'T3', planned: 16000, actual: 17200 },
  { month: 'T4', planned: 15000, actual: 15500 },
  { month: 'T5', planned: 18000, actual: 19200 },
  { month: 'T6', planned: 20000, actual: 21500 },
  { month: 'T7', planned: 22000, actual: 0 },
  { month: 'T8', planned: 24000, actual: 0 },
];

// Category distribution
const categoryDistribution = [
  { name: 'Vật tư', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Nhân công', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Thầu phụ', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Máy móc', value: 7, color: 'hsl(var(--chart-4))' },
  { name: 'Khác', value: 3, color: 'hsl(var(--chart-5))' },
];

// Top cost overruns
const topOverruns = [
  { item: 'Thép phi 16', category: 'Vật tư', variance: 150000000, percent: 12.5 },
  { item: 'Nhân công Block A', category: 'Nhân công', variance: 65000000, percent: 8.2 },
  { item: 'Xi măng PCB40', category: 'Vật tư', variance: 42000000, percent: 6.8 },
  { item: 'Thầu phụ điện', category: 'Thầu phụ', variance: 35000000, percent: 5.1 },
  { item: 'Phụ cấp làm thêm', category: 'Nhân công', variance: 12000000, percent: 24.0 },
];

const Costs: React.FC = () => {
  const id = useProjectIdParam();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [costDialogMode, setCostDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCost, setSelectedCost] = useState<CostEntry | undefined>(undefined);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleAddCost = () => {
    setCostDialogMode('create');
    setSelectedCost(undefined);
    setCostDialogOpen(true);
  };

  const handleEditCost = (entry: typeof mockCostEntries[0]) => {
    setCostDialogMode('edit');
    setSelectedCost({
      ...entry,
      category: entry.category as CostEntry['category'],
      status: entry.status as CostEntry['status'],
    });
    setCostDialogOpen(true);
  };

  const handleCostSubmit = (data: any) => {
    if (costDialogMode === 'create') {
      toast({
        title: 'Thêm chi phí thành công',
        description: `Chi phí ${data.code} đã được thêm vào hệ thống.`,
      });
    } else {
      toast({
        title: 'Cập nhật thành công',
        description: `Chi phí ${data.code} đã được cập nhật.`,
      });
    }
  };

  const handleImport = (data: ImportedCostEntry[]) => {
    toast({
      title: 'Import thành công',
      description: `Đã import ${data.length} chi phí vào hệ thống.`,
    });
  };

  // Filter cost entries
  const filteredEntries = mockCostEntries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <StatusBadge status="success">Đã thanh toán</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Chờ duyệt</StatusBadge>;
      case 'committed':
        return <StatusBadge status="info">Cam kết</StatusBadge>;
      case 'in_progress':
        return <StatusBadge status="active">Đang thực hiện</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  // Calculate variance
  const budgetVariance = mockCostKPIs.totalBudget - mockCostKPIs.totalForecast;
  const variancePercent = ((budgetVariance / mockCostKPIs.totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chi phí</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi chi phí dự án</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddCost}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm chi phí
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {costCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="whitespace-nowrap"
          >
            <cat.icon className="h-4 w-4 mr-2" />
            {cat.name}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ngân sách"
          value={formatCurrency(mockCostKPIs.totalBudget)}
          icon={Wallet}
          variant="default"
        />
        <KPICard
          title="Thực tế"
          value={formatCurrency(mockCostKPIs.totalActual)}
          subtitle={`${((mockCostKPIs.totalActual / mockCostKPIs.totalBudget) * 100).toFixed(0)}% ngân sách`}
          icon={TrendingUp}
          variant="default"
        />
        <KPICard
          title="Cam kết"
          value={formatCurrency(mockCostKPIs.totalCommitted)}
          subtitle={`${((mockCostKPIs.totalCommitted / mockCostKPIs.totalBudget) * 100).toFixed(0)}% ngân sách`}
          icon={FileText}
          variant="warning"
        />
        <KPICard
          title="Dự báo"
          value={formatCurrency(mockCostKPIs.totalForecast)}
          change={parseFloat(variancePercent)}
          changeLabel={budgetVariance < 0 ? 'vượt ngân sách' : 'dưới ngân sách'}
          icon={budgetVariance < 0 ? TrendingDown : TrendingUp}
          variant={budgetVariance < 0 ? 'destructive' : 'success'}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Chi tiết chi phí</TabsTrigger>
          <TabsTrigger value="analysis">Phân tích</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
          <TabsTrigger value="overruns">Vượt chi</TabsTrigger>
        </TabsList>

        {/* Cost Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã, mô tả, nhà cung cấp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="committed">Cam kết</SelectItem>
                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ngày</TableHead>
                  <TableHead className="w-[100px]">Mã</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Hạng mục</TableHead>
                  <TableHead className="text-right">Ngân sách</TableHead>
                  <TableHead className="text-right">Thực tế</TableHead>
                  <TableHead className="text-right">Chênh lệch</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const variance = entry.actual - entry.budget;
                  const variancePercent = entry.budget > 0 ? ((variance / entry.budget) * 100).toFixed(1) : 0;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="font-medium">{entry.code}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell>{entry.vendor}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.boqItem}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.budget)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.actual)}</TableCell>
                      <TableCell className="text-right">
                        {entry.actual > 0 && (
                          <span className={variance > 0 ? 'text-destructive' : 'text-green-600'}>
                            {variance > 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCost(entry)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Summary Footer */}
          <div className="flex justify-end">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between gap-8 text-sm">
                <span className="text-muted-foreground">Tổng ngân sách:</span>
                <span className="font-medium">{formatCurrency(filteredEntries.reduce((sum, e) => sum + e.budget, 0))}</span>
              </div>
              <div className="flex justify-between gap-8 text-sm">
                <span className="text-muted-foreground">Tổng thực tế:</span>
                <span className="font-medium">{formatCurrency(filteredEntries.reduce((sum, e) => sum + e.actual, 0))}</span>
              </div>
              <div className="flex justify-between gap-8 text-sm border-t pt-2">
                <span className="text-muted-foreground">Tổng chênh lệch:</span>
                <span className={`font-medium ${
                  filteredEntries.reduce((sum, e) => sum + (e.actual - e.budget), 0) > 0 
                    ? 'text-destructive' 
                    : 'text-green-600'
                }`}>
                  {formatCurrency(filteredEntries.reduce((sum, e) => sum + (e.actual - e.budget), 0))}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Budget vs Actual Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ngân sách vs Thực tế theo loại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetVsActualData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `${value / 1000}tỷ`} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip 
                        formatter={(value: number) => [`${formatCurrency(value * 1000000)}`, '']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="budget" name="Ngân sách" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="actual" name="Thực tế" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Phân bổ chi phí theo loại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Tỷ lệ']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Burn Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tốc độ tiêu thụ ngân sách</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Burn rate tháng hiện tại</p>
                  <p className="text-2xl font-bold">{formatCurrency(mockCostKPIs.burnRate)}/tháng</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ngân sách còn lại</p>
                  <p className="text-2xl font-bold">{formatCurrency(mockCostKPIs.totalBudget - mockCostKPIs.totalActual)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Dự kiến hết ngân sách</p>
                  <p className="text-2xl font-bold">
                    {Math.ceil((mockCostKPIs.totalBudget - mockCostKPIs.totalActual) / mockCostKPIs.burnRate)} tháng
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Xu hướng chi phí theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value / 1000}tỷ`} />
                    <Tooltip 
                      formatter={(value: number) => [`${formatCurrency(value * 1000000)}`, '']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="planned" 
                      name="Kế hoạch" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      name="Thực tế" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly comparison table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">So sánh chi phí theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead className="text-right">Kế hoạch</TableHead>
                    <TableHead className="text-right">Thực tế</TableHead>
                    <TableHead className="text-right">Chênh lệch</TableHead>
                    <TableHead className="text-right">Tỷ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costTrendData.filter(d => d.actual > 0).map((data) => {
                    const variance = data.actual - data.planned;
                    const percent = ((variance / data.planned) * 100).toFixed(1);
                    return (
                      <TableRow key={data.month}>
                        <TableCell className="font-medium">Tháng {data.month.replace('T', '')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.planned * 1000000)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.actual * 1000000)}</TableCell>
                        <TableCell className={`text-right ${variance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {variance > 0 ? '+' : ''}{formatCurrency(variance * 1000000)}
                        </TableCell>
                        <TableCell className={`text-right ${variance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {variance > 0 ? '+' : ''}{percent}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overruns Tab */}
        <TabsContent value="overruns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top hạng mục vượt chi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOverruns.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">+{formatCurrency(item.variance)}</p>
                      <p className="text-sm text-muted-foreground">+{item.percent}%</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Variance Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Tổng vượt chi</p>
                  <p className="text-3xl font-bold text-destructive">
                    +{formatCurrency(topOverruns.reduce((sum, item) => sum + item.variance, 0))}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Số hạng mục vượt chi</p>
                  <p className="text-3xl font-bold text-destructive">{topOverruns.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Tỷ lệ vượt chi trung bình</p>
                  <p className="text-3xl font-bold text-destructive">
                    +{(topOverruns.reduce((sum, item) => sum + item.percent, 0) / topOverruns.length).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cost Form Dialog */}
      <CostFormDialog
        open={costDialogOpen}
        onOpenChange={setCostDialogOpen}
        mode={costDialogMode}
        initialData={selectedCost}
        onSubmit={handleCostSubmit}
      />

      {/* Cost Import Dialog */}
      <CostImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />

      {/* Cost Export Dialog */}
      <CostExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={mockCostEntries}
      />
    </div>
  );
};

export default Costs;
