import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/app/session/useSession";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { acceptInvite } from "@/app/api/members";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const InviteAccept: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  useEffect(() => {
    if (!token || !user || loading) return;

    const run = async () => {
      setSubmitting(true);
      try {
        await acceptInvite(token);
        toast({
          title: "Đã chấp nhận lời mời",
          description: "Bạn đã gia nhập công ty.",
        });
        navigate("/app/projects");
      } catch (err: any) {
        toast({
          title: "Không thể chấp nhận lời mời",
          description: err?.message ?? "Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    };

    run();
  }, [token, user, loading, navigate]);

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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Thiếu token lời mời.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`/app/invite?token=${token}`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Vui lòng đăng nhập để chấp nhận lời mời.</p>
          <Button onClick={() => navigate(`/app/login?next=${next}`)}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">
        {submitting ? "Đang chấp nhận lời mời..." : "Đang xử lý..."}
      </p>
    </div>
  );
};

export default InviteAccept;
