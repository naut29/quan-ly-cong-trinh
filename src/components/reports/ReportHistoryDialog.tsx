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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Mail,
  FileText,
  Search,
  RefreshCw,
  Download,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReportHistoryEntry {
  id: string;
  reportName: string;
  reportType: string;
  sentAt: string;
  status: 'success' | 'failed' | 'pending';
  recipients: {
    email: string;
    status: 'delivered' | 'failed' | 'pending';
    deliveredAt?: string;
    errorMessage?: string;
  }[];
  triggeredBy: 'manual' | 'scheduled';
  scheduleName?: string;
  format: 'email' | 'pdf' | 'excel';
  fileSize?: string;
  errorMessage?: string;
  retryCount?: number;
}

interface ReportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockHistoryData: ReportHistoryEntry[] = [
  {
    id: '1',
    reportName: 'Báo cáo sử dụng vật tư',
    reportType: 'materials',
    sentAt: '2024-01-22 08:00:15',
    status: 'success',
    recipients: [
      { email: 'manager@company.com', status: 'delivered', deliveredAt: '2024-01-22 08:00:18' },
      { email: 'accountant@company.com', status: 'delivered', deliveredAt: '2024-01-22 08:00:20' },
    ],
    triggeredBy: 'scheduled',
    scheduleName: 'Báo cáo vật tư hàng tuần',
    format: 'email',
  },
  {
    id: '2',
    reportName: 'Báo cáo vượt ngân sách',
    reportType: 'budget',
    sentAt: '2024-01-21 14:30:45',
    status: 'failed',
    recipients: [
      { email: 'director@company.com', status: 'failed', errorMessage: 'Mailbox full' },
      { email: 'cfo@company.com', status: 'delivered', deliveredAt: '2024-01-21 14:30:48' },
    ],
    triggeredBy: 'manual',
    format: 'email',
    errorMessage: 'Gửi thất bại cho 1/2 người nhận',
    retryCount: 1,
  },
  {
    id: '3',
    reportName: 'Báo cáo dòng tiền',
    reportType: 'cashflow',
    sentAt: '2024-01-20 17:00:00',
    status: 'success',
    recipients: [
      { email: 'cfo@company.com', status: 'delivered', deliveredAt: '2024-01-20 17:00:05' },
    ],
    triggeredBy: 'scheduled',
    scheduleName: 'Báo cáo dòng tiền cuối tuần',
    format: 'email',
  },
  {
    id: '4',
    reportName: 'Báo cáo công nợ',
    reportType: 'receivables',
    sentAt: '2024-01-19 09:15:30',
    status: 'success',
    recipients: [
      { email: 'accountant@company.com', status: 'delivered', deliveredAt: '2024-01-19 09:15:35' },
      { email: 'manager@company.com', status: 'delivered', deliveredAt: '2024-01-19 09:15:36' },
      { email: 'director@company.com', status: 'delivered', deliveredAt: '2024-01-19 09:15:38' },
    ],
    triggeredBy: 'manual',
    format: 'email',
  },
  {
    id: '5',
    reportName: 'Báo cáo chênh lệch định mức',
    reportType: 'norms',
    sentAt: '2024-01-18 10:00:00',
    status: 'failed',
    recipients: [
      { email: 'engineer@company.com', status: 'failed', errorMessage: 'Invalid email address' },
    ],
    triggeredBy: 'scheduled',
    scheduleName: 'Báo cáo định mức hàng ngày',
    format: 'email',
    errorMessage: 'Địa chỉ email không hợp lệ',
    retryCount: 3,
  },
  {
    id: '6',
    reportName: 'Báo cáo sử dụng vật tư',
    reportType: 'materials',
    sentAt: '2024-01-17 08:00:00',
    status: 'pending',
    recipients: [
      { email: 'manager@company.com', status: 'pending' },
    ],
    triggeredBy: 'scheduled',
    scheduleName: 'Báo cáo vật tư hàng tuần',
    format: 'email',
  },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  success: { label: 'Thành công', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  delivered: { label: 'Đã gửi', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
};

const ReportHistoryDialog: React.FC<ReportHistoryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredHistory = mockHistoryData.filter((entry) => {
    const matchesSearch =
      entry.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.recipients.some((r) => r.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const stats = {
    total: mockHistoryData.length,
    success: mockHistoryData.filter((h) => h.status === 'success').length,
    failed: mockHistoryData.filter((h) => h.status === 'failed').length,
    pending: mockHistoryData.filter((h) => h.status === 'pending').length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Lịch sử gửi báo cáo
          </DialogTitle>
          <DialogDescription>
            Theo dõi trạng thái và chi tiết các báo cáo đã gửi
          </DialogDescription>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Tổng số</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-xs text-green-600/80">Thành công</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-red-600/80">Thất bại</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-yellow-600/80">Đang chờ</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên báo cáo hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="success">Thành công</SelectItem>
              <SelectItem value="failed">Thất bại</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History Table */}
        <ScrollArea className="flex-1 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Báo cáo</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy lịch sử gửi báo cáo
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((entry) => (
                  <Collapsible key={entry.id} asChild open={expandedRows.has(entry.id)}>
                    <>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <CollapsibleTrigger asChild onClick={() => toggleRow(entry.id)}>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expandedRows.has(entry.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{entry.reportName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {entry.sentAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{entry.recipients.length} người</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {entry.triggeredBy === 'scheduled' ? 'Tự động' : 'Thủ công'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusLabels[entry.status].color}>
                            {getStatusIcon(entry.status)}
                            <span className="ml-1">{statusLabels[entry.status].label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.status === 'failed' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Thử lại
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={7} className="p-0">
                            <div className="p-4 space-y-3">
                              {/* Error Message */}
                              {entry.errorMessage && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm">
                                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                  <div>
                                    <div className="font-medium text-red-800 dark:text-red-300">
                                      Lỗi: {entry.errorMessage}
                                    </div>
                                    {entry.retryCount && (
                                      <div className="text-red-600/80 text-xs mt-1">
                                        Đã thử lại {entry.retryCount} lần
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Schedule Info */}
                              {entry.triggeredBy === 'scheduled' && entry.scheduleName && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Lịch gửi: {entry.scheduleName}</span>
                                </div>
                              )}

                              {/* Recipients Detail */}
                              <div className="space-y-2">
                                <div className="text-sm font-medium flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Chi tiết người nhận
                                </div>
                                <div className="grid gap-2">
                                  {entry.recipients.map((recipient, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-2 bg-background rounded border"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{recipient.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {recipient.deliveredAt && (
                                          <span className="text-xs text-muted-foreground">
                                            {recipient.deliveredAt}
                                          </span>
                                        )}
                                        {recipient.errorMessage && (
                                          <span className="text-xs text-red-600">
                                            {recipient.errorMessage}
                                          </span>
                                        )}
                                        <Badge className={statusLabels[recipient.status].color + ' text-xs'}>
                                          {getStatusIcon(recipient.status)}
                                          <span className="ml-1">{statusLabels[recipient.status].label}</span>
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportHistoryDialog;
