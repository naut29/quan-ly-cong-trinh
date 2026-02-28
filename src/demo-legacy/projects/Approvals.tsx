import React, { useState } from 'react';
import { useProjectIdParam } from '@/lib/projectRoutes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Package,
  Image,
  Send,
  Download,
  Upload,
  MessageSquare,
  Paperclip,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Lock,
} from 'lucide-react';

// Mock data for material approvals
const mockMaterialApprovals = [
  {
    id: 'ma-001',
    code: 'MAT-2024-001',
    title: 'Phê duyệt mẫu gạch ốp lát tầng 1',
    category: 'Vật liệu hoàn thiện',
    supplier: 'Công ty TNHH Gạch Đồng Tâm',
    submitDate: '2024-01-10',
    dueDate: '2024-01-17',
    status: 'pending',
    priority: 'high',
    submittedBy: 'Nguyễn Văn A',
    attachments: 3,
    comments: 2,
    materials: [
      { name: 'Gạch lát nền 60x60 - Marble White', qty: '500 m²', spec: 'Độ hút nước < 0.5%' },
      { name: 'Gạch ốp tường 30x60 - Marble Gray', qty: '200 m²', spec: 'Độ hút nước < 0.5%' },
    ],
  },
  {
    id: 'ma-002',
    code: 'MAT-2024-002',
    title: 'Phê duyệt mẫu sơn nội thất',
    category: 'Sơn & Phủ',
    supplier: 'Công ty CP Sơn Jotun',
    submitDate: '2024-01-08',
    dueDate: '2024-01-15',
    status: 'approved',
    priority: 'medium',
    submittedBy: 'Trần Văn B',
    approvedBy: 'Chủ đầu tư - Ông Lê Văn C',
    approvedDate: '2024-01-12',
    attachments: 5,
    comments: 4,
    materials: [
      { name: 'Sơn lót nội thất Jotun Essence', qty: '50 thùng', spec: 'Màu trắng' },
      { name: 'Sơn phủ nội thất Jotun Majestic', qty: '80 thùng', spec: 'Màu kem nhạt - Mã 1024' },
    ],
  },
  {
    id: 'ma-003',
    code: 'MAT-2024-003',
    title: 'Phê duyệt cửa nhôm hệ Xingfa',
    category: 'Cửa & Vách',
    supplier: 'Công ty CP Nhôm Xingfa',
    submitDate: '2024-01-05',
    dueDate: '2024-01-12',
    status: 'rejected',
    priority: 'high',
    submittedBy: 'Phạm Văn D',
    rejectedBy: 'Chủ đầu tư - Ông Lê Văn C',
    rejectedDate: '2024-01-10',
    rejectReason: 'Mẫu kính không đạt yêu cầu về độ dày. Yêu cầu kính 12mm thay vì 10mm.',
    attachments: 4,
    comments: 6,
    materials: [
      { name: 'Cửa sổ mở hất 1200x1400', qty: '24 bộ', spec: 'Nhôm Xingfa 55, kính 10mm' },
      { name: 'Cửa đi 2 cánh 1800x2200', qty: '8 bộ', spec: 'Nhôm Xingfa 93, kính 10mm' },
    ],
  },
  {
    id: 'ma-004',
    code: 'MAT-2024-004',
    title: 'Phê duyệt thiết bị vệ sinh TOTO',
    category: 'Thiết bị vệ sinh',
    supplier: 'TOTO Vietnam',
    submitDate: '2024-01-12',
    dueDate: '2024-01-19',
    status: 'pending',
    priority: 'medium',
    submittedBy: 'Nguyễn Văn A',
    attachments: 2,
    comments: 1,
    materials: [
      { name: 'Bồn cầu TOTO CS761DT3', qty: '12 bộ', spec: 'Màu trắng, 2 chế độ xả' },
      { name: 'Lavabo TOTO LW991A', qty: '12 bộ', spec: 'Âm bàn, màu trắng' },
    ],
  },
];

