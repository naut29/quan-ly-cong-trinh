import type {
  AppDataLayer,
  BillingData,
  DashboardData,
  DataProject,
  DataUser,
} from "@/lib/data/types";
import { demoAlerts } from "@/lib/data/demo/fixtures/alerts";
import { demoActivity } from "@/lib/data/demo/fixtures/activity";
import { demoBillingData } from "@/lib/data/demo/fixtures/billing";
import { demoCompanyData } from "@/lib/data/demo/fixtures/company";
import { demoIntegrations } from "@/lib/data/demo/fixtures/integrations";
import { demoProjects } from "@/lib/data/demo/fixtures/projects";
import { demoRoles } from "@/lib/data/demo/fixtures/roles";
import { demoUsers } from "@/lib/data/demo/fixtures/users";

const cloneProject = (project: DataProject): DataProject => ({ ...project });
const cloneUser = (user: DataUser): DataUser => ({
  ...user,
  assignedProjectIds: [...user.assignedProjectIds],
});
const cloneBilling = (data: BillingData): BillingData => ({
  ...data,
  invoices: data.invoices.map((invoice) => ({ ...invoice })),
  paymentMethods: data.paymentMethods.map((method) => ({ ...method })),
});

const buildDashboardData = (): DashboardData => {
  const projects = demoProjects.map(cloneProject);
  const totalBudget = projects.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = projects.reduce((sum, item) => sum + item.actual, 0);
  const totalCommitted = projects.reduce((sum, item) => sum + item.committed, 0);
  const totalAlerts = projects.reduce((sum, item) => sum + item.alertCount, 0);

  return {
    companyName: demoCompanyData.name,
    summary: {
      totalBudget,
      totalActual,
      totalCommitted,
      averageProgress: Math.round(
        projects.reduce((sum, item) => sum + item.progress, 0) / projects.length,
      ),
      activeProjects: projects.filter((item) => item.status === "active").length,
      pausedProjects: projects.filter((item) => item.status === "paused").length,
      totalAlerts,
    },
    projects,
    alerts: demoAlerts.map((alert) => ({ ...alert })),
  };
};

export const demoDataProvider: AppDataLayer = {
  mode: "demo",
  getDashboardData: async () => buildDashboardData(),
  listProjects: async () => demoProjects.map(cloneProject),
  listUsers: async () => demoUsers.map(cloneUser),
  getBillingData: async () => cloneBilling(demoBillingData),
  listActivity: async () => demoActivity.map((entry) => ({ ...entry })),
  getCompanyData: async () => ({ ...demoCompanyData }),
  listRoles: async () => demoRoles.map((role) => ({ ...role })),
  listIntegrations: async () => demoIntegrations.map((item) => ({ ...item })),
};
