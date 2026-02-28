import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  MoreVertical,
  Plus,
  Search,
  UserCog,
} from "lucide-react";

import { useCompany } from "@/app/context/CompanyContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/hooks/use-toast";
import { listProjectsByOrg } from "@/lib/api/projects";
import { listOrgRoles, type OrgRoleRow } from "@/lib/api/rbac";
import { logActivity } from "@/lib/api/activity";
import {
  addOrgMemberByEmail,
  listOrgMembers,
  listProjectAssignmentsForOrg,
  replaceUserProjectAssignments,
  updateOrgMember,
  type OrgMemberView,
} from "@/lib/api/users";
import { getDefaultRole, getRoleBadgeStatus, normalizeRoleKey } from "@/lib/rbac";

const STATUS_OPTIONS = ["active", "invited", "disabled"];

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  if (typeof error === "string") return error;
  return "";
};

const toUserFacingError = (error: unknown, fallback: string) => {
  const rawMessage = getErrorMessage(error).toLowerCase();
  if (rawMessage.includes("does not exist")) {
    return "Cau hinh du lieu chua dong bo. Vui long lien he quan tri hoac thu tai lai.";
  }
  return fallback;
};

const logUsersError = (scope: string, error: unknown) => {
  console.error(`[AdminUsers] ${scope}`, error);
};

