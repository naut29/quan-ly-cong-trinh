import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Wallet,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Plus,
  Filter,
  Search,
  Eye,
  Edit3,
  ChevronRight,
  Building2,
  Calendar,
  Banknote,
  FileCheck,
  ClipboardCheck,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { projects, formatCurrency, formatCurrencyFull } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Types
type PaymentStatus = 'missing_docs' | 'pending_acceptance' | 'pending_approval' | 'approved' | 'paid' | 'rejected';
type DossierType = 'contract' | 'acceptance' | 'payment_request' | 'payment';

interface Contract {
  id: string;
  code: string;
  vendor: string;
  vendorType: 'supplier' | 'subcontractor';
  description: string;
  value: number;
  paidAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'terminated';
}

interface PaymentDossier {
  id: string;
  code: string;
  contractId: string;
  contractCode: string;
  vendor: string;
  description: string;
  amount: number;
  status: PaymentStatus;
  type: DossierType;
  createdDate: string;
  dueDate?: string;
  approvedDate?: string;
  paidDate?: string;
  acceptanceCode?: string;
  paymentRequestCode?: string;
  notes?: string;
}

// Mock Contracts
const mockContracts: Contract[] = [
  {
    id: 'ct-1',
    code: 'HĐ-NCC-001',
    vendor: 'Công ty TNHH Thép Việt',
    vendorType: 'supplier',
    description: 'Cung cấp thép xây dựng',
    value: 15000000000,
    paidAmount: 8500000000,
    retentionPercent: 5,
    retentionAmount: 750000000,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active',
  },
  {
    id: 'ct-2',
    code: 'HĐ-NCC-002',
    vendor: 'Công ty CP Bê tông Hòa Phát',
    vendorType: 'supplier',
    description: 'Cung cấp bê tông thương phẩm',
    value: 22000000000,
    paidAmount: 14200000000,
    retentionPercent: 5,
    retentionAmount: 1100000000,
    startDate: '2024-01-20',
    endDate: '2024-12-31',
    status: 'active',
  },
  {
    id: 'ct-3',
    code: 'HĐ-TN-001',
    vendor: 'Công ty TNHH Xây dựng Phú Thịnh',
    vendorType: 'subcontractor',
    description: 'Thi công phần thô Block A',
    value: 45000000000,
    paidAmount: 28000000000,
    retentionPercent: 10,
    retentionAmount: 4500000000,
    startDate: '2024-02-01',
    endDate: '2025-06-30',
    status: 'active',
  },
  {
    id: 'ct-4',
    code: 'HĐ-TN-002',
    vendor: 'Công ty CP Điện lạnh Carrier',
    vendorType: 'subcontractor',
    description: 'Thi công hệ thống HVAC',
    value: 18000000000,
    paidAmount: 5400000000,
    retentionPercent: 10,
    retentionAmount: 1800000000,
    startDate: '2024-04-15',
    endDate: '2025-03-31',
    status: 'active',
  },
];

