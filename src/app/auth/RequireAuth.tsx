import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/app/session/useSession";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, memberStatus, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Äang táº£i tá»«ng lÆ°u...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/login" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">KhÃ´ng táº£i Ä‘Æ°á»£c há»“ sÆ¡ ngÆ°á»i dÃ¹ng</h2>
          <p className="text-muted-foreground text-sm">
            TÃ i khoáº£n cÃ³ thá»ƒ chÆ°a Ä‘Æ°á»£c gáº¯n cÃ´ng ty. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.
          </p>
        </div>
      </div>
    );
  }

  if (memberStatus === "disabled") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Tài khoản bị vô hiệu</h2>
          <p className="text-muted-foreground text-sm">
            Liên hệ quản trị để được kích hoạt lại.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
