import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Package, Search, Upload, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MaterialImportDialog, ImportedMaterial } from './MaterialImportDialog';
import * as XLSX from 'xlsx';

export interface MaterialData {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  minStock: number;
  notes: string;
}

interface MaterialManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { id: 'steel', label: 'Thép' },
  { id: 'concrete', label: 'Bê tông' },
  { id: 'foundation', label: 'Cọc/Móng' },
  { id: 'formwork', label: 'Coffa/Giàn giáo' },
  { id: 'mep', label: 'MEP' },
  { id: 'finishing', label: 'Hoàn thiện' },
  { id: 'consumables', label: 'Vật tư phụ' },
];

const units = ['kg', 'm³', 'm²', 'm', 'cái', 'bao', 'thùng', 'tấn', 'lít'];

const initialMaterials: MaterialData[] = [
  { id: '1', code: 'THEP-16', name: 'Thép phi 16 SD390', category: 'steel', unit: 'kg', price: 18500, minStock: 5000, notes: '' },
  { id: '2', code: 'THEP-12', name: 'Thép phi 12 SD390', category: 'steel', unit: 'kg', price: 18500, minStock: 3000, notes: '' },
  { id: '3', code: 'THEP-10', name: 'Thép phi 10 SD390', category: 'steel', unit: 'kg', price: 18500, minStock: 2000, notes: '' },
  { id: '4', code: 'BT-C30', name: 'Bê tông C30', category: 'concrete', unit: 'm³', price: 1250000, minStock: 50, notes: '' },
  { id: '5', code: 'BT-C25', name: 'Bê tông C25', category: 'concrete', unit: 'm³', price: 1150000, minStock: 30, notes: '' },
  { id: '6', code: 'XIMANG-PCB40', name: 'Xi măng PCB40', category: 'consumables', unit: 'bao', price: 95000, minStock: 200, notes: '' },
  { id: '7', code: 'CAT-VANG', name: 'Cát vàng xây dựng', category: 'consumables', unit: 'm³', price: 280000, minStock: 50, notes: '' },
];

export const MaterialManagementDialog: React.FC<MaterialManagementDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [materials, setMaterials] = useState<MaterialData[]>(initialMaterials);
  const [editingMaterial, setEditingMaterial] = useState<MaterialData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    unit: '',
    price: 0,
    minStock: 0,
    notes: '',
  });

  const resetForm = () => {
    setFormData({ code: '', name: '', category: '', unit: '', price: 0, minStock: 0, notes: '' });
    setEditingMaterial(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (material: MaterialData) => {
    setEditingMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      category: material.category,
      unit: material.unit,
      price: material.price,
      minStock: material.minStock,
      notes: material.notes,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    setDeleteId(null);
    toast({
      title: 'Đã xóa vật tư',
      description: 'Vật tư đã được xóa thành công.',
    });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.category || !formData.unit) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
        variant: 'destructive',
      });
      return;
    }

    if (editingMaterial) {
      setMaterials(prev =>
        prev.map(m =>
          m.id === editingMaterial.id
            ? { ...m, ...formData }
            : m
        )
      );
      toast({
        title: 'Cập nhật thành công',
        description: `Vật tư ${formData.name} đã được cập nhật.`,
      });
    } else {
      const newMaterial: MaterialData = {
        id: Date.now().toString(),
        ...formData,
      };
      setMaterials(prev => [...prev, newMaterial]);
      toast({
        title: 'Thêm thành công',
        description: `Vật tư ${formData.name} đã được thêm.`,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  const handleImport = (data: ImportedMaterial[]) => {
    const newMaterials = data.map((item, index) => ({
      id: `imported-${Date.now()}-${index}`,
      ...item,
    }));
    setMaterials(prev => [...prev, ...newMaterials]);
    toast({
      title: 'Import thành công',
      description: `Đã thêm ${data.length} vật tư vào danh mục.`,
    });
  };

  const handleExport = () => {
    const exportData = materials.map(m => ({
      'Mã vật tư': m.code,
      'Tên vật tư': m.name,
      'Nhóm': getCategoryLabel(m.category),
      'Đơn vị': m.unit,
      'Đơn giá': m.price,
      'Tồn tối thiểu': m.minStock,
      'Ghi chú': m.notes,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục vật tư');
    
    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Mã vật tư
      { wch: 35 }, // Tên vật tư
      { wch: 15 }, // Nhóm
      { wch: 10 }, // Đơn vị
      { wch: 15 }, // Đơn giá
      { wch: 15 }, // Tồn tối thiểu
      { wch: 30 }, // Ghi chú
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Danh_muc_vat_tu_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất ${materials.length} vật tư ra file Excel.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quản lý Danh mục Vật tư
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {!isFormOpen ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm vật tư..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Xuất Excel
                  </Button>
                  <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import Excel
                  </Button>
                  <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm vật tư
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã VT</TableHead>
                      <TableHead>Tên vật tư</TableHead>
                      <TableHead>Nhóm</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Tồn tối thiểu</TableHead>
                      <TableHead className="w-24">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.code}</TableCell>
                        <TableCell>{material.name}</TableCell>
                        <TableCell>{getCategoryLabel(material.category)}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell className="text-right">{material.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{material.minStock.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(material)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(material.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Mã vật tư *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="VD: THEP-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên vật tư *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Thép phi 20 SD390"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nhóm vật tư *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Đơn vị tính *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ĐVT" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Đơn giá (VNĐ)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Tồn kho tối thiểu</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Mô tả, quy cách, tiêu chuẩn..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingMaterial ? 'Cập nhật' : 'Thêm vật tư'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vật tư</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vật tư này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MaterialImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </>
  );
};
