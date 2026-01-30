import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseAuth = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: userData } = await supabaseAuth.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, entity_type, entity_id, decision_note } = await req.json();
    if (!action || !entity_type || !entity_id) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, company_id, role")
      .eq("id", userData.user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Missing profile" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isAdmin = ["owner", "admin"].includes(profile.role);
    const isEditor = ["owner", "admin", "editor"].includes(profile.role);

    if (["approve", "reject"].includes(action) && !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (["create_draft", "submit", "cancel"].includes(action) && !isEditor) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabaseAdmin
      .from("approval_requests")
      .select("*")
      .eq("company_id", profile.company_id)
      .eq("entity_type", entity_type)
      .eq("entity_id", entity_id)
      .maybeSingle();

    let result;
    if (action === "create_draft") {
      if (existing) {
        result = existing;
      } else {
        const { data } = await supabaseAdmin
          .from("approval_requests")
          .insert({
            company_id: profile.company_id,
            entity_type,
            entity_id,
            status: "draft",
          })
          .select("*")
          .single();
        result = data;
      }
    } else if (!existing) {
      return new Response(JSON.stringify({ error: "Approval request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "submit") {
      const { data } = await supabaseAdmin
        .from("approval_requests")
        .update({
          status: "submitted",
          submitted_by: userData.user.id,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      result = data;
    } else if (action === "approve") {
      const { data } = await supabaseAdmin
        .from("approval_requests")
        .update({
          status: "approved",
          decided_by: userData.user.id,
          decided_at: new Date().toISOString(),
          decision_note: decision_note ?? null,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      result = data;
    } else if (action === "reject") {
      const { data } = await supabaseAdmin
        .from("approval_requests")
        .update({
          status: "rejected",
          decided_by: userData.user.id,
          decided_at: new Date().toISOString(),
          decision_note: decision_note ?? null,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      result = data;
    } else if (action === "cancel") {
      const { data } = await supabaseAdmin
        .from("approval_requests")
        .update({
          status: "cancelled",
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      result = data;
    }

    const actionMap: Record<string, string> = {
      create_draft: "approval_draft_created",
      submit: "approval_submitted",
      approve: "approval_approved",
      reject: "approval_rejected",
      cancel: "approval_cancelled",
    };

    await supabaseAdmin.from("audit_logs").insert({
      company_id: profile.company_id,
      actor_user_id: userData.user.id,
      action: actionMap[action] ?? `approval_${action}`,
      entity_type: entity_type,
      entity_id: entity_id,
      metadata: { status: result?.status ?? null, decision_note },
    });

    return new Response(JSON.stringify({ approval: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
