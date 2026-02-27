import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { purgeDemoSession } from "@/auth/demoAuth";
import { purgeDemoProjects } from "@/data/demoRepo";
import { purgeDemoStorage } from "@/lib/demoStorage";

const AppEntryGuard: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith("/app")) {
      return;
    }

    purgeDemoSession();
    purgeDemoProjects();
    purgeDemoStorage();
  }, [pathname]);

  return <Outlet />;
};

export default AppEntryGuard;