// Mock Payment Dossiers
const mockDossiers: PaymentDossier[] = [
  // Missing docs
  {
    id: 'pd-1',
    code: 'ĐNTT-2024-015',
    contractId: 'ct-1',
    contractCode: 'HĐ-NCC-001',
    vendor: 'Công ty TNHH Thép Việt',
    description: 'Thanh toán đợt 6 - Thép tầng 8-10',
    amount: 1200000000,
    status: 'missing_docs',
    type: 'payment_request',
    createdDate: '2024-03-18',
    dueDate: '2024-04-02',
    notes: 'Thiếu biên bản nghiệm thu, hóa đơn VAT',
  },
  // Pending acceptance
  {
    id: 'pd-2',
    code: 'NT-2024-022',
    contractId: 'ct-3',
    contractCode: 'HĐ-TN-001',
    vendor: 'Công ty TNHH Xây dựng Phú Thịnh',
    description: 'Nghiệm thu thi công sàn tầng 9',
    amount: 3500000000,
    status: 'pending_acceptance',
    type: 'acceptance',
    createdDate: '2024-03-15',
  },
  // Pending approval
  {
    id: 'pd-3',
    code: 'ĐNTT-2024-014',
    contractId: 'ct-2',
    contractCode: 'HĐ-NCC-002',
    vendor: 'Công ty CP Bê tông Hòa Phát',
    description: 'Thanh toán đợt 8 - Bê tông móng Block B',
    amount: 2800000000,
    status: 'pending_approval',
    type: 'payment_request',
    createdDate: '2024-03-12',
    dueDate: '2024-03-27',
    acceptanceCode: 'NT-2024-018',
  },
  {
    id: 'pd-4',
    code: 'ĐNTT-2024-013',
    contractId: 'ct-4',
    contractCode: 'HĐ-TN-002',
    vendor: 'Công ty CP Điện lạnh Carrier',
    description: 'Thanh toán đợt 2 - Lắp đặt HVAC tầng 1-3',
    amount: 1800000000,
    status: 'pending_approval',
    type: 'payment_request',
    createdDate: '2024-03-10',
    dueDate: '2024-03-25',
    acceptanceCode: 'NT-2024-016',
  },
  // Approved
  {
    id: 'pd-5',
    code: 'ĐNTT-2024-012',
    contractId: 'ct-1',
    contractCode: 'HĐ-NCC-001',
    vendor: 'Công ty TNHH Thép Việt',
    description: 'Thanh toán đợt 5 - Thép tầng 5-7',
    amount: 1500000000,
    status: 'approved',
    type: 'payment_request',
    createdDate: '2024-03-05',
    dueDate: '2024-03-20',
    approvedDate: '2024-03-15',
    acceptanceCode: 'NT-2024-014',
  },
  {
    id: 'pd-6',
    code: 'ĐNTT-2024-011',
    contractId: 'ct-3',
    contractCode: 'HĐ-TN-001',
    vendor: 'Công ty TNHH Xây dựng Phú Thịnh',
    description: 'Thanh toán đợt 4 - Thi công sàn tầng 6-8',
    amount: 4200000000,
    status: 'approved',
    type: 'payment_request',
    createdDate: '2024-03-01',
    dueDate: '2024-03-16',
    approvedDate: '2024-03-12',
    acceptanceCode: 'NT-2024-012',
  },
  // Paid
  {
    id: 'pd-7',
    code: 'TT-2024-008',
    contractId: 'ct-2',
    contractCode: 'HĐ-NCC-002',
    vendor: 'Công ty CP Bê tông Hòa Phát',
    description: 'Thanh toán đợt 7 - Bê tông cột tầng 8-10',
    amount: 1800000000,
    status: 'paid',
    type: 'payment',
    createdDate: '2024-02-20',
    paidDate: '2024-03-05',
    paymentRequestCode: 'ĐNTT-2024-008',
  },
  {
    id: 'pd-8',
    code: 'TT-2024-007',
    contractId: 'ct-1',
    contractCode: 'HĐ-NCC-001',
    vendor: 'Công ty TNHH Thép Việt',
    description: 'Thanh toán đợt 4 - Thép tầng 1-4',
    amount: 2200000000,
    status: 'paid',
    type: 'payment',
    createdDate: '2024-02-15',
    paidDate: '2024-02-28',
    paymentRequestCode: 'ĐNTT-2024-006',
  },
  {
    id: 'pd-9',
    code: 'TT-2024-006',
    contractId: 'ct-3',
    contractCode: 'HĐ-TN-001',
    vendor: 'Công ty TNHH Xây dựng Phú Thịnh',
    description: 'Thanh toán đợt 3 - Thi công cột tầng 5-8',
    amount: 5500000000,
    status: 'paid',
    type: 'payment',
    createdDate: '2024-02-10',
    paidDate: '2024-02-25',
    paymentRequestCode: 'ĐNTT-2024-005',
  },
];

// Status configuration
const statusConfig: Record<PaymentStatus, { label: string; status: 'danger' | 'warning' | 'info' | 'success' | 'neutral' | 'active' }> = {
  missing_docs: { label: 'Thiếu hồ sơ', status: 'danger' },
  pending_acceptance: { label: 'Chờ nghiệm thu', status: 'info' },
  pending_approval: { label: 'Chờ duyệt', status: 'warning' },
  approved: { label: 'Đã duyệt', status: 'active' },
  paid: { label: 'Đã thanh toán', status: 'success' },
  rejected: { label: 'Từ chối', status: 'danger' },
};

