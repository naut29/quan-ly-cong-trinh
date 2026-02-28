import { ensureSubscription, getSubscription, listInvoices, listPaymentMethods } from "@/lib/api/billing";
import { getOrganization, getOrganizationStats } from "@/lib/api/company";
import { listProjectsByOrg, getProjectDashboardStats } from "@/lib/api/projects";
import { listActivityLogs } from "@/lib/api/activity";
import { listOrgMembers, listProjectAssignmentsForOrg } from "@/lib/api/users";
import { getPlan, type PlanId } from "@/lib/plans/planCatalog";
import type {
  ActivityEntry,
  AppDataLayer,
  BillingData,
  CompanyData,
  DashboardData,
  DataProject,
  DataProjectStage,
  DataProjectStatus,
  DataUser,
  IntegrationSummary,
  RoleSummary,
} from "@/lib/data/types";

interface CreateAppDataProviderOptions {
  orgId: string | null;
  companyName?: string | null;
}

const fallbackProjectStatus = (value: string | null | undefined): DataProjectStatus => {
  if (value === "paused" || value === "completed") return value;
  return "active";
};

const fallbackProjectStage = (value: string | null | undefined): DataProjectStage => {
  if (value === "structure" || value === "finishing") return value;
  return "foundation";
};

const mapProject = (project: Awaited<ReturnType<typeof listProjectsByOrg>>[number]): DataProject => ({
  id: project.id,
  code: project.code,
  name: project.name,
  address: project.address,
  status: fallbackProjectStatus(project.status),
  stage: fallbackProjectStage(project.stage),
  budget: project.budget,
  actual: project.actual,
  committed: project.committed,
  forecast: project.forecast,
  progress: project.progress,
  startDate: project.startDate,
  endDate: project.endDate,
  alertCount: project.alertCount,
  manager: project.manager,
});

const emptyDashboardData = (companyName: string): DashboardData => ({
  companyName,
  summary: {
    totalBudget: 0,
    totalActual: 0,
    totalCommitted: 0,
    averageProgress: 0,
    activeProjects: 0,
    pausedProjects: 0,
    totalAlerts: 0,
  },
  projects: [],
  alerts: [],
});

const emptyBillingData = (companyName: string): BillingData => ({
  companyName,
  currentPlanId: "starter",
  subscriptionStatus: "inactive",
  subscriptionBadge: "No subscription",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  membersUsed: 0,
  projectsUsed: 0,
  invoices: [],
  paymentMethods: [],
});

const emptyCompanyData = (companyName: string): CompanyData => ({
  name: companyName,
  taxCode: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  representativeName: "",
  representativeTitle: "",
  description: "",
});

