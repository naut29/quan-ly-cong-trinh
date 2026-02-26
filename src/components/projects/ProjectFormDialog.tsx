import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  FolderKanban, 
  CalendarIcon, 
  MapPin, 
  User, 
  Loader2,
  Building2,
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Form schema with validation
const projectFormSchema = z.object({
  code: z
    .string()
    .min(2, 'Mã dự án phải có ít nhất 2 ký tự')
    .max(20, 'Mã dự án không được quá 20 ký tự')
    .regex(/^[A-Z0-9-]+$/, 'Mã dự án chỉ chứa chữ in hoa, số và dấu gạch ngang'),
  name: z
    .string()
    .min(5, 'Tên dự án phải có ít nhất 5 ký tự')
    .max(200, 'Tên dự án không được quá 200 ký tự'),
  address: z
    .string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(500, 'Địa chỉ không được quá 500 ký tự'),
  status: z.enum(['active', 'paused', 'completed']),
  stage: z.enum(['foundation', 'structure', 'finishing']),
  manager: z
    .string()
    .min(2, 'Tên quản lý dự án phải có ít nhất 2 ký tự'),
  startDate: z.date({
    required_error: 'Vui lòng chọn ngày bắt đầu',
  }),
  endDate: z.date({
    required_error: 'Vui lòng chọn ngày kết thúc',
  }),
  budget: z
    .number()
    .min(1000000, 'Ngân sách phải ít nhất 1,000,000 VNĐ')
    .max(1000000000000, 'Ngân sách không được vượt quá 1,000 tỷ VNĐ'),
  description: z.string().max(1000, 'Mô tả không được quá 1000 ký tự').optional(),
  clientName: z.string().min(2, 'Tên chủ đầu tư phải có ít nhất 2 ký tự').optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
}).refine((data) => data.endDate > data.startDate, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate'],
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export interface ProjectEntry {
  id?: string;
  code: string;
  name: string;
  address: string;
  status: 'active' | 'paused' | 'completed';
  stage: 'foundation' | 'structure' | 'finishing';
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: ProjectEntry;
  onSubmit: (data: ProjectFormData) => Promise<void> | void;
}

const statusOptions = [
  { value: 'active', label: 'Đang thi công' },
  { value: 'paused', label: 'Tạm dừng' },
  { value: 'completed', label: 'Hoàn thành' },
];

const stageOptions = [
  { value: 'foundation', label: 'Móng' },
  { value: 'structure', label: 'Thân' },
  { value: 'finishing', label: 'Hoàn thiện' },
];

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      code: '',
      name: '',
      address: '',
      status: 'active',
      stage: 'foundation',
      manager: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year later
      budget: 0,
      description: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
    },
  });

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code,
          name: initialData.name,
          address: initialData.address,
          status: initialData.status,
          stage: initialData.stage,
          manager: initialData.manager,
          startDate: new Date(initialData.startDate),
          endDate: new Date(initialData.endDate),
          budget: initialData.budget,
          description: initialData.description || '',
          clientName: initialData.clientName || '',
          clientPhone: initialData.clientPhone || '',
          clientEmail: initialData.clientEmail || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          address: '',
          status: 'active',
          stage: 'foundation',
          manager: '',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          budget: 0,
          description: '',
          clientName: '',
          clientPhone: '',
          clientEmail: '',
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format number for display
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            {mode === 'create' ? 'Tạo dự án mới' : 'Chỉnh sửa dự án'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền thông tin để tạo dự án mới'
              : 'Cập nhật thông tin dự án'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã dự án *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="VD: DA-2024-001" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên dự án *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Khu dân cư cao cấp Sunrise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ công trình *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="VD: Số 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giai đoạn *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giai đoạn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quản lý dự án *</FormLabel>
                      <FormControl>
                        <Input placeholder="Họ tên quản lý" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Thời gian & Ngân sách
              </h3>

              <div className="grid grid-cols-2 gap-4">
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
                            className={cn("p-3 pointer-events-auto")}
                            locale={vi}
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
                            disabled={(date) => 
                              form.getValues('startDate') ? date < form.getValues('startDate') : false
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                            locale={vi}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngân sách dự án (VNĐ) *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="VD: 50,000,000,000"
                        value={field.value ? formatNumber(field.value) : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          field.onChange(value ? parseInt(value, 10) : 0);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value > 0 && `= ${(field.value / 1000000000).toFixed(2)} tỷ VNĐ`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Client Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin chủ đầu tư
              </h3>

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chủ đầu tư</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Công ty TNHH ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 0988097621" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: contact@abc.vn" {...field} />
                      </FormControl>
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
                    <FormLabel>Mô tả dự án</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả ngắn gọn về dự án..." 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : mode === 'create' ? (
                  'Tạo dự án'
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
