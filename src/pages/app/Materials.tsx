import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Package, 
  Plus,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Warehouse,
  Building2,
  Settings,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { MaterialTransactionDialog, TransactionType } from '@/components/materials/MaterialTransactionDialog';
import { InventoryCheckDialog } from '@/components/materials/InventoryCheckDialog';
import { MaterialCharts } from '@/components/materials/MaterialCharts';
import { WarehouseManagementDialog } from '@/components/materials/WarehouseManagementDialog';
import { MaterialManagementDialog } from '@/components/materials/MaterialManagementDialog';
import { SupplierManagementDialog } from '@/components/materials/SupplierManagementDialog';
import { exportToExcel, exportToPDF, formatNumberForExport } from '@/lib/export-utils';
import { MaterialAdvancedFilter, MaterialFilters, defaultFilters } from '@/components/materials/MaterialAdvancedFilter';
import { MaterialNormsTab } from '@/components/materials/MaterialNormsTab';
import { MaterialBySupplierTab } from '@/components/materials/MaterialBySupplierTab';
import { MaterialByCostCodeTab } from '@/components/materials/MaterialByCostCodeTab';
import { MaterialRequestsTab } from '@/components/materials/MaterialRequestsTab';
import { MaterialRequest, mockMaterialRequests } from '@/data/materialRequestData';
import { useCompany } from '@/app/context/CompanyContext';
import { transitionApproval } from '@/app/api/approvals';
import { supabase } from '@/lib/supabaseClient';
import UpgradeModal from '@/components/plans/UpgradeModal';
import { usePlanContext } from '@/hooks/usePlanContext';
import { canDownload, canExport, canUseApproval } from '@/lib/planLimits';
// Mock material data
const materialCategories = [
  { id: 'overview', label: 'Tổng quan', icon: Package },
  { id: 'steel', label: 'Thép', icon: Package },
  { id: 'concrete', label: 'Bê tông', icon: Package },
  { id: 'foundation', label: 'Cọc/Móng', icon: Package },
  { id: 'formwork', label: 'Coffa/Giàn giáo', icon: Package },
  { id: 'mep', label: 'MEP', icon: Package },
  { id: 'finishing', label: 'Hoàn thiện', icon: Package },
  { id: 'consumables', label: 'Vật tư phụ', icon: Package },
];

const mockMaterialKPIs = {
  totalDemand: 15800000000,
  purchased: 12500000000,
  received: 11200000000,
  used: 9800000000,
  stock: 1400000000,
  variance: 2.8,
};

const mockMaterials = [
  { id: '1', code: 'THEP-16', name: 'Thép phi 16 SD390', unit: 'kg', category: 'steel', demand: 125000, purchased: 98000, received: 95000, used: 78000, stock: 17000, price: 18500, variance: 3.2 },
  { id: '2', code: 'THEP-12', name: 'Thép phi 12 SD390', unit: 'kg', category: 'steel', demand: 85000, purchased: 72000, received: 70000, used: 62000, stock: 8000, price: 18500, variance: 1.5 },
  { id: '3', code: 'THEP-10', name: 'Thép phi 10 SD390', unit: 'kg', category: 'steel', demand: 45000, purchased: 38000, received: 36000, used: 32000, stock: 4000, price: 18500, variance: 0.8 },
  { id: '4', code: 'BT-C30', name: 'Bê tông C30', unit: 'm³', category: 'concrete', demand: 2500, purchased: 2100, received: 2050, used: 1850, stock: 200, price: 1250000, variance: 2.1 },
  { id: '5', code: 'BT-C25', name: 'Bê tông C25', unit: 'm³', category: 'concrete', demand: 1800, purchased: 1500, received: 1450, used: 1320, stock: 130, price: 1150000, variance: 1.2 },
  { id: '6', code: 'COC-D400', name: 'Cọc BTCT D400', unit: 'm', category: 'foundation', demand: 3200, purchased: 3200, received: 3000, used: 2800, stock: 200, price: 850000, variance: 1.8 },
  { id: '7', code: 'VAN-10x20', name: 'Ván coffa 10x20cm', unit: 'tấm', category: 'formwork', demand: 500, purchased: 450, received: 450, used: 380, stock: 70, price: 125000, variance: 0.5 },
  { id: '8', code: 'ONG-DN100', name: 'Ống PVC DN100', unit: 'm', category: 'mep', demand: 1200, purchased: 1000, received: 950, used: 800, stock: 150, price: 45000, variance: 2.5 },
  { id: '9', code: 'SON-NT', name: 'Sơn nội thất cao cấp', unit: 'thùng', category: 'finishing', demand: 200, purchased: 180, received: 180, used: 120, stock: 60, price: 1850000, variance: 0.3 },
  { id: '10', code: 'BULONG-M16', name: 'Bu lông M16x80', unit: 'bộ', category: 'consumables', demand: 5000, purchased: 4500, received: 4500, used: 3800, stock: 0, price: 12000, variance: 12.5 },
];

