import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  MoreHorizontal,
  Calendar,
  Building2,
  Percent,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/data/mockData';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractFormDialog } from '@/components/contracts/ContractFormDialog';
import { toast } from '@/hooks/use-toast';

// Types
interface Milestone {
  id: string;
  name: string;
  description: string;
  percentage: number;
  amount: number;
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface Contract {
  id: string;
  code: string;
  name: string;
  vendor: string;
  vendorTaxCode: string;
  type: 'subcontract' | 'supply' | 'service' | 'equipment';
  category: string;
  value: number;
  paid: number;
  retention: number;
  retentionPercent: number;
  retentionReleaseDate?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'terminated' | 'suspended';
  signedDate?: string;
  milestones: Milestone[];
  attachments: { name: string; type: string; size: string }[];
  notes: string;
}

// Mock data
const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    code: 'HĐ-2024-001',
    name: 'Thi công phần thô Block A',
    vendor: 'Công ty TNHH Xây dựng Minh Phát',
    vendorTaxCode: '0312345678',
    type: 'subcontract',
    category: 'Xây dựng',
    value: 25000000000,
    paid: 18000000000,
    retention: 1250000000,
    retentionPercent: 5,
    retentionReleaseDate: '2025-06-30',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active',
    signedDate: '2024-01-10',
    milestones: [
      { id: 'm1', name: 'Tạm ứng', description: 'Tạm ứng 20% giá trị hợp đồng', percentage: 20, amount: 5000000000, plannedDate: '2024-01-20', actualDate: '2024-01-18', status: 'completed' },
      { id: 'm2', name: 'Hoàn thành móng', description: 'Nghiệm thu hoàn thành phần móng', percentage: 25, amount: 6250000000, plannedDate: '2024-04-30', actualDate: '2024-05-05', status: 'completed' },
      { id: 'm3', name: 'Hoàn thành thân', description: 'Nghiệm thu hoàn thành phần thân', percentage: 35, amount: 8750000000, plannedDate: '2024-09-30', status: 'in_progress' },
      { id: 'm4', name: 'Hoàn thành toàn bộ', description: 'Nghiệm thu hoàn thành và bàn giao', percentage: 20, amount: 5000000000, plannedDate: '2024-12-31', status: 'pending' },
    ],
    attachments: [
      { name: 'Hợp đồng gốc.pdf', type: 'pdf', size: '2.5 MB' },
      { name: 'Phụ lục 1 - BOQ.xlsx', type: 'excel', size: '1.2 MB' },
    ],
    notes: 'Nhà thầu có kinh nghiệm thi công các dự án tương tự.',
  },
  {
    id: 'contract-2',
    code: 'HĐ-2024-002',
    name: 'Cung cấp thép xây dựng',
    vendor: 'Công ty CP Thép Hòa Phát',
    vendorTaxCode: '0800123456',
    type: 'supply',
    category: 'Vật tư',
    value: 8500000000,
    paid: 6800000000,
    retention: 0,
    retentionPercent: 0,
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    status: 'active',
    signedDate: '2024-01-28',
    milestones: [
      { id: 'm1', name: 'Đợt 1', description: 'Giao hàng đợt 1 - Thép móng', percentage: 30, amount: 2550000000, plannedDate: '2024-03-15', actualDate: '2024-03-12', status: 'completed' },
      { id: 'm2', name: 'Đợt 2', description: 'Giao hàng đợt 2 - Thép sàn tầng 1-5', percentage: 35, amount: 2975000000, plannedDate: '2024-06-30', actualDate: '2024-07-02', status: 'completed' },
      { id: 'm3', name: 'Đợt 3', description: 'Giao hàng đợt 3 - Thép sàn tầng 6-10', percentage: 35, amount: 2975000000, plannedDate: '2024-10-15', status: 'in_progress' },
    ],
    attachments: [
      { name: 'Hợp đồng cung cấp thép.pdf', type: 'pdf', size: '1.8 MB' },
    ],
    notes: '',
  },
  {
    id: 'contract-3',
    code: 'HĐ-2024-003',
    name: 'Lắp đặt hệ thống M&E',
    vendor: 'Công ty TNHH Kỹ thuật Điện Việt',
    vendorTaxCode: '0309876543',
    type: 'subcontract',
    category: 'MEP',
    value: 12000000000,
    paid: 3600000000,
    retention: 600000000,
    retentionPercent: 5,
    retentionReleaseDate: '2025-12-31',
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    status: 'active',
    signedDate: '2024-05-25',
    milestones: [
      { id: 'm1', name: 'Tạm ứng', description: 'Tạm ứng 30%', percentage: 30, amount: 3600000000, plannedDate: '2024-06-10', actualDate: '2024-06-08', status: 'completed' },
      { id: 'm2', name: 'Hệ thống điện', description: 'Hoàn thành lắp đặt hệ thống điện', percentage: 25, amount: 3000000000, plannedDate: '2024-10-31', status: 'pending' },
      { id: 'm3', name: 'Hệ thống nước', description: 'Hoàn thành lắp đặt hệ thống cấp thoát nước', percentage: 25, amount: 3000000000, plannedDate: '2025-01-31', status: 'pending' },
      { id: 'm4', name: 'Nghiệm thu tổng', description: 'Nghiệm thu hoàn thành và bàn giao', percentage: 20, amount: 2400000000, plannedDate: '2025-03-31', status: 'pending' },
    ],
    attachments: [
      { name: 'Hợp đồng M&E.pdf', type: 'pdf', size: '3.2 MB' },
      { name: 'Bản vẽ thiết kế.dwg', type: 'cad', size: '15.6 MB' },
      { name: 'Danh mục thiết bị.xlsx', type: 'excel', size: '850 KB' },
    ],
    notes: 'Bao gồm bảo hành 24 tháng sau nghiệm thu.',
  },
  {
    id: 'contract-4',
    code: 'HĐ-2024-004',
    name: 'Thuê cẩu tháp',
    vendor: 'Công ty TNHH Thiết bị Xây dựng ABC',
    vendorTaxCode: '0311111111',
    type: 'equipment',
    category: 'Máy móc',
    value: 1800000000,
    paid: 1200000000,
    retention: 0,
    retentionPercent: 0,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'active',
    signedDate: '2024-02-25',
    milestones: [
      { id: 'm1', name: 'Quý 1', description: 'Thanh toán thuê quý 1', percentage: 25, amount: 450000000, plannedDate: '2024-03-31', actualDate: '2024-04-02', status: 'completed' },
      { id: 'm2', name: 'Quý 2', description: 'Thanh toán thuê quý 2', percentage: 25, amount: 450000000, plannedDate: '2024-06-30', actualDate: '2024-07-01', status: 'completed' },
      { id: 'm3', name: 'Quý 3', description: 'Thanh toán thuê quý 3', percentage: 25, amount: 450000000, plannedDate: '2024-09-30', status: 'overdue' },
      { id: 'm4', name: 'Quý 4', description: 'Thanh toán thuê quý 4', percentage: 25, amount: 450000000, plannedDate: '2024-12-31', status: 'pending' },
    ],
    attachments: [
      { name: 'Hợp đồng thuê cẩu.pdf', type: 'pdf', size: '1.1 MB' },
    ],
    notes: 'Bao gồm chi phí vận hành và bảo trì.',
  },
  {
    id: 'contract-5',
    code: 'HĐ-2023-012',
    name: 'Thi công phần móng',
    vendor: 'Công ty CP Nền móng Việt Nam',
    vendorTaxCode: '0305555555',
    type: 'subcontract',
    category: 'Xây dựng',
    value: 15000000000,
    paid: 14250000000,
    retention: 750000000,
    retentionPercent: 5,
    retentionReleaseDate: '2025-03-31',
    startDate: '2023-10-01',
    endDate: '2024-03-31',
    status: 'completed',
    signedDate: '2023-09-25',
    milestones: [
      { id: 'm1', name: 'Tạm ứng', description: 'Tạm ứng 20%', percentage: 20, amount: 3000000000, plannedDate: '2023-10-10', actualDate: '2023-10-08', status: 'completed' },
      { id: 'm2', name: 'Cọc khoan nhồi', description: 'Hoàn thành thi công cọc', percentage: 40, amount: 6000000000, plannedDate: '2024-01-15', actualDate: '2024-01-20', status: 'completed' },
      { id: 'm3', name: 'Đài móng', description: 'Hoàn thành đài móng và giằng', percentage: 40, amount: 6000000000, plannedDate: '2024-03-31', actualDate: '2024-03-28', status: 'completed' },
    ],
    attachments: [
      { name: 'Hợp đồng móng.pdf', type: 'pdf', size: '2.1 MB' },
      { name: 'Biên bản nghiệm thu.pdf', type: 'pdf', size: '5.4 MB' },
    ],
    notes: 'Đã hoàn thành đúng tiến độ.',
  },
];

