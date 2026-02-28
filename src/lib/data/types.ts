import type { PlanId } from "@/lib/plans/planCatalog";

export type DataMode = "app" | "demo";

export type DataProjectStatus = "active" | "paused" | "completed";
export type DataProjectStage = "foundation" | "structure" | "finishing";
export type DataAlertType = "error" | "warning" | "info";
export type DataBadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface DataProject {
  id: string;
  code: string;
  name: string;
  address: string;
  status: DataProjectStatus;
  stage: DataProjectStage;
  budget: number;
  actual: number;
  committed: number;
  forecast: number;
  progress: number;
  startDate: string;
  endDate: string;
  alertCount: number;
  manager: string;
}

export interface DataAlert {
  id: string;
  projectId: string;
  type: DataAlertType;
  title: string;
  description: string;
  module: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalBudget: number;
  totalActual: number;
  totalCommitted: number;
  averageProgress: number;
  activeProjects: number;
  pausedProjects: number;
  totalAlerts: number;
}

export interface DashboardData {
  companyName: string;
  summary: DashboardSummary;
  projects: DataProject[];
  alerts: DataAlert[];
}

export interface DataUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  assignedProjectIds: string[];
  joinedAt: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNo: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string | null;
  paidAt: string | null;
}

export interface BillingPaymentMethod {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
}

export interface BillingData {
  companyName: string;
  currentPlanId: PlanId;
  currentPlanLabel?: string;
  subscriptionStatus: string;
  subscriptionBadge: string;
  demoLabel?: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  membersUsed: number;
  projectsUsed: number;
  invoices: BillingInvoice[];
  paymentMethods: BillingPaymentMethod[];
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  module: string;
  description: string;
  ip: string | null;
  status: string;
  createdAt: string;
}

export interface CompanyData {
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  representativeName: string;
  representativeTitle: string;
  description: string;
}

export interface RoleSummary {
  id: string;
  label: string;
  memberCount: number;
  description: string;
}

export interface IntegrationSummary {
  id: string;
  name: string;
  status: string;
  description: string;
}

export interface AppDataLayer {
  mode: DataMode;
  getDashboardData: () => Promise<DashboardData>;
  listProjects: () => Promise<DataProject[]>;
  listUsers: () => Promise<DataUser[]>;
  getBillingData: () => Promise<BillingData>;
  listActivity: () => Promise<ActivityEntry[]>;
  getCompanyData: () => Promise<CompanyData>;
  listRoles: () => Promise<RoleSummary[]>;
  listIntegrations: () => Promise<IntegrationSummary[]>;
}
