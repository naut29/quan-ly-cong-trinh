import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  FolderTree,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  Download,
  Filter,
  Building2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Mock WBS data with hierarchical structure
const mockWBSData = [
  {
    id: 'wbs-1',
    code: '1',
    name: 'Phần móng',
    level: 1,
    parent: null,
    progress: 85,
    status: 'in_progress',
    startDate: '2024-01-15',
    endDate: '2024-03-30',
    responsiblePerson: 'Nguyễn Văn A',
    children: [
      {
        id: 'wbs-1.1',
        code: '1.1',
        name: 'Đào đất móng',
        level: 2,
        parent: 'wbs-1',
        progress: 100,
        status: 'completed',
        startDate: '2024-01-15',
        endDate: '2024-02-10',
        responsiblePerson: 'Trần Văn B',
        children: [
          {
            id: 'wbs-1.1.1',
            code: '1.1.1',
            name: 'Đào đất bằng máy',
            level: 3,
            parent: 'wbs-1.1',
            progress: 100,
            status: 'completed',
            startDate: '2024-01-15',
            endDate: '2024-01-30',
            responsiblePerson: 'Lê Văn C',
            children: [],
          },
          {
            id: 'wbs-1.1.2',
            code: '1.1.2',
            name: 'Sửa thủ công hố móng',
            level: 3,
            parent: 'wbs-1.1',
            progress: 100,
            status: 'completed',
            startDate: '2024-01-25',
            endDate: '2024-02-10',
            responsiblePerson: 'Lê Văn C',
            children: [],
          },
        ],
      },
      {
        id: 'wbs-1.2',
        code: '1.2',
        name: 'Bê tông móng',
        level: 2,
        parent: 'wbs-1',
        progress: 75,
        status: 'in_progress',
        startDate: '2024-02-05',
        endDate: '2024-03-15',
        responsiblePerson: 'Trần Văn B',
        children: [
          {
            id: 'wbs-1.2.1',
            code: '1.2.1',
            name: 'Bê tông lót móng',
            level: 3,
            parent: 'wbs-1.2',
            progress: 100,
            status: 'completed',
            startDate: '2024-02-05',
            endDate: '2024-02-15',
            responsiblePerson: 'Phạm Văn D',
            children: [],
          },
          {
            id: 'wbs-1.2.2',
            code: '1.2.2',
            name: 'Cốt thép móng',
            level: 3,
            parent: 'wbs-1.2',
            progress: 80,
            status: 'in_progress',
            startDate: '2024-02-15',
            endDate: '2024-03-05',
            responsiblePerson: 'Phạm Văn D',
            children: [],
          },
          {
            id: 'wbs-1.2.3',
            code: '1.2.3',
            name: 'Đổ bê tông móng',
            level: 3,
            parent: 'wbs-1.2',
            progress: 45,
            status: 'in_progress',
            startDate: '2024-03-01',
            endDate: '2024-03-15',
            responsiblePerson: 'Phạm Văn D',
            children: [],
          },
        ],
      },
      {
        id: 'wbs-1.3',
        code: '1.3',
        name: 'Ép cọc',
        level: 2,
        parent: 'wbs-1',
        progress: 100,
        status: 'completed',
        startDate: '2024-01-20',
        endDate: '2024-02-20',
        responsiblePerson: 'Hoàng Văn E',
        children: [],
      },
    ],
  },
  {
    id: 'wbs-2',
    code: '2',
    name: 'Phần thân',
    level: 1,
    parent: null,
    progress: 35,
    status: 'in_progress',
    startDate: '2024-03-01',
    endDate: '2024-08-30',
    responsiblePerson: 'Nguyễn Văn A',
    children: [
      {
        id: 'wbs-2.1',
        code: '2.1',
        name: 'Kết cấu tầng 1',
        level: 2,
        parent: 'wbs-2',
        progress: 60,
        status: 'in_progress',
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        responsiblePerson: 'Trần Văn B',
        children: [
          {
            id: 'wbs-2.1.1',
            code: '2.1.1',
            name: 'Cột tầng 1',
            level: 3,
            parent: 'wbs-2.1',
            progress: 80,
            status: 'in_progress',
            startDate: '2024-03-01',
            endDate: '2024-03-25',
            responsiblePerson: 'Phạm Văn D',
            children: [],
          },
          {
            id: 'wbs-2.1.2',
            code: '2.1.2',
            name: 'Dầm sàn tầng 1',
            level: 3,
            parent: 'wbs-2.1',
            progress: 40,
            status: 'in_progress',
            startDate: '2024-03-20',
            endDate: '2024-04-30',
            responsiblePerson: 'Phạm Văn D',
            children: [],
          },
        ],
      },
      {
        id: 'wbs-2.2',
        code: '2.2',
        name: 'Kết cấu tầng 2',
        level: 2,
        parent: 'wbs-2',
        progress: 10,
        status: 'pending',
        startDate: '2024-04-15',
        endDate: '2024-06-15',
        responsiblePerson: 'Trần Văn B',
        children: [],
      },
    ],
  },
  {
    id: 'wbs-3',
    code: '3',
    name: 'Phần hoàn thiện',
    level: 1,
    parent: null,
    progress: 0,
    status: 'pending',
    startDate: '2024-07-01',
    endDate: '2024-12-30',
    responsiblePerson: 'Nguyễn Văn A',
    children: [
      {
        id: 'wbs-3.1',
        code: '3.1',
        name: 'Xây tường',
        level: 2,
        parent: 'wbs-3',
        progress: 0,
        status: 'pending',
        startDate: '2024-07-01',
        endDate: '2024-08-30',
        responsiblePerson: 'Hoàng Văn E',
        children: [],
      },
      {
        id: 'wbs-3.2',
        code: '3.2',
        name: 'Tô trát',
        level: 2,
        parent: 'wbs-3',
        progress: 0,
        status: 'pending',
        startDate: '2024-08-15',
        endDate: '2024-10-15',
        responsiblePerson: 'Hoàng Văn E',
        children: [],
      },
    ],
  },
];