export const createAppDataProvider = ({
  orgId,
  companyName,
}: CreateAppDataProviderOptions): AppDataLayer => {
  const resolvedCompanyName = companyName ?? "Cong ty";
  const listUsers = async (): Promise<DataUser[]> => {
    if (!orgId) return [];

    const [users, assignments] = await Promise.all([
      listOrgMembers(orgId),
      listProjectAssignmentsForOrg(orgId),
    ]);

    const assignmentMap = new Map<string, string[]>();
    assignments.forEach((assignment) => {
      const current = assignmentMap.get(assignment.user_id) ?? [];
      current.push(assignment.project_id);
      assignmentMap.set(assignment.user_id, current);
    });

    return users.map((user) => ({
      id: user.user_id,
      name: user.full_name ?? user.email ?? user.user_id,
      email: user.email ?? user.user_id,
      role: user.role,
      status: user.status,
      assignedProjectIds: assignmentMap.get(user.user_id) ?? [],
      joinedAt: user.created_at,
    }));
  };

  return {
    mode: "app",
    getDashboardData: async () => {
      if (!orgId) return emptyDashboardData(resolvedCompanyName);

      const [stats, activity] = await Promise.all([
        getProjectDashboardStats(orgId),
        listActivityLogs({ orgId, limit: 5 }),
      ]);

      const projects = stats.projects.map(mapProject);

      return {
        companyName: resolvedCompanyName,
        summary: {
          totalBudget: stats.totalBudget,
          totalActual: projects.reduce((sum, item) => sum + item.actual, 0),
          totalCommitted: projects.reduce((sum, item) => sum + item.committed, 0),
          averageProgress: stats.avgProgress,
          activeProjects: stats.activeProjects,
          pausedProjects: stats.pausedProjects,
          totalAlerts: projects.reduce((sum, item) => sum + item.alertCount, 0),
        },
        projects,
        alerts: activity.slice(0, 4).map((entry) => ({
          id: entry.id,
          projectId: "",
          type: entry.status === "fail" ? "error" : entry.status === "warn" ? "warning" : "info",
          title: entry.module,
          description: entry.description ?? entry.action,
          module: entry.module,
          createdAt: entry.created_at,
        })),
      };
    },
    listProjects: async () => {
      if (!orgId) return [];
      const projects = await listProjectsByOrg(orgId);
      return projects.map(mapProject);
    },
    listUsers,
    getBillingData: async () => {
      if (!orgId) return emptyBillingData(resolvedCompanyName);

      const [subscriptionRow, invoices, paymentMethods, stats] = await Promise.all([
        getSubscription(orgId).then((row) => row ?? ensureSubscription(orgId)),
        listInvoices(orgId),
        listPaymentMethods(orgId),
        getOrganizationStats(orgId),
      ]);

      const currentPlanId = (subscriptionRow?.plan_id ?? stats.plan ?? "starter") as PlanId;
      const plan = getPlan(currentPlanId);

      return {
        companyName: resolvedCompanyName,
        currentPlanId: plan.id,
        currentPlanLabel: plan.name,
        subscriptionStatus: subscriptionRow?.status ?? "active",
        subscriptionBadge: subscriptionRow?.status ?? "active",
        currentPeriodStart: subscriptionRow?.current_period_start ?? null,
        currentPeriodEnd: subscriptionRow?.current_period_end ?? null,
        membersUsed: stats.membersCount,
        projectsUsed: stats.projectsCount,
        invoices: invoices.map((invoice) => ({
          id: invoice.id,
          invoiceNo: invoice.invoice_no,
          amount: Number(invoice.amount ?? 0),
          currency: invoice.currency ?? "VND",
          status: invoice.status,
          issuedAt: invoice.issued_at,
          paidAt: invoice.paid_at,
        })),
        paymentMethods: paymentMethods.map((method) => ({
          id: method.id,
          brand: method.brand,
          last4: method.last4,
          expMonth: method.exp_month,
          expYear: method.exp_year,
        })),
      };
    },
    listActivity: async () => {
      if (!orgId) return [];

      const rows = await listActivityLogs({ orgId, limit: 100 });
      return rows.map(
        (row): ActivityEntry => ({
          id: row.id,
          actor: row.actor_user_id ?? "System",
          action: row.action,
          module: row.module,
          description: row.description ?? "",
          ip: row.ip,
          status: row.status ?? "success",
          createdAt: row.created_at,
        }),
      );
    },
    getCompanyData: async () => {
      if (!orgId) return emptyCompanyData(resolvedCompanyName);

      const organization = await getOrganization(orgId);
      if (!organization) return emptyCompanyData(resolvedCompanyName);

      return {
        name: organization.name ?? resolvedCompanyName,
        taxCode: organization.tax_code ?? "",
        address: organization.address ?? "",
        phone: organization.phone ?? "",
        email: organization.email ?? "",
        website: organization.website ?? "",
        representativeName: organization.representative_name ?? "",
        representativeTitle: organization.representative_title ?? "",
        description: organization.description ?? "",
      };
    },
    listRoles: async () => {
      const members = await listUsers();
      const counts = members.reduce<Record<string, number>>((acc, user) => {
        acc[user.role] = (acc[user.role] ?? 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(
        ([role, memberCount]): RoleSummary => ({
          id: role,
          label: role,
          memberCount,
          description: `Role ${role} in app mode.`,
        }),
      );
    },
    listIntegrations: async () => {
      const items: IntegrationSummary[] = [
        {
          id: "supabase",
          name: "Supabase",
          status: "connected",
          description: "Primary data source for /app.",
        },
        {
          id: "r2",
          name: "R2 Storage",
          status: "connected",
          description: "Upload and file delivery for /app.",
        },
      ];

      return items;
    },
  };
};
