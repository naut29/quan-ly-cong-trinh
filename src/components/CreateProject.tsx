import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpgradeModal from "@/components/plans/UpgradeModal";
import { usePlanContext } from "@/hooks/usePlanContext";
import { canCreateProject } from "@/lib/planLimits";

interface CreateProjectProps {
  orgId: string;
  onCreated: () => void;
  canCreate?: boolean;
  disabled?: boolean;
}

const CreateProject: React.FC<CreateProjectProps> = ({
  orgId,
  onCreated,
  canCreate = true,
  disabled,
}) => {
  const { limits, usage, refresh: refreshPlanContext } = usePlanContext(orgId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleBlocked = (reason: string) => {
    setError(reason);
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  };

  const evaluateGate = () => {
    const gate = canCreateProject(limits, usage, 1);
    if (!gate.allowed) {
      handleBlocked(gate.reason ?? "Da dat gioi han so du an cua goi hien tai.");
      return false;
    }
    return true;
  };

  const handleOpenDialog = () => {
    if (!canCreate) {
      return;
    }

    if (!orgId || disabled) {
      return;
    }

    if (!evaluateGate()) {
      return;
    }

    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Vui long nhap ten du an.");
      return;
    }

    if (!supabase) {
      setError("Thieu cau hinh Supabase.");
      return;
    }

    if (!evaluateGate()) {
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("projects").insert({
        org_id: orgId,
        name: trimmedName,
        description: description.trim() || null,
      });

      if (insertError) {
        throw insertError;
      }

      setOpen(false);
      await Promise.all([Promise.resolve(onCreated()), refreshPlanContext()]);
    } catch (err: any) {
      setError(err?.message ?? "Khong the tao du an. Vui long thu lai.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!canCreate) {
    return null;
  }

  return (
    <>
      <Button disabled={disabled} onClick={handleOpenDialog}>
        Tao du an
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tao du an moi</DialogTitle>
            <DialogDescription>Nhap thong tin co ban cho du an.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Ten du an</Label>
              <Input
                id="projectName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Vi du: Chung cu An Lac"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Mo ta</Label>
              <Textarea
                id="projectDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mo ta ngan ve du an (tuy chon)"
                rows={4}
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Huy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Dang tao..." : "Tao"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName="tao du an"
        reason={upgradeReason ?? undefined}
      />
    </>
  );
};

export default CreateProject;
