import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderKanban,
  MoreVertical,
  Plus,
  Search,
  UserCog,
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
import { useCompany } from '@/app/context/CompanyContext';
import {
  addOrgMemberByEmail,
  listOrgMembers,
  listProjectAssignmentsForOrg,
  replaceUserProjectAssignments,
  updateOrgMember,
  type OrgMemberView,
} from '@/lib/api/users';
import { listProjectsByOrg } from '@/lib/api/projects';
import { logActivity } from '@/lib/api/activity';
import { roleLabels } from '@/lib/projectMeta';
import { toast } from '@/hooks/use-toast';

const ROLE_OPTIONS = ['owner', 'admin', 'manager', 'member', 'viewer'];
const STATUS_OPTIONS = ['active', 'invited', 'disabled'];

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const getRoleBadgeStatus = (role: string) => {
  if (role === 'owner') return 'info';
  if (role === 'admin') return 'success';
  if (role === 'manager') return 'warning';
  return 'neutral';
};

const getStatusBadgeStatus = (status: string) => {
  if (status === 'active') return 'success';
  if (status === 'invited') return 'warning';
  if (status === 'disabled') return 'danger';
  return 'neutral';
};

const AdminUsers: React.FC = () => {
  const { companyId, companyName } = useCompany();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [users, setUsers] = useState<OrgMemberView[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, Set<string>>>({});

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [addStatus, setAddStatus] = useState('active');
  const [addAssignments, setAddAssignments] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrgMemberView | null>(null);
  const [editingAssignments, setEditingAssignments] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const loadData = async () => {
    if (!companyId) {
      setLoading(false);
      setError('Chua co to chuc.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [memberRows, projectRows, assignmentRows] = await Promise.all([
        listOrgMembers(companyId),
        listProjectsByOrg(companyId),
        listProjectAssignmentsForOrg(companyId),
      ]);

      const nextMap: Record<string, Set<string>> = {};
      assignmentRows.forEach((assignment) => {
        if (!nextMap[assignment.user_id]) {
          nextMap[assignment.user_id] = new Set<string>();
        }
        nextMap[assignment.user_id].add(assignment.project_id);
      });

      setUsers(memberRows);
      setProjects(projectRows);
      setAssignmentMap(nextMap);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message ?? 'Failed to load users')
            : 'Failed to load users';
      setError(message);
      setUsers([]);
      setProjects([]);
      setAssignmentMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [companyId]);

  const filteredUsers = useMemo(
    () =>
      users.filter((member) => {
        const displayName = member.full_name ?? member.email ?? member.user_id;
        const matchesSearch =
          displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [roleFilter, searchQuery, users],
  );

  const toggleProjectSelection = (
    projectId: string,
    selectedIds: string[],
    onChange: (next: string[]) => void,
  ) => {
    if (selectedIds.includes(projectId)) {
      onChange(selectedIds.filter((id) => id !== projectId));
      return;
    }
    onChange([...selectedIds, projectId]);
  };

  const handleAddUser = async () => {
    if (!companyId) return;
    if (!addEmail.trim()) {
      toast({ title: 'Thieu email', description: 'Vui long nhap email.', variant: 'destructive' });
      return;
    }

    setAdding(true);
    try {
      const result = await addOrgMemberByEmail(companyId, addEmail.trim(), addRole, addStatus);

      if (!result.ok && result.reason === 'not_found') {
        toast({
          title: 'Chua tim thay nguoi dung',
          description: 'Email chua ton tai trong he thong. Chua ho tro moi truc tiep, se bo sung sau.',
          variant: 'destructive',
        });
        return;
      }

      if (!result.ok && result.reason === 'already_member') {
        toast({
          title: 'Nguoi dung da ton tai',
          description: 'Tai khoan nay da la thanh vien cua cong ty.',
          variant: 'destructive',
        });
        return;
      }

      await replaceUserProjectAssignments(companyId, result.member.user_id, addAssignments);
      await logActivity({
        orgId: companyId,
        module: 'users',
        action: 'create',
        description: `Them thanh vien ${addEmail} voi role ${addRole}`,
        status: 'success',
      });

      toast({
        title: 'Them nguoi dung thanh cong',
        description: `${addEmail} da duoc them vao ${companyName ?? 'cong ty'}.`,
      });

      setAddEmail('');
      setAddRole('member');
      setAddStatus('active');
      setAddAssignments([]);
      setIsAddDialogOpen(false);
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message ?? 'Failed to add member')
            : 'Failed to add member';
      toast({ title: 'Them nguoi dung that bai', description: message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (member: OrgMemberView, role: string) => {
    if (!companyId || role === member.role) return;
    try {
      await updateOrgMember(member.id, { role });
      await logActivity({
        orgId: companyId,
        module: 'users',
        action: 'update',
        description: `Doi role thanh vien ${member.email ?? member.user_id} -> ${role}`,
        status: 'success',
      });
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Khong cap nhat duoc role';
      toast({ title: 'Cap nhat role that bai', description: message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (member: OrgMemberView, status: string) => {
    if (!companyId || status === member.status) return;
    try {
      await updateOrgMember(member.id, { status });
      await logActivity({
        orgId: companyId,
        module: 'users',
        action: 'update',
        description: `Doi trang thai thanh vien ${member.email ?? member.user_id} -> ${status}`,
        status: 'success',
      });
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Khong cap nhat duoc trang thai';
      toast({ title: 'Cap nhat trang thai that bai', description: message, variant: 'destructive' });
    }
  };

  const openAssignmentDialog = (member: OrgMemberView) => {
    setSelectedMember(member);
    setEditingAssignments(Array.from(assignmentMap[member.user_id] ?? []));
    setAssignmentDialogOpen(true);
  };

  const saveAssignments = async () => {
    if (!companyId || !selectedMember) return;
    setSavingAssignments(true);

    try {
      await replaceUserProjectAssignments(companyId, selectedMember.user_id, editingAssignments);
      await logActivity({
        orgId: companyId,
        module: 'users',
        action: 'update',
        description: `Cap nhat phan cong du an cho ${selectedMember.email ?? selectedMember.user_id}`,
        status: 'success',
      });

      toast({ title: 'Da cap nhat phan cong du an' });
      setAssignmentDialogOpen(false);
      setSelectedMember(null);
      setEditingAssignments([]);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Khong luu duoc phan cong';
      toast({ title: 'Luu phan cong that bai', description: message, variant: 'destructive' });
    } finally {
      setSavingAssignments(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Quan ly Nguoi dung</h1>
            <p className="page-subtitle">
              {companyName ?? 'To chuc'} • {users.length} nguoi dung
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Them nguoi dung
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Them nguoi dung moi</DialogTitle>
                <DialogDescription>
                  Nhap email nguoi dung da ton tai trong he thong de them vao cong ty.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addEmail}
                    onChange={(event) => setAddEmail(event.target.value)}
                    placeholder="user@company.vn"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Vai tro</Label>
                    <Select value={addRole} onValueChange={setAddRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role] ?? role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trang thai</Label>
                    <Select value={addStatus} onValueChange={setAddStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phan cong du an</Label>
                  <div className="border border-border rounded-lg p-3 max-h-44 overflow-y-auto space-y-2">
                    {projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chua co du an nao.</p>
                    ) : (
                      projects.map((project) => (
                        <div key={project.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`add-${project.id}`}
                            checked={addAssignments.includes(project.id)}
                            onCheckedChange={() =>
                              toggleProjectSelection(project.id, addAssignments, setAddAssignments)
                            }
                          />
                          <Label htmlFor={`add-${project.id}`} className="text-sm font-normal cursor-pointer">
                            {project.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={adding}>
                  Huy
                </Button>
                <Button onClick={handleAddUser} disabled={adding}>
                  {adding ? 'Dang them...' : 'Them nguoi dung'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="filter-bar rounded-xl bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tim nguoi dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vai tro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca vai tro</SelectItem>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabels[role] ?? role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nguoi dung</th>
                <th>Vai tro</th>
                <th>Trang thai</th>
                <th>Du an phan cong</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8">
                    Dang tai du lieu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8">
                    Khong co nguoi dung.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => {
                  const displayName = member.full_name ?? member.email ?? member.user_id;
                  const assignedProjects = assignmentMap[member.user_id] ?? new Set<string>();

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{member.email ?? member.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Select value={member.role} onValueChange={(value) => handleRoleChange(member, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleLabels[role] ?? role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          <StatusBadge status={getRoleBadgeStatus(member.role) as any} dot={false}>
                            {roleLabels[member.role] ?? member.role}
                          </StatusBadge>
                        </div>
                      </td>
                      <td>
                        <Select value={member.status} onValueChange={(value) => handleStatusChange(member, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          <StatusBadge status={getStatusBadgeStatus(member.status) as any}>
                            {member.status}
                          </StatusBadge>
                        </div>
                      </td>
                      <td>
                        {member.role === 'owner' ? (
                          <span className="text-sm text-muted-foreground">Tat ca du an</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{assignedProjects.size} du an</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAssignmentDialog(member)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Phan cong du an
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Phan cong du an</DialogTitle>
            <DialogDescription>
              {selectedMember?.email ?? selectedMember?.user_id ?? 'Nguoi dung'}
            </DialogDescription>
          </DialogHeader>

          <div className="border border-border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co du an.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`assign-${project.id}`}
                    checked={editingAssignments.includes(project.id)}
                    onCheckedChange={() =>
                      toggleProjectSelection(project.id, editingAssignments, setEditingAssignments)
                    }
                  />
                  <Label htmlFor={`assign-${project.id}`} className="text-sm font-normal cursor-pointer">
                    {project.name}
                  </Label>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)} disabled={savingAssignments}>
              Huy
            </Button>
            <Button onClick={saveAssignments} disabled={savingAssignments}>
              {savingAssignments ? 'Dang luu...' : 'Luu phan cong'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