// Mock data for drawing approvals
const mockDrawingApprovals = [
  {
    id: 'da-001',
    code: 'DWG-2024-001',
    title: 'Bản vẽ kiến trúc tầng 1 - Phiên bản 03',
    category: 'Kiến trúc',
    discipline: 'Architectural',
    version: 'Rev.03',
    submitDate: '2024-01-11',
    dueDate: '2024-01-18',
    status: 'pending',
    priority: 'high',
    submittedBy: 'KTS. Nguyễn Thị E',
    attachments: 8,
    comments: 3,
    drawings: [
      { code: 'AR-T1-01', name: 'Mặt bằng tầng 1', format: 'A1' },
      { code: 'AR-T1-02', name: 'Mặt cắt A-A, B-B', format: 'A1' },
      { code: 'AR-T1-03', name: 'Chi tiết cầu thang', format: 'A2' },
    ],
  },
  {
    id: 'da-002',
    code: 'DWG-2024-002',
    title: 'Bản vẽ kết cấu móng - Phiên bản 02',
    category: 'Kết cấu',
    discipline: 'Structural',
    version: 'Rev.02',
    submitDate: '2024-01-09',
    dueDate: '2024-01-16',
    status: 'approved',
    priority: 'high',
    submittedBy: 'KS. Trần Văn F',
    approvedBy: 'Chủ đầu tư - Ông Lê Văn C',
    approvedDate: '2024-01-14',
    attachments: 12,
    comments: 5,
    drawings: [
      { code: 'ST-M-01', name: 'Mặt bằng bố trí móng', format: 'A0' },
      { code: 'ST-M-02', name: 'Chi tiết móng M1, M2', format: 'A1' },
      { code: 'ST-M-03', name: 'Thống kê thép móng', format: 'A3' },
    ],
  },
  {
    id: 'da-003',
    code: 'DWG-2024-003',
    title: 'Bản vẽ M&E tầng hầm',
    category: 'M&E',
    discipline: 'MEP',
    version: 'Rev.01',
    submitDate: '2024-01-13',
    dueDate: '2024-01-20',
    status: 'in_review',
    priority: 'medium',
    submittedBy: 'KS. Hoàng Văn G',
    reviewer: 'Tư vấn giám sát',
    attachments: 6,
    comments: 2,
    drawings: [
      { code: 'ME-H-01', name: 'Hệ thống điện tầng hầm', format: 'A1' },
      { code: 'ME-H-02', name: 'Hệ thống PCCC tầng hầm', format: 'A1' },
      { code: 'ME-H-03', name: 'Hệ thống thoát nước', format: 'A2' },
    ],
  },
];

interface ApprovalFormData {
  title: string;
  category: string;
  supplier: string;
  dueDate: string;
  priority: string;
  description: string;
  attachments: File[];
}

const defaultFormData: ApprovalFormData = {
  title: '',
  category: '',
  supplier: '',
  dueDate: '',
  priority: 'medium',
  description: '',
  attachments: [],
};