// Get unique units from materials
const materialUnits = [...new Set(mockMaterials.map(m => m.unit))];

const mockTransactions = [
  { id: '1', date: '2024-03-15', type: 'receive', material: 'Thép phi 16 SD390', quantity: 5000, unit: 'kg', supplier: 'Hòa Phát Steel', costCode: '', warehouse: 'Kho A' },
  { id: '2', date: '2024-03-15', type: 'issue', material: 'Bê tông C30', quantity: 45, unit: 'm³', supplier: '', costCode: 'COT-C1-BT', warehouse: 'Kho A' },
  { id: '3', date: '2024-03-14', type: 'receive', material: 'Thép phi 12 SD390', quantity: 3500, unit: 'kg', supplier: 'Pomina Steel', costCode: '', warehouse: 'Kho A' },
  { id: '4', date: '2024-03-14', type: 'issue', material: 'Thép phi 16 SD390', quantity: 2800, unit: 'kg', supplier: '', costCode: 'SAN-T7-THEP', warehouse: 'Kho A' },
  { id: '5', date: '2024-03-13', type: 'transfer', material: 'Xi măng PCB40', quantity: 500, unit: 'bao', supplier: '', costCode: '', warehouse: 'Kho A → Kho B' },
  { id: '6', date: '2024-03-13', type: 'issue', material: 'Thép phi 10 SD390', quantity: 1500, unit: 'kg', supplier: '', costCode: 'DAM-D1-THEP', warehouse: 'Kho A' },
  { id: '7', date: '2024-03-12', type: 'receive', material: 'Bê tông C25', quantity: 80, unit: 'm³', supplier: 'Bê tông Việt Đức', costCode: '', warehouse: 'Kho A' },
];

