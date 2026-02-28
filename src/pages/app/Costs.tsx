import React, { useEffect, useMemo, useState } from 'react';
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
  Building2,
  User,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CostFormDialog, CostEntry } from '@/components/costs/CostFormDialog';
import { CostImportDialog, ImportedCostEntry } from '@/components/costs/CostImportDialog';
import CostExportDialog from '@/components/costs/CostExportDialog';
import { toast } from '@/hooks/use-toast';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompany } from '@/app/context/CompanyContext';
import { costsApi } from '@/lib/api/costs';
import type { ProjectModuleRecordRow } from '@/lib/api/projectModuleRecords';
import { formatCurrencyFull } from '@/lib/numberFormat';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

type CostCategory = CostEntry['category'];
type CostStatus = CostEntry['status'];

const formatCurrency = (value: number) => formatCurrencyFull(value);
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const categories = [
  { id: 'all', name: 'Tất cả', icon: Wallet },
  { id: 'labor', name: 'Nhân công', icon: User },
  { id: 'material', name: 'Vật tư', icon: Building2 },
  { id: 'equipment', name: 'Máy móc', icon: Building2 },
  { id: 'subcontractor', name: 'Thầu phụ', icon: FileText },
  { id: 'other', name: 'Chi phí khác', icon: Wallet },
] as const;

