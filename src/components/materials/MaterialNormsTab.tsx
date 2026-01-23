import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Calculator,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KPICard } from '@/components/ui/kpi-card';
import * as XLSX from 'xlsx';

// Mock data for material norms
const mockNorms = [
  { 
    id: '1', 
    workCode: 'COT-C1', 
    workName: 'Cột tầng 1 - Bê tông C30', 
    workUnit: 'm³',
    materials: [
      { materialCode: 'BT-C30', materialName: 'Bê tông C30', unit: 'm³', normQty: 1.02, actualQty: 1.05, variance: 2.94 },
      { materialCode: 'THEP-16', materialName: 'Thép phi 16 SD390', unit: 'kg', normQty: 120, actualQty: 125, variance: 4.17 },
      { materialCode: 'THEP-12', materialName: 'Thép phi 12 SD390', unit: 'kg', normQty: 45, actualQty: 44, variance: -2.22 },
    ]
  },
  { 
    id: '2', 
    workCode: 'SAN-T1', 
    workName: 'Sàn tầng 1 - Bê tông C25', 
    workUnit: 'm²',
    materials: [
      { materialCode: 'BT-C25', materialName: 'Bê tông C25', unit: 'm³', normQty: 0.15, actualQty: 0.16, variance: 6.67 },
      { materialCode: 'THEP-10', materialName: 'Thép phi 10 SD390', unit: 'kg', normQty: 18, actualQty: 17.5, variance: -2.78 },
    ]
  },
  { 
    id: '3', 
    workCode: 'DAM-D1', 
    workName: 'Dầm tầng 1 - Bê tông C30', 
    workUnit: 'm',
    materials: [
      { materialCode: 'BT-C30', materialName: 'Bê tông C30', unit: 'm³', normQty: 0.25, actualQty: 0.26, variance: 4.00 },
      { materialCode: 'THEP-16', materialName: 'Thép phi 16 SD390', unit: 'kg', normQty: 35, actualQty: 36, variance: 2.86 },
      { materialCode: 'THEP-12', materialName: 'Thép phi 12 SD390', unit: 'kg', normQty: 22, actualQty: 21, variance: -4.55 },
    ]
  },
  { 
    id: '4', 
    workCode: 'MONG-M1', 
    workName: 'Móng băng M1', 
    workUnit: 'm³',
    materials: [
      { materialCode: 'BT-C25', materialName: 'Bê tông C25', unit: 'm³', normQty: 1.05, actualQty: 1.08, variance: 2.86 },
      { materialCode: 'THEP-16', materialName: 'Thép phi 16 SD390', unit: 'kg', normQty: 85, actualQty: 88, variance: 3.53 },
      { materialCode: 'COC-D400', materialName: 'Cọc BTCT D400', unit: 'm', normQty: 24, actualQty: 24, variance: 0 },
    ]
  },
  { 
    id: '5', 
    workCode: 'TUONG-T1', 
    workName: 'Tường xây gạch tầng 1', 
    workUnit: 'm²',
    materials: [
      { materialCode: 'GACH-10x20', materialName: 'Gạch xây 10x20', unit: 'viên', normQty: 52, actualQty: 55, variance: 5.77 },
      { materialCode: 'XIMANG-PCB40', materialName: 'Xi măng PCB40', unit: 'kg', normQty: 25, actualQty: 26, variance: 4.00 },
      { materialCode: 'CAT-VL', materialName: 'Cát vàng', unit: 'm³', normQty: 0.03, actualQty: 0.032, variance: 6.67 },
    ]
  },
];

const workCategories = [
  { id: 'all', label: 'Tất cả hạng mục' },
  { id: 'foundation', label: 'Móng' },
  { id: 'structure', label: 'Kết cấu' },
  { id: 'masonry', label: 'Xây tô' },
  { id: 'finishing', label: 'Hoàn thiện' },
];

interface NormFormData {
  workCode: string;
  workName: string;
  workUnit: string;
  materialCode: string;
  materialName: string;
  unit: string;
  normQty: number;
  notes: string;
}

