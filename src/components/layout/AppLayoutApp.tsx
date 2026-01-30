import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebarApp from './AppSidebarApp';
import AppTopbarApp from './AppTopbarApp';
import Footer from './Footer';

const AppLayoutApp: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebarApp />
      <div className="flex flex-col flex-1 min-w-0">
        <AppTopbarApp />
        <main className="flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayoutApp;
