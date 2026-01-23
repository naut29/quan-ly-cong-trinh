import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Plus, Pencil, Trash2, Warehouse, MapPin, Phone, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface WarehouseData {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  notes: string;
}

interface WarehouseManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialWarehouses: WarehouseData[] = [
  { id: '1', code: 'KHO-A', name: 'Kho A - Chính', address: 'Lô A1, Khu công trình', manager: 'Nguyễn Văn A', phone: '0901234567', notes: 'Kho chính lưu trữ thép, bê tông' },
  { id: '2', code: 'KHO-B', name: 'Kho B - Phụ', address: 'Lô B2, Khu công trình', manager: 'Trần Thị B', phone: '0902345678', notes: 'Kho phụ lưu trữ vật tư hoàn thiện' },
  { id: '3', code: 'KHO-C', name: 'Kho C - Tạm', address: 'Lô C3, Khu công trình', manager: 'Lê Văn C', phone: '0903456789', notes: 'Kho tạm cho vật tư MEP' },
];

export const WarehouseManagementDialog: React.FC<WarehouseManagementDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>(initialWarehouses);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    manager: '',
    phone: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({ code: '', name: '', address: '', manager: '', phone: '', notes: '' });
    setEditingWarehouse(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (warehouse: WarehouseData) => {
    setEditingWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address,
      manager: warehouse.manager,
      phone: warehouse.phone,
      notes: warehouse.notes,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
    setDeleteId(null);
    toast({
      title: 'Đã xóa kho',
      description: 'Kho đã được xóa thành công.',
    });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã và tên kho.',
        variant: 'destructive',
      });
      return;
    }

    if (editingWarehouse) {
      setWarehouses(prev =>
        prev.map(w =>
          w.id === editingWarehouse.id
            ? { ...w, ...formData }
            : w
        )
      );
      toast({
        title: 'Cập nhật thành công',
        description: `Kho ${formData.name} đã được cập nhật.`,
      });
    } else {
      const newWarehouse: WarehouseData = {
        id: Date.now().toString(),
        ...formData,
      };
      setWarehouses(prev => [...prev, newWarehouse]);
      toast({
        title: 'Thêm thành công',
        description: `Kho ${formData.name} đã được thêm.`,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Quản lý Kho
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {!isFormOpen ? (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm kho
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã kho</TableHead>
                      <TableHead>Tên kho</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Thủ kho</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead className="w-24">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.code}</TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell>{warehouse.address}</TableCell>
                        <TableCell>{warehouse.manager}</TableCell>
                        <TableCell>{warehouse.phone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(warehouse)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(warehouse.id)}
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
                    <Label htmlFor="code">Mã kho *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="VD: KHO-D"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên kho *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Kho D - Vật tư điện"
                    />
                  </div>
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
                    placeholder="Địa chỉ kho"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Thủ kho
                    </Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                      placeholder="Tên thủ kho"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ghi chú về kho..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingWarehouse ? 'Cập nhật' : 'Thêm kho'}
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
            <AlertDialogTitle>Xác nhận xóa kho</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kho này? Hành động này không thể hoàn tác.
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
    </>
  );
};
