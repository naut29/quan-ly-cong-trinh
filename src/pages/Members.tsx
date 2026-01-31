import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type MemberRole = "owner" | "admin" | "manager" | "viewer";

interface MemberRow {
  org_id: string;
  user_id: string;
  role: MemberRole;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

const roleOptions: MemberRole[] = ["viewer", "manager", "admin"];

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const Members: React.FC = () => {
  const { orgId, orgRole, loading: sessionLoading } = useSession();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userIdInput, setUserIdInput] = useState("");
  const [roleInput, setRoleInput] = useState<MemberRole>("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const isAdmin = useMemo(
    () => (orgRole ?? "viewer") === "owner" || (orgRole ?? "viewer") === "admin",
    [orgRole],
  );

  const ownersCount = useMemo(
    () => members.filter((member) => member.role === "owner").length,
    [members],
  );

  const loadMembers = useCallback(async () => {
    if (!supabase || !orgId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("list_org_members", { p_org_id: orgId });
    if (error) {
      setError(error.message);
      setMembers([]);
    } else {
      setMembers((data ?? []) as MemberRow[]);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (sessionLoading) return;
    loadMembers();
  }, [loadMembers, sessionLoading]);

  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedUserId = userIdInput.trim();
    if (!trimmedUserId || !isUuid(trimmedUserId)) {
      setSubmitError("User ID không hợp lệ.");
      return;
    }

    if (!supabase || !orgId) {
      setSubmitError("Thiếu dữ liệu tổ chức.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("org_members").insert({
        org_id: orgId,
        user_id: trimmedUserId,
        role: roleInput,
      });

      if (error) {
        if (error.code === "23505" || /duplicate/i.test(error.message)) {
          throw new Error("User đã thuộc công ty");
        }
        throw error;
      }

      setUserIdInput("");
      setRoleInput("viewer");
      await loadMembers();
    } catch (err: any) {
      setSubmitError(err?.message ?? "Không thể thêm thành viên.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (member: MemberRow, nextRole: MemberRole) => {
    setSubmitError(null);
    if (!supabase || !orgId) return;

    if (member.role === "owner" && nextRole !== "owner" && ownersCount <= 1) {
      setSubmitError("Không thể thay đổi quyền của owner cuối cùng.");
      return;
    }

    const { error } = await supabase
      .from("org_members")
      .update({ role: nextRole })
      .eq("org_id", orgId)
      .eq("user_id", member.user_id);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    await loadMembers();
  };

  const handleDeleteMember = async () => {
    if (!deleteMemberId || !supabase || !orgId) {
      setDeleteMemberId(null);
      return;
    }

    const target = members.find((member) => member.user_id === deleteMemberId);
    if (target?.role === "owner" && ownersCount <= 1) {
      setSubmitError("Không thể xoá owner cuối cùng.");
      setDeleteMemberId(null);
      return;
    }

    setDeleteSubmitting(true);
    try {
      const { error } = await supabase
        .from("org_members")
        .delete()
        .eq("org_id", orgId)
        .eq("user_id", deleteMemberId);

      if (error) {
        throw error;
      }

      setDeleteMemberId(null);
      await loadMembers();
    } catch (err: any) {
      setSubmitError(err?.message ?? "Không thể xoá thành viên.");
      setDeleteMemberId(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Missing Supabase env</h2>
          <p className="text-muted-foreground text-sm">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.
          </p>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Không có quyền</p>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Quay lại Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Thành viên</h1>
          <p className="text-sm text-muted-foreground">Quản lý thành viên trong tổ chức.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1.5fr,1fr,auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="userIdInput">User ID (UUID)</Label>
                <Input
                  id="userIdInput"
                  value={userIdInput}
                  onChange={(event) => setUserIdInput(event.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Quyền</Label>
                <Select value={roleInput} onValueChange={(value) => setRoleInput(value as MemberRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quyền" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? "Đang thêm..." : "Thêm thành viên"}
              </Button>
            </div>
            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Quyền</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive py-8">
                    {error}
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Chưa có thành viên
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>{member.email ?? "-"}</TableCell>
                    <TableCell>{member.full_name ?? "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member, value as MemberRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["owner", "admin", "manager", "viewer"] as MemberRole[]).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {member.created_at
                        ? new Date(member.created_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteMemberId(member.user_id)}
                      >
                        Xoá
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá thành viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá thành viên này khỏi công ty không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} disabled={deleteSubmitting}>
              {deleteSubmitting ? "Đang xoá..." : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Members;