const Approvals: React.FC = () => {
  const projectId = useProjectIdParam();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<ApprovalFormData>(defaultFormData);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  // Permission checks
  const canView = hasPermission('approvals', 'view');
  const canEdit = hasPermission('approvals', 'edit');
  const canApprove = hasPermission('approvals', 'approve');

  // KPIs
  const materialStats = {
    total: mockMaterialApprovals.length,
    pending: mockMaterialApprovals.filter(m => m.status === 'pending').length,
    approved: mockMaterialApprovals.filter(m => m.status === 'approved').length,
    rejected: mockMaterialApprovals.filter(m => m.status === 'rejected').length,
  };

  const drawingStats = {
    total: mockDrawingApprovals.length,
    pending: mockDrawingApprovals.filter(d => d.status === 'pending' || d.status === 'in_review').length,
    approved: mockDrawingApprovals.filter(d => d.status === 'approved').length,
    rejected: mockDrawingApprovals.filter(d => d.status === 'rejected').length,
  };

  const stats = activeTab === 'materials' ? materialStats : drawingStats;

  const handleViewDetail = (item: any) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
  };

  const handleSubmitApproval = () => {
    toast({
      title: approvalAction === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối',
      description: `Yêu cầu ${selectedItem?.code} đã được ${approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'}.`,
    });
    setApprovalAction(null);
    setApprovalComment('');
    setDetailDialogOpen(false);
  };

  const handleSubmitRequest = () => {
    toast({
      title: 'Đã gửi yêu cầu phê duyệt',
      description: `Yêu cầu "${formData.title}" đã được gửi đến Chủ đầu tư.`,
    });
    setDialogOpen(false);
    setFormData(defaultFormData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <StatusBadge status="success" dot={false}><CheckCircle2 className="h-3 w-3 mr-1" />Đã duyệt</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="danger" dot={false}><XCircle className="h-3 w-3 mr-1" />Từ chối</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning" dot={false}><Clock className="h-3 w-3 mr-1" />Chờ duyệt</StatusBadge>;
      case 'in_review':
        return <StatusBadge status="info" dot={false}><Eye className="h-3 w-3 mr-1" />Đang xem xét</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Cao</Badge>;
      case 'medium':
        return <Badge variant="secondary">Trung bình</Badge>;
      case 'low':
        return <Badge variant="outline">Thấp</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filterItems = (items: any[]) => {
    return items.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return item.code.toLowerCase().includes(query) || 
               item.title.toLowerCase().includes(query);
      }
      return true;
    });
  };

  const filteredMaterials = filterItems(mockMaterialApprovals);
  const filteredDrawings = filterItems(mockDrawingApprovals);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />
              Phê duyệt
            </h1>
            <p className="page-subtitle">Quản lý phê duyệt vật tư và bản vẽ với Chủ đầu tư</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit ? (
              <Button className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Tạo yêu cầu
              </Button>
            ) : (
              <Button className="gap-2" disabled variant="outline">
                <Lock className="h-4 w-4" />
                Tạo yêu cầu
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Permission Info Banner */}
      {!canApprove && canView && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted border border-border">
          <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Quyền hạn của bạn</p>
            <p className="text-muted-foreground mt-1">
              {canEdit 
                ? 'Bạn có thể xem và tạo yêu cầu phê duyệt. Chỉ Giám đốc/Chủ đầu tư mới có quyền phê duyệt hoặc từ chối.'
                : 'Bạn chỉ có quyền xem các yêu cầu phê duyệt. Liên hệ quản lý để được cấp quyền tạo yêu cầu.'}
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Tổng yêu cầu"
          value={stats.total.toString()}
          subtitle={activeTab === 'materials' ? 'Phê duyệt vật tư' : 'Phê duyệt bản vẽ'}
          variant="primary"
        />
        <KPICard
          title="Chờ phê duyệt"
          value={stats.pending.toString()}
          subtitle="Cần xử lý"
          variant="warning"
        />
        <KPICard
          title="Đã duyệt"
          value={stats.approved.toString()}
          subtitle={`${Math.round(stats.approved / stats.total * 100)}% tổng số`}
          variant="success"
        />
        <KPICard
          title="Từ chối"
          value={stats.rejected.toString()}
          subtitle="Cần chỉnh sửa"
          variant="destructive"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="materials" className="gap-2">
              <Package className="h-4 w-4" />
              Vật tư ({mockMaterialApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="drawings" className="gap-2">
              <Image className="h-4 w-4" />
              Bản vẽ ({mockDrawingApprovals.length})
            </TabsTrigger>
          </TabsList>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="in_review">Đang xem xét</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Material Approvals Tab */}
        <TabsContent value="materials">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mã yêu cầu</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tiêu đề</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nhà cung cấp</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Ưu tiên</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hạn duyệt</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không có yêu cầu phê duyệt nào
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium text-primary">{item.code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{item.supplier}</td>
                      <td className="py-3 px-4 text-center">{getPriorityBadge(item.priority)}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(item.status)}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.dueDate}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleViewDetail(item)} className="gap-2">
                              <Eye className="h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" />
                              Tải đính kèm
                            </DropdownMenuItem>
                            {item.status === 'pending' && canApprove && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-success" onClick={() => {
                                  handleViewDetail(item);
                                  handleApprovalAction('approve');
                                }}>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Phê duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => {
                                  handleViewDetail(item);
                                  handleApprovalAction('reject');
                                }}>
                                  <XCircle className="h-4 w-4" />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Drawing Approvals Tab */}
        <TabsContent value="drawings">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mã yêu cầu</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tiêu đề</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bộ môn</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Phiên bản</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hạn duyệt</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDrawings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không có yêu cầu phê duyệt nào
                    </td>
                  </tr>
                ) : (
                  filteredDrawings.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium text-primary">{item.code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{item.discipline}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline">{item.version}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(item.status)}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.dueDate}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleViewDetail(item)} className="gap-2">
                              <Eye className="h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" />
                              Tải bản vẽ
                            </DropdownMenuItem>
                            {(item.status === 'pending' || item.status === 'in_review') && canApprove && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-success" onClick={() => {
                                  handleViewDetail(item);
                                  handleApprovalAction('approve');
                                }}>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Phê duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => {
                                  handleViewDetail(item);
                                  handleApprovalAction('reject');
                                }}>
                                  <XCircle className="h-4 w-4" />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeTab === 'materials' ? <Package className="h-5 w-5" /> : <Image className="h-5 w-5" />}
              Chi tiết yêu cầu phê duyệt
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-primary font-medium">{selectedItem.code}</p>
                  <h3 className="text-lg font-semibold mt-1">{selectedItem.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedItem.priority)}
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Người gửi:</span>
                  <span className="font-medium">{selectedItem.submittedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ngày gửi:</span>
                  <span className="font-medium">{selectedItem.submitDate}</span>
                </div>
                {activeTab === 'materials' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">NCC:</span>
                    <span className="font-medium">{selectedItem.supplier}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Hạn duyệt:</span>
                  <span className="font-medium">{selectedItem.dueDate}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-medium mb-3">
                  {activeTab === 'materials' ? 'Danh sách vật tư' : 'Danh sách bản vẽ'}
                </h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {activeTab === 'materials' ? (
                          <>
                            <th className="text-left py-2 px-3 font-medium">Tên vật tư</th>
                            <th className="text-left py-2 px-3 font-medium">Khối lượng</th>
                            <th className="text-left py-2 px-3 font-medium">Quy cách</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left py-2 px-3 font-medium">Mã bản vẽ</th>
                            <th className="text-left py-2 px-3 font-medium">Tên bản vẽ</th>
                            <th className="text-left py-2 px-3 font-medium">Khổ giấy</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(activeTab === 'materials' ? selectedItem.materials : selectedItem.drawings)?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          {activeTab === 'materials' ? (
                            <>
                              <td className="py-2 px-3">{item.name}</td>
                              <td className="py-2 px-3">{item.qty}</td>
                              <td className="py-2 px-3 text-muted-foreground">{item.spec}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-3 font-mono text-primary">{item.code}</td>
                              <td className="py-2 px-3">{item.name}</td>
                              <td className="py-2 px-3">{item.format}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attachments */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  {selectedItem.attachments} tệp đính kèm
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  {selectedItem.comments} bình luận
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedItem.status === 'rejected' && selectedItem.rejectReason && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Lý do từ chối</p>
                      <p className="text-sm mt-1">{selectedItem.rejectReason}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Từ chối bởi: {selectedItem.rejectedBy} - {selectedItem.rejectedDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {selectedItem.status === 'approved' && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-success">Đã phê duyệt</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Phê duyệt bởi: {selectedItem.approvedBy} - {selectedItem.approvedDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Actions */}
              {/* Approval Actions */}
              {(selectedItem.status === 'pending' || selectedItem.status === 'in_review') && (
                <div className="space-y-4">
                  {canApprove ? (
                    approvalAction ? (
                      <div className="space-y-3">
                        <Label>
                          {approvalAction === 'approve' ? 'Ghi chú phê duyệt' : 'Lý do từ chối'} *
                        </Label>
                        <Textarea
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          placeholder={approvalAction === 'approve' 
                            ? 'Nhập ghi chú (tùy chọn)...' 
                            : 'Nhập lý do từ chối...'}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                            onClick={handleSubmitApproval}
                            disabled={approvalAction === 'reject' && !approvalComment}
                          >
                            {approvalAction === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                          </Button>
                          <Button variant="outline" onClick={() => setApprovalAction(null)}>
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button className="gap-2 flex-1" onClick={() => handleApprovalAction('approve')}>
                          <CheckCircle2 className="h-4 w-4" />
                          Phê duyệt
                        </Button>
                        <Button variant="destructive" className="gap-2 flex-1" onClick={() => handleApprovalAction('reject')}>
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Bạn không có quyền phê duyệt hoặc từ chối yêu cầu này.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Tạo yêu cầu phê duyệt
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Loại yêu cầu *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Phê duyệt vật tư</SelectItem>
                  <SelectItem value="drawing">Phê duyệt bản vẽ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Phê duyệt mẫu gạch ốp lát tầng 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hạng mục</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hạng mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finishing">Vật liệu hoàn thiện</SelectItem>
                    <SelectItem value="structure">Kết cấu</SelectItem>
                    <SelectItem value="mep">M&E</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hạn phê duyệt</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết yêu cầu phê duyệt..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tệp đính kèm</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Kéo thả hoặc nhấn để tải lên tài liệu, hình ảnh mẫu vật tư
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitRequest} className="gap-2">
              <Send className="h-4 w-4" />
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