const toRoleFallbackLabel = (value: string | null | undefined) => {
  if (!value) {
    return "Chua gan";
  }

  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
};

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { companyId, companyName } = useCompany();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [users, setUsers] = useState<OrgMemberView[]>([]);
  const [roles, setRoles] = useState<OrgRoleRow[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, Set<string>>>({});

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRoleId, setAddRoleId] = useState("");
  const [addStatus, setAddStatus] = useState("active");
  const [addAssignments, setAddAssignments] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrgMemberView | null>(null);
  const [editingAssignments, setEditingAssignments] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles],
  );

  const defaultRole = useMemo(() => getDefaultRole(roles), [roles]);

  useEffect(() => {
    if (roles.length === 0) {
      setAddRoleId("");
      setRoleFilter("all");
      return;
    }

    setAddRoleId((currentRoleId) => {
      if (roles.some((role) => role.id === currentRoleId)) {
        return currentRoleId;
      }

      return defaultRole?.id ?? roles[0].id;
    });

    setRoleFilter((currentFilter) => {
      if (currentFilter === "all" || roles.some((role) => role.id === currentFilter)) {
        return currentFilter;
      }

      return "all";
    });
  }, [defaultRole, roles]);

  const getRoleLabel = (member: Pick<OrgMemberView, "role_id" | "role_name" | "role_key" | "role">) => {
    if (member.role_id) {
      const matchedRole = rolesById.get(member.role_id);
      if (matchedRole) {
        return matchedRole.name;
      }
    }

    return member.role_name ?? toRoleFallbackLabel(member.role_key ?? member.role);
  };

  const loadData = useCallback(async () => {
    if (!companyId) {
      setUsers([]);
      setRoles([]);
      setProjects([]);
      setAssignmentMap({});
      setLoading(false);
      setError("Chưa có tổ chức.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [memberRows, roleRows, projectRows, assignmentRows] = await Promise.all([
        listOrgMembers(companyId),
        listOrgRoles(companyId),
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
      setRoles(roleRows);
      setProjects(projectRows);
      setAssignmentMap(nextMap);
    } catch (err) {
      logUsersError("loadData", err);
      setError(
        toUserFacingError(
          err,
          "Không thể tải danh sách người dùng. Vui lòng thử tải lại.",
        ),
      );
      setUsers([]);
      setRoles([]);
      setProjects([]);
      setAssignmentMap({});
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);
    return users.filter((member) => {
      const displayName = member.full_name ?? member.email ?? member.user_id;
      const normalizedDisplayName = normalizeSearchValue(displayName);
      const normalizedEmail = normalizeSearchValue(member.email ?? "");
      const matchesSearch =
        normalizedDisplayName.includes(normalizedQuery) ||
        normalizedEmail.includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || member.role_id === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchQuery, users]);

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
      toast({ title: "Thieu email", description: "Vui long nhap email.", variant: "destructive" });
      return;
    }

    if (!addRoleId) {
      toast({
        title: "Thiếu vai trò",
        description: "Không tìm thấy vai trò hệ thống để gán cho người dùng.",
        variant: "destructive",
      });
      return;
    }

    const selectedRole = rolesById.get(addRoleId);

    setAdding(true);
    try {
      const result = await addOrgMemberByEmail(companyId, addEmail.trim(), addRoleId, addStatus);

      if (!result.ok) {
        if ("reason" in result && result.reason === "not_found") {
          toast({
            title: "Chưa tìm thấy người dùng",
            description: "Email chưa tồn tại trong hệ thống. Chưa hỗ trợ mời trực tiếp, sẽ bổ sung sau.",
            variant: "destructive",
          });
          return;
        }

        if ("reason" in result && result.reason === "already_member") {
          toast({
            title: "Người dùng đã tồn tại",
            description: "Tài khoản này đã là thành viên của công ty.",
            variant: "destructive",
          });
        }
        return;
      }

      await replaceUserProjectAssignments(companyId, result.member.user_id, addAssignments);
      await logActivity({
        orgId: companyId,
        module: "users",
        action: "create",
        description: `Thêm thành viên ${addEmail} với vai trò ${selectedRole?.name ?? "Member"}`,
        status: "success",
      });

      toast({
        title: "Thêm người dùng thành công",
        description: `${addEmail} đã được thêm vào ${companyName ?? "công ty"}.`,
      });

      setAddEmail("");
      setAddRoleId(defaultRole?.id ?? "");
      setAddStatus("active");
      setAddAssignments([]);
      setIsAddDialogOpen(false);
      await loadData();
    } catch (err) {
      logUsersError("handleAddUser", err);
      toast({
        title: "Thêm người dùng thất bại",
        description: toUserFacingError(
          err,
          "Không thể thêm người dùng. Vui lòng thử lại.",
        ),
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (member: OrgMemberView, nextRoleId: string) => {
    if (!companyId || nextRoleId === member.role_id) return;

    const selectedRole = rolesById.get(nextRoleId);

    try {
      await updateOrgMember(member.org_id, member.user_id, { roleId: nextRoleId });
      await logActivity({
        orgId: companyId,
        module: "users",
        action: "update",
        description: `Đổi vai trò thành viên ${member.email ?? member.user_id} -> ${selectedRole?.name ?? nextRoleId}`,
        status: "success",
      });
      await loadData();
    } catch (err) {
      logUsersError("handleRoleChange", err);
      toast({
        title: "Cập nhật vai trò thất bại",
        description: toUserFacingError(
          err,
          "Không thể cập nhật vai trò. Vui lòng thử lại.",
        ),
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (member: OrgMemberView, status: string) => {
    if (!companyId || status === member.status) return;
    try {
      await updateOrgMember(member.org_id, member.user_id, { status });
      await logActivity({
        orgId: companyId,
        module: "users",
        action: "update",
        description: `Đổi trạng thái thành viên ${member.email ?? member.user_id} -> ${status}`,
        status: "success",
      });
      await loadData();
    } catch (err) {
      logUsersError("handleStatusChange", err);
      toast({
        title: "Cập nhật trạng thái thất bại",
        description: toUserFacingError(
          err,
          "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        ),
        variant: "destructive",
      });
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
        module: "users",
        action: "update",
        description: `Cập nhật phân công dự án cho ${selectedMember.email ?? selectedMember.user_id}`,
        status: "success",
      });

      toast({ title: "Đã cập nhật phân công dự án" });
      setAssignmentDialogOpen(false);
      setSelectedMember(null);
      setEditingAssignments([]);
      await loadData();
    } catch (err) {
      logUsersError("saveAssignments", err);
      toast({
        title: "Lưu phân công thất bại",
        description: toUserFacingError(
          err,
          "Không thể lưu phân công. Vui lòng thử lại.",
        ),
        variant: "destructive",
      });
    } finally {
      setSavingAssignments(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Quản lý Người dùng</h1>
            <p className="page-subtitle">
              {companyName ?? "Tổ chức"} • {users.length} người dùng
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
                <DialogDescription>
                  Nhập email người dùng đã tồn tại trong hệ thống để thêm vào công ty.
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
                    <Label>Vai trò</Label>
                    <Select value={addRoleId} onValueChange={setAddRoleId} disabled={roles.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
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
                  <Label>Phân công dự án</Label>
                  <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                    {projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có dự án nào.</p>
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
                          <Label htmlFor={`add-${project.id}`} className="cursor-pointer text-sm font-normal">
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
                  Hủy
                </Button>
                <Button onClick={handleAddUser} disabled={adding || roles.length === 0}>
                  {adding ? "Đang thêm..." : "Thêm người dùng"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="filter-bar rounded-xl bg-card">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm người dùng..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Dự án phân công</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Không có người dùng.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => {
                  const displayName = member.full_name ?? member.email ?? member.user_id;
                  const assignedProjects = assignmentMap[member.user_id] ?? new Set<string>();
                  const resolvedRoleKey = normalizeRoleKey(member.role_key ?? member.role);
                  const roleLabel = getRoleLabel(member);

                  return (
                    <tr key={member.member_key}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-sm text-primary">
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
                        <Select
                          value={member.role_id ?? ""}
                          onValueChange={(value) => handleRoleChange(member, value)}
                          disabled={roles.length === 0 || !member.role_id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          {member.role_id ? (
                            <button
                              type="button"
                              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              onClick={() => navigate(`/app/admin/roles?role=${member.role_id}`)}
                            >
                              <StatusBadge status={getRoleBadgeStatus(resolvedRoleKey)} dot={false}>
                                {roleLabel}
                              </StatusBadge>
                            </button>
                          ) : (
                            <StatusBadge status={getRoleBadgeStatus(resolvedRoleKey)} dot={false}>
                              {roleLabel}
                            </StatusBadge>
                          )}
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
                          <StatusBadge
                            status={
                              member.status === "active"
                                ? "success"
                                : member.status === "invited"
                                  ? "warning"
                                  : member.status === "disabled"
                                    ? "danger"
                                    : "neutral"
                            }
                          >
                            {member.status}
                          </StatusBadge>
                        </div>
                      </td>
                      <td>
                        {resolvedRoleKey === "owner" ? (
                          <span className="text-sm text-muted-foreground">Tất cả dự án</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{assignedProjects.size} dự án</span>
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
                              Phân công dự án
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
            <DialogTitle>Phân công dự án</DialogTitle>
            <DialogDescription>
              {selectedMember?.email ?? selectedMember?.user_id ?? "Người dùng"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dự án.</p>
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
                  <Label htmlFor={`assign-${project.id}`} className="cursor-pointer text-sm font-normal">
                    {project.name}
                  </Label>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)} disabled={savingAssignments}>
              Hủy
            </Button>
            <Button onClick={saveAssignments} disabled={savingAssignments}>
              {savingAssignments ? "Đang lưu..." : "Lưu phân công"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
