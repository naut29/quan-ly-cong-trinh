import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Plus, X, Upload, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Form validation schema
const costFormSchema = z.object({
  code: z.string()
    .min(1, 'Mã chi phí là bắt buộc')
    .max(20, 'Mã chi phí tối đa 20 ký tự')
    .regex(/^[A-Za-z0-9-]+$/, 'Mã chỉ chứa chữ, số và dấu gạch ngang'),
  description: z.string()
    .min(1, 'Mô tả là bắt buộc')
    .max(500, 'Mô tả tối đa 500 ký tự'),
  category: z.enum(['labor', 'material', 'equipment', 'subcontractor', 'other'], {
    required_error: 'Vui lòng chọn danh mục',
  }),
  date: z.date({
    required_error: 'Ngày phát sinh là bắt buộc',
  }),
  vendor: z.string()
    .min(1, 'Nhà cung cấp là bắt buộc')
    .max(100, 'Tên nhà cung cấp tối đa 100 ký tự'),
  boqItem: z.string()
    .max(50, 'Mã BOQ tối đa 50 ký tự')
    .optional()
    .or(z.literal('')),
  budget: z.number({
    required_error: 'Ngân sách là bắt buộc',
    invalid_type_error: 'Ngân sách phải là số',
  })
    .min(0, 'Ngân sách không được âm')
    .max(999999999999, 'Ngân sách tối đa 999 tỷ'),
  actual: z.number({
    invalid_type_error: 'Chi phí thực tế phải là số',
  })
    .min(0, 'Chi phí thực tế không được âm')
    .max(999999999999, 'Chi phí thực tế tối đa 999 tỷ')
    .optional()
    .default(0),
  committed: z.number({
    invalid_type_error: 'Chi phí cam kết phải là số',
  })
    .min(0, 'Chi phí cam kết không được âm')
    .max(999999999999, 'Chi phí cam kết tối đa 999 tỷ')
    .optional()
    .default(0),
  status: z.enum(['pending', 'committed', 'in_progress', 'paid'], {
    required_error: 'Vui lòng chọn trạng thái',
  }),
  invoiceNumber: z.string()
    .max(50, 'Số hóa đơn tối đa 50 ký tự')
    .optional()
    .or(z.literal('')),
  paymentMethod: z.enum(['cash', 'transfer', 'credit', 'other']).optional(),
  notes: z.string()
    .max(1000, 'Ghi chú tối đa 1000 ký tự')
    .optional()
    .or(z.literal('')),
});

type CostFormValues = z.infer<typeof costFormSchema>;

export interface CostEntry {
  id: string;
  date: string;
  code: string;
  description: string;
  category: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'other';
  vendor: string;
  boqItem: string;
  budget: number;
  actual: number;
  committed: number;
  status: 'pending' | 'committed' | 'in_progress' | 'paid';
  createdBy: string;
  invoiceNumber?: string;
  paymentMethod?: 'cash' | 'transfer' | 'credit' | 'other';
  notes?: string;
  attachments?: string[];
}

interface CostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: CostEntry;
  onSubmit: (data: CostFormValues & { attachments: string[] }) => void;
}

const categoryLabels: Record<string, string> = {
  labor: 'Nhân công',
  material: 'Vật tư',
  equipment: 'Máy móc',
  subcontractor: 'Thầu phụ',
  other: 'Chi phí khác',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  committed: 'Cam kết',
  in_progress: 'Đang thực hiện',
  paid: 'Đã thanh toán',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  credit: 'Công nợ',
  other: 'Khác',
};

// BOQ items mock data
const boqItems = [
  { code: 'WBS-00.01', name: 'Chi phí chung' },
  { code: 'WBS-01.01', name: 'Công tác chuẩn bị' },
  { code: 'WBS-01.02', name: 'Nhân công thi công' },
  { code: 'WBS-02.01', name: 'Móng và tầng hầm' },
  { code: 'WBS-02.02', name: 'Cột và dầm' },
  { code: 'WBS-02.03', name: 'Thép xây dựng' },
  { code: 'WBS-02.04', name: 'Bê tông' },
  { code: 'WBS-03.01', name: 'Hoàn thiện' },
  { code: 'WBS-04.01', name: 'Cơ điện' },
  { code: 'WBS-04.02', name: 'Hệ thống điện' },
];

export const CostFormDialog: React.FC<CostFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}) => {
  const [attachments, setAttachments] = useState<string[]>([]);

  const form = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      code: '',
      description: '',
      category: undefined,
      date: new Date(),
      vendor: '',
      boqItem: '',
      budget: 0,
      actual: 0,
      committed: 0,
      status: 'pending',
      invoiceNumber: '',
      paymentMethod: undefined,
      notes: '',
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        form.reset({
          code: initialData.code,
          description: initialData.description,
          category: initialData.category,
          date: new Date(initialData.date),
          vendor: initialData.vendor,
          boqItem: initialData.boqItem || '',
          budget: initialData.budget,
          actual: initialData.actual,
          committed: initialData.committed,
          status: initialData.status,
          invoiceNumber: initialData.invoiceNumber || '',
          paymentMethod: initialData.paymentMethod,
          notes: initialData.notes || '',
        });
        setAttachments(initialData.attachments || []);
      } else {
        form.reset({
          code: '',
          description: '',
          category: undefined,
          date: new Date(),
          vendor: '',
          boqItem: '',
          budget: 0,
          actual: 0,
          committed: 0,
          status: 'pending',
          invoiceNumber: '',
          paymentMethod: undefined,
          notes: '',
        });
        setAttachments([]);
      }
    }
  }, [open, mode, initialData, form]);

  const handleSubmit = (values: CostFormValues) => {
    onSubmit({ ...values, attachments });
    onOpenChange(false);
  };

  const handleAddAttachment = () => {
    // Mock adding attachment
    const mockFileName = `Hóa đơn_${Date.now()}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate variance
  const budget = form.watch('budget') || 0;
  const actual = form.watch('actual') || 0;
  const variance = actual - budget;
  const variancePercent = budget > 0 ? ((variance / budget) * 100).toFixed(1) : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm chi phí mới' : 'Chỉnh sửa chi phí'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Nhập thông tin chi phí mới cho dự án'
              : 'Cập nhật thông tin chi phí'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã chi phí *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: VT-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả chi tiết về chi phí"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 ký tự
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày phát sinh *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy', { locale: vi })
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
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Vendor Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Thông tin nhà cung cấp
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà cung cấp *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên nhà cung cấp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="boqItem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hạng mục BOQ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn hạng mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Không chọn</SelectItem>
                          {boqItems.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.code} - {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Thông tin tài chính
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thực tế (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="committed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cam kết (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Variance Display */}
              {actual > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Chênh lệch:</span>
                    <span
                      className={cn(
                        'font-medium',
                        variance > 0 ? 'text-destructive' : 'text-green-600'
                      )}
                    >
                      {variance > 0 ? '+' : ''}
                      {variance.toLocaleString('vi-VN')} VNĐ ({variancePercent}%)
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số hóa đơn</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: HD-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương thức thanh toán</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phương thức" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(paymentMethodLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Attachments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tệp đính kèm
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Thêm tệp
                </Button>
              </div>

              {attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2 pr-1"
                    >
                      <FileText className="h-3 w-3" />
                      {file}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có tệp đính kèm
                </p>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú bổ sung (nếu có)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Thêm chi phí' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
