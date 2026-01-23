import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  User,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

// Mock audit log data
const mockAuditLogs = [
  {
    id: 'log-001',
    timestamp: '2024-03-15 14:32:15',
    user: 'Nguyễn Văn A',
    action: 'login',
    module: 'Auth',
    description: 'Đăng nhập thành công',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-002',
    timestamp: '2024-03-15 14:35:22',
    user: 'Nguyễn Văn A',
    action: 'create',
    module: 'Costs',
    description: 'Tạo chi phí mới: NC-001 - Tiền lương công nhân tháng 3',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-003',
    timestamp: '2024-03-15 14:40:10',
    user: 'Trần Thị B',
    action: 'update',
    module: 'Materials',
    description: 'Cập nhật số lượng vật tư: Thép phi 16',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
  {
    id: 'log-004',
    timestamp: '2024-03-15 14:45:33',
    user: 'Lê Văn C',
    action: 'delete',
    module: 'Contracts',
    description: 'Xóa hợp đồng: HD-2024-003',
    ipAddress: '192.168.1.110',
    status: 'warning',
  },
  {
    id: 'log-005',
    timestamp: '2024-03-15 15:00:00',
    user: 'Phạm Thị D',
    action: 'view',
    module: 'Reports',
    description: 'Xem báo cáo chi phí tháng 3',
    ipAddress: '192.168.1.115',
    status: 'success',
  },
  {
    id: 'log-006',
    timestamp: '2024-03-15 15:10:45',
    user: 'Nguyễn Văn A',
    action: 'update',
    module: 'Settings',
    description: 'Cập nhật cấu hình hệ thống',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-007',
    timestamp: '2024-03-15 15:20:00',
    user: 'Hệ thống',
    action: 'system',
    module: 'Backup',
    description: 'Sao lưu dữ liệu tự động',
    ipAddress: 'localhost',
    status: 'success',
  },
  {
    id: 'log-008',
    timestamp: '2024-03-15 15:30:12',
    user: 'Trần Thị B',
    action: 'logout',
    module: 'Auth',
    description: 'Đăng xuất',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
];

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  system: Settings,
};

const actionLabels: Record<string, string> = {
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  view: 'Xem',
  system: 'Hệ thống',
};

const AdminAuditLog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Activity;
    return Icon;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <StatusBadge status="success">Thành công</StatusBadge>;
      case 'warning':
        return <StatusBadge status="warning">Cảnh báo</StatusBadge>;
      case 'error':
        return <StatusBadge status="danger">Lỗi</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const uniqueModules = [...new Set(mockAuditLogs.map((log) => log.module))];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nhật ký hoạt động</h1>
          <p className="text-muted-foreground">Theo dõi các hoạt động trong hệ thống</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAuditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Tổng hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <LogIn className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAuditLogs.filter((l) => l.action === 'login').length}
                </p>
                <p className="text-sm text-muted-foreground">Đăng nhập</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Edit className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAuditLogs.filter((l) => l.action === 'update').length}
                </p>
                <p className="text-sm text-muted-foreground">Cập nhật</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAuditLogs.filter((l) => l.action === 'delete').length}
                </p>
                <p className="text-sm text-muted-foreground">Xóa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo người dùng, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Hành động" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hành động</SelectItem>
            <SelectItem value="login">Đăng nhập</SelectItem>
            <SelectItem value="logout">Đăng xuất</SelectItem>
            <SelectItem value="create">Tạo mới</SelectItem>
            <SelectItem value="update">Cập nhật</SelectItem>
            <SelectItem value="delete">Xóa</SelectItem>
            <SelectItem value="view">Xem</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả module</SelectItem>
            {uniqueModules.map((module) => (
              <SelectItem key={module} value={module}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Thời gian</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon className={cn(
                          "h-4 w-4",
                          log.action === 'delete' && "text-destructive",
                          log.action === 'create' && "text-success",
                          log.action === 'update' && "text-info",
                        )} />
                        <span>{actionLabels[log.action]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="neutral">{log.module}</StatusBadge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLog;
