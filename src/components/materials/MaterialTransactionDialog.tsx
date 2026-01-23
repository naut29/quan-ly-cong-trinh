import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight,
  CalendarIcon,
  Package,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Transaction type
export type TransactionType = 'receive' | 'issue' | 'transfer';

// Form schema
const transactionFormSchema = z.object({
  date: z.date({
    required_error: 'Vui lòng chọn ngày',
  }),
  materialId: z.string().min(1, 'Vui lòng chọn vật tư'),
  quantity: z.number().min(0.01, 'Số lượng phải lớn hơn 0'),
  unitPrice: z.number().min(0, 'Đơn giá không được âm').optional(),
  warehouse: z.string().min(1, 'Vui lòng chọn kho'),
  toWarehouse: z.string().optional(),
  supplier: z.string().optional(),
  costCode: z.string().optional(),
  invoiceNumber: z.string().optional(),
  note: z.string().max(500, 'Ghi chú không quá 500 ký tự').optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface MaterialTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  onSubmit: (data: TransactionFormData & { type: TransactionType }) => void;
}

// Mock data for selects
const mockMaterials = [
  { id: '1', code: 'THEP-16', name: 'Thép phi 16 SD390', unit: 'kg' },
  { id: '2', code: 'THEP-12', name: 'Thép phi 12 SD390', unit: 'kg' },
  { id: '3', code: 'THEP-10', name: 'Thép phi 10 SD390', unit: 'kg' },
  { id: '4', code: 'BT-C30', name: 'Bê tông C30', unit: 'm³' },
  { id: '5', code: 'BT-C25', name: 'Bê tông C25', unit: 'm³' },
  { id: '6', code: 'XI-MANG', name: 'Xi măng PCB40', unit: 'bao' },
  { id: '7', code: 'CAT-XD', name: 'Cát xây dựng', unit: 'm³' },
  { id: '8', code: 'DA-1X2', name: 'Đá 1x2', unit: 'm³' },
];

const mockWarehouses = [
  { id: 'kho-a', name: 'Kho A - Chính' },
  { id: 'kho-b', name: 'Kho B - Phụ' },
  { id: 'kho-c', name: 'Kho C - Tạm' },
];

const mockSuppliers = [
  { id: 's1', name: 'Hòa Phát Steel' },
  { id: 's2', name: 'Pomina Steel' },
  { id: 's3', name: 'Bê tông Việt Đức' },
  { id: 's4', name: 'VLXD Tân Phú' },
];

const mockCostCodes = [
  { id: 'c1', code: 'SAN-T8-THEP', name: 'Sàn tầng 8 - Thép' },
  { id: 'c2', code: 'COT-C1-BT', name: 'Cột C1 - Bê tông' },
  { id: 'c3', code: 'DAM-D1-THEP', name: 'Dầm D1 - Thép' },
  { id: 'c4', code: 'MONG-M1', name: 'Móng M1' },
];

const typeConfig = {
  receive: {
    title: 'Nhập kho',
    description: 'Nhập vật tư từ nhà cung cấp vào kho',
    icon: ArrowDownToLine,
    color: 'text-success',
  },
  issue: {
    title: 'Xuất kho',
    description: 'Xuất vật tư từ kho ra công trình sử dụng',
    icon: ArrowUpFromLine,
    color: 'text-info',
  },
  transfer: {
    title: 'Điều chuyển kho',
    description: 'Chuyển vật tư giữa các kho',
    icon: ArrowLeftRight,
    color: 'text-warning',
  },
};

export const MaterialTransactionDialog: React.FC<MaterialTransactionDialogProps> = ({
  open,
  onOpenChange,
  type,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<typeof mockMaterials[0] | null>(null);
  
  const config = typeConfig[type];
  const Icon = config.icon;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: new Date(),
      materialId: '',
      quantity: 0,
      unitPrice: 0,
      warehouse: '',
      toWarehouse: '',
      supplier: '',
      costCode: '',
      invoiceNumber: '',
      note: '',
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        materialId: '',
        quantity: 0,
        unitPrice: 0,
        warehouse: '',
        toWarehouse: '',
        supplier: '',
        costCode: '',
        invoiceNumber: '',
        note: '',
      });
      setSelectedMaterial(null);
    }
  }, [open, form]);

  // Update selected material when materialId changes
  const watchMaterialId = form.watch('materialId');
  useEffect(() => {
    const material = mockMaterials.find(m => m.id === watchMaterialId);
    setSelectedMaterial(material || null);
  }, [watchMaterialId]);

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit({ ...data, type });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", config.color)}>
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày {type === 'receive' ? 'nhập' : type === 'issue' ? 'xuất' : 'chuyển'} *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: vi })
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material */}
            <FormField
              control={form.control}
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vật tư *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vật tư" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockMaterials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.code} - {material.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMaterial && (
                    <FormDescription>
                      Đơn vị tính: {selectedMaterial.unit}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity & Unit Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0"
                        value={field.value ? formatNumber(field.value) : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 'receive' && (
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn giá (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0"
                          value={field.value ? formatNumber(field.value) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value ? parseFloat(value) : 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Warehouse */}
            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{type === 'transfer' ? 'Kho xuất' : 'Kho'} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kho" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockWarehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To Warehouse (for transfer) */}
            {type === 'transfer' && (
              <FormField
                control={form.control}
                name="toWarehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kho nhận *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kho nhận" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockWarehouses
                          .filter(w => w.id !== form.watch('warehouse'))
                          .map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Supplier (for receive) */}
            {type === 'receive' && (
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà cung cấp</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockSuppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Cost Code (for issue) */}
            {type === 'issue' && (
              <FormField
                control={form.control}
                name="costCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã công việc</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn công việc" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCostCodes.map((cc) => (
                          <SelectItem key={cc.id} value={cc.code}>
                            {cc.code} - {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Invoice Number (for receive) */}
            {type === 'receive' && (
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hóa đơn / Phiếu nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: PN-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {type === 'receive' ? 'Nhập kho' : type === 'issue' ? 'Xuất kho' : 'Điều chuyển'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialTransactionDialog;
