import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/app/context/CompanyContext";
import RequireAuth from "@/app/auth/RequireAuth";
import RequireRole from "@/app/auth/RequireRole";

// Public Pages
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import TrialRequest from "./pages/TrialRequest";
import DemoLogin from "./pages/demo/Login";
import AppLogin from "./pages/app/Login";
import Onboarding from "./pages/Onboarding";

// App Layout & Pages
import AppLayout from "./components/layout/AppLayout";
import AppLayoutApp from "./components/layout/AppLayoutApp";
import AppDashboard from "./pages/app/Dashboard";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Members from "./pages/Members";
import Billing from "./pages/Billing";
import Projects from "./pages/app/Projects";
import ProjectOverview from "./pages/app/ProjectOverview";
import Materials from "./pages/app/Materials";
import Norms from "./pages/app/Norms";
import WBS from "./pages/app/WBS";
import BOQ from "./pages/app/BOQ";
import Costs from "./pages/app/Costs";
import Progress from "./pages/app/Progress";
import Payments from "./pages/app/Payments";
import Contracts from "./pages/app/Contracts";
import Approvals from "./pages/app/Approvals";
import Reports from "./pages/app/Reports";
import AdminUsers from "./pages/app/AdminUsers";
import AdminRoles from "./pages/app/AdminRoles";
import AdminCompany from "./pages/app/AdminCompany";
import AdminAuditLog from "./pages/app/AdminAuditLog";
import AdminIntegrations from "./pages/app/AdminIntegrations";
import AdminBilling from "./pages/app/AdminBilling";
import AdminMembers from "./pages/app/AdminMembers";
import DemoDashboard from "./pages/demo/Dashboard";
import DemoProjects from "./pages/demo/Projects";
import DemoProjectOverview from "./pages/demo/ProjectOverview";
import DemoMaterials from "./pages/demo/Materials";
import DemoNorms from "./pages/demo/Norms";
import DemoWBS from "./pages/demo/WBS";
import DemoBOQ from "./pages/demo/BOQ";
import DemoCosts from "./pages/demo/Costs";
import DemoProgress from "./pages/demo/Progress";
import DemoPayments from "./pages/demo/Payments";
import DemoContracts from "./pages/demo/Contracts";
import DemoApprovals from "./pages/demo/Approvals";
import DemoReports from "./pages/demo/Reports";
import DemoAdminUsers from "./pages/demo/AdminUsers";
import DemoAdminRoles from "./pages/demo/AdminRoles";
import DemoAdminCompany from "./pages/demo/AdminCompany";
import DemoAdminAuditLog from "./pages/demo/AdminAuditLog";
import DemoAdminIntegrations from "./pages/demo/AdminIntegrations";
import DemoAdminBilling from "./pages/demo/AdminBilling";
import PlatformTenants from "./pages/platform/Tenants";
import PlatformUsers from "./pages/platform/Users";
import PlatformBilling from "./pages/platform/Billing";

// Guards
import ProjectGuard from "./components/guards/ProjectGuard";
import PermissionGuard from "./components/guards/PermissionGuard";

