import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface MaterialRequestFormItem {
  id: string;
  materialCode: string;
  materialName: string;
  unit: string;
  requestedQty: number;
}

interface MaterialRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  initialData?: {
    title: string;
    requestDate: string;
    requiredDate: string;
    requester: string;
    department: string;
    supplier?: string;
    notes?: string;
    items: MaterialRequestFormItem[];
  };
  onSubmit: (data: {
    title: string;
    requestDate: string;
    requiredDate: string;
    requester: string;
    department: string;
    supplier: string;
    notes: string;
    items: MaterialRequestFormItem[];
  }) => void;
}

// Mock material list for selection
const availableMaterials = [
  { code: 'THEP-16', name: 'Thép phi 16 SD390', unit: 'kg' },
  { code: 'THEP-12', name: 'Thép phi 12 SD390', unit: 'kg' },
  { code: 'THEP-10', name: 'Thép phi 10 SD390', unit: 'kg' },
  { code: 'THEP-8', name: 'Thép phi 8 SD390', unit: 'kg' },
  { code: 'BT-C30', name: 'Bê tông C30', unit: 'm³' },
  { code: 'BT-C25', name: 'Bê tông C25', unit: 'm³' },
  { code: 'XI-MANG', name: 'Xi măng PCB40', unit: 'bao' },
  { code: 'CAT-XD', name: 'Cát xây dựng', unit: 'm³' },
  { code: 'DA-1X2', name: 'Đá 1x2', unit: 'm³' },
  { code: 'GACH-ONG', name: 'Gạch ống 8x8x19', unit: 'viên' },
  { code: 'VAN-10x20', name: 'Ván coffa 10x20cm', unit: 'tấm' },
  { code: 'GIAN-GIAO', name: 'Giàn giáo tiêu chuẩn', unit: 'bộ' },
  { code: 'ONG-DN100', name: 'Ống PVC DN100', unit: 'm' },
  { code: 'ONG-DN50', name: 'Ống PVC DN50', unit: 'm' },
  { code: 'DAY-1.5', name: 'Dây điện 1.5mm²', unit: 'm' },
  { code: 'DAY-2.5', name: 'Dây điện 2.5mm²', unit: 'm' },
  { code: 'SON-NT', name: 'Sơn nội thất cao cấp', unit: 'thùng' },
  { code: 'SON-NGT', name: 'Sơn ngoại thất', unit: 'thùng' },
  { code: 'BOT-TT', name: 'Bột trét tường', unit: 'bao' },
];

const MaterialRequestFormDialog: React.FC<MaterialRequestFormDialogProps> = ({
  open,
  onOpenChange,
  editMode,
  initialData,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [requiredDate, setRequiredDate] = useState('');
  const [requester, setRequester] = useState('');
  const [department, setDepartment] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MaterialRequestFormItem[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setRequestDate(initialData.requestDate);
        setRequiredDate(initialData.requiredDate);
        setRequester(initialData.requester);
        setDepartment(initialData.department);
        setSupplier(initialData.supplier || '');
        setNotes(initialData.notes || '');
        setItems(initialData.items.map(item => ({
          id: item.id,
          materialCode: item.materialCode,
          materialName: item.materialName,
          unit: item.unit,
          requestedQty: item.requestedQty,
        })));
      } else {
        setTitle('');
        setRequestDate(new Date().toISOString().split('T')[0]);
        setRequiredDate('');
        setRequester('');
        setDepartment('');
        setSupplier('');
        setNotes('');
        setItems([]);
      }
    }
  }, [open, initialData]);

  const handleAddItem = () => {
    const newItem: MaterialRequestFormItem = {
      id: `item-${Date.now()}`,
      materialCode: '',
      materialName: '',
      unit: '',
      requestedQty: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof MaterialRequestFormItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      
      // If selecting a material, auto-fill name and unit
      if (field === 'materialCode') {
        const selectedMaterial = availableMaterials.find(m => m.code === value);
        if (selectedMaterial) {
          return {
            ...item,
            materialCode: selectedMaterial.code,
            materialName: selectedMaterial.name,
            unit: selectedMaterial.unit,
          };
        }
      }
      
      return { ...item, [field]: value };
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      requestDate,
      requiredDate,
      requester,
      department,
      supplier,
      notes,
      items,
    });
  };

  const isValid = title && requester && department && requiredDate && items.length > 0 && 
    items.every(item => item.materialCode && item.requestedQty > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Chỉnh sửa yêu cầu vật tư' : 'Tạo yêu cầu vật tư mới'}
          </DialogTitle>
          <DialogDescription>
            {editMode ? 'Cập nhật thông tin yêu cầu vật tư' : 'Điền thông tin và danh sách vật tư cần yêu cầu'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-2">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề yêu cầu <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="VD: Yêu cầu vật tư thép tầng 8" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestDate">Ngày yêu cầu</Label>
                  <Input 
                    id="requestDate" 
                    type="date" 
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredDate">Ngày cần <span className="text-destructive">*</span></Label>
                  <Input 
                    id="requiredDate" 
                    type="date" 
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requester">Người yêu cầu <span className="text-destructive">*</span></Label>
                  <Input 
                    id="requester" 
                    placeholder="Tên người yêu cầu" 
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Bộ phận <span className="text-destructive">*</span></Label>
                  <Input 
                    id="department" 
                    placeholder="Bộ phận/Đội" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Nhà cung cấp (tùy chọn)</Label>
                <Input 
                  id="supplier" 
                  placeholder="Chọn hoặc nhập nhà cung cấp" 
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
            </div>

            {/* Materials List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Danh sách vật tư <span className="text-destructive">*</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm vật tư
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-3">Chưa có vật tư nào trong yêu cầu</p>
                  <Button type="button" variant="outline" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm vật tư đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Vật tư</th>
                        <th className="text-left p-3 font-medium w-24">ĐVT</th>
                        <th className="text-right p-3 font-medium w-32">Số lượng</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="p-2">
                            <Select
                              value={item.materialCode}
                              onValueChange={(value) => handleItemChange(item.id, 'materialCode', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Chọn vật tư..." />
                              </SelectTrigger>
                              <SelectContent className="bg-popover z-50">
                                {availableMaterials.map((material) => (
                                  <SelectItem key={material.code} value={material.code}>
                                    <span className="font-mono text-xs text-muted-foreground mr-2">{material.code}</span>
                                    {material.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input 
                              value={item.unit} 
                              readOnly 
                              className="h-9 bg-muted/50 text-center"
                              placeholder="—"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              value={item.requestedQty || ''}
                              onChange={(e) => handleItemChange(item.id, 'requestedQty', Number(e.target.value))}
                              className="h-9 text-right"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Add more button */}
                  <div className="border-t border-border p-2 bg-muted/30">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={handleAddItem}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm dòng
                    </Button>
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Tổng: {items.length} vật tư
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea 
                id="notes" 
                placeholder="Ghi chú thêm về yêu cầu..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {editMode ? 'Cập nhật' : 'Tạo yêu cầu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialRequestFormDialog;
