import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Building2,
  Phone,
  Mail,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KPICard } from '@/components/ui/kpi-card';
import { formatCurrency } from '@/data/mockData';
import * as XLSX from 'xlsx';

// Mock data for supplier analysis
const mockSupplierData = [
  { 
    id: '1', 
    code: 'NCC-001',
    name: 'Hòa Phát Steel', 
    phone: '024-3456-7890',
    email: 'sales@hoaphat.com.vn',
    totalOrders: 15,
    totalValue: 2850000000,
    deliveredValue: 2650000000,
    onTimeRate: 95,
    qualityRate: 98,
    materials: [
      { code: 'THEP-16', name: 'Thép phi 16 SD390', qty: 45000, value: 832500000 },
      { code: 'THEP-12', name: 'Thép phi 12 SD390', qty: 35000, value: 647500000 },
      { code: 'THEP-10', name: 'Thép phi 10 SD390', qty: 28000, value: 518000000 },
    ]
  },
  { 
    id: '2', 
    code: 'NCC-002',
    name: 'Bê tông Việt Đức', 
    phone: '028-1234-5678',
    email: 'order@vietduc.com.vn',
    totalOrders: 22,
    totalValue: 1950000000,
    deliveredValue: 1850000000,
    onTimeRate: 88,
    qualityRate: 96,
    materials: [
      { code: 'BT-C30', name: 'Bê tông C30', qty: 850, value: 1062500000 },
      { code: 'BT-C25', name: 'Bê tông C25', qty: 650, value: 747500000 },
    ]
  },
  { 
    id: '3', 
    code: 'NCC-003',
    name: 'Pomina Steel', 
    phone: '024-9876-5432',
    email: 'contact@pomina.com.vn',
    totalOrders: 8,
    totalValue: 980000000,
    deliveredValue: 920000000,
    onTimeRate: 92,
    qualityRate: 97,
    materials: [
      { code: 'THEP-16', name: 'Thép phi 16 SD390', qty: 25000, value: 462500000 },
      { code: 'THEP-12', name: 'Thép phi 12 SD390', qty: 18000, value: 333000000 },
    ]
  },
  { 
    id: '4', 
    code: 'NCC-004',
    name: 'Xi măng Hà Tiên', 
    phone: '028-2468-1357',
    email: 'sales@hatien.com.vn',
    totalOrders: 12,
    totalValue: 450000000,
    deliveredValue: 425000000,
    onTimeRate: 85,
    qualityRate: 99,
    materials: [
      { code: 'XIMANG-PCB40', name: 'Xi măng PCB40', qty: 15000, value: 225000000 },
      { code: 'XIMANG-PCB50', name: 'Xi măng PCB50', qty: 8000, value: 200000000 },
    ]
  },
];

