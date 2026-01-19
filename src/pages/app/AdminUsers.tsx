import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus,
  MoreVertical,
  Mail,
  Shield,
  FolderKanban,
  UserCog,
  Ban,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { users, projects, roleLabels, UserRole } from '@/data/mockData';

const AdminUsers: React.FC = () => {
  const { user: currentUser, getCurrentTenant } = useAuth();
  const tenant = getCurrentTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter users by tenant
  const tenantUsers = users.filter(u => u.tenantId === tenant?.id);
  const tenantProjects = projects.filter(p => p.tenantId === tenant?.id);

  // Apply filters
  const filteredUsers = tenantUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeStatus = (role: UserRole) => {
    switch (role) {
      case 'company_owner': return 'info';
      case 'project_manager': return 'success';
      case 'qs_controller': return 'warning';
      case 'warehouse': return 'neutral';
      case 'accountant': return 'neutral';
      case 'viewer': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Quản lý Người dùng</h1>
            <p className="page-subtitle">
              {tenant?.name} • {tenantUsers.length} người dùng
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
                <DialogDescription>
                  Tạo tài khoản mới cho thành viên trong công ty
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@company.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project_manager">Quản lý Dự án</SelectItem>
                      <SelectItem value="qs_controller">QS/Kiểm soát Chi phí</SelectItem>
                      <SelectItem value="warehouse">Kho/Vật tư</SelectItem>
                      <SelectItem value="accountant">Kế toán</SelectItem>
                      <SelectItem value="viewer">Xem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phân công dự án</Label>
                  <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {tenantProjects.map((project) => (
                      <div key={project.id} className="flex items-center gap-2">
                        <Checkbox id={project.id} />
                        <Label htmlFor={project.id} className="text-sm font-normal cursor-pointer">
                          {project.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Tạo người dùng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filter Bar */}
        <div className="filter-bar rounded-xl bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="company_owner">Giám đốc</SelectItem>
              <SelectItem value="project_manager">Quản lý Dự án</SelectItem>
              <SelectItem value="qs_controller">QS/Chi phí</SelectItem>
              <SelectItem value="warehouse">Kho/Vật tư</SelectItem>
              <SelectItem value="accountant">Kế toán</SelectItem>
              <SelectItem value="viewer">Xem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Dự án phân công</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userProjects = tenantProjects.filter(p => 
                  user.role === 'company_owner' || user.projectIds.includes(p.id)
                );
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={getRoleBadgeStatus(user.role)} dot={false}>
                        {roleLabels[user.role]}
                      </StatusBadge>
                    </td>
                    <td>
                      {user.role === 'company_owner' ? (
                        <span className="text-sm text-muted-foreground">Tất cả dự án</span>
                      ) : userProjects.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{userProjects.length} dự án</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa phân công</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status="success">Hoạt động</StatusBadge>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <UserCog className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FolderKanban className="mr-2 h-4 w-4" />
                            Phân công dự án
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="mr-2 h-4 w-4" />
                            Đặt lại mật khẩu
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            Vô hiệu hóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
