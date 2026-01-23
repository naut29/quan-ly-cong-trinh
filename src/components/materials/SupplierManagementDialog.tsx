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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2, Search, Mail, Phone, MapPin, User, Upload, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SupplierImportDialog, ImportedSupplier } from './SupplierImportDialog';
import * as XLSX from 'xlsx';

export interface SupplierData {
  id: string;
  code: string;
  name: string;
  taxCode: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  materials: string[];
  notes: string;
}

interface SupplierManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialSuppliers: SupplierData[] = [
  { 
    id: '1', 
    code: 'NCC-001', 
    name: 'VLXD Tân Phú', 
    taxCode: '0309123456',
    address: '123 Trường Chinh, Q.Tân Phú, TP.HCM',
    contactPerson: 'Nguyễn Văn Tân',
    phone: '0901234567',
    email: 'contact@vlxdtanphu.vn',
    materials: ['Xi măng', 'Cát', 'Đá'],
    notes: 'NCC uy tín, giao hàng đúng hẹn'
  },
  { 
    id: '2', 
    code: 'NCC-002', 
    name: 'Hòa Phát Steel', 
    taxCode: '0101012345',
    address: 'KCN Phố Nối A, Hưng Yên',
    contactPerson: 'Trần Minh Đức',
    phone: '0902345678',
    email: 'sales@hoaphat.com.vn',
    materials: ['Thép xây dựng', 'Thép cuộn'],
    notes: 'Nhà máy lớn, chất lượng ổn định'
  },
  { 
    id: '3', 
    code: 'NCC-003', 
    name: 'Pomina Steel', 
    taxCode: '0303456789',
    address: 'KCN Phú Mỹ I, Bà Rịa - Vũng Tàu',
    contactPerson: 'Lê Thị Hương',
    phone: '0903456789',
    email: 'order@pomina.com.vn',
    materials: ['Thép xây dựng'],
    notes: ''
  },
  { 
    id: '4', 
    code: 'NCC-004', 
    name: 'Bê tông Việt Đức', 
    taxCode: '0305678901',
    address: '45 Xa Lộ Hà Nội, Q.9, TP.HCM',
    contactPerson: 'Phạm Văn Hùng',
    phone: '0904567890',
    email: 'info@betonvietduc.vn',
    materials: ['Bê tông tươi', 'Vữa xây'],
    notes: 'Có trạm trộn gần công trình'
  },
];

export const SupplierManagementDialog: React.FC<SupplierManagementDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>(initialSuppliers);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taxCode: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    materials: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({ 
      code: '', 
      name: '', 
      taxCode: '', 
      address: '', 
      contactPerson: '', 
      phone: '', 
      email: '', 
      materials: '', 
      notes: '' 
    });
    setEditingSupplier(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: SupplierData) => {
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code,
      name: supplier.name,
      taxCode: supplier.taxCode,
      address: supplier.address,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      materials: supplier.materials.join(', '),
      notes: supplier.notes,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
    toast({
      title: 'Đã xóa nhà cung cấp',
      description: 'Nhà cung cấp đã được xóa thành công.',
    });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã và tên nhà cung cấp.',
        variant: 'destructive',
      });
      return;
    }

    const materialsArray = formData.materials
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (editingSupplier) {
      setSuppliers(prev =>
        prev.map(s =>
          s.id === editingSupplier.id
            ? { ...s, ...formData, materials: materialsArray }
            : s
        )
      );
      toast({
        title: 'Cập nhật thành công',
        description: `NCC ${formData.name} đã được cập nhật.`,
      });
    } else {
      const newSupplier: SupplierData = {
        id: Date.now().toString(),
        ...formData,
        materials: materialsArray,
      };
      setSuppliers(prev => [...prev, newSupplier]);
      toast({
        title: 'Thêm thành công',
        description: `NCC ${formData.name} đã được thêm.`,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImport = (data: ImportedSupplier[]) => {
    const newSuppliers = data.map((item, index) => ({
      id: `imported-${Date.now()}-${index}`,
      ...item,
    }));
    setSuppliers(prev => [...prev, ...newSuppliers]);
    toast({
      title: 'Import thành công',
      description: `Đã thêm ${data.length} nhà cung cấp vào danh sách.`,
    });
  };

  const handleExport = () => {
    const exportData = suppliers.map(s => ({
      'Mã NCC': s.code,
      'Tên nhà cung cấp': s.name,
      'Mã số thuế': s.taxCode,
      'Địa chỉ': s.address,
      'Người liên hệ': s.contactPerson,
      'Điện thoại': s.phone,
      'Email': s.email,
      'Vật tư cung cấp': s.materials.join(', '),
      'Ghi chú': s.notes,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhà cung cấp');
    
    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Mã NCC
      { wch: 30 }, // Tên NCC
      { wch: 15 }, // MST
      { wch: 40 }, // Địa chỉ
      { wch: 20 }, // Người liên hệ
      { wch: 15 }, // Điện thoại
      { wch: 25 }, // Email
      { wch: 30 }, // Vật tư
      { wch: 25 }, // Ghi chú
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Danh_sach_NCC_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất ${suppliers.length} nhà cung cấp ra file Excel.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Quản lý Nhà cung cấp
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {!isFormOpen ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm nhà cung cấp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
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
                    Thêm NCC
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã NCC</TableHead>
                      <TableHead>Tên nhà cung cấp</TableHead>
                      <TableHead>Người liên hệ</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead>Vật tư cung cấp</TableHead>
                      <TableHead className="w-24">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-xs text-muted-foreground">{supplier.taxCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.contactPerson}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {supplier.materials.slice(0, 2).map((m, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {m}
                              </Badge>
                            ))}
                            {supplier.materials.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{supplier.materials.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(supplier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(supplier.id)}
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
                    <Label htmlFor="code">Mã NCC *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="VD: NCC-005"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên nhà cung cấp *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Công ty TNHH ABC"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxCode">Mã số thuế</Label>
                  <Input
                    id="taxCode"
                    value={formData.taxCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxCode: e.target.value }))}
                    placeholder="Mã số thuế"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Địa chỉ nhà cung cấp"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Người liên hệ
                    </Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="Họ tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Số điện thoại"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materials">Vật tư cung cấp (phân cách bằng dấu phẩy)</Label>
                  <Input
                    id="materials"
                    value={formData.materials}
                    onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                    placeholder="VD: Thép, Xi măng, Cát"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ghi chú về nhà cung cấp..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingSupplier ? 'Cập nhật' : 'Thêm NCC'}
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
            <AlertDialogTitle>Xác nhận xóa nhà cung cấp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhà cung cấp này? Hành động này không thể hoàn tác.
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

      <SupplierImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </>
  );
};
