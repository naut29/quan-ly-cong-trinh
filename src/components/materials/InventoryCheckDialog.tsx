import React, { useState } from 'react';
import { ClipboardList, Loader2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  systemStock: number;
  actualStock: number | null;
}

interface InventoryCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (items: InventoryItem[]) => void;
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  { id: '1', code: 'THEP-16', name: 'Thép phi 16 SD390', unit: 'kg', systemStock: 17000, actualStock: null },
  { id: '2', code: 'THEP-12', name: 'Thép phi 12 SD390', unit: 'kg', systemStock: 8000, actualStock: null },
  { id: '3', code: 'THEP-10', name: 'Thép phi 10 SD390', unit: 'kg', systemStock: 4000, actualStock: null },
  { id: '4', code: 'BT-C30', name: 'Bê tông C30', unit: 'm³', systemStock: 200, actualStock: null },
  { id: '5', code: 'BT-C25', name: 'Bê tông C25', unit: 'm³', systemStock: 130, actualStock: null },
  { id: '6', code: 'XI-MANG', name: 'Xi măng PCB40', unit: 'bao', systemStock: 250, actualStock: null },
];

export const InventoryCheckDialog: React.FC<InventoryCheckDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);

  const handleActualStockChange = (id: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value.replace(/[^\d.]/g, ''));
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, actualStock: numValue } : item
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(items);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getVariance = (item: InventoryItem) => {
    if (item.actualStock === null) return null;
    return item.actualStock - item.systemStock;
  };

  const getVariancePercent = (item: InventoryItem) => {
    if (item.actualStock === null || item.systemStock === 0) return null;
    return ((item.actualStock - item.systemStock) / item.systemStock) * 100;
  };

  const checkedCount = items.filter(i => i.actualStock !== null).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Kiểm kê kho
          </DialogTitle>
          <DialogDescription>
            Nhập số lượng thực tế của từng vật tư để so sánh với hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Đã kiểm: {checkedCount}/{items.length}
            </span>
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(checkedCount / items.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã VT</th>
                  <th>Tên vật tư</th>
                  <th>ĐVT</th>
                  <th className="text-right">Tồn hệ thống</th>
                  <th className="text-right">Tồn thực tế</th>
                  <th className="text-right">Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const variance = getVariance(item);
                  const variancePercent = getVariancePercent(item);
                  
                  return (
                    <tr key={item.id}>
                      <td className="font-medium">{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.unit}</td>
                      <td className="text-right">{formatNumber(item.systemStock)}</td>
                      <td className="text-right">
                        <Input
                          type="text"
                          className="w-28 text-right h-8"
                          placeholder="Nhập SL"
                          value={item.actualStock !== null ? formatNumber(item.actualStock) : ''}
                          onChange={(e) => handleActualStockChange(item.id, e.target.value)}
                        />
                      </td>
                      <td className="text-right">
                        {variance !== null ? (
                          <div className={cn(
                            "flex items-center justify-end gap-1 font-medium",
                            variance > 0 && "text-success",
                            variance < 0 && "text-destructive",
                            variance === 0 && "text-muted-foreground"
                          )}>
                            {variance > 0 && '+'}
                            {formatNumber(variance)}
                            {variancePercent !== null && (
                              <span className="text-xs">
                                ({variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {checkedCount > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Tổng kết kiểm kê</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Khớp chính xác</p>
                  <p className="font-medium text-success">
                    {items.filter(i => i.actualStock !== null && i.actualStock === i.systemStock).length} mục
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thừa</p>
                  <p className="font-medium text-info">
                    {items.filter(i => i.actualStock !== null && i.actualStock > i.systemStock).length} mục
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thiếu</p>
                  <p className="font-medium text-destructive">
                    {items.filter(i => i.actualStock !== null && i.actualStock < i.systemStock).length} mục
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || checkedCount === 0}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu kết quả kiểm kê
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryCheckDialog;
