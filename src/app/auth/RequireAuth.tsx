import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/app/session/useSession";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, memberStatus, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải từng lưu...</p>
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
          <h2 className="text-lg font-semibold text-foreground">Không tải được hồ sơ người dùng</h2>
          <p className="text-muted-foreground text-sm">
            Tài khoản có thể chưa được gắn công ty. Vui lòng liên hệ quản trị viên.
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
