import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KPICard } from '@/components/ui/kpi-card';
import { formatCurrency } from '@/data/mockData';
import * as XLSX from 'xlsx';

// Mock data for cost code analysis
const mockCostCodeData = [
  { 
    id: '1', 
    code: 'COT-C1',
    name: 'Cột tầng 1', 
    category: 'Kết cấu',
    plannedQty: 45,
    actualQty: 42,
    unit: 'm³',
    plannedCost: 850000000,
    actualCost: 820000000,
    materials: [
      { code: 'BT-C30', name: 'Bê tông C30', planned: 46, actual: 43, unit: 'm³', value: 53750000 },
      { code: 'THEP-16', name: 'Thép phi 16 SD390', planned: 5400, actual: 5250, unit: 'kg', value: 97125000 },
      { code: 'THEP-12', name: 'Thép phi 12 SD390', planned: 2025, actual: 1890, unit: 'kg', value: 34965000 },
    ]
  },
  { 
    id: '2', 
    code: 'SAN-T1',
    name: 'Sàn tầng 1', 
    category: 'Kết cấu',
    plannedQty: 520,
    actualQty: 480,
    unit: 'm²',
    plannedCost: 650000000,
    actualCost: 615000000,
    materials: [
      { code: 'BT-C25', name: 'Bê tông C25', planned: 78, actual: 72, unit: 'm³', value: 82800000 },
      { code: 'THEP-10', name: 'Thép phi 10 SD390', planned: 9360, actual: 8400, unit: 'kg', value: 155400000 },
    ]
  },
  { 
    id: '3', 
    code: 'DAM-D1',
    name: 'Dầm tầng 1', 
    category: 'Kết cấu',
    plannedQty: 180,
    actualQty: 165,
    unit: 'm',
    plannedCost: 420000000,
    actualCost: 395000000,
    materials: [
      { code: 'BT-C30', name: 'Bê tông C30', planned: 45, actual: 42.9, unit: 'm³', value: 53625000 },
      { code: 'THEP-16', name: 'Thép phi 16 SD390', planned: 6300, actual: 5940, unit: 'kg', value: 109890000 },
    ]
  },
  { 
    id: '4', 
    code: 'MONG-M1',
    name: 'Móng băng M1', 
    category: 'Móng',
    plannedQty: 85,
    actualQty: 85,
    unit: 'm³',
    plannedCost: 1250000000,
    actualCost: 1180000000,
    materials: [
      { code: 'BT-C25', name: 'Bê tông C25', planned: 89.25, actual: 91.8, unit: 'm³', value: 105570000 },
      { code: 'THEP-16', name: 'Thép phi 16 SD390', planned: 7225, actual: 7480, unit: 'kg', value: 138380000 },
      { code: 'COC-D400', name: 'Cọc BTCT D400', planned: 2040, actual: 2040, unit: 'm', value: 1734000000 },
    ]
  },
  { 
    id: '5', 
    code: 'TUONG-T1',
    name: 'Tường xây tầng 1', 
    category: 'Xây tô',
    plannedQty: 320,
    actualQty: 280,
    unit: 'm²',
    plannedCost: 180000000,
    actualCost: 162000000,
    materials: [
      { code: 'GACH-10x20', name: 'Gạch xây 10x20', planned: 16640, actual: 15400, unit: 'viên', value: 38500000 },
      { code: 'XIMANG-PCB40', name: 'Xi măng PCB40', planned: 8000, actual: 7280, unit: 'kg', value: 29120000 },
    ]
  },
];

const categoryOptions = [
  { id: 'all', label: 'Tất cả hạng mục' },
  { id: 'Móng', label: 'Móng' },
  { id: 'Kết cấu', label: 'Kết cấu' },
  { id: 'Xây tô', label: 'Xây tô' },
  { id: 'Hoàn thiện', label: 'Hoàn thiện' },
];

