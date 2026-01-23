import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Building2,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Ban,
  Check,
  Shield,
  Key,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock platform users data
const mockUsers = [
  {
    id: 'user-001',
    name: 'Nguyễn Văn A',
    email: 'admin@xaydungabc.vn',
    tenant: 'Công ty Xây dựng ABC',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2 phút trước',
    createdAt: '15/01/2023',
  },
  {
    id: 'user-002',
    name: 'Trần Thị B',
    email: 'tranb@xaydungabc.vn',
    tenant: 'Công ty Xây dựng ABC',
    role: 'company_owner',
    status: 'active',
    lastLogin: '1 giờ trước',
    createdAt: '20/01/2023',
  },
  {
    id: 'user-003',
    name: 'Lê Văn C',
    email: 'levanc@xyz.vn',
    tenant: 'Công ty TNHH Đầu tư XYZ',
    role: 'project_manager',
    status: 'active',
    lastLogin: '3 giờ trước',
    createdAt: '25/03/2023',
  },
  {
    id: 'user-004',
    name: 'Phạm Thị D',
    email: 'phamthid@xdmn.vn',
    tenant: 'Tập đoàn Xây dựng Miền Nam',
    role: 'accountant',
    status: 'inactive',
    lastLogin: '5 ngày trước',
    createdAt: '10/06/2023',
  },
  {
    id: 'user-005',
    name: 'Hoàng Văn E',
    email: 'hoange@kthd.vn',
    tenant: 'Công ty CP Kiến trúc Hiện đại',
    role: 'viewer',
    status: 'active',
    lastLogin: '30 phút trước',
    createdAt: '05/03/2024',
  },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  company_owner: 'Chủ công ty',
  project_manager: 'Quản lý dự án',
  accountant: 'Kế toán',
  viewer: 'Xem',
};

const PlatformUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Hoạt động</StatusBadge>;
      case 'inactive':
        return <StatusBadge status="neutral">Không hoạt động</StatusBadge>;
      case 'suspended':
        return <StatusBadge status="danger">Tạm ngưng</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <StatusBadge status="danger">{roleLabels[role]}</StatusBadge>;
      case 'company_owner':
        return <StatusBadge status="warning">{roleLabels[role]}</StatusBadge>;
      case 'project_manager':
        return <StatusBadge status="info">{roleLabels[role]}</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{roleLabels[role] || role}</StatusBadge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Người dùng</h1>
          <p className="text-muted-foreground">Quản lý tất cả người dùng trên nền tảng</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockUsers.length}</p>
              <p className="text-sm text-muted-foreground">Tổng người dùng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockUsers.filter((u) => u.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockUsers.filter((u) => u.role === 'super_admin').length}
              </p>
              <p className="text-sm text-muted-foreground">Super Admin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(mockUsers.map((u) => u.tenant)).size}
              </p>
              <p className="text-sm text-muted-foreground">Công ty</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email, công ty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="company_owner">Chủ công ty</SelectItem>
            <SelectItem value="project_manager">Quản lý dự án</SelectItem>
            <SelectItem value="accountant">Kế toán</SelectItem>
            <SelectItem value="viewer">Xem</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
            <SelectItem value="suspended">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Công ty</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Đăng nhập cuối</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.tenant}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
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
                        <DropdownMenuItem>
                          <Key className="h-4 w-4 mr-2" />
                          Reset mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
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

export default PlatformUsers;
