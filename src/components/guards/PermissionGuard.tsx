import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

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
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  if (!hasPermission(module, action)) {
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
