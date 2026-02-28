import React, { useEffect, useMemo, useState } from "react";
import { MoreVertical, Plus, Search, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { DataUser } from "@/lib/data/types";
import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
};

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getRoleTone = (role: string): "info" | "success" | "warning" | "neutral" => {
  if (role === "owner") return "info";
  if (role === "admin") return "success";
  if (role === "manager") return "warning";
  return "neutral";
};

const getStatusTone = (status: string): "success" | "warning" | "neutral" => {
  if (status === "active") return "success";
  if (status === "invited") return "warning";
  return "neutral";
};

const DemoAdminUsers: React.FC = () => {
  const dataProvider = useDataProvider();
  const [users, setUsers] = useState<DataUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    let active = true;

    dataProvider
      .listUsers()
      .then((items) => {
        if (active) {
          setUsers(items);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataProvider]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [roleFilter, search, users],
  );

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quan ly nguoi dung</h1>
          <p className="text-muted-foreground">5 users mock co dinh cho /demo/admin/users</p>
        </div>
        <Button onClick={showDemoNotSavedToast}>
          <Plus className="mr-2 h-4 w-4" />
          Them user demo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Tong users</p>
          <p className="mt-2 text-2xl font-bold">{users.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Dang hoat dong</p>
          <p className="mt-2 text-2xl font-bold">{users.filter((item) => item.status === "active").length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Du an phan cong</p>
          <p className="mt-2 text-2xl font-bold">
            {users.reduce((sum, item) => sum + item.assignedProjectIds.length, 0)}
          </p>
        </div>
      </div>

      <div className="filter-bar rounded-xl bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo ten hoac email..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Vai tro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca vai tro</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Projects</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  Dang tai users demo...
                </td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
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
                  <StatusBadge status={getRoleTone(user.role)} dot={false}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </StatusBadge>
                </td>
                <td>
                  <StatusBadge status={getStatusTone(user.status)}>
                    {user.status}
                  </StatusBadge>
                </td>
                <td>{user.assignedProjectIds.length}</td>
                <td className="text-sm text-muted-foreground">
                  {new Date(user.joinedAt).toLocaleDateString("vi-VN")}
                </td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={showDemoNotSavedToast}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Cap nhat demo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemoAdminUsers;
