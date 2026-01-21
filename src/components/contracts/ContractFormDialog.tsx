import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  Plus,
  Trash2,
  Upload,
  FileText,
  X
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Validation schema
const milestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tên milestone không được để trống'),
  description: z.string().optional(),
  percentage: z.number().min(0, 'Phần trăm phải >= 0').max(100, 'Phần trăm phải <= 100'),
  plannedDate: z.date({ required_error: 'Vui lòng chọn ngày dự kiến' }),
});

const contractFormSchema = z.object({
  code: z.string().min(1, 'Mã hợp đồng không được để trống').max(50, 'Mã hợp đồng tối đa 50 ký tự'),
  name: z.string().min(1, 'Tên hợp đồng không được để trống').max(200, 'Tên hợp đồng tối đa 200 ký tự'),
  vendor: z.string().min(1, 'Tên nhà thầu/NCC không được để trống').max(200, 'Tên nhà thầu tối đa 200 ký tự'),
  vendorTaxCode: z.string().min(10, 'Mã số thuế phải có ít nhất 10 ký tự').max(14, 'Mã số thuế tối đa 14 ký tự'),
  type: z.enum(['subcontract', 'supply', 'service', 'equipment'], {
    required_error: 'Vui lòng chọn loại hợp đồng',
  }),
  category: z.string().min(1, 'Danh mục không được để trống'),
  value: z.number().min(1, 'Giá trị hợp đồng phải lớn hơn 0'),
  retentionPercent: z.number().min(0, 'Phần trăm giữ lại >= 0').max(20, 'Phần trăm giữ lại tối đa 20%'),
  startDate: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  endDate: z.date({ required_error: 'Vui lòng chọn ngày kết thúc' }),
  signedDate: z.date().optional(),
  retentionReleaseDate: z.date().optional(),
  status: z.enum(['draft', 'active', 'completed', 'terminated', 'suspended']),
  notes: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').optional(),
  milestones: z.array(milestoneSchema),
}).refine((data) => data.endDate > data.startDate, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate'],
}).refine((data) => {
  const totalPercent = data.milestones.reduce((sum, m) => sum + m.percentage, 0);
  return totalPercent === 100 || data.milestones.length === 0;
}, {
  message: 'Tổng phần trăm các milestone phải bằng 100%',
  path: ['milestones'],
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
}

const contractTypeLabels: Record<string, string> = {
  subcontract: 'Thầu phụ',
  supply: 'Cung cấp',
  service: 'Dịch vụ',
  equipment: 'Thiết bị',
};

const contractStatusLabels: Record<string, string> = {
  draft: 'Nháp',
  active: 'Đang thực hiện',
  completed: 'Hoàn thành',
  terminated: 'Đã hủy',
  suspended: 'Tạm dừng',
};

const categoryOptions = [
  'Xây dựng',
  'MEP',
  'Hoàn thiện',
  'Vật tư',
  'Máy móc',
  'Tư vấn',
  'Khác',
];

export function ContractFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: ContractFormDialogProps) {
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);

  const defaultValues: Partial<ContractFormValues> = {
    code: '',
    name: '',
    vendor: '',
    vendorTaxCode: '',
    type: 'subcontract',
    category: 'Xây dựng',
    value: 0,
    retentionPercent: 5,
    status: 'draft',
    notes: '',
    milestones: [],
    ...initialData,
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'milestones',
  });

  const totalMilestonePercent = form.watch('milestones')?.reduce(
    (sum, m) => sum + (m.percentage || 0), 
    0
  ) || 0;

  const contractValue = form.watch('value') || 0;
  const retentionPercent = form.watch('retentionPercent') || 0;
  const retentionAmount = (contractValue * retentionPercent) / 100;

  const handleSubmit = (data: ContractFormValues) => {
    onSubmit(data);
    onOpenChange(false);
    form.reset();
  };

  const addMilestone = () => {
    const remainingPercent = 100 - totalMilestonePercent;
    append({
      id: `m-${Date.now()}`,
      name: '',
      description: '',
      percentage: remainingPercent > 0 ? Math.min(remainingPercent, 25) : 0,
      plannedDate: new Date(),
    });
  };

  const handleAddAttachment = () => {
    // Mock adding attachment - in real app would handle file upload
    const mockFile = {
      name: `Tài liệu ${attachments.length + 1}.pdf`,
      size: '1.2 MB',
    };
    setAttachments([...attachments, mockFile]);
  };

  const formatCurrencyInput = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === 'create' ? 'Thêm hợp đồng mới' : 'Chỉnh sửa hợp đồng'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-6 py-4">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Thông tin cơ bản
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã hợp đồng *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: HĐ-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(contractStatusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên hợp đồng *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Thi công phần thô Block A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại hợp đồng *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại hợp đồng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(contractTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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

              {/* Vendor Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Thông tin nhà thầu/NCC
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên nhà thầu/NCC *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Công ty TNHH Xây dựng ABC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vendorTaxCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã số thuế *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: 0312345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Financial Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Thông tin tài chính
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị hợp đồng (VNĐ) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        {field.value > 0 && (
                          <FormDescription>
                            {formatCurrencyInput(field.value)} VNĐ
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="retentionPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phần trăm giữ lại (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={0}
                            max={20}
                            step={0.5}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        {retentionAmount > 0 && (
                          <FormDescription>
                            Số tiền giữ lại: {formatCurrencyInput(retentionAmount)} VNĐ
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Timeline Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Thời gian thực hiện
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="signedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày ký</FormLabel>
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
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày bắt đầu *</FormLabel>
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
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày kết thúc *</FormLabel>
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
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="retentionReleaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày hoàn trả giữ lại</FormLabel>
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
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Milestones Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Milestones thanh toán
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tổng: {totalMilestonePercent}% / 100%
                      {totalMilestonePercent !== 100 && fields.length > 0 && (
                        <span className="text-destructive ml-2">
                          (Còn thiếu {100 - totalMilestonePercent}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm milestone
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Chưa có milestone nào</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={addMilestone}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm milestone đầu tiên
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-start p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`milestones.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tên milestone</FormLabel>
                              <FormControl>
                                <Input placeholder="VD: Tạm ứng" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-6 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`milestones.${index}.percentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">% Giá trị</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-6 md:col-span-2">
                        <FormItem>
                          <FormLabel className="text-xs">Số tiền</FormLabel>
                          <div className="h-10 flex items-center px-3 bg-background rounded-md border text-sm">
                            {formatCurrencyInput(
                              (contractValue * (form.watch(`milestones.${index}.percentage`) || 0)) / 100
                            )}
                          </div>
                        </FormItem>
                      </div>

                      <div className="col-span-10 md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`milestones.${index}.plannedDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-xs">Ngày dự kiến</FormLabel>
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
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2 md:col-span-1 flex items-end pb-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {form.formState.errors.milestones?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.milestones.root.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Attachments Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Tài liệu đính kèm
                </h3>

                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 py-2">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground text-xs">({file.size})</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <Button type="button" variant="outline" size="sm" onClick={handleAddAttachment}>
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên tài liệu
                </Button>
              </div>

              <Separator />

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Ghi chú
                </h3>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ghi chú về hợp đồng..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
            {mode === 'create' ? 'Tạo hợp đồng' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