const contractTypeLabels: Record<Contract['type'], string> = {
  subcontract: 'Thầu phụ',
  supply: 'Cung cấp',
  service: 'Dịch vụ',
  equipment: 'Thiết bị',
};

const contractStatusLabels: Record<Contract['status'], string> = {
  draft: 'Nháp',
  active: 'Đang thực hiện',
  completed: 'Hoàn thành',
  terminated: 'Đã hủy',
  suspended: 'Tạm dừng',
};

const milestoneStatusLabels: Record<Milestone['status'], string> = {
  pending: 'Chờ thực hiện',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  overdue: 'Quá hạn',
};

const getContractStatusVariant = (status: Contract['status']): 'active' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  switch (status) {
    case 'active': return 'info';
    case 'completed': return 'success';
    case 'suspended': return 'warning';
    case 'terminated': return 'danger';
    default: return 'neutral';
  }
};

const getMilestoneStatusVariant = (status: Milestone['status']): 'active' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'info';
    case 'overdue': return 'danger';
    default: return 'neutral';
  }
};

export default function Contracts() {
  useParams();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('contracts', 'edit');

  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Calculate KPIs
  const totalContractValue = contracts.reduce((sum, c) => sum + c.value, 0);
  const totalPaid = contracts.reduce((sum, c) => sum + c.paid, 0);
  const totalRetention = contracts.reduce((sum, c) => sum + c.retention, 0);
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const overdueMillestones = contracts.flatMap(c => c.milestones).filter(m => m.status === 'overdue').length;

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    
    if (activeTab === 'retention') {
      return matchesSearch && matchesStatus && matchesType && contract.retention > 0;
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getProgressPercent = (contract: Contract) => {
    const completedMilestones = contract.milestones.filter(m => m.status === 'completed');
    return completedMilestones.reduce((sum, m) => sum + m.percentage, 0);
  };

  const handleCreateContract = () => {
    setEditingContract(null);
    setFormDialogOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = (data: {
    code: string;
    name: string;
    vendor: string;
    vendorTaxCode: string;
    type: 'subcontract' | 'supply' | 'service' | 'equipment';
    category: string;
    value: number;
    retentionPercent: number;
    startDate: Date;
    endDate: Date;
    signedDate?: Date;
    retentionReleaseDate?: Date;
    status: 'draft' | 'active' | 'completed' | 'terminated' | 'suspended';
    notes?: string;
    milestones: Array<{
      id: string;
      name: string;
      description?: string;
      percentage: number;
      plannedDate: Date;
    }>;
  }) => {
    if (editingContract) {
      // Update existing contract
      const updatedContract: Contract = {
        ...editingContract,
        code: data.code,
        name: data.name,
        vendor: data.vendor,
        vendorTaxCode: data.vendorTaxCode,
        type: data.type,
        category: data.category,
        value: data.value,
        retention: (data.value * data.retentionPercent) / 100,
        retentionPercent: data.retentionPercent,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        signedDate: data.signedDate?.toISOString().split('T')[0],
        retentionReleaseDate: data.retentionReleaseDate?.toISOString().split('T')[0],
        status: data.status,
        notes: data.notes || '',
        milestones: data.milestones.map((m, index) => ({
          ...m,
          description: m.description || '',
          amount: (data.value * m.percentage) / 100,
          plannedDate: m.plannedDate.toISOString().split('T')[0],
          status: editingContract.milestones[index]?.status || 'pending' as const,
        })),
      };
      
      setContracts(contracts.map(c => c.id === editingContract.id ? updatedContract : c));
      toast({
        title: 'Cập nhật thành công',
        description: `Hợp đồng ${data.code} đã được cập nhật.`,
      });
    } else {
      // Create new contract
      const newContract: Contract = {
        id: `contract-${Date.now()}`,
        code: data.code,
        name: data.name,
        vendor: data.vendor,
        vendorTaxCode: data.vendorTaxCode,
        type: data.type,
        category: data.category,
        value: data.value,
        paid: 0,
        retention: (data.value * data.retentionPercent) / 100,
        retentionPercent: data.retentionPercent,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        signedDate: data.signedDate?.toISOString().split('T')[0],
        retentionReleaseDate: data.retentionReleaseDate?.toISOString().split('T')[0],
        status: data.status,
        notes: data.notes || '',
        milestones: data.milestones.map(m => ({
          ...m,
          description: m.description || '',
          amount: (data.value * m.percentage) / 100,
          plannedDate: m.plannedDate.toISOString().split('T')[0],
          status: 'pending' as const,
        })),
        attachments: [],
      };
      
      setContracts([newContract, ...contracts]);
      toast({
        title: 'Tạo thành công',
        description: `Hợp đồng ${data.code} đã được tạo.`,
      });
    }
  };

  const handleDeleteContract = (contract: Contract) => {
    setContracts(contracts.filter(c => c.id !== contract.id));
    toast({
      title: 'Xóa thành công',
      description: `Hợp đồng ${contract.code} đã được xóa.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Hợp đồng</h1>
          <p className="text-muted-foreground">Theo dõi hợp đồng, milestones và retention</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          {canEdit && (
            <Button size="sm" onClick={handleCreateContract}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm hợp đồng
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Tổng giá trị HĐ"
          value={formatCurrency(totalContractValue)}
          icon={FileText}
        />
        <KPICard
          title="Đã thanh toán"
          value={formatCurrency(totalPaid)}
          subtitle={`${((totalPaid / totalContractValue) * 100).toFixed(1)}%`}
          icon={CheckCircle2}
          variant="success"
        />
        <KPICard
          title="Giữ lại"
          value={formatCurrency(totalRetention)}
          icon={Percent}
          variant="warning"
        />
        <KPICard
          title="HĐ đang thực hiện"
          value={activeContracts.toString()}
          icon={Clock}
          variant="primary"
        />
        <KPICard
          title="HĐ hoàn thành"
          value={completedContracts.toString()}
          icon={CheckCircle2}
          variant="success"
        />
        <KPICard
          title="Milestone quá hạn"
          value={overdueMillestones.toString()}
          icon={AlertTriangle}
          variant={overdueMillestones > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({mockContracts.length})</TabsTrigger>
          <TabsTrigger value="retention">
            Giữ lại ({mockContracts.filter(c => c.retention > 0).length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="active">Đang thực hiện</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="suspended">Tạm dừng</SelectItem>
              <SelectItem value="terminated">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại hợp đồng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="subcontract">Thầu phụ</SelectItem>
              <SelectItem value="supply">Cung cấp</SelectItem>
              <SelectItem value="service">Dịch vụ</SelectItem>
              <SelectItem value="equipment">Thiết bị</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-4">
          <ContractTable 
            contracts={filteredContracts} 
            onSelectContract={setSelectedContract}
            onEditContract={handleEditContract}
            onDeleteContract={handleDeleteContract}
            canEdit={canEdit}
            getProgressPercent={getProgressPercent}
          />
        </TabsContent>

        <TabsContent value="retention" className="mt-4">
          <RetentionTable 
            contracts={filteredContracts}
            onSelectContract={setSelectedContract}
          />
        </TabsContent>
      </Tabs>

      {/* Contract Form Dialog */}
      <ContractFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={editingContract ? 'edit' : 'create'}
        initialData={editingContract ? {
          code: editingContract.code,
          name: editingContract.name,
          vendor: editingContract.vendor,
          vendorTaxCode: editingContract.vendorTaxCode,
          type: editingContract.type,
          category: editingContract.category,
          value: editingContract.value,
          retentionPercent: editingContract.retentionPercent,
          startDate: new Date(editingContract.startDate),
          endDate: new Date(editingContract.endDate),
          signedDate: editingContract.signedDate ? new Date(editingContract.signedDate) : undefined,
          retentionReleaseDate: editingContract.retentionReleaseDate ? new Date(editingContract.retentionReleaseDate) : undefined,
          status: editingContract.status,
          notes: editingContract.notes,
          milestones: editingContract.milestones.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            percentage: m.percentage,
            plannedDate: new Date(m.plannedDate),
          })),
        } : undefined}
        onSubmit={handleFormSubmit}
      />

      {/* Contract Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedContract && (
            <ContractDetail 
              contract={selectedContract} 
              canEdit={canEdit}
              onClose={() => setSelectedContract(null)}
              onEdit={() => {
                setSelectedContract(null);
                handleEditContract(selectedContract);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Contract Table Component
interface ContractTableProps {
  contracts: Contract[];
  onSelectContract: (contract: Contract) => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (contract: Contract) => void;
  canEdit: boolean;
  getProgressPercent: (contract: Contract) => number;
}

function ContractTable({ contracts, onSelectContract, onEditContract, onDeleteContract, canEdit, getProgressPercent }: ContractTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã HĐ</TableHead>
            <TableHead>Tên hợp đồng</TableHead>
            <TableHead>Nhà thầu/NCC</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Giá trị</TableHead>
            <TableHead>Tiến độ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow 
              key={contract.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectContract(contract)}
            >
              <TableCell className="font-medium">{contract.code}</TableCell>
              <TableCell>
                <div className="max-w-[200px]">
                  <p className="truncate font-medium">{contract.name}</p>
                  <p className="text-xs text-muted-foreground">{contract.category}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[150px]">{contract.vendor}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{contractTypeLabels[contract.type]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <p className="font-medium">{formatCurrency(contract.value)}</p>
                  <p className="text-xs text-muted-foreground">
                    Đã TT: {formatCurrency(contract.paid)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="w-[100px]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{getProgressPercent(contract)}%</span>
                  </div>
                  <Progress value={getProgressPercent(contract)} className="h-2" />
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={getContractStatusVariant(contract.status)}>
                  {contractStatusLabels[contract.status]}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectContract(contract); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditContract(contract); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onDeleteContract(contract); }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {contracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Không tìm thấy hợp đồng nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Retention Table Component
interface RetentionTableProps {
  contracts: Contract[];
  onSelectContract: (contract: Contract) => void;
}

function RetentionTable({ contracts, onSelectContract }: RetentionTableProps) {
  const totalRetention = contracts.reduce((sum, c) => sum + c.retention, 0);

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã HĐ</TableHead>
            <TableHead>Tên hợp đồng</TableHead>
            <TableHead>Nhà thầu/NCC</TableHead>
            <TableHead className="text-right">Giá trị HĐ</TableHead>
            <TableHead className="text-right">% Giữ lại</TableHead>
            <TableHead className="text-right">Số tiền giữ lại</TableHead>
            <TableHead>Ngày hoàn trả</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow 
              key={contract.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectContract(contract)}
            >
              <TableCell className="font-medium">{contract.code}</TableCell>
              <TableCell className="max-w-[200px] truncate">{contract.name}</TableCell>
              <TableCell>{contract.vendor}</TableCell>
              <TableCell className="text-right">{formatCurrency(contract.value)}</TableCell>
              <TableCell className="text-right">{contract.retentionPercent}%</TableCell>
              <TableCell className="text-right font-medium text-warning">
                {formatCurrency(contract.retention)}
              </TableCell>
              <TableCell>
                {contract.retentionReleaseDate ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(contract.retentionReleaseDate).toLocaleDateString('vi-VN')}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={getContractStatusVariant(contract.status)}>
                  {contractStatusLabels[contract.status]}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
          {contracts.length > 0 && (
            <TableRow className="bg-muted/50 font-medium">
              <TableCell colSpan={5} className="text-right">Tổng cộng:</TableCell>
              <TableCell className="text-right text-warning">
                {formatCurrency(totalRetention)}
              </TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          )}
          {contracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Không có hợp đồng nào có giữ lại
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Contract Detail Component
interface ContractDetailProps {
  contract: Contract;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
}

function ContractDetail({ contract, canEdit, onClose, onEdit }: ContractDetailProps) {
  const progressPercent = contract.milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.percentage, 0);

  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div>
            <DialogTitle className="text-xl">{contract.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{contract.code}</p>
          </div>
          <StatusBadge status={getContractStatusVariant(contract.status)}>
            {contractStatusLabels[contract.status]}
          </StatusBadge>
        </div>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Contract Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nhà thầu/NCC</p>
            <p className="font-medium">{contract.vendor}</p>
            <p className="text-xs text-muted-foreground">MST: {contract.vendorTaxCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Loại hợp đồng</p>
            <p className="font-medium">{contractTypeLabels[contract.type]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Thời gian</p>
            <p className="font-medium">
              {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày ký</p>
            <p className="font-medium">
              {contract.signedDate ? new Date(contract.signedDate).toLocaleDateString('vi-VN') : '-'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Financial Summary */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin tài chính</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Giá trị hợp đồng</p>
              <p className="text-lg font-bold">{formatCurrency(contract.value)}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Đã thanh toán</p>
              <p className="text-lg font-bold text-success">{formatCurrency(contract.paid)}</p>
              <p className="text-xs text-muted-foreground">
                {((contract.paid / contract.value) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Còn lại</p>
              <p className="text-lg font-bold">{formatCurrency(contract.value - contract.paid - contract.retention)}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Giữ lại ({contract.retentionPercent}%)</p>
              <p className="text-lg font-bold text-warning">{formatCurrency(contract.retention)}</p>
              {contract.retentionReleaseDate && (
                <p className="text-xs text-muted-foreground">
                  Hoàn trả: {new Date(contract.retentionReleaseDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Milestones thanh toán</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tiến độ:</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
          </div>
          
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {contract.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex gap-4">
                  {/* Status indicator */}
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                    ${milestone.status === 'completed' ? 'bg-success text-success-foreground' :
                      milestone.status === 'in_progress' ? 'bg-primary text-primary-foreground' :
                      milestone.status === 'overdue' ? 'bg-destructive text-destructive-foreground' :
                      'bg-muted text-muted-foreground'}
                  `}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : milestone.status === 'overdue' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Milestone content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{milestone.name}</p>
                          <Badge variant="outline">{milestone.percentage}%</Badge>
                          <StatusBadge status={getMilestoneStatusVariant(milestone.status)}>
                            {milestoneStatusLabels[milestone.status]}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(milestone.amount)}</p>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Kế hoạch: {new Date(milestone.plannedDate).toLocaleDateString('vi-VN')}
                      </span>
                      {milestone.actualDate && (
                        <span className="text-success">
                          Thực tế: {new Date(milestone.actualDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Attachments */}
        <div>
          <h3 className="font-semibold mb-3">Tài liệu đính kèm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {contract.attachments.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {contract.notes && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Ghi chú</h3>
              <p className="text-sm text-muted-foreground">{contract.notes}</p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {canEdit && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
