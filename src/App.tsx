import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/app/context/CompanyContext";
import RequireNoOrg from "@/app/auth/RequireNoOrg";
import RequireOrg from "@/app/auth/RequireOrg";
import RequireRole from "@/app/auth/RequireRole";

import PublicLayout from "@/components/layout/PublicLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import AppEntryGuard from "./components/layout/AppEntryGuard";
import DemoLayout from "./components/layout/DemoLayout";
import AppLayout from "./components/layout/AppLayout";
import AppLayoutApp from "./components/layout/AppLayoutApp";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import TrialRequest from "./pages/TrialRequest";
import DemoLogin from "./pages/demo/Login";
import AppLogin from "./pages/app/Login";
import Onboarding from "./pages/Onboarding";
import SelectPlan from "./pages/SelectPlan";

import LegacyDashboard from "./pages/Dashboard";
import LegacyProjects from "./pages/Projects";
import LegacyProjectDetail from "./pages/ProjectDetail";
import LegacyBilling from "./pages/Billing";

import AppDashboard from "./pages/app/Dashboard";
import AppProjects from "./pages/app/Projects";
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
import InviteAccept from "./pages/app/InviteAccept";

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

import ProjectGuard from "./components/guards/ProjectGuard";
import PermissionGuard from "./components/guards/PermissionGuard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppProtectedLayout = () => (
  <RequireOrg>
    <CompanyProvider>
      <AppLayoutApp />
    </CompanyProvider>
  </RequireOrg>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<TrialRequest />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route
                path="/onboarding"
                element={
                  <RequireNoOrg>
                    <Onboarding />
                  </RequireNoOrg>
                }
              />
              <Route
                path="/select-plan"
                element={
                  <RequireOrg>
                    <SelectPlan />
                  </RequireOrg>
                }
              />
            </Route>

            <Route
              path="/dashboard"
              element={
                <RequireOrg>
                  <LegacyDashboard />
                </RequireOrg>
              }
            />
            <Route
              path="/projects"
              element={
                <RequireOrg>
                  <LegacyProjects />
                </RequireOrg>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <RequireOrg>
                  <LegacyProjectDetail />
                </RequireOrg>
              }
            />
            <Route
              path="/members"
              element={<Navigate to="/app/admin/users" replace />}
            />
            <Route
              path="/team"
              element={<Navigate to="/app/admin/users" replace />}
            />
            <Route
              path="/thanh-vien"
              element={<Navigate to="/app/admin/users" replace />}
            />
            <Route
              path="/billing"
              element={
                <RequireOrg allowInactive>
                  <LegacyBilling />
                </RequireOrg>
              }
            />
            <Route path="/demo" element={<DemoLayout />}>
              <Route path="login" element={<DemoLogin />} />
              <Route index element={<Navigate to="/demo/login" replace />} />
              <Route path="dashboard" element={<DemoDashboard />} />
              <Route path="projects" element={<DemoProjects />} />
              <Route path="company" element={<PlatformTenants />} />
              <Route path="users" element={<PlatformUsers />} />
              <Route path="billing" element={<PlatformBilling />} />

              <Route
                path="projects/:id"
                element={
                  <ProjectGuard>
                    <Outlet />
                  </ProjectGuard>
                }
              >
                <Route index element={<DemoProjectOverview />} />
                <Route path="overview" element={<Navigate to=".." replace />} />
                <Route path="wbs" element={<DemoWBS />} />
                <Route path="boq" element={<DemoBOQ />} />
                <Route path="materials" element={<DemoMaterials />} />
                <Route path="norms" element={<DemoNorms />} />
                <Route path="costs" element={<DemoCosts />} />
                <Route path="contracts" element={<DemoContracts />} />
                <Route path="payments" element={<DemoPayments />} />
                <Route path="approvals" element={<DemoApprovals />} />
                <Route path="progress" element={<DemoProgress />} />
                <Route path="reports" element={<DemoReports />} />
              </Route>

              <Route path="admin/company" element={<DemoAdminCompany />} />
              <Route path="admin/users" element={<DemoAdminUsers />} />
              <Route path="admin/roles" element={<DemoAdminRoles />} />
              <Route path="admin/audit-log" element={<DemoAdminAuditLog />} />
              <Route path="admin/integrations" element={<DemoAdminIntegrations />} />
              <Route path="admin/billing" element={<DemoAdminBilling />} />
              <Route path="*" element={<Navigate to="/demo/dashboard" replace />} />
            </Route>

            <Route path="/app" element={<AppEntryGuard />}>
              <Route path="login" element={<AppLogin />} />
              <Route path="invite" element={<InviteAccept />} />
              <Route path="members" element={<Navigate to="/app/admin/users" replace />} />
              <Route path="team" element={<Navigate to="/app/admin/users" replace />} />
              <Route path="thanh-vien" element={<Navigate to="/app/admin/users" replace />} />

              <Route element={<AppProtectedLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<AppDashboard />} />
                <Route path="projects" element={<AppProjects />} />

                <Route
                  path="projects/:id/overview"
                  element={
                    <ProjectGuard>
                      <ProjectOverview />
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/wbs"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="wbs">
                        <WBS />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/boq"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="boq">
                        <BOQ />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/materials"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="materials">
                        <Materials />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/norms"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="norms">
                        <Norms />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/costs"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="costs">
                        <Costs />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/contracts"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="contracts">
                        <Contracts />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/payments"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="payments">
                        <Payments />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/approvals"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="approvals">
                        <Approvals />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/progress"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="progress">
                        <Progress />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />
                <Route
                  path="projects/:id/reports"
                  element={
                    <ProjectGuard>
                      <PermissionGuard module="reports">
                        <Reports />
                      </PermissionGuard>
                    </ProjectGuard>
                  }
                />

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
                      <Navigate to="/app/admin/users" replace />
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
                  path="admin/activity"
                  element={
                    <RequireRole allowed={["owner", "admin"]}>
                      <AdminAuditLog />
                    </RequireRole>
                  }
                />
                <Route
                  path="admin/audit-log"
                  element={
                    <RequireRole allowed={["owner", "admin"]}>
                      <Navigate to="/app/admin/activity" replace />
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
            </Route>

            <Route path="/platform" element={<AppLayout />}>
              <Route path="tenants" element={<PlatformTenants />} />
              <Route path="users" element={<PlatformUsers />} />
              <Route path="billing" element={<PlatformBilling />} />
            </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
