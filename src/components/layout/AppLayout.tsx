import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAppBasePath } from '@/lib/appMode';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);

  if (!isAuthenticated) {
    return <Navigate to={`${basePath}/login`} replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppTopbar />
        <main className="flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
