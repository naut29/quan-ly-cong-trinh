import React, { useState } from 'react';
import { useProjectIdParam } from '@/lib/projectRoutes';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ChevronRight,
  BarChart3,
  CalendarDays,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { projects, projectStageLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Mock work items for progress tracking
interface WorkItem {
  id: string;
  code: string;
  name: string;
  zone: string;
  unit: string;
  plannedQty: number;
  actualQty: number;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  delayDays: number;
  delayReason?: string;
}

const mockWorkItems: WorkItem[] = [
  {
    id: 'wi-1',
    code: 'M-001',
    name: 'Đào đất móng Block A',
    zone: 'Block A',
    unit: 'm³',
    plannedQty: 1500,
    actualQty: 1500,
    plannedStart: '2024-01-15',
    plannedEnd: '2024-01-25',
    actualStart: '2024-01-15',
    actualEnd: '2024-01-24',
    progress: 100,
    status: 'completed',
    delayDays: -1,
  },
  {
    id: 'wi-2',
    code: 'M-002',
    name: 'Đổ bê tông móng M1-M10',
    zone: 'Block A',
    unit: 'm³',
    plannedQty: 850,
    actualQty: 850,
    plannedStart: '2024-01-26',
    plannedEnd: '2024-02-10',
    actualStart: '2024-01-27',
    actualEnd: '2024-02-12',
    progress: 100,
    status: 'completed',
    delayDays: 2,
    delayReason: 'Thời tiết mưa',
  },
  {
    id: 'wi-3',
    code: 'T-001',
    name: 'Cột tầng 1-5 Block A',
    zone: 'Block A',
    unit: 'm³',
    plannedQty: 420,
    actualQty: 420,
    plannedStart: '2024-02-15',
    plannedEnd: '2024-03-15',
    actualStart: '2024-02-17',
    actualEnd: '2024-03-18',
    progress: 100,
    status: 'completed',
    delayDays: 3,
    delayReason: 'Thiếu nhân công',
  },
  {
    id: 'wi-4',
    code: 'T-002',
    name: 'Sàn tầng 6-8 Block A',
    zone: 'Block A',
    unit: 'm³',
    plannedQty: 680,
    actualQty: 580,
    plannedStart: '2024-03-20',
    plannedEnd: '2024-04-20',
    actualStart: '2024-03-22',
    progress: 85,
    status: 'in_progress',
    delayDays: 5,
    delayReason: 'Chậm vật tư thép',
  },
  {
    id: 'wi-5',
    code: 'T-003',
    name: 'Cột tầng 6-10 Block A',
    zone: 'Block A',
    unit: 'm³',
    plannedQty: 380,
    actualQty: 190,
    plannedStart: '2024-04-15',
    plannedEnd: '2024-05-15',
    actualStart: '2024-04-18',
    progress: 50,
    status: 'in_progress',
    delayDays: 3,
    delayReason: 'Phụ thuộc công tác T-002',
  },
  {
    id: 'wi-6',
    code: 'T-004',
    name: 'Sàn tầng 9-12 Block A',
    zone: 'Block A',
    unit: 'm³',
    plannedQty: 720,
    actualQty: 0,
    plannedStart: '2024-05-01',
    plannedEnd: '2024-06-05',
    progress: 0,
    status: 'not_started',
    delayDays: 0,
  },
  {
    id: 'wi-7',
    code: 'M-003',
    name: 'Đào đất móng Block B',
    zone: 'Block B',
    unit: 'm³',
    plannedQty: 1200,
    actualQty: 960,
    plannedStart: '2024-02-01',
    plannedEnd: '2024-02-15',
    actualStart: '2024-02-05',
    progress: 80,
    status: 'delayed',
    delayDays: 8,
    delayReason: 'Gặp mạch nước ngầm',
  },
  {
    id: 'wi-8',
    code: 'HT-001',
    name: 'Hoàn thiện nội thất Block A tầng 1-3',
    zone: 'Block A',
    unit: 'm²',
    plannedQty: 2400,
    actualQty: 0,
    plannedStart: '2024-07-01',
    plannedEnd: '2024-08-15',
    progress: 0,
    status: 'not_started',
    delayDays: 0,
  },
];

// Mock delay items
interface DelayItem {
  id: string;
  workItemCode: string;
  workItemName: string;
  zone: string;
  delayDays: number;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  reportedDate: string;
  status: 'open' | 'resolved' | 'escalated';
}

const mockDelays: DelayItem[] = [
  {
    id: 'delay-1',
    workItemCode: 'M-003',
    workItemName: 'Đào đất móng Block B',
    zone: 'Block B',
    delayDays: 8,
    reason: 'Gặp mạch nước ngầm, cần xử lý thoát nước',
    impact: 'high',
    reportedDate: '2024-02-08',
    status: 'open',
  },
  {
    id: 'delay-2',
    workItemCode: 'T-002',
    workItemName: 'Sàn tầng 6-8 Block A',
    zone: 'Block A',
    delayDays: 5,
    reason: 'Chậm vật tư thép từ nhà cung cấp',
    impact: 'medium',
    reportedDate: '2024-03-25',
    status: 'open',
  },
  {
    id: 'delay-3',
    workItemCode: 'T-001',
    workItemName: 'Cột tầng 1-5 Block A',
    zone: 'Block A',
    delayDays: 3,
    reason: 'Thiếu nhân công do Tết',
    impact: 'low',
    reportedDate: '2024-02-20',
    status: 'resolved',
  },
  {
    id: 'delay-4',
    workItemCode: 'M-002',
    workItemName: 'Đổ bê tông móng M1-M10',
    zone: 'Block A',
    delayDays: 2,
    reason: 'Thời tiết mưa liên tục',
    impact: 'low',
    reportedDate: '2024-02-05',
    status: 'resolved',
  },
];

const Progress: React.FC = () => {
  const id = useProjectIdParam();
  const { hasPermission } = useAuth();
  
  const project = projects.find(p => p.id === id);
  const canEdit = hasPermission('progress', 'edit');

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [updateProgress, setUpdateProgress] = useState('');
  const [updateNote, setUpdateNote] = useState('');

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Không tìm thấy dự án</p>
      </div>
    );
  }

  // Filter work items
  const filteredItems = mockWorkItems.filter(item => {
    const matchesZone = selectedZone === 'all' || item.zone === selectedZone;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesStatus && matchesSearch;
  });

  // Calculate summary stats
  const totalItems = mockWorkItems.length;
  const completedItems = mockWorkItems.filter(i => i.status === 'completed').length;
  const inProgressItems = mockWorkItems.filter(i => i.status === 'in_progress').length;
  const delayedItems = mockWorkItems.filter(i => i.status === 'delayed').length;
  const totalDelayDays = mockWorkItems.reduce((sum, i) => sum + (i.delayDays > 0 ? i.delayDays : 0), 0);

  const statusLabels: Record<WorkItem['status'], string> = {
    not_started: 'Chưa bắt đầu',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    delayed: 'Chậm tiến độ',
  };

  const impactLabels: Record<DelayItem['impact'], string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
  };

  const handleUpdateProgress = (item: WorkItem) => {
    setSelectedWorkItem(item);
    setUpdateProgress(item.progress.toString());
    setUpdateNote('');
    setUpdateDialogOpen(true);
  };

  const handleSaveProgress = () => {
    // Mock save - in real app, this would update the backend
    console.log('Saving progress:', {
      workItem: selectedWorkItem?.id,
      progress: updateProgress,
      note: updateNote,
    });
    setUpdateDialogOpen(false);
    setSelectedWorkItem(null);
  };

  // Gantt chart time range (mock)
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Tiến độ dự án</h1>
            <p className="page-subtitle">{project.name} • {project.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Đồng bộ
            </Button>
            {canEdit && (
              <Button size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Cập nhật tiến độ
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
          <KPICard
            title="Tiến độ tổng thể"
            value={`${project.progress}%`}
            subtitle="Kế hoạch: 52%"
            icon={TrendingUp}
            variant={project.progress >= 52 ? 'success' : 'destructive'}
            change={project.progress - 52}
            changeLabel="so với kế hoạch"
          />
          <KPICard
            title="Công tác hoàn thành"
            value={`${completedItems}/${totalItems}`}
            subtitle={`${Math.round(completedItems / totalItems * 100)}%`}
            icon={CheckCircle2}
            variant="success"
          />
          <KPICard
            title="Đang thực hiện"
            value={inProgressItems.toString()}
            subtitle="công tác"
            icon={Play}
            variant="primary"
          />
          <KPICard
            title="Chậm tiến độ"
            value={delayedItems.toString()}
            subtitle="công tác"
            icon={AlertTriangle}
            variant={delayedItems > 0 ? 'destructive' : 'default'}
          />
          <KPICard
            title="Tổng ngày chậm"
            value={totalDelayDays.toString()}
            subtitle="ngày"
            icon={Clock}
            variant={totalDelayDays > 10 ? 'warning' : 'default'}
          />
        </div>

        {/* Plan vs Actual Progress Chart */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Tiến độ kế hoạch vs Thực tế</h3>
              <p className="text-sm text-muted-foreground">So sánh tiến độ theo tháng</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Kế hoạch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span>Thực tế</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Plan vs Actual Bar Chart Placeholder */}
            <div className="h-64 flex items-end justify-between gap-2">
              {[
                { month: 'T1', plan: 8, actual: 7 },
                { month: 'T2', plan: 18, actual: 16 },
                { month: 'T3', plan: 28, actual: 25 },
                { month: 'T4', plan: 38, actual: 34 },
                { month: 'T5', plan: 48, actual: 42 },
                { month: 'T6', plan: 58, actual: 48 },
                { month: 'T7', plan: 68, actual: null },
                { month: 'T8', plan: 78, actual: null },
                { month: 'T9', plan: 88, actual: null },
                { month: 'T10', plan: 95, actual: null },
                { month: 'T11', plan: 98, actual: null },
                { month: 'T12', plan: 100, actual: null },
              ].map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 h-52 items-end justify-center">
                    <div 
                      className="w-5 bg-primary/30 rounded-t transition-all"
                      style={{ height: `${data.plan * 2}px` }}
                      title={`Kế hoạch: ${data.plan}%`}
                    />
                    {data.actual !== null && (
                      <div 
                        className={cn(
                          "w-5 rounded-t transition-all",
                          data.actual >= data.plan ? "bg-success" : "bg-warning"
                        )}
                        style={{ height: `${data.actual * 2}px` }}
                        title={`Thực tế: ${data.actual}%`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="gantt" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gantt" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Gantt Chart
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Danh sách công tác
            </TabsTrigger>
            <TabsTrigger value="delays" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danh sách chậm tiến độ
            </TabsTrigger>
          </TabsList>

          {/* Gantt Chart Tab */}
          <TabsContent value="gantt" className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Biểu đồ Gantt</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Lọc
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  {/* Gantt Header - Months */}
                  <div className="flex border-b border-border">
                    <div className="w-64 shrink-0 p-3 border-r border-border bg-muted/50">
                      <span className="font-medium text-sm">Công tác</span>
                    </div>
                    <div className="flex-1 flex">
                      {months.map((month, index) => (
                        <div 
                          key={index} 
                          className="flex-1 p-3 text-center text-sm font-medium border-r border-border last:border-r-0 bg-muted/50"
                        >
                          {month}/2024
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gantt Rows */}
                  {mockWorkItems.slice(0, 8).map((item, index) => {
                    // Mock position calculation (simplified)
                    const startMonth = parseInt(item.plannedStart.split('-')[1]) - 1;
                    const endMonth = parseInt(item.plannedEnd.split('-')[1]) - 1;
                    const duration = endMonth - startMonth + 1;
                    const leftPercent = (startMonth / 12) * 100;
                    const widthPercent = (duration / 12) * 100;

                    return (
                      <div key={item.id} className="flex border-b border-border hover:bg-muted/30 transition-colors">
                        <div className="w-64 shrink-0 p-3 border-r border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{item.code}</span>
                            <span className="text-sm font-medium truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge 
                              status={
                                item.status === 'completed' ? 'success' :
                                item.status === 'delayed' ? 'danger' :
                                item.status === 'in_progress' ? 'warning' : 'neutral'
                              }
                            >
                              {item.progress}%
                            </StatusBadge>
                            <span className="text-xs text-muted-foreground">{item.zone}</span>
                          </div>
                        </div>
                        <div className="flex-1 relative py-3">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            {months.map((_, i) => (
                              <div key={i} className="flex-1 border-r border-border/50 last:border-r-0" />
                            ))}
                          </div>
                          {/* Planned bar */}
                          <div 
                            className="absolute h-5 rounded bg-primary/30 top-1/2 -translate-y-1/2"
                            style={{ 
                              left: `${leftPercent}%`, 
                              width: `${widthPercent}%`,
                              minWidth: '40px'
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground/70">
                              Kế hoạch
                            </div>
                          </div>
                          {/* Actual bar */}
                          {item.progress > 0 && (
                            <div 
                              className={cn(
                                "absolute h-5 rounded top-1/2 -translate-y-1/2 mt-3",
                                item.status === 'completed' ? 'bg-success' :
                                item.status === 'delayed' ? 'bg-destructive' : 'bg-warning'
                              )}
                              style={{ 
                                left: `${leftPercent}%`, 
                                width: `${widthPercent * (item.progress / 100)}%`,
                                minWidth: '40px'
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                Thực tế
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-border bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground">
                  Biểu đồ Gantt placeholder - Tích hợp thư viện Gantt để xem chi tiết đầy đủ
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Work Items List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Tìm kiếm công tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  <SelectItem value="Block A">Block A</SelectItem>
                  <SelectItem value="Block B">Block B</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="not_started">Chưa bắt đầu</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="delayed">Chậm tiến độ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Items Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Mã</TableHead>
                    <TableHead>Tên công tác</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead className="text-center">Khối lượng</TableHead>
                    <TableHead className="text-center">Tiến độ</TableHead>
                    <TableHead>Kế hoạch</TableHead>
                    <TableHead>Thực tế</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-center">Chậm</TableHead>
                    {canEdit && <TableHead className="w-20"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.code}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.zone}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{item.actualQty.toLocaleString()}</span>
                        <span className="text-muted-foreground">/{item.plannedQty.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={item.progress} className="h-2 w-20" />
                          <span className="text-sm font-medium w-10">{item.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{item.plannedStart}</div>
                        <div className="text-muted-foreground">{item.plannedEnd}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.actualStart ? (
                          <>
                            <div>{item.actualStart}</div>
                            <div className="text-muted-foreground">{item.actualEnd || '...'}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            item.status === 'completed' ? 'success' :
                            item.status === 'delayed' ? 'danger' :
                            item.status === 'in_progress' ? 'warning' : 'neutral'
                          }
                        >
                          {statusLabels[item.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.delayDays > 0 ? (
                          <span className="text-destructive font-medium">+{item.delayDays} ngày</span>
                        ) : item.delayDays < 0 ? (
                          <span className="text-success font-medium">{item.delayDays} ngày</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateProgress(item)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Delays Tab */}
          <TabsContent value="delays" className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Danh sách chậm tiến độ</h3>
                <p className="text-sm text-muted-foreground">Theo dõi và quản lý các công tác chậm tiến độ</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã công tác</TableHead>
                    <TableHead>Tên công tác</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead className="text-center">Số ngày chậm</TableHead>
                    <TableHead>Nguyên nhân</TableHead>
                    <TableHead>Mức độ ảnh hưởng</TableHead>
                    <TableHead>Ngày báo cáo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDelays.map((delay) => (
                    <TableRow key={delay.id}>
                      <TableCell className="font-mono text-xs">{delay.workItemCode}</TableCell>
                      <TableCell className="font-medium">{delay.workItemName}</TableCell>
                      <TableCell>{delay.zone}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-destructive font-bold">+{delay.delayDays}</span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{delay.reason}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            delay.impact === 'high' ? 'danger' :
                            delay.impact === 'medium' ? 'warning' : 'info'
                          }
                        >
                          {impactLabels[delay.impact]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-sm">{delay.reportedDate}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            delay.status === 'resolved' ? 'success' :
                            delay.status === 'escalated' ? 'danger' : 'warning'
                          }
                        >
                          {delay.status === 'resolved' ? 'Đã xử lý' :
                           delay.status === 'escalated' ? 'Leo thang' : 'Đang xử lý'}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật tiến độ</DialogTitle>
            <DialogDescription>
              {selectedWorkItem?.code} - {selectedWorkItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Tiến độ hoàn thành (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={updateProgress}
                onChange={(e) => setUpdateProgress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú về tiến độ công việc..."
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveProgress}>
              Lưu tiến độ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Progress;
