import React from "react";
import { useSession } from "@/app/session/useSession";

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

const RequireSuperAdmin: React.FC<RequireSuperAdminProps> = ({ children }) => {
  const { loading, membershipLoading, isSuperAdmin } = useSession();

  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang kiểm tra quyền...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Không có quyền truy cập</h2>
          <p className="text-muted-foreground text-sm">
            Chỉ tài khoản có platform role <code>super_admin</code> mới truy cập được phần này.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireSuperAdmin;
