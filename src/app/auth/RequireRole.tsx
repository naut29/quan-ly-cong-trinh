import React from "react";
import { useCompany } from "@/app/context/CompanyContext";

interface RequireRoleProps {
  allowed: string[];
  children: React.ReactNode;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowed, children }) => {
  const { role, loading } = useCompany();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Äang kiá»ƒm tra quyá»n...</p>
      </div>
    );
  }

  if (!role || !allowed.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
          <p className="text-muted-foreground text-sm">
            Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p pháº§n nÃ y.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireRole;