const Materials: React.FC = () => {
  const { id: projectId } = useParams();
  const { companyId, role } = useCompany();
  const { limits, usage, recordUsageEvent } = usePlanContext(companyId);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeTab, setActiveTab] = useState('summary');
  const [transactionFilter, setTransactionFilter] = useState('all');
  
  // Advanced filters state
  const [filters, setFilters] = useState<MaterialFilters>(defaultFilters);
  
  // Dialog states
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('receive');
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  
  // Management dialog states
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>(undefined);

  // Material requests state for chart sync
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(mockMaterialRequests);

  const openUpgrade = (feature: string, reason: string) => {
    setUpgradeFeature(feature);
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  };

  const ensureExportAllowed = (estimatedDownloadGb: number) => {
    const exportGate = canExport(limits, usage);
    if (!exportGate.allowed) {
      openUpgrade('xuat du lieu', exportGate.reason ?? 'Da dat gioi han xuat du lieu/ngay.');
      return false;
    }

    const downloadGate = canDownload(limits, usage, estimatedDownloadGb);
    if (!downloadGate.allowed) {
      openUpgrade('tai xuong', downloadGate.reason ?? 'Da dat gioi han bang thong tai xuong/thang.');
      return false;
    }

    return true;
  };

  const ensureApprovalAllowed = () => {
    const approvalGate = canUseApproval(limits);
    if (!approvalGate.allowed) {
      openUpgrade('phe duyet', approvalGate.reason ?? 'Tinh nang phe duyet khong co trong goi hien tai.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    let isActive = true;
    const client = supabase;
    if (!companyId || !projectId || !client) return;
    client
      .from("approval_requests")
      .select("id, status")
      .eq("company_id", companyId)
      .eq("entity_type", "material_request")
      .eq("entity_id", projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (!isActive) return;
        setApprovalId(data?.id ?? null);
        setApprovalStatus(data?.status ?? null);
      });
    return () => {
      isActive = false;
    };
  }, [companyId, projectId]);

  const runApprovalAction = async (action: "create_draft" | "submit" | "approve" | "reject" | "cancel") => {
    if (!projectId) return;
    if (!ensureApprovalAllowed()) return;
    setApprovalLoading(true);
    try {
      const result = await transitionApproval({
        action,
        entity_type: "material_request",
        entity_id: projectId,
      });
      setApprovalId(result?.approval?.id ?? approvalId);
      setApprovalStatus(result?.approval?.status ?? approvalStatus);
      toast({ title: "Đã cập nhật phê duyệt" });
    } catch (err: any) {
      toast({
        title: "Không thể cập nhật phê duyệt",
        description: err?.message ?? "Vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  // Filter materials based on advanced filters
  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter(material => {
      // Text search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!material.code.toLowerCase().includes(searchLower) &&
            !material.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(material.category)) {
        return false;
      }

      // Specific material code filter
      if (filters.materialCodes.length > 0 && !filters.materialCodes.includes(material.code)) {
        return false;
      }

      // Unit filter
      if (filters.units.length > 0 && !filters.units.includes(material.unit)) {
        return false;
      }

      // Stock status filter
      if (filters.stockStatus !== 'all') {
        const stockRatio = material.stock / material.demand;
        switch (filters.stockStatus) {
          case 'out':
            if (material.stock > 0) return false;
            break;
          case 'low':
            if (material.stock === 0 || stockRatio >= 0.1) return false;
            break;
          case 'normal':
            if (stockRatio < 0.1 || stockRatio > 0.3) return false;
            break;
          case 'over':
            if (stockRatio <= 0.3) return false;
            break;
        }
      }

      // Price range filter
      if (filters.priceMin && material.price < Number(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && material.price > Number(filters.priceMax)) {
        return false;
      }

      // Stock range filter
      if (filters.stockMin && material.stock < Number(filters.stockMin)) {
        return false;
      }
      if (filters.stockMax && material.stock > Number(filters.stockMax)) {
        return false;
      }

      // Variance status filter
      if (filters.varianceStatus !== 'all') {
        switch (filters.varianceStatus) {
          case 'normal':
            if (material.variance >= 5) return false;
            break;
          case 'warning':
            if (material.variance < 5 || material.variance > 10) return false;
            break;
          case 'over':
            if (material.variance <= 10) return false;
            break;
        }
      }

      // Active category tab filter
      if (activeCategory !== 'overview' && material.category !== activeCategory) {
        return false;
      }

      return true;
    });
  }, [filters, activeCategory]);

  // Open transaction dialog with type
  const handleOpenTransaction = (type: TransactionType) => {
    setTransactionType(type);
    setTransactionDialogOpen(true);
  };

  // Handle transaction submit
  const handleTransactionSubmit = (data: any) => {
    const typeLabels = {
      receive: 'Nhập kho',
      issue: 'Xuất kho',
      transfer: 'Điều chuyển',
    };
    
    toast({
      title: `${typeLabels[data.type]} thành công`,
      description: `Đã ${typeLabels[data.type].toLowerCase()} ${data.quantity.toLocaleString()} đơn vị vật tư.`,
    });
  };

  // Handle inventory check submit
  const handleInventorySubmit = (items: any[]) => {
    const checkedCount = items.filter(i => i.actualStock !== null).length;
    toast({
      title: 'Kiểm kê thành công',
      description: `Đã kiểm kê ${checkedCount} mục vật tư.`,
    });
  };

  // Export functions
  const handleExportMaterialsExcel = () => {
    const estimatedDownloadGb = 0.05;
    if (!ensureExportAllowed(estimatedDownloadGb)) {
      return;
    }

    const exportData = mockMaterials.map(m => ({
      code: m.code,
      name: m.name,
      unit: m.unit,
      demand: formatNumberForExport(m.demand),
      purchased: formatNumberForExport(m.purchased),
      received: formatNumberForExport(m.received),
      used: formatNumberForExport(m.used),
      stock: formatNumberForExport(m.stock),
      variance: `${m.variance}%`,
    }));

    exportToExcel({
      title: 'Danh sách vật tư',
      fileName: `vat-tu-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Mã VT', key: 'code', width: 12 },
        { header: 'Tên vật tư', key: 'name', width: 30 },
        { header: 'ĐVT', key: 'unit', width: 8 },
        { header: 'Nhu cầu', key: 'demand', width: 15 },
        { header: 'Đã mua', key: 'purchased', width: 15 },
        { header: 'Đã nhập', key: 'received', width: 15 },
        { header: 'Đã dùng', key: 'used', width: 15 },
        { header: 'Tồn kho', key: 'stock', width: 15 },
        { header: 'Hao hụt', key: 'variance', width: 10 },
      ],
      data: exportData,
    });

    void recordUsageEvent('export', estimatedDownloadGb);

    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất ${mockMaterials.length} vật tư ra file Excel.`,
    });
  };

  const handleExportMaterialsPDF = () => {
    const estimatedDownloadGb = 0.05;
    if (!ensureExportAllowed(estimatedDownloadGb)) {
      return;
    }

    const exportData = mockMaterials.map(m => ({
      code: m.code,
      name: m.name,
      unit: m.unit,
      demand: formatNumberForExport(m.demand),
      received: formatNumberForExport(m.received),
      used: formatNumberForExport(m.used),
      stock: formatNumberForExport(m.stock),
      variance: `${m.variance}%`,
    }));

    exportToPDF({
      title: 'Danh sách vật tư',
      subtitle: `Xuất ngày ${new Date().toLocaleDateString('vi-VN')}`,
      fileName: `vat-tu-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Mã VT', key: 'code', width: 12 },
        { header: 'Tên vật tư', key: 'name', width: 30 },
        { header: 'ĐVT', key: 'unit', width: 8 },
        { header: 'Nhu cầu', key: 'demand', width: 12 },
        { header: 'Đã nhập', key: 'received', width: 12 },
        { header: 'Đã dùng', key: 'used', width: 12 },
        { header: 'Tồn', key: 'stock', width: 12 },
        { header: 'Hao hụt', key: 'variance', width: 10 },
      ],
      data: exportData,
    });

    void recordUsageEvent('export', estimatedDownloadGb);

    toast({
      title: 'Xuất PDF thành công',
      description: `Đã xuất ${mockMaterials.length} vật tư ra file PDF.`,
    });
  };

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(tx => {
    if (transactionFilter === 'all') return true;
    return tx.type === transactionFilter;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Quản lý Vật tư</h1>
            <p className="page-subtitle">Theo dõi nhập xuất tồn và định mức vật tư</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => setShowCharts(!showCharts)}
            >
              <BarChart3 className="h-4 w-4" />
              Thống kê
              {showCharts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Xuất file
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportMaterialsExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Xuất Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportMaterialsPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Xuất PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Danh mục
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setWarehouseDialogOpen(true)}>
                  <Warehouse className="h-4 w-4 mr-2" />
                  Quản lý Kho
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMaterialDialogOpen(true)}>
                  <Package className="h-4 w-4 mr-2" />
                  Quản lý Vật tư
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSupplierDialogOpen(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Quản lý Nhà cung cấp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thao tác kho
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenTransaction('receive')}>
                  <ArrowDownToLine className="h-4 w-4 mr-2 text-success" />
                  Nhập kho
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenTransaction('issue')}>
                  <ArrowUpFromLine className="h-4 w-4 mr-2 text-info" />
                  Xuất kho
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenTransaction('transfer')}>
                  <ArrowLeftRight className="h-4 w-4 mr-2 text-warning" />
                  Điều chuyển
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setInventoryDialogOpen(true)}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Kiểm kê
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-card rounded-xl border border-border p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Phê duyệt yêu cầu vật tư</div>
            <div className="text-lg font-semibold">{approvalStatus ?? "Chưa tạo"}</div>
            {approvalId && (
              <div className="text-xs text-muted-foreground">ID: {approvalId}</div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => runApprovalAction("create_draft")} disabled={approvalLoading || !projectId}>
              Lưu nháp
            </Button>
            <Button variant="outline" onClick={() => runApprovalAction("submit")} disabled={approvalLoading || !projectId || !["owner","admin","editor"].includes(role ?? "")}>
              Gửi duyệt
            </Button>
            <Button onClick={() => runApprovalAction("approve")} disabled={approvalLoading || !projectId || !["owner","admin"].includes(role ?? "")}>
              Duyệt
            </Button>
            <Button variant="destructive" onClick={() => runApprovalAction("reject")} disabled={approvalLoading || !projectId || !["owner","admin"].includes(role ?? "")}>
              Từ chối
            </Button>
            <Button variant="ghost" onClick={() => runApprovalAction("cancel")} disabled={approvalLoading || !projectId || !["owner","admin","editor"].includes(role ?? "")}>
              Huỷ
            </Button>
          </div>
        </div>
        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {materialCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 stagger-children">
          <KPICard
            title="Nhu cầu"
            value={formatCurrency(mockMaterialKPIs.totalDemand)}
            variant="primary"
          />
          <KPICard
            title="Đã mua"
            value={formatCurrency(mockMaterialKPIs.purchased)}
            subtitle="79% nhu cầu"
          />
          <KPICard
            title="Đã nhập"
            value={formatCurrency(mockMaterialKPIs.received)}
            subtitle="90% đã mua"
          />
          <KPICard
            title="Đã xuất"
            value={formatCurrency(mockMaterialKPIs.used)}
            subtitle="87% đã nhập"
          />
          <KPICard
            title="Tồn kho"
            value={formatCurrency(mockMaterialKPIs.stock)}
            variant="accent"
          />
          <KPICard
            title="Hao hụt"
            value={`${mockMaterialKPIs.variance}%`}
            subtitle="Cho phép: 5%"
            variant={mockMaterialKPIs.variance > 5 ? 'destructive' : 'success'}
          />
        </div>

        {/* Charts Section */}
        {showCharts && (
          <MaterialCharts 
            className="mb-6" 
            filters={filters}
            materials={filteredMaterials}
            materialRequests={materialRequests}
          />
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Tổng hợp</TabsTrigger>
            <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
            <TabsTrigger value="requests">Yêu cầu VT</TabsTrigger>
            <TabsTrigger value="norms">Định mức</TabsTrigger>
            <TabsTrigger value="suppliers">Theo NCC</TabsTrigger>
            <TabsTrigger value="costcodes">Theo công việc</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0">
            {/* Advanced Filter */}
            <div className="mb-4">
              <MaterialAdvancedFilter
                filters={filters}
                onFiltersChange={setFilters}
                categories={materialCategories}
                units={materialUnits}
                materials={mockMaterials.map(m => ({ id: m.id, code: m.code, name: m.name, category: m.category }))}
              />
            </div>

            {/* Materials Table */}
            {/* Materials Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã VT</th>
                    <th>Tên vật tư</th>
                    <th>ĐVT</th>
                    <th className="text-right">Nhu cầu</th>
                    <th className="text-right">Đã mua</th>
                    <th className="text-right">Đã nhập</th>
                    <th className="text-right">Đã xuất</th>
                    <th className="text-right">Tồn</th>
                    <th className="text-right">Hao hụt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-muted-foreground">
                        Không tìm thấy vật tư phù hợp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((material) => (
                      <tr key={material.id} className="cursor-pointer">
                        <td className="font-medium">{material.code}</td>
                        <td>{material.name}</td>
                        <td>{material.unit}</td>
                        <td className="text-right">{material.demand.toLocaleString()}</td>
                        <td className="text-right">{material.purchased.toLocaleString()}</td>
                        <td className="text-right">{material.received.toLocaleString()}</td>
                        <td className="text-right">{material.used.toLocaleString()}</td>
                        <td className="text-right font-medium">{material.stock.toLocaleString()}</td>
                        <td className="text-right">
                          <StatusBadge status={material.variance > 3 ? 'warning' : 'success'} dot={false}>
                            {material.variance > 0 ? '+' : ''}{material.variance}%
                          </StatusBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results count */}
            {filteredMaterials.length > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">
                Hiển thị {filteredMaterials.length} / {mockMaterials.length} vật tư
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Button className="gap-2" onClick={() => handleOpenTransaction('receive')}>
                <ArrowDownToLine className="h-4 w-4" />
                Nhập kho
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleOpenTransaction('issue')}>
                <ArrowUpFromLine className="h-4 w-4" />
                Xuất kho
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleOpenTransaction('transfer')}>
                <ArrowLeftRight className="h-4 w-4" />
                Điều chuyển
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setInventoryDialogOpen(true)}>
                <ClipboardList className="h-4 w-4" />
                Kiểm kê
              </Button>
              
              <div className="ml-auto">
                <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Lọc loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="receive">Nhập kho</SelectItem>
                    <SelectItem value="issue">Xuất kho</SelectItem>
                    <SelectItem value="transfer">Điều chuyển</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Loại</th>
                    <th>Vật tư</th>
                    <th className="text-right">Số lượng</th>
                    <th>ĐVT</th>
                    <th>NCC / Mã công việc</th>
                    <th>Kho</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>
                        <StatusBadge 
                          status={tx.type === 'receive' ? 'success' : tx.type === 'issue' ? 'info' : 'neutral'}
                          dot={false}
                        >
                          {tx.type === 'receive' ? 'Nhập kho' : tx.type === 'issue' ? 'Xuất kho' : 'Điều chuyển'}
                        </StatusBadge>
                      </td>
                      <td className="font-medium">{tx.material}</td>
                      <td className="text-right font-medium">{tx.quantity.toLocaleString()}</td>
                      <td>{tx.unit}</td>
                      <td className="text-muted-foreground">{tx.supplier || tx.costCode || '—'}</td>
                      <td>{tx.warehouse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
            <MaterialRequestsTab onRequestsChange={setMaterialRequests} />
          </TabsContent>

          <TabsContent value="norms" className="mt-0">
            <MaterialNormsTab />
          </TabsContent>

          <TabsContent value="suppliers" className="mt-0">
            <MaterialBySupplierTab />
          </TabsContent>

          <TabsContent value="costcodes" className="mt-0">
            <MaterialByCostCodeTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Dialog */}
      <MaterialTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        type={transactionType}
        onSubmit={handleTransactionSubmit}
      />

      {/* Inventory Check Dialog */}
      <InventoryCheckDialog
        open={inventoryDialogOpen}
        onOpenChange={setInventoryDialogOpen}
        onSubmit={handleInventorySubmit}
      />

      {/* Management Dialogs */}
      <WarehouseManagementDialog
        open={warehouseDialogOpen}
        onOpenChange={setWarehouseDialogOpen}
      />
      <MaterialManagementDialog
        open={materialDialogOpen}
        onOpenChange={setMaterialDialogOpen}
      />
      <SupplierManagementDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
      />

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName={upgradeFeature}
        reason={upgradeReason ?? undefined}
      />
    </div>
  );
};

export default Materials;
