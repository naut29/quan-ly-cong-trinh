import React from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectGuardProps {
  children: React.ReactNode;
}

const ProjectGuard: React.FC<ProjectGuardProps> = ({ children }) => {
  const { id: projectId } = useParams();
  const { canAccessProject, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (projectId && !canAccessProject(projectId)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-muted-foreground mb-6">
            Bạn không có quyền truy cập dự án này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
          <Button onClick={() => navigate('/app/projects')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách dự án
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProjectGuard;
