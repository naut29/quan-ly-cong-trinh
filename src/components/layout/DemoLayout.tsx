import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { DEFAULT_DEMO_USER_ID } from "@/auth/demoAuth";
import { useAuth } from "@/contexts/AuthContext";
import { demoCompanyData } from "@/lib/data/demo/fixtures/company";

import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import Footer from "./Footer";

const DemoLayout: React.FC = () => {
  const { isAuthenticated, loadingSession, loginAs } = useAuth();
  const location = useLocation();
  const isLoginRoute = location.pathname === "/demo/login";

  useEffect(() => {
    if (!isLoginRoute && !loadingSession && !isAuthenticated) {
      loginAs(DEFAULT_DEMO_USER_ID);
    }
  }, [isAuthenticated, isLoginRoute, loadingSession, loginAs]);

  if (isLoginRoute) {
    return <Outlet />;
  }

  if (loadingSession || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Dang tai demo...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="custom-scrollbar flex-1 overflow-auto">
          <div className="px-6 pt-4">
            <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
              Demo mode - data is not saved. Company: {demoCompanyData.name}
            </div>
          </div>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DemoLayout;
