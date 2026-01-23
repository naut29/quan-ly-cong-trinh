import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MoreHorizontal,
  Users,
  FolderKanban,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Ban,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/data/mockData';

// Mock tenants data
const mockTenants = [
  {
    id: 'tenant-001',
    name: 'Công ty Xây dựng ABC',
    code: 'ABC',
    plan: 'Enterprise',
    status: 'active',
    users: 24,
    projects: 12,
    createdAt: '15/01/2023',
    lastActive: '2 phút trước',
    mrr: 4990000,
  },
  {
    id: 'tenant-002',
    name: 'Công ty TNHH Đầu tư XYZ',
    code: 'XYZ',
    plan: 'Professional',
    status: 'active',
    users: 15,
    projects: 8,
    createdAt: '20/03/2023',
    lastActive: '1 giờ trước',
    mrr: 2990000,
  },
  {
    id: 'tenant-003',
    name: 'Tập đoàn Xây dựng Miền Nam',
    code: 'XDMN',
    plan: 'Enterprise',
    status: 'active',
    users: 45,
    projects: 25,
    createdAt: '05/06/2023',
    lastActive: '30 phút trước',
    mrr: 4990000,
  },
  {
    id: 'tenant-004',
    name: 'Công ty CP Kiến trúc Hiện đại',
    code: 'KTHD',
    plan: 'Starter',
    status: 'trial',
    users: 3,
    projects: 1,
    createdAt: '01/03/2024',
    lastActive: '5 ngày trước',
    mrr: 0,
  },
  {
    id: 'tenant-005',
    name: 'Công ty Xây lắp Điện nước',
    code: 'XLDN',
    plan: 'Professional',
    status: 'suspended',
    users: 10,
    projects: 5,
    createdAt: '10/08/2023',
    lastActive: '15 ngày trước',
    mrr: 0,
  },
];

const PlatformTenants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMRR = mockTenants.reduce((sum, t) => sum + t.mrr, 0);
  const totalUsers = mockTenants.reduce((sum, t) => sum + t.users, 0);
  const totalProjects = mockTenants.reduce((sum, t) => sum + t.projects, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Hoạt động</StatusBadge>;
      case 'trial':
        return <StatusBadge status="info">Dùng thử</StatusBadge>;
      case 'suspended':
        return <StatusBadge status="danger">Tạm ngưng</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Công ty</h1>
          <p className="text-muted-foreground">Quản lý tất cả công ty trên nền tảng</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm công ty
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockTenants.length}</p>
              <p className="text-sm text-muted-foreground">Tổng công ty</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Tổng người dùng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProjects}</p>
              <p className="text-sm text-muted-foreground">Tổng dự án</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalMRR)}</p>
              <p className="text-sm text-muted-foreground">MRR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên công ty, mã..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Công ty</TableHead>
                <TableHead>Gói dịch vụ</TableHead>
                <TableHead className="text-center">Người dùng</TableHead>
                <TableHead className="text-center">Dự án</TableHead>
                <TableHead>Hoạt động cuối</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
                        {tenant.code}
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">Tham gia: {tenant.createdAt}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="neutral">{tenant.plan}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-center">{tenant.users}</TableCell>
                  <TableCell className="text-center">{tenant.projects}</TableCell>
                  <TableCell className="text-muted-foreground">{tenant.lastActive}</TableCell>
                  <TableCell className="text-right font-medium">
                    {tenant.mrr > 0 ? formatCurrency(tenant.mrr) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tenant.status === 'active' ? (
                          <DropdownMenuItem className="text-warning">
                            <Ban className="h-4 w-4 mr-2" />
                            Tạm ngưng
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success">
                            <Check className="h-4 w-4 mr-2" />
                            Kích hoạt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformTenants;