import NotFound from "./pages/NotFound";
import InviteAccept from "./pages/app/InviteAccept";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/trial" element={<TrialRequest />} />
            <Route path="/demo/login" element={<DemoLogin />} />
            <Route path="/app/login" element={<AppLogin />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/projects"
              element={
                <RequireAuth>
                  <Projects />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <RequireAuth>
                  <ProjectDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/members"
              element={
                <RequireAuth>
                  <Members />
                </RequireAuth>
              }
            />
            <Route
              path="/billing"
              element={
                <RequireAuth allowInactive>
                  <Billing />
                </RequireAuth>
              }
            />
            <Route path="/app/invite" element={<InviteAccept />} />

            {/* Demo Routes */}
            <Route path="/demo" element={<AppLayout />}>
              <Route index element={<Navigate to="/demo/dashboard" replace />} />
              <Route path="dashboard" element={<DemoDashboard />} />
              <Route path="projects" element={<DemoProjects />} />

              <Route path="projects/:id/overview" element={<ProjectGuard><DemoProjectOverview /></ProjectGuard>} />
              <Route path="projects/:id/wbs" element={<ProjectGuard><PermissionGuard module="wbs"><DemoWBS /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/boq" element={<ProjectGuard><PermissionGuard module="boq"><DemoBOQ /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/materials" element={<ProjectGuard><PermissionGuard module="materials"><DemoMaterials /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/norms" element={<ProjectGuard><PermissionGuard module="norms"><DemoNorms /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/costs" element={<ProjectGuard><PermissionGuard module="costs"><DemoCosts /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/contracts" element={<ProjectGuard><PermissionGuard module="contracts"><DemoContracts /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/payments" element={<ProjectGuard><PermissionGuard module="payments"><DemoPayments /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/approvals" element={<ProjectGuard><PermissionGuard module="approvals"><DemoApprovals /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/progress" element={<ProjectGuard><PermissionGuard module="progress"><DemoProgress /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/reports" element={<ProjectGuard><PermissionGuard module="reports"><DemoReports /></PermissionGuard></ProjectGuard>} />

              <Route path="admin/company" element={<PermissionGuard module="admin"><DemoAdminCompany /></PermissionGuard>} />
              <Route path="admin/users" element={<PermissionGuard module="admin"><DemoAdminUsers /></PermissionGuard>} />
              <Route path="admin/roles" element={<PermissionGuard module="admin"><DemoAdminRoles /></PermissionGuard>} />
              <Route path="admin/audit-log" element={<PermissionGuard module="admin"><DemoAdminAuditLog /></PermissionGuard>} />
              <Route path="admin/integrations" element={<PermissionGuard module="admin"><DemoAdminIntegrations /></PermissionGuard>} />
              <Route path="admin/billing" element={<PermissionGuard module="admin"><DemoAdminBilling /></PermissionGuard>} />
            </Route>

            {/* App Routes */}
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <CompanyProvider>
                    <AppLayoutApp />
                  </CompanyProvider>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<AppDashboard />} />
              <Route path="projects" element={<Projects />} />
              
              {/* Project Routes with Guard */}
              <Route path="projects/:id/overview" element={<ProjectGuard><ProjectOverview /></ProjectGuard>} />
              <Route path="projects/:id/wbs" element={<ProjectGuard><PermissionGuard module="wbs"><WBS /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/boq" element={<ProjectGuard><PermissionGuard module="boq"><BOQ /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/materials" element={<ProjectGuard><PermissionGuard module="materials"><Materials /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/norms" element={<ProjectGuard><PermissionGuard module="norms"><Norms /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/costs" element={<ProjectGuard><PermissionGuard module="costs"><Costs /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/contracts" element={<ProjectGuard><PermissionGuard module="contracts"><Contracts /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/payments" element={<ProjectGuard><PermissionGuard module="payments"><Payments /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/approvals" element={<ProjectGuard><PermissionGuard module="approvals"><Approvals /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/progress" element={<ProjectGuard><PermissionGuard module="progress"><Progress /></PermissionGuard></ProjectGuard>} />
              <Route path="projects/:id/reports" element={<ProjectGuard><PermissionGuard module="reports"><Reports /></PermissionGuard></ProjectGuard>} />

              {/* Admin Routes */}
              <Route
                path="admin/company"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminCompany />
                  </RequireRole>
                }
              />
              <Route
                path="admin/members"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminMembers />
                  </RequireRole>
                }
              />
              <Route
                path="admin/users"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminUsers />
                  </RequireRole>
                }
              />
              <Route
                path="admin/roles"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminRoles />
                  </RequireRole>
                }
              />
              <Route
                path="admin/audit-log"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminAuditLog />
                  </RequireRole>
                }
              />
              <Route
                path="admin/integrations"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminIntegrations />
                  </RequireRole>
                }
              />
              <Route
                path="admin/billing"
                element={
                  <RequireRole allowed={["owner", "admin"]}>
                    <AdminBilling />
                  </RequireRole>
                }
              />
            </Route>

            {/* Platform Routes (Super Admin) */}
            <Route path="/platform" element={<AppLayout />}>
              <Route path="tenants" element={<PlatformTenants />} />
              <Route path="users" element={<PlatformUsers />} />
              <Route path="billing" element={<PlatformBilling />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
