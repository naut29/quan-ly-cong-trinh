import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { inviteMember, updateMemberRole, disableMember } from "@/app/api/members";
import { useCompany } from "@/app/context/CompanyContext";
import { toast } from "@/hooks/use-toast";

type Member = {
  id: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "invited" | "active" | "disabled";
  invited_at: string | null;
};

const roleOptions: Member["role"][] = ["owner", "admin", "editor", "viewer"];

const AdminMembers: React.FC = () => {
  const { companyId } = useCompany();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Member["role"]>("viewer");

  const loadMembers = async () => {
    const client = supabase;
    if (!companyId || !client) return;
    setLoading(true);
    const { data, error } = await client
      .from("company_members")
      .select("id, email, role, status, invited_at")
      .eq("company_id", companyId)
      .order("invited_at", { ascending: false });
    if (!error) {
      setMembers((data ?? []) as Member[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [companyId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      const result = await inviteMember({ email: inviteEmail, role: inviteRole });
      toast({
        title: "Đã gửi lời mời",
        description: `Token: ${result.token}`,
      });
      setInviteEmail("");
      await loadMembers();
    } catch (err: any) {
      toast({
        title: "Không gửi được lời mời",
        description: err?.message ?? "Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (memberId: string, role: Member["role"]) => {
    try {
      await updateMemberRole(memberId, role);
      await loadMembers();
    } catch (err: any) {
      toast({
        title: "Không đổi được vai trò",
        description: err?.message ?? "Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const handleDisable = async (memberId: string) => {
    try {
      await disableMember(memberId);
      await loadMembers();
    } catch (err: any) {
      toast({
        title: "Không vô hiệu hoá được thành viên",
        description: err?.message ?? "Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Thành viên công ty</h1>
        <p className="text-muted-foreground mt-1">Quản lý lời mời và phân quyền</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="text-sm font-medium">Mời thành viên</div>
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="email@company.vn"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="max-w-xs"
          />
          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Member["role"])}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleInvite}>Gửi lời mời</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  Chưa có thành viên
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>{member.email}</td>
                  <td>
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleChange(member.id, value as Member["role"])}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td>{member.status}</td>
                  <td className="text-right">
                    <Button variant="outline" onClick={() => handleDisable(member.id)}>
                      Vô hiệu hoá
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMembers;
