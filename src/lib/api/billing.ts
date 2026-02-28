import { type PlanId, getPlan } from "@/lib/plans/planCatalog";
import { supabase } from "@/lib/supabaseClient";

interface RawSubscriptionRow {
  id: string;
  org_id: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubscriptionRow {
  id: string;
  org_id: string;
  plan_id: PlanId;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InvoiceRow {
  id: string;
  org_id: string;
  invoice_no: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string | null;
  paid_at: string | null;
  created_at: string | null;
}

export interface PaymentMethodRow {
  id: string;
  org_id: string;
  brand: string | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  created_at: string | null;
}

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }
  return supabase;
};

const addOneMonth = (value: string) => {
  const next = new Date(value);
  next.setMonth(next.getMonth() + 1);
  return next.toISOString();
};

const mapSubscriptionRow = (row: RawSubscriptionRow | null): SubscriptionRow | null => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    org_id: row.org_id,
    plan_id: getPlan(row.plan).id,
    status: row.status,
    current_period_start: row.current_period_start,
    current_period_end: row.current_period_end,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const syncOrganizationPlan = async (orgId: string, planId: PlanId) => {
  const client = assertClient();
  const plan = getPlan(planId);

  const { error } = await client
    .from("organizations")
    .update({
      plan: plan.id,
      plan_id: plan.dbPlanId,
    })
    .eq("id", orgId);

  if (error) {
    console.warn("Failed to sync organization plan metadata", error);
  }
};

export const getSubscription = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("subscriptions")
    .select("id, org_id, plan, status, current_period_start, current_period_end, created_at, updated_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return mapSubscriptionRow((data ?? null) as RawSubscriptionRow | null);
};

export const ensureSubscription = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client.rpc("ensure_org_subscription", {
    p_org_id: orgId,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? (data[0] ?? null) : data;
  return mapSubscriptionRow((row ?? null) as RawSubscriptionRow | null);
};

export const upsertSubscription = async (
  orgId: string,
  payload: Partial<Pick<SubscriptionRow, "plan_id" | "status" | "current_period_start" | "current_period_end">>,
) => {
  const client = assertClient();

  const now = new Date().toISOString();
  const currentPeriodStart = payload.current_period_start ?? now;
  const nextPlanId = payload.plan_id ?? "starter";
  const row = {
    org_id: orgId,
    plan: nextPlanId,
    status: payload.status ?? "active",
    current_period_start: currentPeriodStart,
    current_period_end: payload.current_period_end ?? addOneMonth(currentPeriodStart),
    updated_at: now,
  };

  const { data, error } = await client
    .from("subscriptions")
    .upsert(row, { onConflict: "org_id" })
    .select("id, org_id, plan, status, current_period_start, current_period_end, created_at, updated_at")
    .single();
  if (error) throw error;

  await syncOrganizationPlan(orgId, nextPlanId);

  return mapSubscriptionRow(data as RawSubscriptionRow)!;
};

export const listInvoices = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("invoices")
    .select("id, org_id, invoice_no, amount, currency, status, issued_at, paid_at, created_at")
    .eq("org_id", orgId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvoiceRow[];
};

export const listPaymentMethods = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("payment_methods")
    .select("id, org_id, brand, last4, exp_month, exp_year, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentMethodRow[];
};

export const savePaymentMethod = async (
  orgId: string,
  payload: Pick<PaymentMethodRow, "brand" | "last4" | "exp_month" | "exp_year">,
) => {
  const client = assertClient();
  const { data, error } = await client
    .from("payment_methods")
    .insert({
      org_id: orgId,
      ...payload,
    })
    .select("id, org_id, brand, last4, exp_month, exp_year, created_at")
    .single();
  if (error) throw error;
  return data as PaymentMethodRow;
};
