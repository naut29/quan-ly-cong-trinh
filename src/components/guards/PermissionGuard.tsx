import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useCompany } from '@/app/context/CompanyContext';
import { Button } from '@/components/ui/button';
import { hasOrgPermission } from '@/lib/api/rolePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  action?: 'view' | 'edit';
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  module, 
  action = 'view' 
}) => {
  const { companyId } = useCompany();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    if (!companyId) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    hasOrgPermission(companyId, module, action)
      .then((nextAllowed) => {
        if (isActive) {
          setAllowed(nextAllowed);
        }
      })
      .catch(() => {
        if (isActive) {
          setAllowed(false);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [action, companyId, module]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">Dang kiem tra quyen truy cap...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bạn không có quyền truy cập
          </h1>
          <p className="text-muted-foreground mb-6">
            Tính năng này yêu cầu quyền {action === 'view' ? 'xem' : 'chỉnh sửa'} module "{module}". 
            Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
