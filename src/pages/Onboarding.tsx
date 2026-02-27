import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasSupabaseEnv, supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { getLastPath } from "@/lib/lastPath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setOrgMembership } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedSlug = useMemo(() => toSlug(companyName), [companyName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Please enter company name.");
      return;
    }

    if (!supabase) {
      setError("Missing Supabase configuration.");
      return;
    }

    const slug = suggestedSlug;
    if (!slug) {
      setError("Cannot create slug from company name.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: orgData, error: rpcError } = await supabase.rpc("create_organization_with_owner", {
        p_name: companyName.trim(),
        p_slug: slug,
      });

      if (rpcError) {
        throw rpcError;
      }

      const orgId =
        (orgData as { id?: string } | null)?.id ??
        (Array.isArray(orgData) ? (orgData[0] as { id?: string } | undefined)?.id : undefined);

      if (!orgId) {
        throw new Error("Cannot resolve organization id after onboarding.");
      }

      const { error: subscriptionError } = await supabase.rpc("ensure_org_subscription", {
        p_org_id: orgId,
      });

      if (subscriptionError) {
        throw subscriptionError;
      }

      setOrgMembership({ orgId, role: "owner" });

      // Helpful flag only; org_members remains source of truth.
      void supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
        },
      });

      navigate(getLastPath("/app/dashboard"), { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message?: unknown }).message ?? "Onboarding failed")
            : "Onboarding failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Missing Supabase env</h2>
          <p className="text-muted-foreground text-sm">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create company</CardTitle>
          <CardDescription>Enter your company name to start using the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Example: ABC Construction"
              />
              {companyName && (
                <p className="text-xs text-muted-foreground">
                  Slug: <span className="font-mono">{suggestedSlug}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating company..." : "Create company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
