import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Download,
  Edit,
  Eye,
  LogIn,
  LogOut,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCompany } from '@/app/context/CompanyContext';
import { listActivityLogs, type ActivityLogRow } from '@/lib/api/activity';
import { activityActionLabels } from '@/lib/projectMeta';
import { formatDateTime } from '@/lib/numberFormat';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  system: Settings,
};

const AdminAuditLog: React.FC = () => {
  const { companyId } = useCompany();
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [userLabels, setUserLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      if (!companyId) {
        if (isMounted) {
          setLogs([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rows = await listActivityLogs({ orgId: companyId, limit: 300 });
        if (!isMounted) return;

        setLogs(rows);

        const actorIds = Array.from(new Set(rows.map((item) => item.actor_user_id).filter(Boolean))) as string[];
        if (actorIds.length > 0 && supabase) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', actorIds);

          const labels: Record<string, string> = {};
          (profiles ?? []).forEach((profile: any) => {
            labels[profile.id] = profile.full_name || profile.email || profile.id;
          });
          if (isMounted) {
            setUserLabels(labels);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err && 'message' in err
              ? String((err as { message?: unknown }).message ?? 'Failed to load activity logs')
              : 'Failed to load activity logs';
        setError(message);
        setLogs([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadLogs();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actorLabel = log.actor_user_id ? userLabels[log.actor_user_id] ?? log.actor_user_id : 'He thong';
      const matchesSearch =
        actorLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
      return matchesSearch && matchesAction && matchesModule;
    });
  }, [actionFilter, logs, moduleFilter, searchQuery, userLabels]);

  const uniqueModules = useMemo(() => Array.from(new Set(logs.map((item) => item.module))).sort(), [logs]);

  const getStatusBadge = (status: string | null) => {
    if (status === 'success') return <StatusBadge status="success">Thanh cong</StatusBadge>;
    if (status === 'warn') return <StatusBadge status="warning">Cảnh báo</StatusBadge>;
    if (status === 'fail') return <StatusBadge status="danger">Thất bại</StatusBadge>;
    return <StatusBadge status="neutral">{status ?? '-'}</StatusBadge>;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nhật ký hoạt động</h1>
          <p className="text-muted-foreground">Theo dõi các hoạt động trong hệ thống</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng hoạt động</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Đăng nhập</p>
            <p className="text-2xl font-bold">{logs.filter((item) => item.action === 'login').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Cập nhật</p>
            <p className="text-2xl font-bold">{logs.filter((item) => item.action === 'update').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Xóa</p>
            <p className="text-2xl font-bold">{logs.filter((item) => item.action === 'delete').length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo người dùng, mô tả..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Hanh dong" />
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Thời gian</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Không có nhật ký nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const ActionIcon = actionIcons[log.action] ?? Activity;
                  const actorLabel = log.actor_user_id ? userLabels[log.actor_user_id] ?? log.actor_user_id : 'He thong';

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-sm">{formatDateTime(log.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{actorLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActionIcon
                            className={cn(
                              'h-4 w-4',
                              log.action === 'delete' && 'text-destructive',
                              log.action === 'create' && 'text-success',
                              log.action === 'update' && 'text-info',
                            )}
                          />
                          <span>{activityActionLabels[log.action] ?? log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="neutral">{log.module}</StatusBadge>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">{log.description ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">{log.ip ?? '-'}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLog;
