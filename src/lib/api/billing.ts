import { supabase } from "@/lib/supabaseClient";

export interface SubscriptionRow {
  id: string;
  org_id: string;
  plan: string;
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
  return (data ?? null) as SubscriptionRow | null;
};

export const upsertSubscription = async (
  orgId: string,
  payload: Partial<Pick<SubscriptionRow, "plan" | "status" | "current_period_start" | "current_period_end">>,
) => {
  const client = assertClient();

  const now = new Date().toISOString();
  const row = {
    org_id: orgId,
    plan: payload.plan ?? "starter",
    status: payload.status ?? "active",
    current_period_start: payload.current_period_start ?? now,
    current_period_end: payload.current_period_end ?? null,
    updated_at: now,
  };

  const { data, error } = await client
    .from("subscriptions")
    .upsert(row, { onConflict: "org_id" })
    .select("id, org_id, plan, status, current_period_start, current_period_end, created_at, updated_at")
    .single();
  if (error) throw error;
  return data as SubscriptionRow;
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
