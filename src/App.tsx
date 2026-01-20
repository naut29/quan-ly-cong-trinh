import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";

// App Layout & Pages
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Projects from "./pages/app/Projects";
import ProjectOverview from "./pages/app/ProjectOverview";
import Materials from "./pages/app/Materials";
import BOQ from "./pages/app/BOQ";
import Progress from "./pages/app/Progress";
import Payments from "./pages/app/Payments";
import AdminUsers from "./pages/app/AdminUsers";
import AdminRoles from "./pages/app/AdminRoles";

// Guards
import ProjectGuard from "./components/guards/ProjectGuard";
import PermissionGuard from "./components/guards/PermissionGuard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Landing />} />
            <Route path="/demo" element={<Landing />} />

            {/* App Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              
              {/* Project Routes with Guard */}
              <Route path="projects/:id/overview" element={<ProjectGuard><ProjectOverview /></ProjectGuard>} />
              <Route path="projects/:id/wbs" element={<ProjectGuard><PermissionGuard module="wbs"><BOQ /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/boq" element={<ProjectGuard><PermissionGuard module="boq"><BOQ /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/materials" element={<ProjectGuard><PermissionGuard module="materials"><Materials /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/norms" element={<ProjectGuard><PermissionGuard module="norms"><Materials /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/costs" element={<ProjectGuard><PermissionGuard module="costs"><Materials /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/contracts" element={<ProjectGuard><PermissionGuard module="contracts"><BOQ /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/payments" element={<ProjectGuard><PermissionGuard module="payments"><Payments /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/progress" element={<ProjectGuard><PermissionGuard module="progress"><Progress /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/reports" element={<ProjectGuard><PermissionGuard module="reports"><BOQ /></PermissionGuard></ProjectGuard>} />

              {/* Admin Routes */}
              <Route path="admin/company" element={<PermissionGuard module="admin"><AdminUsers /></PermissionGuard>} />
              <Route path="admin/users" element={<PermissionGuard module="admin"><AdminUsers /></PermissionGuard>} />
              <Route path="admin/roles" element={<PermissionGuard module="admin"><AdminRoles /></PermissionGuard>} />
              <Route path="admin/audit-log" element={<PermissionGuard module="admin"><AdminUsers /></PermissionGuard>} />
              <Route path="admin/integrations" element={<PermissionGuard module="admin"><AdminUsers /></PermissionGuard>} />
              <Route path="admin/billing" element={<PermissionGuard module="admin"><AdminUsers /></PermissionGuard>} />
            </Route>

            {/* Platform Routes (Super Admin) */}
            <Route path="/platform" element={<AppLayout />}>
              <Route path="tenants" element={<AdminUsers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="billing" element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
