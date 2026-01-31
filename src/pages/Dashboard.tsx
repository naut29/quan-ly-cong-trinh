import React, { useCallback, useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabaseClient";
import { useSession } from "@/app/session/useSession";
import CreateProject from "@/components/CreateProject";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { orgId, orgRole, loading: sessionLoading } = useSession();
  const isAdmin = (orgRole ?? "viewer") === "owner" || (orgRole ?? "viewer") === "admin";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    if (!supabase || !orgId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setProjects([]);
    } else {
      setProjects((data ?? []) as Project[]);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (sessionLoading) return;
    loadProjects();
  }, [loadProjects, sessionLoading]);

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

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Quản lý Công trình</h1>
            <p className="text-sm text-muted-foreground">
              Danh sách dự án trong tổ chức của bạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/projects">Xem tất cả dự án</Link>
            </Button>
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link to="/members">Thành viên</Link>
              </Button>
            )}
            <CreateProject
              orgId={orgId ?? ""}
              onCreated={loadProjects}
              canCreate={orgRole !== "viewer"}
              disabled={!orgId}
            />
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Đang tải dự án...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-destructive">Không thể tải dự án: {error}</p>
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Chưa có dự án nào. Hãy tạo dự án đầu tiên của bạn.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {project.description?.trim() || "Chưa có mô tả."}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
