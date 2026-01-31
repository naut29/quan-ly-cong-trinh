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
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateProjectProps {
  orgId: string;
  onCreated: () => void;
  canCreate?: boolean;
  disabled?: boolean;
}

const CreateProject: React.FC<CreateProjectProps> = ({ orgId, onCreated, canCreate = true, disabled }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxProjects, setMaxProjects] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    const client = supabase;
    if (!client || !orgId) {
      setMaxProjects(null);
      return;
    }

    const loadSubscription = async () => {
      const { data, error } = await client
        .from("org_subscriptions")
        .select("max_projects")
        .eq("org_id", orgId)
        .maybeSingle();

      if (error) {
        setMaxProjects(null);
        return;
      }

      setMaxProjects(typeof data?.max_projects === "number" ? data.max_projects : null);
    };

    loadSubscription();
  }, [orgId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Vui lòng nhập tên dự án.");
      return;
    }

    if (!supabase) {
      setError("Thiếu cấu hình Supabase.");
      return;
    }

    setSubmitting(true);
    try {
      if (maxProjects !== null) {
        const { count, error: countError } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId);

        if (countError) {
          throw countError;
        }

        if ((count ?? 0) >= maxProjects) {
          throw new Error("Đã đạt giới hạn số lượng dự án của gói hiện tại.");
        }
      }

      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          org_id: orgId,
          name: trimmedName,
          description: description.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      setOpen(false);
      onCreated();
    } catch (err: any) {
      setError(err?.message ?? "Không thể tạo dự án. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!canCreate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Tạo dự án</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>Nhập thông tin cơ bản cho dự án.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Tên dự án</Label>
            <Input
              id="projectName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Chung cư An Lạc"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Mô tả</Label>
            <Textarea
              id="projectDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả ngắn về dự án (tuỳ chọn)"
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
              Huỷ
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProject;
