import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Mail,
  CalendarClock,
  Pencil,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScheduledReport {
  id: string;
  reportType: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  isActive: boolean;
  lastSent?: string;
  nextSend: string;
}

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTypes: { value: string; label: string }[];
}

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    reportType: 'materials',
    reportName: 'Báo cáo sử dụng vật tư',
    frequency: 'weekly',
    dayOfWeek: 1,
    time: '08:00',
    recipients: ['manager@company.com', 'accountant@company.com'],
    isActive: true,
    lastSent: '2024-01-15 08:00',
    nextSend: '2024-01-22 08:00',
  },
  {
    id: '2',
    reportType: 'budget',
    reportName: 'Báo cáo vượt ngân sách',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '09:00',
    recipients: ['director@company.com'],
    isActive: true,
    lastSent: '2024-01-01 09:00',
    nextSend: '2024-02-01 09:00',
  },
  {
    id: '3',
    reportType: 'cashflow',
    reportName: 'Báo cáo dòng tiền',
    frequency: 'weekly',
    dayOfWeek: 5,
    time: '17:00',
    recipients: ['cfo@company.com'],
    isActive: false,
    lastSent: '2024-01-12 17:00',
    nextSend: '2024-01-19 17:00',
  },
];

const dayOfWeekLabels: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

const frequencyLabels: Record<string, string> = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
};

const ScheduleReportDialog: React.FC<ScheduleReportDialogProps> = ({
  open,
  onOpenChange,
  reportTypes,
}) => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(mockScheduledReports);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    reportType: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '08:00',
    recipientInput: '',
    recipients: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      reportType: '',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '08:00',
      recipientInput: '',
      recipients: [],
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleAddRecipient = () => {
    const email = formData.recipientInput.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !formData.recipients.includes(email)) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, email],
        recipientInput: '',
      });
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter((r) => r !== email),
    });
  };

  const handleSaveSchedule = () => {
    if (!formData.reportType || formData.recipients.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn loại báo cáo và thêm ít nhất một người nhận',
        variant: 'destructive',
      });
      return;
    }

    const reportName = reportTypes.find((r) => r.value === formData.reportType)?.label || '';
    const now = new Date();
    let nextSend = new Date();

    if (formData.frequency === 'daily') {
      nextSend.setDate(now.getDate() + 1);
    } else if (formData.frequency === 'weekly') {
      const daysUntilNext = (formData.dayOfWeek - now.getDay() + 7) % 7 || 7;
      nextSend.setDate(now.getDate() + daysUntilNext);
    } else {
      nextSend.setMonth(now.getMonth() + 1);
      nextSend.setDate(formData.dayOfMonth);
    }

    const newSchedule: ScheduledReport = {
      id: editingId || Date.now().toString(),
      reportType: formData.reportType,
      reportName,
      frequency: formData.frequency,
      dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
      dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : undefined,
      time: formData.time,
      recipients: formData.recipients,
      isActive: true,
      nextSend: `${nextSend.toISOString().split('T')[0]} ${formData.time}`,
    };

    if (editingId) {
      setSchedules(schedules.map((s) => (s.id === editingId ? newSchedule : s)));
      toast({ title: 'Đã cập nhật lịch gửi báo cáo' });
    } else {
      setSchedules([...schedules, newSchedule]);
      toast({ title: 'Đã tạo lịch gửi báo cáo mới' });
    }

    resetForm();
  };

  const handleToggleActive = (id: string) => {
    setSchedules(
      schedules.map((s) => {
        if (s.id === id) {
          const newStatus = !s.isActive;
          toast({
            title: newStatus ? 'Đã kích hoạt lịch gửi' : 'Đã tạm dừng lịch gửi',
          });
          return { ...s, isActive: newStatus };
        }
        return s;
      })
    );
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
    toast({ title: 'Đã xóa lịch gửi báo cáo' });
  };

  const handleEdit = (schedule: ScheduledReport) => {
    setFormData({
      reportType: schedule.reportType,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek || 1,
      dayOfMonth: schedule.dayOfMonth || 1,
      time: schedule.time,
      recipientInput: '',
      recipients: schedule.recipients,
    });
    setEditingId(schedule.id);
    setIsCreating(true);
  };

  const getScheduleDescription = (schedule: ScheduledReport) => {
    if (schedule.frequency === 'daily') {
      return `Hàng ngày lúc ${schedule.time}`;
    } else if (schedule.frequency === 'weekly') {
      return `${dayOfWeekLabels[schedule.dayOfWeek!]} hàng tuần lúc ${schedule.time}`;
    } else {
      return `Ngày ${schedule.dayOfMonth} hàng tháng lúc ${schedule.time}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Lên lịch gửi báo cáo tự động
          </DialogTitle>
          <DialogDescription>
            Thiết lập lịch gửi báo cáo định kỳ qua email
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Create/Edit Form */}
          {isCreating ? (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {editingId ? 'Chỉnh sửa lịch gửi' : 'Tạo lịch gửi mới'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại báo cáo</Label>
                  <Select
                    value={formData.reportType}
                    onValueChange={(v) => setFormData({ ...formData, reportType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn báo cáo" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tần suất</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) =>
                      setFormData({ ...formData, frequency: v as 'daily' | 'weekly' | 'monthly' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Ngày trong tuần</Label>
                    <Select
                      value={formData.dayOfWeek.toString()}
                      onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dayOfWeekLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Ngày trong tháng</Label>
                    <Select
                      value={formData.dayOfMonth.toString()}
                      onValueChange={(v) => setFormData({ ...formData, dayOfMonth: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            Ngày {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Giờ gửi</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Người nhận</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Nhập email và nhấn Enter"
                    value={formData.recipientInput}
                    onChange={(e) => setFormData({ ...formData, recipientInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRecipient();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddRecipient}>
                    Thêm
                  </Button>
                </div>
                {formData.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1">
                        {email}
                        <button
                          onClick={() => handleRemoveRecipient(email)}
                          className="ml-2 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button onClick={handleSaveSchedule}>
                  {editingId ? 'Cập nhật' : 'Tạo lịch'}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Tạo lịch gửi báo cáo mới
            </Button>
          )}

          {/* Scheduled Reports List */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Báo cáo</TableHead>
                  <TableHead>Lịch gửi</TableHead>
                  <TableHead>Người nhận</TableHead>
                  <TableHead>Lần gửi tiếp theo</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Chưa có lịch gửi báo cáo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="font-medium">{schedule.reportName}</div>
                        <div className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {frequencyLabels[schedule.frequency]}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {getScheduleDescription(schedule)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{schedule.recipients.length} người</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {schedule.nextSend}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={schedule.isActive}
                          onCheckedChange={() => handleToggleActive(schedule.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleReportDialog;
