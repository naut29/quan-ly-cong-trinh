import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Check,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  ShieldOff,
  Users,
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
import { toast } from '@/components/ui/use-toast';
import { useSession } from '@/app/session/useSession';
import {
  grantSuperAdmin,
  listPlatformUsers,
  revokeSuperAdmin,
  type PlatformUserRecord,
} from '@/lib/api/platformUsers';

const ORG_ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  editor: 'Editor',
  viewer: 'Member',
};

const getDisplayName = (user: PlatformUserRecord) => user.fullName ?? user.email ?? user.userId;

const getDisplayRole = (user: PlatformUserRecord) => {
  if (user.platformRole === 'super_admin') {
    return 'Super Admin';
  }
  if (!user.orgRole) {
    return 'No org role';
  }
  return ORG_ROLE_LABELS[user.orgRole] ?? user.orgRole;
};

const PlatformUsers: React.FC = () => {
  const { user: sessionUser } = useSession();
  const [users, setUsers] = useState<PlatformUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const rows = await listPlatformUsers();
      setUsers(rows);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Khong the tai danh sach nguoi dung.';
      toast({
        title: 'Tai du lieu that bai',
        description,
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        getDisplayName(user).toLowerCase().includes(normalizedQuery) ||
        (user.email ?? '').toLowerCase().includes(normalizedQuery) ||
        (user.companyName ?? '').toLowerCase().includes(normalizedQuery);

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'super_admin' && user.platformRole === 'super_admin') ||
        (roleFilter === 'org_user' && user.platformRole !== 'super_admin');

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const superAdminCount = users.filter((user) => user.platformRole === 'super_admin').length;
  const activeCount = users.filter((user) => user.status === 'active').length;
  const organizationCount = new Set(users.map((user) => user.companyId).filter(Boolean)).size;

  const toggleSuperAdmin = async (target: PlatformUserRecord) => {
    if (target.userId === sessionUser?.id && target.platformRole === 'super_admin') {
      toast({
        title: 'Khong the tu go quyen',
        description: 'Hay cap them mot super admin khac truoc khi go quyen cua chinh ban.',
        variant: 'destructive',
      });
      return;
    }

    setSavingUserId(target.userId);
    try {
      if (target.platformRole === 'super_admin') {
        await revokeSuperAdmin(target.userId);
        toast({
          title: 'Da go quyen Super Admin',
          description: `${getDisplayName(target)} khong con la Super Admin.`,
        });
      } else {
        await grantSuperAdmin(target.userId);
        toast({
          title: 'Da cap quyen Super Admin',
          description: `${getDisplayName(target)} da duoc cap quyen Super Admin.`,
        });
      }

      await loadUsers();
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Khong the cap nhat platform role.';
      toast({
        title: 'Cap nhat that bai',
        description,
        variant: 'destructive',
      });
    } finally {
      setSavingUserId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <StatusBadge status="success">Hoat dong</StatusBadge>;
    }
    return <StatusBadge status="neutral">Khong hoat dong</StatusBadge>;
  };

  const getRoleBadge = (user: PlatformUserRecord) => {
    if (user.platformRole === 'super_admin') {
      return <StatusBadge status="danger">Super Admin</StatusBadge>;
    }
    if (user.orgRole === 'owner' || user.orgRole === 'admin') {
      return <StatusBadge status="warning">{getDisplayRole(user)}</StatusBadge>;
    }
    if (user.orgRole) {
      return <StatusBadge status="info">{getDisplayRole(user)}</StatusBadge>;
    }
    return <StatusBadge status="neutral">No role</StatusBadge>;
  };

  const getInitials = (value: string) =>
    value
      .split(' ')
      .map((part) => part[0])
      .slice(-2)
      .join('')
      .toUpperCase();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quan ly nguoi dung nen tang</h1>
          <p className="text-muted-foreground">Du lieu that tu profiles, org_members va platform_roles.</p>
        </div>
        <Button variant="outline" onClick={() => void loadUsers()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Lam moi
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Tong nguoi dung</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Dang hoat dong</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{superAdminCount}</p>
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
              <p className="text-2xl font-bold">{organizationCount}</p>
              <p className="text-sm text-muted-foreground">Cong ty</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tim theo ten, email, cong ty..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vai tro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca vai tro</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="org_user">Org user</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca trang thai</SelectItem>
            <SelectItem value="active">Hoat dong</SelectItem>
            <SelectItem value="inactive">Khong hoat dong</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nguoi dung</TableHead>
                <TableHead>Cong ty</TableHead>
                <TableHead>Vai tro</TableHead>
                <TableHead>Trang thai</TableHead>
                <TableHead>Ngay tao</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Dang tai...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Khong co nguoi dung phu hop.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(getDisplayName(user))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getDisplayName(user)}</p>
                          <p className="text-sm text-muted-foreground">{user.email ?? user.userId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {user.companyName ?? (user.companyId ? user.companyId : 'Chua co cong ty')}
                        </span>
                        {user.companyCount > 1 && (
                          <span className="text-xs text-muted-foreground">+{user.companyCount - 1}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '--'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => void toggleSuperAdmin(user)}
                            disabled={savingUserId === user.userId}
                          >
                            {user.platformRole === 'super_admin' ? (
                              <>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Go quyen Super Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Cap quyen Super Admin
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformUsers;