export const MaterialBySupplierTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Calculate KPIs
  const totalSuppliers = mockSupplierData.length;
  const totalValue = mockSupplierData.reduce((acc, s) => acc + s.totalValue, 0);
  const avgOnTimeRate = mockSupplierData.reduce((acc, s) => acc + s.onTimeRate, 0) / mockSupplierData.length;
  const avgQualityRate = mockSupplierData.reduce((acc, s) => acc + s.qualityRate, 0) / mockSupplierData.length;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const exportData: any[] = [];
    
    mockSupplierData.forEach(supplier => {
      supplier.materials.forEach(material => {
        exportData.push({
          'Mã NCC': supplier.code,
          'Tên NCC': supplier.name,
          'Điện thoại': supplier.phone,
          'Email': supplier.email,
          'Mã vật tư': material.code,
          'Tên vật tư': material.name,
          'Số lượng': material.qty,
          'Giá trị': material.value,
          'Tỷ lệ đúng hẹn': supplier.onTimeRate + '%',
          'Tỷ lệ chất lượng': supplier.qualityRate + '%',
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Phân tích NCC');
    
    XLSX.writeFile(wb, `Phan_tich_NCC_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất dữ liệu ${mockSupplierData.length} nhà cung cấp.`,
    });
  };

  // Filter suppliers
  const filteredSuppliers = mockSupplierData.filter(supplier => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!supplier.code.toLowerCase().includes(query) && 
          !supplier.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Nhà cung cấp"
          value={totalSuppliers.toString()}
          subtitle="Đang giao dịch"
          variant="primary"
        />
        <KPICard
          title="Tổng giá trị"
          value={formatCurrency(totalValue)}
          subtitle="Đã đặt hàng"
        />
        <KPICard
          title="Đúng hẹn"
          value={`${avgOnTimeRate.toFixed(0)}%`}
          subtitle="Trung bình"
          variant={avgOnTimeRate >= 90 ? 'success' : 'warning'}
        />
        <KPICard
          title="Chất lượng"
          value={`${avgQualityRate.toFixed(0)}%`}
          subtitle="Trung bình"
          variant={avgQualityRate >= 95 ? 'success' : 'warning'}
        />
      </div>

      {/* Toolbar */}
      <div className="filter-bar rounded-xl bg-card">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên NCC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1" />
        
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10"></th>
              <th>Mã NCC</th>
              <th>Tên nhà cung cấp</th>
              <th className="text-center">Đơn hàng</th>
              <th className="text-right">Giá trị đặt</th>
              <th className="text-right">Đã giao</th>
              <th className="text-center">Đúng hẹn</th>
              <th className="text-center">Chất lượng</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy nhà cung cấp phù hợp
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => {
                const isExpanded = expandedRows.includes(supplier.id);
                const deliveryProgress = (supplier.deliveredValue / supplier.totalValue) * 100;
                
                return (
                  <React.Fragment key={supplier.id}>
                    <tr 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(supplier.id)}
                    >
                      <td className="text-center">
                        <span className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </td>
                      <td className="font-medium">{supplier.code}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {supplier.name}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge variant="secondary">{supplier.totalOrders}</Badge>
                      </td>
                      <td className="text-right font-medium">{formatCurrency(supplier.totalValue)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{formatCurrency(supplier.deliveredValue)}</span>
                          <Badge variant={deliveryProgress >= 90 ? 'default' : 'secondary'} className="text-xs">
                            {deliveryProgress.toFixed(0)}%
                          </Badge>
                        </div>
                      </td>
                      <td className="text-center">
                        <StatusBadge 
                          status={supplier.onTimeRate >= 90 ? 'success' : supplier.onTimeRate >= 80 ? 'warning' : 'danger'}
                          dot={false}
                        >
                          {supplier.onTimeRate}%
                        </StatusBadge>
                      </td>
                      <td className="text-center">
                        <StatusBadge 
                          status={supplier.qualityRate >= 95 ? 'success' : supplier.qualityRate >= 90 ? 'warning' : 'danger'}
                          dot={false}
                        >
                          {supplier.qualityRate}%
                        </StatusBadge>
                      </td>
                    </tr>
                    
                    {/* Expanded material details */}
                    {isExpanded && (
                      <tr className="bg-muted/30">
                        <td colSpan={8} className="p-0">
                          <div className="p-4">
                            <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {supplier.phone}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {supplier.email}
                              </div>
                            </div>
                            
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mã VT</th>
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Tên vật tư</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Số lượng</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Giá trị</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Tỷ trọng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {supplier.materials.map((material, idx) => {
                                  const percentage = (material.value / supplier.totalValue) * 100;
                                  return (
                                    <tr key={idx} className="border-b border-border/50 last:border-0">
                                      <td className="py-2 px-3 font-medium">{material.code}</td>
                                      <td className="py-2 px-3">{material.name}</td>
                                      <td className="py-2 px-3 text-right">{material.qty.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(material.value)}</td>
                                      <td className="py-2 px-3 text-right">
                                        <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Hiển thị {filteredSuppliers.length} / {mockSupplierData.length} nhà cung cấp
      </div>
    </div>
  );
};
