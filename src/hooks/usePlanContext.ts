import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getDefaultOrgUsage,
  getDefaultPlanLimits,
  normalizeOrgUsage,
  normalizePlanLimits,
  type OrgUsage,
  type PlanLimits,
} from "@/lib/planLimits";

interface PlanContextPayload {
  org_id?: string | null;
  plan_id?: string | null;
  plan_code?: string | null;
  plan_name?: string | null;
  base_limits?: unknown;
  overrides?: Record<string, unknown> | null;
  limits?: unknown;
  usage?: unknown;
}

export interface PlanContext {
  orgId: string | null;
  planId: string | null;
  planCode: string | null;
  planName: string | null;
  baseLimits: PlanLimits;
  limits: PlanLimits;
  overrides: Record<string, unknown>;
  usage: OrgUsage;
}

const emptyContext = (): PlanContext => ({
  orgId: null,
  planId: null,
  planCode: null,
  planName: null,
  baseLimits: getDefaultPlanLimits(),
  limits: getDefaultPlanLimits(),
  overrides: {},
  usage: getDefaultOrgUsage(),
});

const parsePayload = (payload: PlanContextPayload | null): PlanContext => {
  if (!payload) {
    return emptyContext();
  }

  const baseLimits = normalizePlanLimits(payload.base_limits ?? {});
  const mergedLimits = normalizePlanLimits(payload.limits ?? payload.base_limits ?? {});

  return {
    orgId: payload.org_id ?? null,
    planId: payload.plan_id ?? null,
    planCode: payload.plan_code ?? null,
    planName: payload.plan_name ?? null,
    baseLimits,
    limits: mergedLimits,
    overrides: (payload.overrides ?? {}) as Record<string, unknown>,
    usage: normalizeOrgUsage(payload.usage ?? {}),
  };
};

export const usePlanContext = (orgId: string | null | undefined) => {
  const [context, setContext] = useState<PlanContext>(emptyContext());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const client = supabase;
    if (!client || !orgId) {
      setContext(emptyContext());
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await client.rpc("get_org_plan_context", {
      p_org_id: orgId,
    });

    if (error) {
      setContext(emptyContext());
      setError(error.message);
      setLoading(false);
      return;
    }

    setContext(parsePayload((data ?? null) as PlanContextPayload | null));
    setLoading(false);
  }, [orgId]);

  const recordUsageEvent = useCallback(
    async (event: "download" | "upload" | "export", amount = 0) => {
      const client = supabase;
      if (!client || !orgId) {
        return;
      }

      await client.rpc("record_org_usage_event", {
        p_org_id: orgId,
        p_event: event,
        p_amount: amount,
      });

      await refresh();
    },
    [orgId, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const result = useMemo(
    () => ({
      context,
      limits: context.limits,
      usage: context.usage,
      loading,
      error,
      refresh,
      recordUsageEvent,
    }),
    [context, loading, error, refresh, recordUsageEvent],
  );

  return result;
};