interface WBSItem {
  id: string;
  code: string;
  name: string;
  level: number;
  parent: string | null;
  progress: number;
  status: string;
  startDate: string;
  endDate: string;
  responsiblePerson: string;
  children: WBSItem[];
}

interface WBSFormData {
  code: string;
  name: string;
  parentId: string;
  startDate: string;
  endDate: string;
  responsiblePerson: string;
  description: string;
}

const defaultFormData: WBSFormData = {
  code: '',
  name: '',
  parentId: '',
  startDate: '',
  endDate: '',
  responsiblePerson: '',
  description: '',
};

// Flatten WBS for counting
const flattenWBS = (items: WBSItem[]): WBSItem[] => {
  let result: WBSItem[] = [];
  items.forEach(item => {
    result.push(item);
    if (item.children.length > 0) {
      result = result.concat(flattenWBS(item.children));
    }
  });
  return result;
};

const WBS: React.FC = () => {
  const { id: projectId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>(['wbs-1', 'wbs-2', 'wbs-1.1', 'wbs-1.2', 'wbs-2.1']);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<WBSFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const allItems = flattenWBS(mockWBSData);
  
  // KPIs
  const totalItems = allItems.length;
  const completedItems = allItems.filter(item => item.status === 'completed').length;
  const inProgressItems = allItems.filter(item => item.status === 'in_progress').length;
  const overallProgress = Math.round(allItems.reduce((sum, item) => sum + item.progress, 0) / totalItems);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddItem = (parentId?: string) => {
    setFormData({ ...defaultFormData, parentId: parentId || '' });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: WBSItem) => {
    setFormData({
      code: item.code,
      name: item.name,
      parentId: item.parent || '',
      startDate: item.startDate,
      endDate: item.endDate,
      responsiblePerson: item.responsiblePerson,
      description: '',
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    toast({
      title: editingId ? 'Cập nhật thành công' : 'Thêm công việc thành công',
      description: `Công việc "${formData.name}" đã được ${editingId ? 'cập nhật' : 'thêm vào WBS'}.`,
    });
    setDialogOpen(false);
    setFormData(defaultFormData);
  };

  const handleExport = () => {
    const exportData = allItems.map(item => ({
      'Mã công việc': item.code,
      'Tên công việc': item.name,
      'Cấp': item.level,
      'Tiến độ (%)': item.progress,
      'Trạng thái': item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ thực hiện',
      'Ngày bắt đầu': item.startDate,
      'Ngày kết thúc': item.endDate,
      'Người phụ trách': item.responsiblePerson,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WBS');
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 35 }, { wch: 8 }, { wch: 12 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
    ];

    XLSX.writeFile(wb, `WBS_${projectId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất ${exportData.length} công việc ra file Excel.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <StatusBadge status="success" dot={false}><CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành</StatusBadge>;
      case 'in_progress':
        return <StatusBadge status="info" dot={false}><Clock className="h-3 w-3 mr-1" />Đang thực hiện</StatusBadge>;
      case 'pending':
        return <StatusBadge status="neutral" dot={false}><Clock className="h-3 w-3 mr-1" />Chờ thực hiện</StatusBadge>;
      case 'delayed':
        return <StatusBadge status="warning" dot={false}><AlertTriangle className="h-3 w-3 mr-1" />Chậm tiến độ</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const renderWBSItem = (item: WBSItem, depth: number = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children.length > 0;

    // Apply filters
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      // Only hide if all children also don't match
      const hasMatchingChild = flattenWBS(item.children).some(child => child.status === statusFilter);
      if (!hasMatchingChild) return null;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
      const hasMatchingChild = flattenWBS(item.children).some(
        child => child.code.toLowerCase().includes(query) || child.name.toLowerCase().includes(query)
      );
      if (!matches && !hasMatchingChild) return null;
    }

    return (
      <React.Fragment key={item.id}>
        <tr className="hover:bg-muted/50 transition-colors">
          <td className="py-3 px-4" style={{ paddingLeft: `${depth * 24 + 16}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <span className="w-5" />
              )}
              <span className="font-mono text-sm font-medium text-primary">{item.code}</span>
            </div>
          </td>
          <td className="py-3 px-4">
            <span className={depth === 0 ? 'font-semibold' : ''}>{item.name}</span>
          </td>
          <td className="py-3 px-4 text-center">
            <Badge variant="outline">Cấp {item.level}</Badge>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Progress value={item.progress} className="h-2 flex-1" />
              <span className="text-sm font-medium w-10 text-right">{item.progress}%</span>
            </div>
          </td>
          <td className="py-3 px-4 text-center">
            {getStatusBadge(item.status)}
          </td>
          <td className="py-3 px-4 text-sm text-muted-foreground">
            {item.startDate} → {item.endDate}
          </td>
          <td className="py-3 px-4 text-sm">
            {item.responsiblePerson}
          </td>
          <td className="py-3 px-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAddItem(item.id)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm công việc con
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditItem(item)} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Copy className="h-4 w-4" />
                  Nhân bản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
        {isExpanded && item.children.map(child => renderWBSItem(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Cấu trúc phân rã công việc (WBS)
            </h1>
            <p className="page-subtitle">Quản lý và theo dõi các hạng mục công việc theo cấu trúc phân cấp</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => handleAddItem()}>
              <Plus className="h-4 w-4" />
              Thêm công việc
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Tổng công việc"
          value={totalItems.toString()}
          subtitle="Trong WBS"
          variant="primary"
        />
        <KPICard
          title="Hoàn thành"
          value={completedItems.toString()}
          subtitle={`${Math.round(completedItems / totalItems * 100)}% công việc`}
          variant="success"
        />
        <KPICard
          title="Đang thực hiện"
          value={inProgressItems.toString()}
          subtitle="Cần theo dõi"
          variant="accent"
        />
        <KPICard
          title="Tiến độ chung"
          value={`${overallProgress}%`}
          subtitle="Trung bình các hạng mục"
        />
      </div>

      {/* Toolbar */}
      <div className="filter-bar rounded-xl bg-card">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="pending">Chờ thực hiện</SelectItem>
            <SelectItem value="delayed">Chậm tiến độ</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedItems(allItems.map(i => i.id))}
        >
          Mở rộng tất cả
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedItems([])}
        >
          Thu gọn tất cả
        </Button>
      </div>

      {/* WBS Tree Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-48">Mã công việc</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tên công việc</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground w-24">Cấp</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-40">Tiến độ</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground w-36">Trạng thái</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-44">Thời gian</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-36">Phụ trách</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockWBSData.map(item => renderWBSItem(item))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {editingId ? 'Sửa công việc' : 'Thêm công việc mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã công việc *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="VD: 1.2.3"
                />
              </div>
              <div className="space-y-2">
                <Label>Công việc cha</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn công việc cha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Cấp cao nhất --</SelectItem>
                    {allItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.code} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tên công việc *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên công việc"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Người phụ trách</Label>
              <Input
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                placeholder="Nhập tên người phụ trách"
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết công việc..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Cập nhật' : 'Thêm công việc'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WBS;