const Payments: React.FC = () => {
  const { id } = useParams();
  const { hasPermission } = useAuth();
  
  const project = projects.find(p => p.id === id);
  const canEdit = hasPermission('payments', 'edit');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<PaymentDossier | null>(null);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Không tìm thấy dự án</p>
      </div>
    );
  }

  // Calculate summary stats
  const totalContractValue = mockContracts.reduce((sum, c) => sum + c.value, 0);
  const totalPaid = mockContracts.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalRetention = mockContracts.reduce((sum, c) => sum + c.retentionAmount, 0);
  const pendingApprovalAmount = mockDossiers
    .filter(d => d.status === 'pending_approval')
    .reduce((sum, d) => sum + d.amount, 0);
  const approvedPendingPayment = mockDossiers
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);
  const missingDocsCount = mockDossiers.filter(d => d.status === 'missing_docs').length;

  // Filter dossiers
  const filteredDossiers = mockDossiers.filter(d => {
    const matchesSearch = searchQuery === '' || 
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    const matchesVendor = selectedVendor === 'all' || d.vendor === selectedVendor;
    return matchesSearch && matchesStatus && matchesVendor;
  });

  // Get unique vendors
  const vendors = [...new Set(mockDossiers.map(d => d.vendor))];

  const handleViewDetail = (dossier: PaymentDossier) => {
    setSelectedDossier(dossier);
    setDetailDialogOpen(true);
  };

  // Flow steps for visualization
  const flowSteps = [
    { icon: FileText, label: 'Hợp đồng', color: 'bg-primary' },
    { icon: ClipboardCheck, label: 'Nghiệm thu', color: 'bg-info' },
    { icon: FileCheck, label: 'Đề nghị TT', color: 'bg-warning' },
    { icon: CreditCard, label: 'Thanh toán', color: 'bg-success' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Thanh toán</h1>
            <p className="page-subtitle">{project.name} • {project.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            {canEdit && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tạo đề nghị thanh toán
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Flow Visualization */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Quy trình thanh toán</h3>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {flowSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white",
                    step.color
                  )}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {index < flowSteps.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-2">
                    <div className="h-0.5 w-full bg-border relative">
                      <ChevronRight className="h-5 w-5 absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
          <KPICard
            title="Tổng giá trị HĐ"
            value={formatCurrency(totalContractValue)}
            subtitle={`${mockContracts.length} hợp đồng`}
            icon={FileText}
            variant="primary"
          />
          <KPICard
            title="Đã thanh toán"
            value={formatCurrency(totalPaid)}
            subtitle={`${Math.round(totalPaid / totalContractValue * 100)}% giá trị HĐ`}
            icon={CheckCircle2}
            variant="success"
          />
          <KPICard
            title="Chờ duyệt"
            value={formatCurrency(pendingApprovalAmount)}
            subtitle={`${mockDossiers.filter(d => d.status === 'pending_approval').length} đề nghị`}
            icon={Clock}
            variant="warning"
          />
          <KPICard
            title="Đã duyệt - Chờ TT"
            value={formatCurrency(approvedPendingPayment)}
            subtitle={`${mockDossiers.filter(d => d.status === 'approved').length} đề nghị`}
            icon={Banknote}
          />
          <KPICard
            title="Giữ lại (Retention)"
            value={formatCurrency(totalRetention)}
            subtitle="Bảo hành"
            icon={Wallet}
          />
        </div>

        {/* Alert for missing docs */}
        {missingDocsCount > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-destructive">
                {missingDocsCount} đề nghị thanh toán đang thiếu hồ sơ
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng bổ sung hồ sơ để tiếp tục quy trình thanh toán
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              Xem chi tiết
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Chờ xử lý
              <span className="bg-warning/20 text-warning text-xs px-1.5 py-0.5 rounded-full">
                {mockDossiers.filter(d => ['missing_docs', 'pending_acceptance', 'pending_approval'].includes(d.status)).length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
            <TabsTrigger value="paid">Đã thanh toán</TabsTrigger>
            <TabsTrigger value="retention">Giữ lại (Retention)</TabsTrigger>
          </TabsList>

          {/* All Dossiers Tab */}
          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm mã, nhà cung cấp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="missing_docs">Thiếu hồ sơ</SelectItem>
                  <SelectItem value="pending_acceptance">Chờ nghiệm thu</SelectItem>
                  <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả NCC</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dossiers Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDossiers.map((dossier) => (
                    <TableRow key={dossier.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <span className="font-mono text-sm font-medium">{dossier.code}</span>
                          <p className="text-xs text-muted-foreground">{dossier.contractCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{dossier.vendor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-[250px] block">{dossier.description}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(dossier.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={statusConfig[dossier.status].status}>
                          {statusConfig[dossier.status].label}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-sm">{dossier.createdDate}</TableCell>
                      <TableCell className="text-sm">
                        {dossier.dueDate ? (
                          <span className={cn(
                            new Date(dossier.dueDate) < new Date() && dossier.status !== 'paid' && 'text-destructive font-medium'
                          )}>
                            {dossier.dueDate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(dossier)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {canEdit && dossier.status !== 'paid' && (
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            {canEdit && dossier.status === 'pending_approval' && (
                              <>
                                <DropdownMenuItem className="text-success">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Phê duyệt
                                </DropdownMenuItem>
                              </>
                            )}
                            {canEdit && dossier.status === 'approved' && (
                              <DropdownMenuItem className="text-primary">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Xác nhận thanh toán
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Missing Docs */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Thiếu hồ sơ</h3>
                      <p className="text-xs text-muted-foreground">
                        {mockDossiers.filter(d => d.status === 'missing_docs').length} đề nghị
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {mockDossiers.filter(d => d.status === 'missing_docs').map(dossier => (
                    <div key={dossier.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleViewDetail(dossier)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-medium">{dossier.code}</span>
                        <span className="text-sm font-medium">{formatCurrency(dossier.amount)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{dossier.vendor}</p>
                      {dossier.notes && (
                        <p className="text-xs text-destructive mt-1">{dossier.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Acceptance */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-info/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                      <ClipboardCheck className="h-4 w-4 text-info" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Chờ nghiệm thu</h3>
                      <p className="text-xs text-muted-foreground">
                        {mockDossiers.filter(d => d.status === 'pending_acceptance').length} đề nghị
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {mockDossiers.filter(d => d.status === 'pending_acceptance').map(dossier => (
                    <div key={dossier.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleViewDetail(dossier)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-medium">{dossier.code}</span>
                        <span className="text-sm font-medium">{formatCurrency(dossier.amount)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{dossier.vendor}</p>
                      <p className="text-xs text-muted-foreground mt-1">{dossier.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Approval */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-warning/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Chờ duyệt</h3>
                      <p className="text-xs text-muted-foreground">
                        {mockDossiers.filter(d => d.status === 'pending_approval').length} đề nghị
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {mockDossiers.filter(d => d.status === 'pending_approval').map(dossier => (
                    <div key={dossier.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleViewDetail(dossier)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-medium">{dossier.code}</span>
                        <span className="text-sm font-medium">{formatCurrency(dossier.amount)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{dossier.vendor}</p>
                      {dossier.dueDate && (
                        <p className={cn(
                          "text-xs mt-1",
                          new Date(dossier.dueDate) < new Date() ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          Hạn: {dossier.dueDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Đã duyệt - Chờ thanh toán</h3>
                <p className="text-sm text-muted-foreground">
                  Tổng: {formatCurrencyFull(approvedPendingPayment)}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã ĐNTT</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Ngày duyệt</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDossiers.filter(d => d.status === 'approved').map(dossier => (
                    <TableRow key={dossier.id}>
                      <TableCell className="font-mono text-sm">{dossier.code}</TableCell>
                      <TableCell>{dossier.vendor}</TableCell>
                      <TableCell>{dossier.description}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(dossier.amount)}</TableCell>
                      <TableCell>{dossier.approvedDate}</TableCell>
                      <TableCell>
                        {canEdit && (
                          <Button size="sm" variant="outline">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Thanh toán
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Paid Tab */}
          <TabsContent value="paid" className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Đã thanh toán</h3>
                <p className="text-sm text-muted-foreground">
                  Tổng: {formatCurrencyFull(mockDossiers.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0))}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã TT</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Ngày thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDossiers.filter(d => d.status === 'paid').map(dossier => (
                    <TableRow key={dossier.id}>
                      <TableCell className="font-mono text-sm">{dossier.code}</TableCell>
                      <TableCell>{dossier.vendor}</TableCell>
                      <TableCell>{dossier.description}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(dossier.amount)}</TableCell>
                      <TableCell>{dossier.paidDate}</TableCell>
                      <TableCell>
                        <StatusBadge status="success">Đã thanh toán</StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Giữ lại bảo hành (Retention)</h3>
                <p className="text-sm text-muted-foreground">
                  Tổng giữ lại: {formatCurrencyFull(totalRetention)}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Giá trị HĐ</TableHead>
                    <TableHead className="text-center">% Giữ lại</TableHead>
                    <TableHead className="text-right">Số tiền giữ lại</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockContracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">{contract.code}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{contract.vendor}</span>
                          <p className="text-xs text-muted-foreground">{contract.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(contract.value)}</TableCell>
                      <TableCell className="text-center">{contract.retentionPercent}%</TableCell>
                      <TableCell className="text-right font-medium text-warning">
                        {formatCurrency(contract.retentionAmount)}
                      </TableCell>
                      <TableCell>{contract.endDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status === 'active' ? 'warning' : 'success'}>
                          {contract.status === 'active' ? 'Đang giữ' : 'Đã trả'}
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedDossier?.code}</span>
              {selectedDossier && (
                <StatusBadge status={statusConfig[selectedDossier.status].status}>
                  {statusConfig[selectedDossier.status].label}
                </StatusBadge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDossier?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDossier && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
                  <p className="font-medium">{selectedDossier.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mã hợp đồng</p>
                  <p className="font-medium">{selectedDossier.contractCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số tiền</p>
                  <p className="font-medium text-lg">{formatCurrencyFull(selectedDossier.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{selectedDossier.createdDate}</p>
                </div>
                {selectedDossier.dueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hạn thanh toán</p>
                    <p className={cn(
                      "font-medium",
                      new Date(selectedDossier.dueDate) < new Date() && selectedDossier.status !== 'paid' && 'text-destructive'
                    )}>
                      {selectedDossier.dueDate}
                    </p>
                  </div>
                )}
                {selectedDossier.acceptanceCode && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mã nghiệm thu</p>
                    <p className="font-medium">{selectedDossier.acceptanceCode}</p>
                  </div>
                )}
                {selectedDossier.approvedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày duyệt</p>
                    <p className="font-medium">{selectedDossier.approvedDate}</p>
                  </div>
                )}
                {selectedDossier.paidDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày thanh toán</p>
                    <p className="font-medium text-success">{selectedDossier.paidDate}</p>
                  </div>
                )}
              </div>
              
              {selectedDossier.notes && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">Ghi chú:</p>
                  <p className="text-sm">{selectedDossier.notes}</p>
                </div>
              )}

              {/* Flow Progress */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Tiến trình</p>
                <div className="flex items-center gap-2">
                  {flowSteps.map((step, index) => {
                    const isCompleted = 
                      (index === 0) || // Contract always done
                      (index === 1 && ['pending_approval', 'approved', 'paid'].includes(selectedDossier.status)) ||
                      (index === 2 && ['approved', 'paid'].includes(selectedDossier.status)) ||
                      (index === 3 && selectedDossier.status === 'paid');
                    const isCurrent = 
                      (index === 1 && selectedDossier.status === 'pending_acceptance') ||
                      (index === 2 && selectedDossier.status === 'pending_approval') ||
                      (index === 3 && selectedDossier.status === 'approved');
                    
                    return (
                      <React.Fragment key={index}>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg",
                          isCompleted && "bg-success/10 text-success",
                          isCurrent && "bg-warning/10 text-warning ring-2 ring-warning",
                          !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                        )}>
                          <step.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{step.label}</span>
                        </div>
                        {index < flowSteps.length - 1 && (
                          <ArrowRight className={cn(
                            "h-4 w-4",
                            isCompleted ? "text-success" : "text-muted-foreground"
                          )} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
            {canEdit && selectedDossier?.status === 'pending_approval' && (
              <Button className="bg-success hover:bg-success/90">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Phê duyệt
              </Button>
            )}
            {canEdit && selectedDossier?.status === 'approved' && (
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Xác nhận thanh toán
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
