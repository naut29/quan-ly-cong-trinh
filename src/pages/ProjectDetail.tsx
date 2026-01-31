import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const { orgId, loading: sessionLoading } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!supabase || !orgId || !id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, created_at")
        .eq("org_id", orgId)
        .eq("id", id)
        .maybeSingle();

      if (!isActive) return;
      if (error) {
        setError(error.message);
        setProject(null);
      } else {
        setProject((data as Project) ?? null);
      }
      setLoading(false);
    };

    if (!sessionLoading) {
      load();
    }

    return () => {
      isActive = false;
    };
  }, [id, orgId, sessionLoading]);

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Missing Supabase env</h2>
          <p className="text-muted-foreground text-sm">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.
          </p>
        </div>
      </div>
    );
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {project?.name ?? "Không tìm thấy dự án"}
            </h1>
            <p className="text-sm text-muted-foreground">Chi tiết dự án</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/projects">Quay lại danh sách</Link>
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-destructive">Không thể tải dự án: {error}</p>
            </CardContent>
          </Card>
        ) : !project ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Dự án không tồn tại.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{project.description?.trim() || "Chưa có mô tả."}</p>
              <p className="text-xs">
                Ngày tạo: {new Date(project.created_at).toLocaleDateString("vi-VN")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