const LABELS: Record<CostCategory, string> = {
  labor: 'Nhân công',
  material: 'Vật tư',
  equipment: 'Máy móc',
  subcontractor: 'Thầu phụ',
  other: 'Khác',
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isCategory = (value: unknown): value is CostCategory =>
  value === 'labor' || value === 'material' || value === 'equipment' || value === 'subcontractor' || value === 'other';

const isStatus = (value: unknown): value is CostStatus =>
  value === 'pending' || value === 'committed' || value === 'in_progress' || value === 'paid';

const mapRecord = (row: ProjectModuleRecordRow): CostEntry => {
  const meta = row.metadata ?? {};
  return {
    id: row.id,
    date: String(meta.date ?? row.updated_at),
    code: String(meta.code ?? row.code ?? row.id.slice(0, 8).toUpperCase()),
    description: row.name,
    category: isCategory(meta.category) ? meta.category : 'other',
    vendor: String(meta.vendor ?? 'Chưa cập nhật'),
    boqItem: String(meta.boqItem ?? ''),
    budget: toNumber(meta.budget, row.amount),
    actual: toNumber(meta.actual, row.amount),
    committed: toNumber(meta.committed, row.amount),
    status: isStatus(row.status) ? row.status : 'pending',
    createdBy: String(meta.createdBy ?? 'System'),
    invoiceNumber: typeof meta.invoiceNumber === 'string' ? meta.invoiceNumber : undefined,
    paymentMethod:
      meta.paymentMethod === 'cash' || meta.paymentMethod === 'transfer' || meta.paymentMethod === 'credit' || meta.paymentMethod === 'other'
        ? meta.paymentMethod
        : undefined,
    notes: typeof meta.notes === 'string' ? meta.notes : undefined,
    attachments: Array.isArray(meta.attachments) ? meta.attachments.map((item) => String(item)) : undefined,
  };
};

const toPayload = (entry: CostEntry) => ({
  name: entry.description,
  code: entry.code,
  status: entry.status,
  amount: entry.actual || entry.committed || entry.budget,
  notes: entry.notes ?? '',
  metadata: {
    date: entry.date,
    code: entry.code,
    category: entry.category,
    vendor: entry.vendor,
    boqItem: entry.boqItem,
    budget: entry.budget,
    actual: entry.actual,
    committed: entry.committed,
    createdBy: entry.createdBy,
    invoiceNumber: entry.invoiceNumber ?? '',
    paymentMethod: entry.paymentMethod ?? '',
    notes: entry.notes ?? '',
    attachments: entry.attachments ?? [],
  },
});

const importToEntry = (entry: ImportedCostEntry): CostEntry => ({
  id: '',
  date: entry.date,
  code: entry.code,
  description: entry.description,
  category: isCategory(entry.category) ? entry.category : 'other',
  vendor: entry.vendor,
  boqItem: entry.boqItem ?? '',
  budget: entry.budget,
  actual: entry.actual,
  committed: entry.committed,
  status: isStatus(entry.status) ? entry.status : 'pending',
  createdBy: 'Import',
  invoiceNumber: entry.invoiceNumber,
  notes: entry.notes,
  attachments: [],
});

const Costs: React.FC = () => {
  const projectId = useProjectIdParam();
  const { companyId } = useCompany();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [costDialogMode, setCostDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCost, setSelectedCost] = useState<CostEntry | undefined>(undefined);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;
    if (!companyId || !projectId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    costsApi.list(companyId, projectId)
      .then((rows) => active && setEntries(rows.map(mapRecord)))
      .catch(() => active && setEntries([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [companyId, projectId]);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) || entry.code.toLowerCase().includes(searchQuery.toLowerCase()) || entry.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const metrics = useMemo(() => {
    const totalBudget = entries.reduce((sum, entry) => sum + entry.budget, 0);
    const totalActual = entries.reduce((sum, entry) => sum + entry.actual, 0);
    const totalCommitted = entries.reduce((sum, entry) => sum + entry.committed, 0);
    const totalForecast = Math.max(totalActual, totalCommitted);
    const grouped = categories.filter((item) => item.id !== 'all').map((item) => {
      const costEntries = entries.filter((entry) => entry.category === item.id);
      const budget = costEntries.reduce((sum, entry) => sum + entry.budget, 0);
      const actual = costEntries.reduce((sum, entry) => sum + entry.actual, 0);
      return { name: item.name, budget: budget / 1_000_000, actual: actual / 1_000_000 };
    });
    const monthly = new Map<string, { month: string; planned: number; actual: number }>();
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = monthly.get(key) ?? { month: `T${date.getMonth() + 1}`, planned: 0, actual: 0 };
      current.planned += entry.budget / 1_000_000;
      current.actual += entry.actual / 1_000_000;
      monthly.set(key, current);
    });
    const totalForShare = entries.reduce((sum, entry) => sum + Math.max(entry.actual, entry.committed, entry.budget), 0);
    const shares = categories.filter((item) => item.id !== 'all').map((item, index) => {
      const total = entries.filter((entry) => entry.category === item.id).reduce((sum, entry) => sum + Math.max(entry.actual, entry.committed, entry.budget), 0);
      return { name: item.name, value: totalForShare > 0 ? Math.round((total / totalForShare) * 100) : 0, color: COLORS[index] };
    }).filter((item) => item.value > 0);
    const overruns = [...entries]
      .map((entry) => ({ item: entry.description, category: LABELS[entry.category], variance: entry.actual - entry.budget, percent: entry.budget > 0 ? ((entry.actual - entry.budget) / entry.budget) * 100 : 0 }))
      .filter((entry) => entry.variance > 0)
      .sort((left, right) => right.variance - left.variance)
      .slice(0, 5);
    const burnRate = monthly.size > 0 ? Math.round([...monthly.values()].reduce((sum, item) => sum + item.actual * 1_000_000, 0) / monthly.size) : 0;
    return {
      totalBudget,
      totalActual,
      totalCommitted,
      totalForecast,
      burnRate,
      grouped,
      monthly: [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value),
      shares,
      overruns,
    };
  }, [entries]);

  const budgetVariance = metrics.totalBudget - metrics.totalForecast;
  const variancePercent = metrics.totalBudget > 0 ? ((budgetVariance / metrics.totalBudget) * 100).toFixed(1) : '0.0';

  const handleEdit = (entry: CostEntry) => {
    setCostDialogMode('edit');
    setSelectedCost(entry);
    setCostDialogOpen(true);
  };

  const handleSubmit = async (data: CostEntry) => {
    if (!companyId || !projectId) return;
    const nextEntry: CostEntry = { ...data, id: selectedCost?.id ?? '', createdBy: selectedCost?.createdBy ?? 'Bạn' };
    if (costDialogMode === 'create') {
      const created = await costsApi.create(companyId, projectId, toPayload(nextEntry));
      const mapped = mapRecord(created);
      setEntries((current) => [mapped, ...current]);
      toast({ title: 'Thêm chi phí thành công', description: `Chi phí ${mapped.code} đã được thêm vào hệ thống.` });
      return;
    }
    if (!selectedCost) return;
    const updated = await costsApi.update(selectedCost.id, toPayload(nextEntry));
    const mapped = mapRecord(updated);
    setEntries((current) => current.map((entry) => (entry.id === mapped.id ? mapped : entry)));
    toast({ title: 'Cập nhật thành công', description: `Chi phí ${mapped.code} đã được cập nhật.` });
  };

  const handleDelete = async (entry: CostEntry) => {
    await costsApi.remove(entry.id);
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    toast({ title: 'Đã xóa chi phí', description: `Chi phí ${entry.code} đã được xóa.` });
  };

  const handleImport = async (data: ImportedCostEntry[]) => {
    if (!companyId || !projectId || data.length === 0) return;
    const created = await Promise.all(data.map((entry) => costsApi.create(companyId, projectId, toPayload(importToEntry(entry)))));
    setEntries((current) => [...created.map(mapRecord), ...current]);
    toast({ title: 'Import thành công', description: `Đã import ${data.length} chi phí vào hệ thống.` });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') return <StatusBadge status="success">Đã thanh toán</StatusBadge>;
    if (status === 'pending') return <StatusBadge status="warning">Chờ duyệt</StatusBadge>;
    if (status === 'committed') return <StatusBadge status="info">Cam kết</StatusBadge>;
    if (status === 'in_progress') return <StatusBadge status="active">Đang thực hiện</StatusBadge>;
    return <StatusBadge status="neutral">{status}</StatusBadge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chi phí</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi chi phí dự án</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}><Upload className="h-4 w-4 mr-2" />Import</Button>
          <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button size="sm" onClick={() => { setCostDialogMode('create'); setSelectedCost(undefined); setCostDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Thêm chi phí</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <Button key={item.id} variant={activeCategory === item.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(item.id)} className="whitespace-nowrap">
            <item.icon className="h-4 w-4 mr-2" />
            {item.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Ngân sách" value={formatCurrency(metrics.totalBudget)} icon={Wallet} />
        <KPICard title="Thực tế" value={formatCurrency(metrics.totalActual)} subtitle={metrics.totalBudget > 0 ? `${((metrics.totalActual / metrics.totalBudget) * 100).toFixed(0)}% ngân sách` : '0% ngân sách'} icon={TrendingUp} />
        <KPICard title="Cam kết" value={formatCurrency(metrics.totalCommitted)} subtitle={metrics.totalBudget > 0 ? `${((metrics.totalCommitted / metrics.totalBudget) * 100).toFixed(0)}% ngân sách` : '0% ngân sách'} icon={FileText} variant="warning" />
        <KPICard title="Dự báo" value={formatCurrency(metrics.totalForecast)} change={parseFloat(variancePercent)} changeLabel={budgetVariance < 0 ? 'vượt ngân sách' : 'dưới ngân sách'} icon={budgetVariance < 0 ? TrendingDown : TrendingUp} variant={budgetVariance < 0 ? 'destructive' : 'success'} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Chi tiết chi phí</TabsTrigger>
          <TabsTrigger value="analysis">Phân tích</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
          <TabsTrigger value="overruns">Vượt chi</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm theo mã, mô tả, nhà cung cấp..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="committed">Cam kết</SelectItem>
                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>

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
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">Đang tải chi phí...</TableCell></TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">Chưa có dữ liệu chi phí.</TableCell></TableRow>
                ) : filteredEntries.map((entry) => {
                  const variance = entry.actual - entry.budget;
                  const percent = entry.budget > 0 ? ((variance / entry.budget) * 100).toFixed(1) : '0';
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">{new Date(entry.date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="font-medium">{entry.code}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell>{entry.vendor}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.boqItem}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.budget)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.actual)}</TableCell>
                      <TableCell className="text-right">{entry.actual > 0 && <span className={variance > 0 ? 'text-destructive' : 'text-green-600'}>{variance > 0 ? '+' : ''}{formatCurrency(variance)} ({percent}%)</span>}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(entry)}><Edit className="h-4 w-4 mr-2" />Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => void handleDelete(entry)}><Trash2 className="h-4 w-4 mr-2" />Xóa</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Ngân sách vs Thực tế theo loại</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.grouped} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `${value / 1000}tỷ`} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value: number) => [`${formatCurrency(value * 1_000_000)}`, '']} />
                      <Bar dataKey="budget" name="Ngân sách" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="actual" name="Thực tế" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Phân bổ chi phí theo loại</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.shares} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                        {metrics.shares.map((item, index) => <Cell key={`${item.name}-${index}`} fill={item.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Tỷ lệ']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Tốc độ tiêu thụ ngân sách</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div><p className="text-sm text-muted-foreground">Burn rate tháng hiện tại</p><p className="text-2xl font-bold">{formatCurrency(metrics.burnRate)}/tháng</p></div>
                <div><p className="text-sm text-muted-foreground">Ngân sách còn lại</p><p className="text-2xl font-bold">{formatCurrency(Math.max(0, metrics.totalBudget - metrics.totalActual))}</p></div>
                <div><p className="text-sm text-muted-foreground">Dự kiến hết ngân sách</p><p className="text-2xl font-bold">{metrics.burnRate > 0 ? `${Math.ceil(Math.max(0, metrics.totalBudget - metrics.totalActual) / metrics.burnRate)} tháng` : 'Chưa đủ dữ liệu'}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Xu hướng chi phí theo tháng</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value / 1000}tỷ`} />
                    <Tooltip formatter={(value: number) => [`${formatCurrency(value * 1_000_000)}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="planned" name="Kế hoạch" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
                    <Line type="monotone" dataKey="actual" name="Thực tế" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overruns" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Top hạng mục vượt chi</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.overruns.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">Chưa có hạng mục vượt chi.</div>
                ) : metrics.overruns.map((item, index) => (
                  <div key={`${item.item}-${index}`} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive font-semibold">{index + 1}</div>
                      <div><p className="font-medium">{item.item}</p><p className="text-sm text-muted-foreground">{item.category}</p></div>
                    </div>
                    <div className="text-right"><p className="font-medium text-destructive">+{formatCurrency(item.variance)}</p><p className="text-sm text-muted-foreground">+{item.percent.toFixed(1)}%</p></div>
                    <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CostFormDialog open={costDialogOpen} onOpenChange={setCostDialogOpen} mode={costDialogMode} initialData={selectedCost} onSubmit={(data) => void handleSubmit(data as CostEntry)} />
      <CostImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={(data) => void handleImport(data)} />
      <CostExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} data={entries} />
    </div>
  );
};

export default Costs;