const defaultFormData: NormFormData = {
  workCode: '',
  workName: '',
  workUnit: '',
  materialCode: '',
  materialName: '',
  unit: '',
  normQty: 0,
  notes: '',
};

export const MaterialNormsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [varianceFilter, setVarianceFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NormFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Calculate KPIs
  const totalNorms = mockNorms.length;
  const totalMaterialNorms = mockNorms.reduce((acc, norm) => acc + norm.materials.length, 0);
  const averageVariance = mockNorms.reduce((acc, norm) => {
    const avgNormVariance = norm.materials.reduce((sum, m) => sum + Math.abs(m.variance), 0) / norm.materials.length;
    return acc + avgNormVariance;
  }, 0) / mockNorms.length;
  const overLimitCount = mockNorms.reduce((acc, norm) => {
    return acc + norm.materials.filter(m => m.variance > 5).length;
  }, 0);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleAddNorm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    toast({
      title: editingId ? 'Cập nhật thành công' : 'Thêm định mức thành công',
      description: `Định mức cho ${formData.workCode} đã được ${editingId ? 'cập nhật' : 'thêm'}.`,
    });
    setDialogOpen(false);
    setFormData(defaultFormData);
  };

  const handleExport = () => {
    const exportData: any[] = [];
    
    mockNorms.forEach(norm => {
      norm.materials.forEach(material => {
        exportData.push({
          'Mã công việc': norm.workCode,
          'Tên công việc': norm.workName,
          'ĐVT công việc': norm.workUnit,
          'Mã vật tư': material.materialCode,
          'Tên vật tư': material.materialName,
          'ĐVT vật tư': material.unit,
          'Định mức': material.normQty,
          'Thực tế': material.actualQty,
          'Chênh lệch (%)': material.variance.toFixed(2) + '%',
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Định mức vật tư');
    
    const colWidths = [
      { wch: 15 }, { wch: 35 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 },
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Dinh_muc_vat_tu_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất ${exportData.length} định mức ra file Excel.`,
    });
  };

  // Filter norms
  const filteredNorms = mockNorms.filter(norm => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!norm.workCode.toLowerCase().includes(query) && 
          !norm.workName.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (varianceFilter !== 'all') {
      const hasOverLimit = norm.materials.some(m => m.variance > 5);
      const allGood = norm.materials.every(m => Math.abs(m.variance) <= 5);
      
      if (varianceFilter === 'over' && !hasOverLimit) return false;
      if (varianceFilter === 'good' && !allGood) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Số hạng mục"
          value={totalNorms.toString()}
          subtitle="Có định mức"
          variant="primary"
        />
        <KPICard
          title="Tổng định mức"
          value={totalMaterialNorms.toString()}
          subtitle="Vật tư - công việc"
        />
        <KPICard
          title="Chênh lệch TB"
          value={`${averageVariance.toFixed(1)}%`}
          subtitle="Định mức: ≤5%"
          variant={averageVariance > 5 ? 'destructive' : 'success'}
        />
        <KPICard
          title="Vượt định mức"
          value={overLimitCount.toString()}
          subtitle="Cần xem xét"
          variant={overLimitCount > 0 ? 'destructive' : 'success'}
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
            {workCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={varianceFilter} onValueChange={setVarianceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Chênh lệch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="good">Trong định mức</SelectItem>
            <SelectItem value="over">Vượt định mức</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />
        
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Excel
        </Button>
        
        <Button className="gap-2" onClick={handleAddNorm}>
          <Plus className="h-4 w-4" />
          Thêm định mức
        </Button>
      </div>

      {/* Norms Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10"></th>
              <th>Mã công việc</th>
              <th>Tên công việc</th>
              <th>ĐVT</th>
              <th className="text-center">Số VT</th>
              <th className="text-right">Chênh lệch TB</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredNorms.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy định mức phù hợp
                </td>
              </tr>
            ) : (
              filteredNorms.map((norm) => {
                const isExpanded = expandedRows.includes(norm.id);
                const avgVariance = norm.materials.reduce((sum, m) => sum + m.variance, 0) / norm.materials.length;
                const hasOverLimit = norm.materials.some(m => m.variance > 5);
                
                return (
                  <React.Fragment key={norm.id}>
                    <tr 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(norm.id)}
                    >
                      <td className="text-center">
                        <span className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </td>
                      <td className="font-medium">{norm.workCode}</td>
                      <td>{norm.workName}</td>
                      <td>{norm.workUnit}</td>
                      <td className="text-center">
                        <Badge variant="secondary">{norm.materials.length} vật tư</Badge>
                      </td>
                      <td className="text-right">
                        <span className={avgVariance > 5 ? 'text-destructive font-medium' : avgVariance < 0 ? 'text-success' : ''}>
                          {avgVariance > 0 ? '+' : ''}{avgVariance.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-center">
                        {hasOverLimit ? (
                          <StatusBadge status="warning" dot={false}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Vượt định mức
                          </StatusBadge>
                        ) : (
                          <StatusBadge status="success" dot={false}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Đạt
                          </StatusBadge>
                        )}
                      </td>
                      <td className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    
                    {/* Expanded material details */}
                    {isExpanded && (
                      <tr className="bg-muted/30">
                        <td colSpan={8} className="p-0">
                          <div className="p-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mã VT</th>
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Tên vật tư</th>
                                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">ĐVT</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Định mức</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Thực tế</th>
                                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Chênh lệch</th>
                                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Xu hướng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {norm.materials.map((material, idx) => (
                                  <tr key={idx} className="border-b border-border/50 last:border-0">
                                    <td className="py-2 px-3 font-medium">{material.materialCode}</td>
                                    <td className="py-2 px-3">{material.materialName}</td>
                                    <td className="py-2 px-3">{material.unit}</td>
                                    <td className="py-2 px-3 text-right">{material.normQty.toLocaleString()}</td>
                                    <td className="py-2 px-3 text-right font-medium">{material.actualQty.toLocaleString()}</td>
                                    <td className="py-2 px-3 text-right">
                                      <span className={
                                        material.variance > 5 ? 'text-destructive font-medium' : 
                                        material.variance < 0 ? 'text-success' : ''
                                      }>
                                        {material.variance > 0 ? '+' : ''}{material.variance.toFixed(2)}%
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      {material.variance > 0 ? (
                                        <TrendingUp className={`h-4 w-4 inline ${material.variance > 5 ? 'text-destructive' : 'text-warning'}`} />
                                      ) : material.variance < 0 ? (
                                        <TrendingDown className="h-4 w-4 inline text-success" />
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
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
        Hiển thị {filteredNorms.length} / {mockNorms.length} hạng mục
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {editingId ? 'Sửa định mức' : 'Thêm định mức mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã công việc *</Label>
                <Input
                  value={formData.workCode}
                  onChange={(e) => setFormData({ ...formData, workCode: e.target.value })}
                  placeholder="VD: COT-C1"
                />
              </div>
              <div className="space-y-2">
                <Label>ĐVT công việc *</Label>
                <Input
                  value={formData.workUnit}
                  onChange={(e) => setFormData({ ...formData, workUnit: e.target.value })}
                  placeholder="VD: m³"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tên công việc *</Label>
              <Input
                value={formData.workName}
                onChange={(e) => setFormData({ ...formData, workName: e.target.value })}
                placeholder="VD: Cột tầng 1 - Bê tông C30"
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <Label className="text-base font-medium">Thông tin vật tư</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã vật tư *</Label>
                <Input
                  value={formData.materialCode}
                  onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                  placeholder="VD: THEP-16"
                />
              </div>
              <div className="space-y-2">
                <Label>ĐVT vật tư *</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="VD: kg"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tên vật tư *</Label>
              <Input
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                placeholder="VD: Thép phi 16 SD390"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Định mức (lượng VT / 1 ĐVT công việc) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.normQty || ''}
                onChange={(e) => setFormData({ ...formData, normQty: parseFloat(e.target.value) || 0 })}
                placeholder="VD: 120"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Cập nhật' : 'Thêm định mức'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
