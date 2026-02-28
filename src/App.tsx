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
import RequireSuperAdmin from "@/app/auth/RequireSuperAdmin";
import { AppDataProvider } from "@/lib/data/appDataLayerProvider";
import { DemoDataProvider } from "@/lib/data/demoDataLayerProvider";

import PublicLayout from "@/components/layout/PublicLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import AppEntryGuard from "./components/layout/AppEntryGuard";
import DemoLayout from "./components/layout/DemoLayout";
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
import { AppIntegrationsPage } from "./pages/app/AdminIntegrations";
import AdminBilling from "./pages/app/AdminBilling";
import InviteAccept from "./pages/app/InviteAccept";

import DemoDashboard from "./pages/demo/Dashboard";
import DemoAdminUsers from "./pages/demo/AdminUsers";
import DemoAdminRoles from "./pages/demo/AdminRoles";
import DemoAdminCompany from "./pages/demo/AdminCompany";
import DemoAdminAuditLog from "./pages/demo/AdminAuditLog";
import DemoAdminBilling from "./pages/demo/AdminBilling";
import DemoAdminIntegrations from "./pages/demo/AdminIntegrations";
import DemoLegacyProjectLayout from "./demo-legacy/projects/DemoLegacyProjectLayout";
import DemoLegacyProjects from "./demo-legacy/projects/Projects";
import DemoLegacyProjectOverview from "./demo-legacy/projects/ProjectOverview";
import DemoLegacyMaterials from "./demo-legacy/projects/Materials";
import DemoLegacyNorms from "./demo-legacy/projects/Norms";
import DemoLegacyWBS from "./demo-legacy/projects/WBS";
import DemoLegacyBOQ from "./demo-legacy/projects/BOQ";
import DemoLegacyCosts from "./demo-legacy/projects/Costs";
import DemoLegacyProgress from "./demo-legacy/projects/Progress";
import DemoLegacyPayments from "./demo-legacy/projects/Payments";
import DemoLegacyContracts from "./demo-legacy/projects/Contracts";
import DemoLegacyApprovals from "./demo-legacy/projects/Approvals";
import DemoLegacyReports from "./demo-legacy/projects/Reports";

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
      <AppDataProvider>
        <AppLayoutApp />
      </AppDataProvider>
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
            <Route
              path="/demo"
              element={
                <DemoDataProvider>
                  <DemoLayout />
                </DemoDataProvider>
              }
            >
              <Route path="login" element={<DemoLogin />} />
              <Route index element={<Navigate to="/demo/login" replace />} />
              <Route path="dashboard" element={<DemoDashboard />} />
              <Route path="projects" element={<DemoLegacyProjects />} />
              <Route path="company" element={<Navigate to="/demo/admin/company" replace />} />
              <Route path="users" element={<Navigate to="/demo/admin/users" replace />} />
              <Route path="billing" element={<Navigate to="/demo/admin/billing" replace />} />

              <Route path="projects/:id" element={<DemoLegacyProjectLayout />}>
                <Route index element={<DemoLegacyProjectOverview />} />
                <Route path="overview" element={<DemoLegacyProjectOverview />} />
                <Route path="wbs" element={<DemoLegacyWBS />} />
                <Route path="budget" element={<DemoLegacyBOQ />} />
                <Route path="boq" element={<DemoLegacyBOQ />} />
                <Route path="materials" element={<DemoLegacyMaterials />} />
                <Route path="norms" element={<DemoLegacyNorms />} />
                <Route path="costs" element={<DemoLegacyCosts />} />
                <Route path="contracts" element={<DemoLegacyContracts />} />
                <Route path="payments" element={<DemoLegacyPayments />} />
                <Route path="approvals" element={<DemoLegacyApprovals />} />
                <Route path="progress" element={<DemoLegacyProgress />} />
                <Route path="reports" element={<DemoLegacyReports />} />
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
                      <AppIntegrationsPage />
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
                <Route
                  path="platform"
                  element={
                    <RequireSuperAdmin>
                      <Navigate to="/app/platform/tenants" replace />
                    </RequireSuperAdmin>
                  }
                />
                <Route
                  path="platform/tenants"
                  element={
                    <RequireSuperAdmin>
                      <PlatformTenants />
                    </RequireSuperAdmin>
                  }
                />
                <Route
                  path="platform/users"
                  element={
                    <RequireSuperAdmin>
                      <PlatformUsers />
                    </RequireSuperAdmin>
                  }
                />
                <Route
                  path="platform/billing"
                  element={
                    <RequireSuperAdmin>
                      <PlatformBilling />
                    </RequireSuperAdmin>
                  }
                />
              </Route>
            </Route>

            <Route path="/platform" element={<Outlet />}>
              <Route index element={<Navigate to="/app/platform/tenants" replace />} />
              <Route path="tenants" element={<Navigate to="/app/platform/tenants" replace />} />
              <Route path="users" element={<Navigate to="/app/platform/users" replace />} />
              <Route path="billing" element={<Navigate to="/app/platform/billing" replace />} />
            </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