export const MaterialByCostCodeTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Calculate KPIs
  const totalCostCodes = mockCostCodeData.length;
  const totalPlannedCost = mockCostCodeData.reduce((acc, c) => acc + c.plannedCost, 0);
  const totalActualCost = mockCostCodeData.reduce((acc, c) => acc + c.actualCost, 0);
  const costVariance = ((totalActualCost - totalPlannedCost) / totalPlannedCost) * 100;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const exportData: any[] = [];
    
    mockCostCodeData.forEach(costCode => {
      costCode.materials.forEach(material => {
        exportData.push({
          'Mã công việc': costCode.code,
          'Tên công việc': costCode.name,
          'Hạng mục': costCode.category,
          'KL kế hoạch': costCode.plannedQty,
          'KL thực tế': costCode.actualQty,
          'ĐVT': costCode.unit,
          'Mã vật tư': material.code,
          'Tên vật tư': material.name,
          'VT kế hoạch': material.planned,
          'VT thực tế': material.actual,
          'ĐVT VT': material.unit,
          'Giá trị VT': material.value,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Phân tích theo công việc');
    
    XLSX.writeFile(wb, `Phan_tich_cong_viec_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất dữ liệu ${mockCostCodeData.length} công việc.`,
    });
  };

  // Filter cost codes
  const filteredCostCodes = mockCostCodeData.filter(costCode => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!costCode.code.toLowerCase().includes(query) && 
          !costCode.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (categoryFilter !== 'all' && costCode.category !== categoryFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Công việc"
          value={totalCostCodes.toString()}
          subtitle="Đang theo dõi"
          variant="primary"
        />
        <KPICard
          title="Chi phí kế hoạch"
          value={formatCurrency(totalPlannedCost)}
          subtitle="Tổng dự toán"
        />
        <KPICard
          title="Chi phí thực tế"
          value={formatCurrency(totalActualCost)}
          subtitle="Đã phát sinh"
        />
        <KPICard
          title="Chênh lệch"
          value={`${costVariance > 0 ? '+' : ''}${costVariance.toFixed(1)}%`}
          subtitle={costVariance < 0 ? 'Tiết kiệm' : 'Vượt dự toán'}
          variant={costVariance > 5 ? 'destructive' : costVariance < 0 ? 'success' : 'accent'}
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
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Hạng mục" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />
        
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Cost Codes Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10"></th>
              <th>Mã CV</th>
              <th>Tên công việc</th>
              <th>Hạng mục</th>
              <th className="text-center">Tiến độ</th>
              <th className="text-right">Chi phí KH</th>
              <th className="text-right">Chi phí TT</th>
              <th className="text-center">Chênh lệch</th>
            </tr>
          </thead>
          <tbody>
            {filteredCostCodes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy công việc phù hợp
                </td>
              </tr>
            ) : (
              filteredCostCodes.map((costCode) => {
                const isExpanded = expandedRows.includes(costCode.id);
                const progress = (costCode.actualQty / costCode.plannedQty) * 100;
                const variance = ((costCode.actualCost - costCode.plannedCost) / costCode.plannedCost) * 100;
                
                return (
                  <React.Fragment key={costCode.id}>
                    <tr 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(costCode.id)}
                    >
                      <td className="text-center">
                        <span className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </td>
                      <td className="font-medium">{costCode.code}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          {costCode.name}
                        </div>
                      </td>
                      <td>
                        <Badge variant="outline">{costCode.category}</Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(progress, 100)} className="h-2 flex-1" />
                          <span className="text-sm font-medium w-12 text-right">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="text-right">{formatCurrency(costCode.plannedCost)}</td>
                      <td className="text-right font-medium">{formatCurrency(costCode.actualCost)}</td>
                      <td className="text-center">
                        <StatusBadge 
                          status={variance > 5 ? 'danger' : variance < -2 ? 'success' : 'neutral'}
                          dot={false}
                        >
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                        </StatusBadge>
                      </td>
                    </tr>
                    
                    {/* Expanded material details */}
                    {isExpanded && (
                      <tr className="bg-muted/30">
                        <td colSpan={8} className="p-0">
                          <div className="p-4">
                            <div className="flex items-center gap-4 mb-3 text-sm">
                              <span className="text-muted-foreground">Khối lượng:</span>
                              <span className="font-medium">{costCode.actualQty.toLocaleString()} / {costCode.plannedQty.toLocaleString()} {costCode.unit}</span>
                            </div>
                            
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mã VT</th>
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Tên vật tư</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Kế hoạch</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Thực tế</th>
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">ĐVT</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Giá trị</th>
                                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Chênh lệch</th>
                                </tr>
                              </thead>
                              <tbody>
                                {costCode.materials.map((material, idx) => {
                                  const matVariance = ((material.actual - material.planned) / material.planned) * 100;
                                  return (
                                    <tr key={idx} className="border-b border-border/50 last:border-0">
                                      <td className="py-2 px-3 font-medium">{material.code}</td>
                                      <td className="py-2 px-3">{material.name}</td>
                                      <td className="py-2 px-3 text-right">{material.planned.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-right font-medium">{material.actual.toLocaleString()}</td>
                                      <td className="py-2 px-3">{material.unit}</td>
                                      <td className="py-2 px-3 text-right">{formatCurrency(material.value)}</td>
                                      <td className="py-2 px-3 text-center">
                                        <span className={
                                          matVariance > 5 ? 'text-destructive font-medium' : 
                                          matVariance < -2 ? 'text-success' : ''
                                        }>
                                          {matVariance > 0 ? '+' : ''}{matVariance.toFixed(1)}%
                                        </span>
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
        Hiển thị {filteredCostCodes.length} / {mockCostCodeData.length} công việc
      </div>
    </div>
  );
};
