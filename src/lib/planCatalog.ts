import {
  PLAN_CATALOG,
  PLAN_LIST,
  getPlan,
  type PlanCatalogEntry,
  type PlanId,
} from "@/lib/plans/planCatalog";

export type PlanCode = PlanId;
export type MarketingPlan = PlanCatalogEntry;

export { PLAN_CATALOG };

export const marketingPlans = PLAN_LIST;

export const getMarketingPlanByCode = getPlan;
